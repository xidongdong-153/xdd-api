import { EntityManager } from '@mikro-orm/core';
import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { ConfigService } from '@/modules/config/config.service';
import { User } from '@/modules/user/entities/user.entity';

interface JwtPayload {
    sub: number;
    username: string;
    email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    private readonly logger = new Logger(JwtStrategy.name);

    constructor(
        private readonly em: EntityManager,
        configService: ConfigService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_ACCESS_SECRET'),
        });
    }

    async validate(payload: JwtPayload) {
        this.logger.debug(`JWT Payload: ${JSON.stringify(payload)}`);

        const user = await this.em.findOne(
            User,
            { id: payload.sub },
            {
                populate: ['roles.permissions'],
            },
        );

        if (!user) {
            this.logger.warn(`No user found for ID: ${payload.sub}`);
            return null;
        }

        this.logger.debug(`User authenticated: ${user.id} (${user.username})`);
        return user;
    }
}
