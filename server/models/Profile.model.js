import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
    userId: {
    type: String,
  },
  bio: {
    type: String,
    default: "",
  },
  avatar: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model("Profile", profileSchema);    
  