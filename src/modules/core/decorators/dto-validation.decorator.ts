import { SetMetadata } from '@nestjs/common';
import { ValidatorOptions } from 'class-validator';
import { ClassTransformOptions } from 'class-transformer';
import { DTO_VALIDATION_OPTIONS } from '@/modules/core/constants';

/**
 * 用于配置通过全局验证管道验证数据的DTO类装饰器
 * @param options
 */
export const DtoValidation = (
    options?: ValidatorOptions & {
        transformOptions?: ClassTransformOptions;
    } & { type?: 'body' | 'query' | 'param' },
) => SetMetadata(DTO_VALIDATION_OPTIONS, options ?? {});
