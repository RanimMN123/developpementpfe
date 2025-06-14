import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ExtractJwt } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extract token JWT du header Authorization
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secretKey', 
    });
  }

  // Cette méthode va être appelée lors de la validation du JWT
  async validate(payload: any) {
    
    return { sub: payload.sub, email: payload.email }; // 'sub' est généralement l'ID de l'utilisateur 
  }
}
