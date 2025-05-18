import { Mindmap, Node } from '../models/MindMap.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import mongoose from 'mongoose';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { generateBasicMindmap, generateSubtopics, gatherResources } from '../services/aiService.js';

const generateEdges = (nodes) => {
    return nodes
        .filter(node => node.parent)
        .map(node => ({
            id: `${node.parent}-${node._id}`,
            source: node.parent.toString(),
            target: node._id.toString(),
        }));
};

export default {
    getAllMindmaps: asyncHandler(async (req, res) => {
        const { user } = req;
        const mindmaps = await Mindmap.find({ owner: user.id })
            .populate('rootNode')
            .sort({ createdAt: -1 });
        res.status(200).json(new ApiResponse(200, { mindmaps }, 'Mindmaps fetched successfully'));
    }),
    createMindmap: asyncHandler(async (req, res) => {
        const { title } = req.body;
        const { user } = req;

        // Validate input
        if (!title) throw new ApiError(400, 'Title is required');
        if (!user || !user.id) throw new ApiError(401, 'User not authenticated');

        // Call AI to generate basic mindmap
        const { nodes: aiNodes } = await generateBasicMindmap(title);
        if (!aiNodes || aiNodes.length === 0) {
            throw new ApiError(500, 'Failed to generate mindmap structure');
        }

        // Generate ObjectIds for nodes
        const nodeDocs = aiNodes.map((node, index) => ({
            data: node.data,
            position: node.position,
            mindmapId: new mongoose.Types.ObjectId(), // Temporary
            parent: null, // Will be set after nodes are created
            _id: new mongoose.Types.ObjectId(),
        }));

        // Set parent references using ObjectIds
        nodeDocs.forEach((doc, index) => {
            if (aiNodes[index].parentIndex !== null) {
                doc.parent = nodeDocs[aiNodes[index].parentIndex]._id;
            }
        });

        // Create mindmap
        const mindmap = new Mindmap({
            owner: user.id,
            title,
            rootNode: nodeDocs[0]._id,
            nodeCount: nodeDocs.length,
        });
        await mindmap.save();

        // Update mindmapId for all nodes
        nodeDocs.forEach(doc => {
            doc.mindmapId = mindmap._id;
        });

        // Insert nodes
        await Node.insertMany(nodeDocs);

        // Generate edges
        const edges = generateEdges(nodeDocs);
        // Update mindmap with node count
        mindmap.nodeCount = nodeDocs.length;
        await mindmap.save();

        // nodeDocs.forEach(node => {
        //     node.id = node._id;
        // });

        res.status(201).json(new ApiResponse(201, { mindmap, nodes: nodeDocs, edges }, 'Mindmap created'));
    }),

    getMindmap: asyncHandler(async (req, res) => {
        const { mindmapId } = req.params;
        const { user } = req;

        const mindmap = await Mindmap.findById(mindmapId).populate('rootNode');
        if (!mindmap || mindmap.owner.toString() !== user.id.toString()) {
            throw new ApiError(404, 'Mindmap not found');
        }

        const nodes = await Node.find({ mindmapId });
        const edges = generateEdges(nodes);

        res.status(200).json(new ApiResponse(200, { mindmap, nodes, edges }, 'Mindmap fetched'));
    }),

    expandNode: asyncHandler(async (req, res) => {
        const { mindmapId, nodeId } = req.params;
        const { user } = req;

        const mindmap = await Mindmap.findById(mindmapId);
        if (!mindmap || mindmap.owner.toString() !== user.id.toString()) {
            throw new ApiError(404, 'Mindmap not found');
        }

        const parentNode = await Node.findById(nodeId);
        if (!parentNode || parentNode.mindmapId.toString() !== mindmapId) {
            throw new ApiError(404, 'Node not found');
        }

        const { nodes: aiNodes } = await generateSubtopics(parentNode.data.label);
        if (!aiNodes || aiNodes.length === 0) {
            throw new ApiError(500, 'Failed to generate subtopics');
        }

        // Generate node documents with temporary parent values
        const nodeDocs = aiNodes.map((node) => ({
            data: node.data,
            position: node.position,
            mindmapId: mindmap._id,
            parent: null, // Temporary
            _id: new mongoose.Types.ObjectId(),
        }));

        // Assign parent IDs in a second pass
        nodeDocs.forEach((doc, index) => {
            if (index === 0) {
                doc.parent = parentNode._id; // First node connects to the parent
            } else if (aiNodes[index].parentIndex !== null && aiNodes[index].parentIndex >= 0 && aiNodes[index].parentIndex < nodeDocs.length) {
                doc.parent = nodeDocs[aiNodes[index].parentIndex]._id;
            } else {
                doc.parent = parentNode._id; // Fallback to parentNode if parentIndex is invalid
            }
        });

        // Insert new nodes
        const newNodes = await Node.insertMany(nodeDocs);

        // Update node count
        mindmap.nodeCount += newNodes.length;
        await mindmap.save();

        // Generate edges
        const edges = generateEdges(newNodes);

        res.status(200).json(new ApiResponse(200, { newNodes, edges }, 'Node expanded'));
    }),

    getNodeResources: asyncHandler(async (req, res) => {
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

        if (node.resources?.length > 0) {
            return res.status(200).json(new ApiResponse(200, { resources: node.resources }, 'Resources fetched'));
        }

        const { resources } = await gatherResources(node.data.label);
        node.resources = resources;
        await node.save();

        res.status(200).json(new ApiResponse(200, { resources }, 'Resources gathered'));
    }),

    updateNode: asyncHandler(async (req, res) => {
        const { mindmapId, nodeId } = req.params;
        const { data, position, status } = req.body;
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
        if (position) node.position = { ...node.position, ...position };
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