import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import {
  searchUsers,
  sendFriendRequest,
  getUserFriends,
  acceptFriendRequest,
  rejectFriendRequest,
  getPendingFriendRequests,
} from '../controllers/friendRequest.controller.js';

const router = express.Router();

// Search users by email
router.get('/search', protectRoute, searchUsers);

// Send friend request
router.post('/request', protectRoute, sendFriendRequest);

// Get user's friends
router.get('/friends', protectRoute, getUserFriends);

// Get pending friend requests
router.get('/requests', protectRoute, getPendingFriendRequests);

// Handle friend request actions
router.put('/requests/accept/:requestId', protectRoute, acceptFriendRequest);
router.put('/requests/reject/:requestId', protectRoute, rejectFriendRequest);

export default router;
