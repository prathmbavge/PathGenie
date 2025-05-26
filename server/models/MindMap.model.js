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

/**ON DELETE HOOKS
 * When a MINDMAP is deleted, all their NOES should also be deleted.
 */
mindmapSchema.pre('remove', async function (next) {
  try {
    // Assuming Node is another model that has a reference to Mindmap
    const Node = mongoose.model('Node');
    await Node.deleteMany({ mindmapId: this._id });
    next();
  } catch (error) {
    next(error);
  }
});

export default Mindmap ;
