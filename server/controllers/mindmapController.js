import { Mindmap, Node } from "../models/MindMap.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { generateBasicMindmap, generateSubtopics, gatherResources } from "../services/aiService.js";

// Helper function to generate edges between nodes
const generateEdges = (nodes) => {
    return nodes
        .filter((node) => node.parent)
        .map((node) => ({
            id: `${node.parent}-${node._id}`,
            source: node.parent.toString(),
            target: node._id.toString(),
            animated: true,
            type: "smoothstep",
            markerEnd: {
                type: "arrowclosed",
                color: "pink",
                width: 30,
                height: 30,
            },
        }));
};

export default {

    getAllMindmaps: asyncHandler(async (req, res) => {
        const { user } = req;
        const mindmaps = await Mindmap.find({ owner: user.id })
            .populate("rootNode")
            .sort({ createdAt: -1 });
        res.status(200).json(new ApiResponse(200, { mindmaps }, "Mindmaps fetched successfully"));
    }),

    // Create a new mindmap
    createMindmap: asyncHandler(async (req, res) => {
        const { title } = req.body;
        const { user } = req;

        if (!title) throw new ApiError(400, "Title is required");
        if (!user || !user.id) throw new ApiError(401, "User not authenticated");

        try {
            const { nodes: aiNodes } = await generateBasicMindmap(title);
            if (!aiNodes || aiNodes.length === 0) {
                throw new ApiError(500, "Failed to generate mindmap structure");
            }
console.log("AI Nodes:", aiNodes);
            const nodeDocs = aiNodes.map((node, index) => ({
                data: node.data,
                mindmapId: new mongoose.Types.ObjectId(), // Temporary
                parent: null, // Will be set later
                _id: new mongoose.Types.ObjectId(),
            }));

            nodeDocs.forEach((doc, index) => {
                if (aiNodes[index].parentIndex !== null) {
                    doc.parent = nodeDocs[aiNodes[index].parentIndex]._id;
                }
            });

            const mindmap = new Mindmap({
                owner: user.id,
                title,
                rootNode: nodeDocs[0]._id,
                nodeCount: nodeDocs.length,
            });

            const session = await mongoose.startSession();
            session.startTransaction();

            try {
                await mindmap.save({ session });
                nodeDocs.forEach((doc) => {
                    doc.mindmapId = mindmap._id;
                });
                await Node.insertMany(nodeDocs, { session });
                await session.commitTransaction();
                session.endSession();
            } catch (error) {
                await session.abortTransaction();
                session.endSession();
                throw error;
            }

            const edges = generateEdges(nodeDocs);
            res
                .status(201)
                .json(new ApiResponse(201, { mindmap, nodes: nodeDocs, edges }, "Mindmap created"));
        } catch (error) {
            console.error("Error creating mindmap:", error);
            throw new ApiError(500, "Failed to create mindmap");
        }
    }),

    // Fetch a specific mindmap with its nodes and edges
    getMindmap: asyncHandler(async (req, res) => {
        const { mindmapId } = req.params;
        const { user } = req;

        const mindmap = await Mindmap.findById(mindmapId).populate("rootNode");
        if (!mindmap || mindmap.owner.toString() !== user.id.toString()) {
            throw new ApiError(404, "Mindmap not found");
        }

        const nodes = await Node.find({ mindmapId });
        // console.log("Fetched nodes:", nodes);
        const edges = generateEdges(nodes);

        res.status(200).json(new ApiResponse(200, { mindmap, nodes, edges }, "Mindmap fetched"));
    }),

    // Expand an existing node with subtopics
    expandNode: asyncHandler(async (req, res) => {
        const { mindmapId, nodeId } = req.params;
        const { user } = req;

        if (!mindmapId || !nodeId) throw new ApiError(400, "Mindmap ID and Node ID are required");

        const mindmap = await Mindmap.findById(mindmapId);
        if (!mindmap || mindmap.owner.toString() !== user.id.toString()) {
            throw new ApiError(404, "Mindmap not found");
        }

        const parentNode = await Node.findById(nodeId);
        if (!parentNode || parentNode.mindmapId.toString() !== mindmapId) {
            throw new ApiError(404, "Node not found");
        }

        try {
            const { nodes: aiNodes } = await generateSubtopics(parentNode.data.label);
            if (!aiNodes || aiNodes.length === 0) {
                throw new ApiError(500, "Failed to generate subtopics");
            }

            const nodeDocs = aiNodes.map((node) => ({
                data: node.data,
                mindmapId: mindmap._id,
                parent: null, // Temporary
                _id: new mongoose.Types.ObjectId(),
            }));

            nodeDocs.forEach((doc, index) => {
                if (index === 0) {
                    doc.parent = parentNode._id;
                } else if (
                    aiNodes[index].parentIndex !== null &&
                    aiNodes[index].parentIndex >= 0 &&
                    aiNodes[index].parentIndex < nodeDocs.length
                ) {
                    doc.parent = nodeDocs[aiNodes[index].parentIndex]._id;
                } else {
                    doc.parent = parentNode._id;
                }
            });

            const session = await mongoose.startSession();
            session.startTransaction();

            try {
                const newNodes = await Node.insertMany(nodeDocs, { session });
                mindmap.nodeCount += newNodes.length;
                await mindmap.save({ session });
                await session.commitTransaction();
                session.endSession();
            } catch (error) {
                await session.abortTransaction();
                session.endSession();
                throw error;
            }

            const edges = generateEdges(nodeDocs);
            res.status(200).json(new ApiResponse(200, { newNodes: nodeDocs, edges }, "Node expanded"));
        } catch (error) {
            console.error("Error expanding node:", error);
            throw new ApiError(500, "Failed to expand node");
        }
    }),

    // Fetch or gather resources for a node
    getNodeResources: asyncHandler(async (req, res) => {
        const { mindmapId, nodeId } = req.params;
        const { user } = req;

        if (!mindmapId || !nodeId) throw new ApiError(400, "Mindmap ID and Node ID are required");

        const mindmap = await Mindmap.findById(mindmapId);
        if (!mindmap || mindmap.owner.toString() !== user.id.toString()) {
            throw new ApiError(404, "Mindmap not found");
        }

        const node = await Node.findById(nodeId);
        if (!node || node.mindmapId.toString() !== mindmapId) {
            throw new ApiError(404, "Node not found");
        }

        if (node.resources?.length > 0) {
            return res.status(200).json(new ApiResponse(200, { resources: node.resources }, "Resources fetched"));
        }

        try {
            const { resources } = await gatherResources(node.data.label);
            node.resources = resources;
            await node.save();
            res.status(200).json(new ApiResponse(200, { resources }, "Resources gathered"));
        } catch (error) {
            console.error("Error gathering resources:", error);
            throw new ApiError(500, "Failed to gather resources");
        }
    }),

    updateNode: asyncHandler(async (req, res) => {
        const { mindmapId, nodeId } = req.params;
        const { data, status } = req.body;
        const { user } = req;

        const mindmap = await Mindmap.findById(mindmapId);
        if (!mindmap || mindmap.owner.toString() !== user.id.toString()) {
            throw new ApiError(404, 'Mindmap not found');
        }

        const node = await Node.findById(nodeId);
        if (!node || node.mindmapId.toString() !== mindmapId) {
            throw new ApiError(404, 'Node not found');
        }

        if (data) node.data = { ...node.data, ...data };
        if (status) node.status = status;

        await node.save();

        res.status(200).json(new ApiResponse(200, { node }, 'Node updated'));
    }),

    deleteNode: asyncHandler(async (req, res) => {
        const { mindmapId, nodeId } = req.params;
        const { user } = req;

        const mindmap = await Mindmap.findById(mindmapId);
        if (!mindmap || mindmap.owner.toString() !== user.id.toString()) {
            throw new ApiError(404, 'Mindmap not found');
        }

        const node = await Node.findById(nodeId);
        if (!node || node.mindmapId.toString() !== mindmapId) {
            throw new ApiError(404, 'Node not found');
        }

        await node.remove();
        mindmap.nodeCount -= 1;
        await mindmap.save();

        res.status(200).json(new ApiResponse(200, {}, 'Node deleted'));
    }),

    updateMindmap: asyncHandler(async (req, res) => {
        const { mindmapId } = req.params;
        const { title, tags, visibility } = req.body;
        const { user } = req;

        const mindmap = await Mindmap.findById(mindmapId);
        if (!mindmap || mindmap.owner.toString() !== user.id.toString()) {
            throw new ApiError(404, 'Mindmap not found');
        }

        if (title) mindmap.title = title;
        if (tags) mindmap.tags = tags;
        if (visibility) mindmap.visibility = visibility;

        mindmap.updatedAt = Date.now();
        await mindmap.save();

        res.status(200).json(new ApiResponse(200, { mindmap }, 'Mindmap updated'));
    }),
};