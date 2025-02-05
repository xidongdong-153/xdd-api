import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/mysql';
import { Demo } from '@/modules/demo/entities/demo.entity';

/**
 * Demo错误演示服务
 * @description 用于演示各种数据库错误的处理方式
 */
@Injectable()
export class DemoErrorService {
    constructor(private readonly em: EntityManager) {}

    /**
     * 测试数据库表不存在错误
     */
    async testTableNotFound() {
        try {
            await this.em.execute('SELECT * FROM non_existent_table');
        } catch (error) {
            console.log('数据库错误对象:', error);
            throw error;
        }
    }

    /**
     * 测试唯一约束冲突错误
     */
    async testUniqueConstraint() {
        // 先清理可能存在的测试数据
        await this.em.nativeDelete(Demo, { name: 'test-unique' });
        await this.em.flush();

        // 创建第一个演示数据
        const demo1 = this.em.create(Demo, {
            name: 'test-unique',
            description: '测试唯一约束',
        });
        await this.em.persistAndFlush(demo1);

        // 尝试创建一个同名的演示数据
        const demo2 = this.em.create(Demo, {
            name: 'test-unique', // 故意使用相同的名称
            description: '测试唯一约束',
        });

        try {
            await this.em.persistAndFlush(demo2);
        } catch (error) {
            // 清理测试数据
            await this.em.nativeDelete(Demo, { name: 'test-unique' });
            await this.em.flush();
            throw error;
        }
    }

    /**
     * 测试资源未找到错误
     */
    async testNotFound() {
        try {
            await this.em.findOneOrFail(Demo, { id: 999999 });
        } catch (error) {
            throw error;
        }
    }

    /**
     * 测试SQL语法错误
     */
    async testSqlSyntaxError() {
        try {
            // 故意写错SQL语法
            await this.em.execute('SELEKT * FORM demo');
        } catch (error) {
            console.log('SQL语法错误:', error);
            throw error;
        }
    }

    /**
     * 测试死锁错误（需要并发操作）
     */
    async testDeadlock(): Promise<void> {
        const TEST_NAMES = [
            'test-deadlock-1',
            'test-deadlock-2',
            'updated-1',
            'updated-2',
            'competing-1',
            'competing-2',
        ];

        let mainTransaction = false;
        let competingTransaction = false;
        const em2 = this.em.fork();

        try {
            // 1. 清理数据
            await this.em.nativeDelete(Demo, {
                name: { $in: TEST_NAMES },
            });
            await this.em.flush();

            // 2. 创建测试数据
            const demo1 = this.em.create(Demo, {
                name: 'test-deadlock-1',
                description: '死锁测试数据1',
            });
            const demo2 = this.em.create(Demo, {
                name: 'test-deadlock-2',
                description: '死锁测试数据2',
            });
            await this.em.persistAndFlush([demo1, demo2]);

            // 3. 开始主事务
            await this.em.begin();
            mainTransaction = true;

            // 主事务更新demo1
            const freshDemo1 = await this.em.findOneOrFail(Demo, { name: 'test-deadlock-1' });
            freshDemo1.name = 'updated-1';
            await this.em.persistAndFlush(freshDemo1);

            // 4. 启动竞争事务
            setTimeout(async () => {
                try {
                    await em2.begin();
                    competingTransaction = true;

                    // 先锁定demo2
                    const demo2 = await em2.findOneOrFail(Demo, { name: 'test-deadlock-2' });
                    demo2.name = 'competing-2';
                    await em2.persistAndFlush(demo2);

                    // 尝试锁定demo1，这里应该会触发死锁
                    const demo1 = await em2.findOneOrFail(Demo, { name: 'test-deadlock-1' });
                    demo1.name = 'competing-1';
                    await em2.persistAndFlush(demo1);

                    await em2.commit();
                    competingTransaction = false;
                } catch (error) {
                    console.log('竞争事务预期的死锁错误:', error);
                    if (competingTransaction) {
                        await em2.rollback();
                    }
                }
            }, 300);

            // 等待一下，让竞争事务有机会获取demo2的锁
            await new Promise((resolve) => setTimeout(resolve, 500));

            // 主事务尝试更新demo2，这里可能触发死锁
            const freshDemo2 = await this.em.findOneOrFail(Demo, { name: 'test-deadlock-2' });
            freshDemo2.name = 'updated-2';
            await this.em.persistAndFlush(freshDemo2);

            await this.em.commit();
            mainTransaction = false;
        } catch (error) {
            if (mainTransaction) {
                await this.em.rollback();
            }
            throw error; // 直接抛出原始错误，让异常过滤器处理
        } finally {
            // 确保清理所有测试数据
            try {
                await this.em.nativeDelete(Demo, {
                    name: { $in: TEST_NAMES },
                });
                await this.em.flush();
            } catch (cleanupError) {
                console.log('清理测试数据时出错:', cleanupError);
            }
        }
    }
}
