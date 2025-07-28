import mongoose from 'mongoose';

const friendRequestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// Ensure one pending request per user pair
friendRequestSchema.index(
  { sender: 1, recipient: 1 },
  { unique: true, partialFilterExpression: { status: 'pending' } }
);

export default mongoose.model('FriendRequest', friendRequestSchema);
