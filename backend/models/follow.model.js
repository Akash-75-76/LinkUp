import mongoose from 'mongoose';

const FollowSchema = new mongoose.Schema({
  followerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  followingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent duplicate follows
FollowSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

const Follow = mongoose.model('Follow', FollowSchema);
export default Follow;