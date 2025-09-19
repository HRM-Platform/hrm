import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { GoogleUser } from '../interfaces/google-user.interface';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      callbackURL: 'http://localhost:3000/auth/google-login/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    const email = profile.emails?.[0]?.value;
    const firstName = profile.name?.givenName;
    const lastName = profile.name?.familyName;

    if (!email || !firstName || !lastName) {
      return done(new Error('Incomplete Google profile'), false);
    }

    const googleUser: GoogleUser = { email, firstName, lastName, accessToken };
    const user = await this.authService.loginOrRegisterGoogle(googleUser);

    done(null, user);
  }
}
