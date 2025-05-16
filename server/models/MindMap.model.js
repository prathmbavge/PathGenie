import mongoose from 'mongoose';
import MpathPlugin from 'mongoose-mpath';

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

// Nodes Schema with Materialized Path
const nodeSchema = new mongoose.Schema({
  data: {
    label: { type: String, required: true },
    color: { type: String }, // Customization
    priority: { type: Number }, // For sorting or emphasis
  },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
  },
  resources: [
    {
      type: { type: String, enum: ['links', 'images', 'markdown','videoUrls', 'note'] },
      url:[ { type: String }],
      description: { type: String },
    },
  ],
  status: { type: String, enum: ['learning', 'completed'], default: 'learning' },
  mindmapId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mindmap', required: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Node' },
  path: { type: String },
});

// Apply mongoose-mpath plugin
nodeSchema.plugin(MpathPlugin, {
  modelName: 'Node',
  pathSeparator: '#',
  onDelete: 'REPARENT',
});

// Indexes for performance
nodeSchema.index({ path: 1 });
nodeSchema.index({ mindmapId: 1 });

const Node = mongoose.model('Node', nodeSchema);

export { Mindmap, Node };