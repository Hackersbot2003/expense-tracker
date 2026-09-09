import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { ApiError } from '../utils/ApiError';
import User from '../models/User';
import FriendRequest from '../models/FriendRequest';

// GET /api/users/search?username=
export const searchUsers = asyncHandler(async (req: Request, res: Response) => {
  const { username } = req.query as Record<string, string>;
  if (!username || username.trim().length < 2) {
    res.status(200).json({ success: true, data: [] });
    return;
  }

  const users = await User.find({
    username: { $regex: username.trim(), $options: 'i' },
    _id: { $ne: req.user!.id },
  })
    .select('name username profileImage')
    .limit(20);

  res.status(200).json({ success: true, data: users });
});

// POST /api/friends/request  { receiverUsername }
export const sendFriendRequest = asyncHandler(async (req: Request, res: Response) => {
  const { receiverUsername } = req.body;
  if (!receiverUsername) throw ApiError.badRequest('receiverUsername is required');

  const receiver = await User.findOne({ username: receiverUsername.toLowerCase() });
  if (!receiver) throw ApiError.notFound('User not found');

  if (receiver._id.toString() === req.user!.id) {
    throw ApiError.badRequest('You cannot send a friend request to yourself');
  }

  const existing = await FriendRequest.findOne({
    $or: [
      { senderId: req.user!.id, receiverId: receiver._id },
      { senderId: receiver._id, receiverId: req.user!.id },
    ],
  });

  if (existing) {
    if (existing.status === 'accepted') throw ApiError.conflict('You are already friends with this user');
    if (existing.status === 'pending') throw ApiError.conflict('A friend request is already pending');
    // Rejected before: allow re-sending by resetting it, from the same sender
    existing.senderId = req.user!.id as any;
    existing.receiverId = receiver._id;
    existing.status = 'pending';
    await existing.save();
    res.status(201).json({ success: true, data: existing });
    return;
  }

  const request = await FriendRequest.create({
    senderId: req.user!.id,
    receiverId: receiver._id,
    status: 'pending',
  });

  res.status(201).json({ success: true, data: request });
});

// GET /api/friends/requests  (incoming pending requests)
export const getIncomingRequests = asyncHandler(async (req: Request, res: Response) => {
  const requests = await FriendRequest.find({ receiverId: req.user!.id, status: 'pending' })
    .populate('senderId', 'name username profileImage')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: requests });
});

// PUT /api/friends/request/:id/accept
export const acceptRequest = asyncHandler(async (req: Request, res: Response) => {
  const request = await FriendRequest.findOne({ _id: req.params.id, receiverId: req.user!.id, status: 'pending' });
  if (!request) throw ApiError.notFound('Friend request not found');

  request.status = 'accepted';
  await request.save();
  res.status(200).json({ success: true, data: request });
});

// PUT /api/friends/request/:id/reject
export const rejectRequest = asyncHandler(async (req: Request, res: Response) => {
  const request = await FriendRequest.findOne({ _id: req.params.id, receiverId: req.user!.id, status: 'pending' });
  if (!request) throw ApiError.notFound('Friend request not found');

  request.status = 'rejected';
  await request.save();
  res.status(200).json({ success: true, data: request });
});

// GET /api/friends  (accepted friends list)
export const getFriends = asyncHandler(async (req: Request, res: Response) => {
  const relations = await FriendRequest.find({
    status: 'accepted',
    $or: [{ senderId: req.user!.id }, { receiverId: req.user!.id }],
  }).populate('senderId receiverId', 'name username profileImage');

  const friends = relations.map((r: any) =>
    r.senderId._id.toString() === req.user!.id ? r.receiverId : r.senderId
  );

  res.status(200).json({ success: true, data: friends });
});

// DELETE /api/friends/:id  (id = the other user's id, or the friendRequest id — we accept the friend's userId)
export const removeFriend = asyncHandler(async (req: Request, res: Response) => {
  const otherUserId = req.params.id;

  const relation = await FriendRequest.findOneAndDelete({
    status: 'accepted',
    $or: [
      { senderId: req.user!.id, receiverId: otherUserId },
      { senderId: otherUserId, receiverId: req.user!.id },
    ],
  });

  if (!relation) throw ApiError.notFound('Friendship not found');
  res.status(200).json({ success: true, data: { removedUserId: otherUserId } });
});
