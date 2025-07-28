import User from '../models/user.model.js';
import FriendRequest from '../models/friendRequest.model.js';
import emailService from '../services/emailService.js';

export const searchUsers = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find users by email (case-insensitive, partial match)
    const users = await User.find({
      email: { $regex: email, $options: 'i' },
      _id: { $ne: req.user._id } // Exclude current user
    }).select('-password');

    res.status(200).json(users);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const sendFriendRequest = async (req, res) => {
  try {
    const { recipientEmail } = req.body;
    const senderId = req.user._id;

    // Check if recipient exists
    const recipient = await User.findOne({ email: recipientEmail });
    if (!recipient) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if trying to send to self
    if (senderId.toString() === recipient._id.toString()) {
      return res.status(400).json({ message: 'Cannot send request to yourself' });
    }

    // Check if request already exists or if users are already friends
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: senderId, recipient: recipient._id },
        { sender: recipient._id, recipient: senderId }
      ]
    });

    if (existingRequest) {
      if (existingRequest.status === 'pending') {
        if (existingRequest.sender.toString() === senderId.toString()) {
          return res.status(400).json({ 
            success: false,
            message: 'Friend request already sent to this user' 
          });
        } else {
          return res.status(400).json({ 
            success: false,
            message: 'This user has already sent you a friend request' 
          });
        }
      }
      if (existingRequest.status === 'accepted') {
        return res.status(400).json({ 
          success: false,
          message: 'You are already friends with this user' 
        });
      }
    }
    
    // Check if users are already friends through the User model
    const sender = await User.findById(senderId).select('friends');
    if (sender && Array.isArray(sender.friends) && sender.friends.some(friendId => friendId.toString() === recipient._id.toString())) {
      return res.status(400).json({ 
        success: false,
        message: 'You are already friends with this user' 
      });
    }

    // Create new friend request
    const friendRequest = new FriendRequest({
      sender: senderId,
      recipient: recipient._id,  // Store user ID, not email
      status: 'pending'
    });

    await friendRequest.save();

    // Populate sender and recipient info for the response
    await friendRequest.populate('sender', 'fullName email profilePic');
    await friendRequest.populate('recipient', 'fullName email profilePic');

    // Send email notification to the recipient
    try {
      const sender = await User.findById(senderId).select('fullName');
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';

      await emailService.sendFriendRequestEmail(
        recipient.email,
        sender.fullName,
        friendRequest._id.toString(),
        frontendUrl
      );
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      message: 'Friend request sent',
      request: friendRequest
    });
  } catch (error) {
    console.error('Send request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// In friendRequest.controller.js
export const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const request = await FriendRequest.findById(requestId)
      .populate('sender', 'fullName email profilePic')
      .populate('recipient', 'fullName email profilePic');

    if (!request) {
      return res.status(404).json({ message: 'Friend request not found' });
    }
    console.log(request.recipient._id, userId, "recipient");

    if (request.recipient._id.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to accept this request' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    request.status = 'accepted';
    await request.save();

    // Add each other as friends
    await User.findByIdAndUpdate(request.sender._id, {
      $addToSet: { friends: request.recipient._id }
    });
    await User.findByIdAndUpdate(request.recipient._id, {
      $addToSet: { friends: request.sender._id }
    });

    res.status(200).json({
      message: 'Friend request accepted',
      request
    });
  } catch (error) {
    console.error('Accept friend request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const rejectFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const request = await FriendRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    if (request.recipient.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to reject this request' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    request.status = 'rejected';
    await request.save();

    res.status(200).json({
      message: 'Friend request rejected',
      request
    });
  } catch (error) {
    console.error('Reject friend request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all pending friend requests for the current user
export const getPendingFriendRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all pending friend requests where the current user is the recipient
    const pendingRequests = await FriendRequest.find({
      recipient: userId,
      status: 'pending'
    })
    .populate('sender', 'fullName email profilePic')
    .sort({ createdAt: -1 }); // Sort by most recent first

    res.status(200).json({
      success: true,
      data: pendingRequests
    });
  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

export const getUserFriends = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all accepted friend requests where the current user is either sender or recipient
    const friendRequests = await FriendRequest.find({
      $or: [
        { sender: userId, status: 'accepted' },
        { recipient: userId, status: 'accepted' }
      ]
    })
      .populate('sender', 'fullName email profilePic')
      .populate('recipient', 'fullName email profilePic');

    // Map the results to get friend objects
    const friends = friendRequests.map(request => {
      // If current user is the sender, return the recipient (friend)
      if (request.sender._id.toString() === userId.toString()) {
        return { ...request.recipient._doc, friendshipId: request._id };
      }
      // Else return the sender (friend)
      return { ...request.sender._doc, friendshipId: request._id };
    });

    res.status(200).json(friends);
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

