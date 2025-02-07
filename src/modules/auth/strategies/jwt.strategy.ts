import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
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
        const user = await this.em.findOne(User, { id: payload.sub });
        return user;
    }
}
