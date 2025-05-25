import express from 'express';
const router = express.Router();
import mindmapController from '../controllers/mindmapController.js';
import authMiddleware from '../middlewares/authMiddleware.js'; // Assuming you have this middleware

router.get('/', mindmapController.getAllMindmaps);
router.post('/', mindmapController.createMindmap);
router.get('/:mindmapId', mindmapController.getMindmap);
router.post('/:mindmapId/nodes/:nodeId/expand', mindmapController.expandNode);
router.get('/:mindmapId/nodes/:nodeId/resources', mindmapController.getNodeResources);
router.put('/:mindmapId/nodes/:nodeId', mindmapController.updateNode);
router.delete('/:mindmapId/nodes/:nodeId', mindmapController.deleteNode);
router.put('/:mindmapId', mindmapController.updateMindmap);
router.post('/nodes/:nodeId/download-resources', mindmapController.downloadResources);


export default router;