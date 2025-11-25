import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from 'src/users/entities/user.entity';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    
    constructor(
        configService: ConfigService,
        private readonly usersService: UsersService,
    ) {
        super({
            secretOrKey: configService.get('JWT_SECRET') || '',
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
        });
    }


    async validate(payload: JwtPayload): Promise<User> {

        const { id } = payload;   

        const user = await this.usersService.findOne(id);

        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        
        if (!user.isActive) {
            throw new UnauthorizedException('User is not active');
        }

        return user;
    }
    
}