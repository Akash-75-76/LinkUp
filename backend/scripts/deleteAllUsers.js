/**
 * Wipes ALL users and dependent data for local/testing DBs.
 * Run from backend: npm run db:wipe-users
 * Requires MONGO_URI (e.g. in .env next to server.js).
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

import User from "../models/user.model.js";
import Profile from "../models/profile.model.js";
import Post from "../models/posts.model.js";
import Comment from "../models/comments.model.js";
import ConnectionRequest from "../models/connections.model.js";
import Follow from "../models/follow.model.js";
import { Message, ChatRoom, Notification } from "../models/chat.model.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const MONGO_URI = process.env.MONGO_URI;

async function main() {
  if (!MONGO_URI) {
    console.error("Missing MONGO_URI. Set it in backend/.env or the environment.");
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  const results = {};

  results.notifications = (await Notification.deleteMany({})).deletedCount;
  results.messages = (await Message.deleteMany({})).deletedCount;
  results.chatRooms = (await ChatRoom.deleteMany({})).deletedCount;
  results.comments = (await Comment.deleteMany({})).deletedCount;
  results.posts = (await Post.deleteMany({})).deletedCount;
  results.connections = (await ConnectionRequest.deleteMany({})).deletedCount;
  results.follows = (await Follow.deleteMany({})).deletedCount;
  results.profiles = (await Profile.deleteMany({})).deletedCount;
  results.users = (await User.deleteMany({})).deletedCount;

  console.log("Deleted counts:", results);
  console.log("Done. All users and related data removed.");

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
