import MpathPlugin from "mongoose-mpath";
import mongoose from "mongoose";

// Resource Schema (Embedded)
const resourceSchema = new mongoose.Schema({
  links: [
    {
      url: { type: String, required: true },
      title: { type: String },
      description: { type: String },
      metadata: { type: mongoose.Schema.Types.Mixed }, // e.g., { source: 'Perplexity' }
    },
  ],
  images: [
    {
      url: { type: String, required: true },
      alt: { type: String },
      caption: { type: String },
      metadata: { type: mongoose.Schema.Types.Mixed }, // e.g., { width: 300 }
    },
  ],
  videos: [
    {
      url: { type: String, required: true },
      title: { type: String },
      description: { type: String },
      metadata: { type: mongoose.Schema.Types.Mixed }, // e.g., { duration: '5min' }
    },
  ],
  notes: [
    {
      content: { type: String, required: true },
      metadata: { type: mongoose.Schema.Types.Mixed }, // e.g., { createdBy: 'Sonar API' }
    },
  ],
  markdown: [
    {
      content: { type: String, required: true },
      metadata: { type: mongoose.Schema.Types.Mixed }, // e.g., { render: 'mathjax' }
    },
  ],
  diagrams: [
    {
      content: { type: String, required: true },
      format: {
        type: String,
        enum: ["markmap", "mermaid", "plantuml"],
        required: true,
      },
      metadata: { type: mongoose.Schema.Types.Mixed }, // e.g., { theme: 'dark' }
    },
  ],
  codeSnippets: [
    {
      content: { type: String, required: true },
      language: { type: String, required: true },
      metadata: { type: mongoose.Schema.Types.Mixed }, // e.g., { purpose: 'example' }
    },
  ],
});

// Nodes Schema with Materialized Path
const nodeSchema = new mongoose.Schema({
  data: {
    label: { type: String, required: true },
    shortDesc: { type: String }, // Short description for quick reference
    color: { type: String }, // Customization
    priority: { type: Number }, // For sorting or emphasis
  },
  isLeafNode: {
    type: Boolean,
    default: true,
    index: true, // still index this field
  },
  resources: { type: resourceSchema, default: () => ({}) }, // Single embedded resource document
  status: { type: String, enum: ["learning", "completed"], default: "learning" },
  mindmapId: { type: mongoose.Schema.Types.ObjectId, ref: "Mindmap", required: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: "Node" },
  path: { type: String }, // plugin will create index on this automatically
});

// Apply mongoose-mpath plugin
nodeSchema.plugin(MpathPlugin, {
  modelName: "Node",
  pathSeparator: "#",
  onDelete: "REPARENT",
});

nodeSchema.index({ mindmapId: 1 });

const Node = mongoose.model("Node", nodeSchema);

export default Node;
