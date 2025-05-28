import express from 'express';
const router = express.Router();
import mindmapController from '../controllers/mindmapController.js';

router.get('/', mindmapController.getAllMindmaps);
router.post('/', mindmapController.createMindmap);
router.get('/:mindmapId', mindmapController.getMindmap);
router.post('/:mindmapId/nodes/:nodeId/expand', mindmapController.expandNode);
router.get('/:mindmapId/nodes/:nodeId/resources', mindmapController.getNodeResources);
router.put('/:mindmapId/nodes/:nodeId', mindmapController.updateNode);
router.put('/:mindmapId', mindmapController.updateMindmap);
router.post('/nodes/:nodeId/download-resources', mindmapController.downloadResources);
router.delete('/:mindmapId',mindmapController.deleteMindmap);


export default router;