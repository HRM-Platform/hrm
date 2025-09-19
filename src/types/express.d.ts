import { UserProfile } from '../auth/user-profile.interface';

declare global {
  namespace Express {
    interface Request {
      user?: UserProfile;
    }
  }
}
