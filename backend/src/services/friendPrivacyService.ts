import { Types } from 'mongoose';
import FriendRequest from '../models/FriendRequest';
import { ApiError } from '../utils/ApiError';

/**
 * Confirms an accepted friendship exists between the two users (in either
 * direction) and throws 403 if not. Every friend-data endpoint must call
 * this before returning anything about the target user.
 */
export const assertAreFriends = async (viewerId: string, targetId: string) => {
  if (viewerId === targetId) return; // viewing your own data is always fine

  const friendship = await FriendRequest.findOne({
    status: 'accepted',
    $or: [
      { senderId: viewerId, receiverId: targetId },
      { senderId: targetId, receiverId: viewerId },
    ],
  });

  if (!friendship) {
    throw ApiError.forbidden('You must be friends with this user to view their data');
  }
};

/** Ensures the given user id refers to a real user; used before privacy checks. */
export const toObjectId = (id: string) => new Types.ObjectId(id);
