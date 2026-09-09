import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { ApiError } from '../utils/ApiError';
import { verifyToken } from '../utils/generateToken';
import User from '../models/User';

/**
 * Verifies the Bearer JWT on the Authorization header, loads the user,
 * and attaches a minimal { id, username, email } to req.user.
 * Every protected route depends on this running first.
 */
export const protect = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Not authorized, no token provided');
  }

  const token = header.split(' ')[1];

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch {
    throw ApiError.unauthorized('Not authorized, token invalid or expired');
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw ApiError.unauthorized('Not authorized, user no longer exists');
  }

  req.user = { id: user._id.toString(), username: user.username, email: user.email };
  next();
});
