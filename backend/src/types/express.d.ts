import { IUser } from '../models/User';

// Extends Express's Request type so `req.user` is typed everywhere
// after the auth middleware runs.
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        email: string;
      };
    }
  }
}

export {};
