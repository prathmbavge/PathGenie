import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  language: {
    type: String,
    default: "",
  },
  background: {
    type: String,
    default: "",
  },
  interests: {
    type: String,
    default: "",
  },
  learningGoals: {
    type: String,
    default: "",
  },
  learningStyle: {
    type: String,
    default: "",
  },
  knowledgeLevel: {
    type: String,
    default: "",
  },
  contentTypes: {
    type: String,
    default: "",
  },
  timeCommitment: {
    type: String,
    default: "",
  },
  bio: {
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

