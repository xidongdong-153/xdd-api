import { Controller, Get, SerializeOptions } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DemoErrorService } from '@/modules/demo/services/demo-error.service';

/**
 * Demo错误演示控制器
 * @description 用于演示各种数据库错误的处理方式
 */
@ApiTags('错误处理演示')
@Controller('demo-error')
export class DemoErrorController {
    constructor(private readonly demoErrorService: DemoErrorService) {}

    /**
     * 测试表不存在错误
     * @remarks 此操作用于测试当数据表不存在时的错误处理
     * @throws {404} 表不存在时的错误响应
     * @throws {500} 服务器内部错误
     */
    @Get('table-not-found')
    @ApiOperation({ summary: '演示表不存在错误' })
    @ApiResponse({
        status: 404,
        description: '数据表不存在',
    })
    @SerializeOptions({})
    testTableNotFound() {
        return this.demoErrorService.testTableNotFound();
    }

    /**
     * 测试唯一约束错误
     * @remarks 此操作用于测试违反唯一约束时的错误处理
     * @throws {400} 唯一约束错误时的响应
     * @throws {500} 服务器内部错误
     */
    @Get('unique-constraint')
    @ApiOperation({ summary: '演示唯一约束错误' })
    @ApiResponse({
        status: 400,
        description: '违反唯一约束',
    })
    @SerializeOptions({})
    testUniqueConstraint() {
        return this.demoErrorService.testUniqueConstraint();
    }

    /**
     * 测试数据不存在错误
     * @remarks 此操作用于测试查询不存在的数据时的错误处理
     * @throws {404} 数据不存在时的错误响应
     * @throws {500} 服务器内部错误
     */
    @Get('not-found')
    @ApiOperation({ summary: '演示数据不存在错误' })
    @ApiResponse({
        status: 404,
        description: '数据不存在',
    })
    @SerializeOptions({})
    testNotFound() {
        return this.demoErrorService.testNotFound();
    }

    /**
     * 测试SQL语法错误
     * @remarks 此操作用于测试SQL语法错误时的错误处理
     * @throws {400} SQL语法错误时的响应
     * @throws {500} 服务器内部错误
     */
    @Get('sql-syntax')
    @ApiOperation({ summary: '演示SQL语法错误' })
    @ApiResponse({
        status: 400,
        description: 'SQL语法错误',
    })
    @SerializeOptions({})
    testSqlSyntax() {
        return this.demoErrorService.testSqlSyntaxError();
    }

    /**
     * 测试死锁错误
     * @remarks 此操作用于测试数据库死锁时的错误处理
     * @throws {503} 死锁错误时的响应
     * @throws {500} 服务器内部错误
     */
    @Get('deadlock')
    @ApiOperation({ summary: '演示死锁错误' })
    @ApiResponse({
        status: 503,
        description: '数据库死锁',
    })
    @SerializeOptions({})
    testDeadlock() {
        return this.demoErrorService.testDeadlock();
    }
}
