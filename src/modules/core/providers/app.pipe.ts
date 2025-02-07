import {
    ArgumentMetadata,
    BadRequestException,
    Injectable,
    ValidationPipe,
    // ValidationError,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { isObject, omit } from 'lodash';

import { DTO_VALIDATION_OPTIONS } from '@/modules/core/constants';
import { deepMerge } from '@/modules/core/helpers/utils';

/**
 * 全局管道,用于处理DTO验证
 */
@Injectable()
export class AppPipe extends ValidationPipe {
    constructor(private readonly reflector: Reflector) {
        super();
    }

    async transform(value: any, metadata: ArgumentMetadata) {
        const { metatype, type } = metadata;
        const dto = metatype as any;
        const options = this.reflector.get(DTO_VALIDATION_OPTIONS, dto) || {};

        const originOptions = { ...this.validatorOptions };
        const originTransform = { ...this.transformOptions };

        const { transformOptions, type: optionsType, ...customOptions } = options;
        const requestType = optionsType ?? 'body';

        if (requestType !== type) return value;

        if (transformOptions) {
            this.transformOptions = deepMerge(
                this.transformOptions,
                transformOptions ?? {},
                'replace',
            );
        }

        this.validatorOptions = deepMerge(this.validatorOptions, customOptions ?? {}, 'replace');

        const toValidate = isObject(value)
            ? Object.fromEntries(
                  Object.entries(value as Record<string, any>).map(([key, v]) => {
                      if (!isObject(v) || !('mimetype' in v)) return [key, v];
                      return [key, omit(v, ['fields'])];
                  }),
              )
            : value;

        try {
            let result = await super.transform(toValidate, metadata);

            if (typeof result.transform === 'function') {
                const transformed = await result.transform(result);
                result = omit(transformed, ['transform']);
            }

            this.validatorOptions = originOptions;
            this.transformOptions = originTransform;

            return result;
        } catch (error: any) {
            this.validatorOptions = originOptions;
            this.transformOptions = originTransform;

            if ('response' in error) throw new BadRequestException(error.response);
            throw new BadRequestException(error);
        }
    }
}
