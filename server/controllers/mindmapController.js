import Mindmap from "../models/MindMap.model.js";
import Node from "../models/Node.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { generateBasicMindmap, generateSubtopics, gatherResources } from "../services/aiService.js";
import downloadResources from "../services/downloadResources.js";


// Helper function to generate edges between nodes
const generateEdges = (nodes) => {
    // Add ancestor property to each node
    const nodesWithAncestors = nodes.map(node => ({
        ...node,
        ancestors: node.parent ? [...(nodes.find(n => n._id === node.parent)?.ancestor || []), node.parent.toString()] : []
    }));

    // Generate edges (same logic as before)
    const newEdges = nodesWithAncestors
        .filter((node) => node.parent)
        .map((node) => ({
            id: `${node.parent}-${node._id}`,
            source: node.parent.toString(),
            target: node._id.toString(),
            animated: true,
            type: "smoothstep",
            markerEnd: {
                type: "arrowclosed",
                color: "orange",
                width: 15,
                height: 15,
            },
            style: {
                stroke: "orange",
                strokeWidth: 3,
            }
        }));

    return {
        nodes: nodesWithAncestors,
        edges: newEdges
    };
};


// Helper function to ensure valid resources field
const ensureValidResources = (node) => {
    if (!node.resources || typeof node.resources !== 'object' || Array.isArray(node.resources)) {
        node.resources = {};
    }
    // Initialize all expected fields if missing
    const resourceFields = ['links', 'images', 'videos', 'notes', 'markdown', 'diagrams', 'codeSnippets'];
    resourceFields.forEach(field => {
        if (!node.resources[field]) {
            node.resources[field] = [];
        }
    });
};

export default {
    getAllMindmaps: asyncHandler(async (req, res) => {
        const { user } = req;
        const mindmaps = await Mindmap.find({
            $or: [
                { owner: user.id },
                { visibility: "public" }
            ]
        })
            .populate("rootNode")
            .sort({ createdAt: -1 });
        res.status(200).json(new ApiResponse(200, { mindmaps }, "Mindmaps fetched successfully"));
    }),

    createMindmap: asyncHandler(async (req, res) => {
        const { title } = req.body;
        const { user } = req;

        if (!title) throw new ApiError(400, "Title is required");
        if (!user || !user.id) throw new ApiError(401, "User not authenticated");

        try {
            const userProfile = { profession: user.profession || 'unknown', experienceYears: user.experienceYears || 0 };
            const { nodes: aiNodes } = await generateBasicMindmap(title, userProfile);
            if (!aiNodes || aiNodes.length === 0) {
                throw new ApiError(500, "Failed to generate mindmap structure");
            }

            const nodeDocs = aiNodes.map((node, index) => ({
                _id: new mongoose.Types.ObjectId(),
                data: node.data,
                mindmapId: new mongoose.Types.ObjectId(),
                parent: null,
                isLeafNode: true,
                resources: {}
            }));

            nodeDocs.forEach((doc, index) => {
                const parentIndex = aiNodes[index].parentIndex;
                if (parentIndex !== null && parentIndex >= 0) {
                    doc.parent = nodeDocs[parentIndex]._id;
                }
            });

            aiNodes.forEach((node, idx) => {
                const parentIdx = node.parentIndex;
                if (parentIdx !== null && parentIdx >= 0) {
                    nodeDocs[parentIdx].isLeafNode = false;
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

            res
                .status(201)
                .json(new ApiResponse(201, { mindmap }, "Mindmap created"));
        } catch (error) {
            console.error("Error creating mindmap:", error);
            throw new ApiError(500, "Failed to create mindmap");
        }
    }),

    getMindmap: asyncHandler(async (req, res) => {
        const { mindmapId } = req.params;
        const { user } = req;

        const mindmap = await Mindmap.findById(mindmapId).populate("rootNode");
        if (!mindmap || mindmap.owner.toString() !== user.id.toString()) {
            throw new ApiError(404, "Mindmap not found");
        }

        // Fetch nodes using lean query (much faster for read-only ops)
        const nodes = await Node.find({ mindmapId }).sort({ path: 1 }).lean();

        const { nodes: updatedNodes, edges } = generateEdges(nodes);
        // console.log("Updated nodes:", updatedNodes);
        res.status(200).json(new ApiResponse(200, { mindmap, nodes: updatedNodes, edges }, "Mindmap fetched"));
    }),


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

        ensureValidResources(parentNode);
        await parentNode.save();

        try {
            const userProfile = { profession: user.profession || 'unknown', experienceYears: user.experienceYears || 0 };
            const { nodes: aiNodes } = await generateSubtopics(parentNode.data.label + '-' + parentNode.data.shortDesc, userProfile);
            if (!aiNodes || aiNodes.length === 0) {
                throw new ApiError(500, "Failed to generate subtopics");
            }

            const nodeDocs = aiNodes.map((node) => ({
                _id: new mongoose.Types.ObjectId(),
                data: node.data,
                mindmapId: mindmap._id,
                parent: null,
                isLeafNode: true,
                resources: {}
            }));

            nodeDocs.forEach((doc, idx) => {
                if (idx === 0) {
                    doc.parent = parentNode._id;
                } else if (
                    aiNodes[idx].parentIndex !== null &&
                    aiNodes[idx].parentIndex >= 0 &&
                    aiNodes[idx].parentIndex < nodeDocs.length
                ) {
                    doc.parent = nodeDocs[aiNodes[idx].parentIndex]._id;
                } else {
                    doc.parent = parentNode._id;
                }
            });

            aiNodes.forEach((node, idx) => {
                if (node.parentIndex !== null && node.parentIndex >= 0) {
                    nodeDocs[node.parentIndex].isLeafNode = false;
                }
            });

            const session = await mongoose.startSession();
            session.startTransaction();
            try {
                const newNodes = await Node.insertMany(nodeDocs, { session });

                if (parentNode.isLeafNode) {
                    parentNode.isLeafNode = false;
                    await parentNode.save({ session });
                }

                mindmap.nodeCount += newNodes.length;
                await mindmap.save({ session });

                await session.commitTransaction();
                session.endSession();
            } catch (error) {
                await session.abortTransaction();
                session.endSession();
                throw error;
            }

            const { nodes: updatedNodes, edges } = generateEdges(nodeDocs);
            res.status(200).json(new ApiResponse(200, { newNodes: updatedNodes, edges }, "Node expanded"));
        } catch (error) {
            console.error("Error expanding node:", error);
            throw new ApiError(500, "Failed to expand node");
        }
    }),

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

        // Ensure resources is a valid object with all fields initialized
        ensureValidResources(node);
        await node.save();

        // Check if resources object is effectively empty
        const resourceFields = ['links', 'images', 'videos', 'notes', 'markdown', 'diagrams', 'codeSnippets'];
        const isResourcesEmpty = !node.resources ||
            Object.keys(node.resources).length === 0 ||
            resourceFields.every(field => {
                const value = node.resources[field];
                return !value || (Array.isArray(value) && value.length === 0);
            });

        if (!isResourcesEmpty) {
            return res.status(200).json(new ApiResponse(200, { resources: node.resources }, "Resources fetched"));
        }

        try {
            const userProfile = { profession: user.profession || 'unknown', experienceYears: user.experienceYears || 0 };
            const { resources } = await gatherResources(node.data.label + '-' + node.data.shortDesc, mindmap.title, userProfile);
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
        const { data, status, resources } = req.body;
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

        ensureValidResources(node);

        if (data) node.data = { ...node.data, ...data };
        if (status) node.status = status;
        if (resources) {
            const validResourceKeys = ['links', 'images', 'videos', 'notes', 'markdown', 'diagrams', 'codeSnippets'];
            const isValidResources = Object.keys(resources).every(key => validResourceKeys.includes(key));
            if (!isValidResources) {
                throw new ApiError(400, "Invalid resources structure");
            }
            node.resources = { ...node.resources, ...resources };
        }

        await node.save();

        res.status(200).json(new ApiResponse(200, { node }, "Node updated"));
    }),

    deleteNode: asyncHandler(async (req, res) => {
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

        const parentId = node.parent ? node.parent.toString() : null;

        await node.deleteOne();

        if (parentId) {
            const siblingCount = await Node.countDocuments({
                mindmapId: mindmapId,
                parent: parentId,
            });
            if (siblingCount === 0) {
                const parentNode = await Node.findById(parentId);
                if (parentNode) {
                    ensureValidResources(parentNode);
                    parentNode.isLeafNode = true;
                    await parentNode.save();
                }
            }
        }

        mindmap.nodeCount -= 1;
        await mindmap.save();

        res.status(200).json(new ApiResponse(200, {}, "Node deleted"));
    }),

    updateMindmap: asyncHandler(async (req, res) => {
        const { mindmapId } = req.params;
        const { title, tags, visibility } = req.body;
        const { user } = req;

        if (!mindmapId) throw new ApiError(400, "Mindmap ID is required");

        const mindmap = await Mindmap.findById(mindmapId);
        if (!mindmap || mindmap.owner.toString() !== user.id.toString()) {
            throw new ApiError(404, "Mindmap not found");
        }

        if (title) mindmap.title = title;
        if (tags) mindmap.tags = tags;
        if (visibility) mindmap.visibility = visibility;

        mindmap.updatedAt = Date.now();
        await mindmap.save();

        res.status(200).json(new ApiResponse(200, { mindmap }, "Mindmap updated"));
    }),

    downloadResources: downloadResources,
};