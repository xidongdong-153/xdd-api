import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '@/app.module';
import { EntityManager } from '@mikro-orm/mysql';
import { Demo } from '@/modules/demo/entities/demo.entity';

describe('DemoController (e2e)', () => {
    let app: INestApplication;
    let em: EntityManager;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();

        // 获取EntityManager并创建新的上下文
        const globalEm = moduleFixture.get<EntityManager>(EntityManager);
        em = globalEm.fork();

        // 配置与主应用相同的全局管道
        app.useGlobalPipes(
            new ValidationPipe({
                transform: true,
                whitelist: true,
            }),
        );

        await app.init();
    });

    afterEach(async () => {
        // 清理测试数据
        await em.nativeDelete(Demo, {});
        await em.flush();
        await app.close();
    });

    describe('GET /demo', () => {
        it('should return an array of demos', async () => {
            // 创建测试数据
            const demo = em.create(Demo, {
                name: 'Test Demo',
                description: 'Test Description',
            });
            await em.persistAndFlush(demo);

            return request(app.getHttpServer())
                .get('/demo')
                .query({ page: 1, limit: 10 })
                .expect(200)
                .expect((res) => {
                    expect(Array.isArray(res.body.data.items)).toBe(true);
                    expect(res.body.data.items.length).toBeGreaterThan(0);
                    expect(res.body.data.total).toBeGreaterThan(0);
                    expect(res.body.data.page).toBe(1);
                    expect(res.body.data.limit).toBe(10);
                });
        });
    });

    describe('POST /demo', () => {
        const createDemoDto = {
            name: 'Test Demo',
            description: 'Test Description',
        };

        it('should create a new demo', () => {
            return request(app.getHttpServer())
                .post('/demo')
                .send(createDemoDto)
                .expect(201)
                .expect((res) => {
                    expect(res.body.data).toHaveProperty('id');
                    expect(res.body.data.name).toBe(createDemoDto.name);
                    expect(res.body.data.description).toBe(createDemoDto.description);
                    expect(res.body.data).toHaveProperty('createdAt');
                    expect(res.body.data).toHaveProperty('updatedAt');
                });
        });

        it('should validate request body', () => {
            return request(app.getHttpServer()).post('/demo').send({}).expect(400);
        });
    });

    describe('GET /demo/:id', () => {
        it('should return 404 for non-existing demo', () => {
            return request(app.getHttpServer()).get('/demo/999').expect(404);
        });

        it('should return a demo by id', async () => {
            // 创建测试数据
            const demo = em.create(Demo, {
                name: 'Test Demo',
                description: 'Test Description',
            });
            await em.persistAndFlush(demo);

            return request(app.getHttpServer())
                .get(`/demo/${demo.id}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.data.id).toBe(demo.id);
                    expect(res.body.data.name).toBe(demo.name);
                    expect(res.body.data.description).toBe(demo.description);
                });
        });
    });
});
