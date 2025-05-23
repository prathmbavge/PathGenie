import mongoose from 'mongoose';

// Mindmaps Schema
const mindmapSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  rootNode: { type: mongoose.Schema.Types.ObjectId, ref: 'Node', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  tags: [{ type: String }], // For searchability
  visibility: { type: String, enum: ['public', 'private'], default: 'private' },
  nodeCount: { type: Number, default: 1 }, // Cached for quick access
});
const Mindmap = mongoose.model('Mindmap', mindmapSchema);

export default Mindmap ;
