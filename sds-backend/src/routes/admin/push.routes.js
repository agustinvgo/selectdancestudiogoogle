const express = require('express');
const PushController = require('../../controllers/admin/push.controller');
const { verifyToken, isAdmin } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.use(verifyToken, isAdmin);
router.get('/public-key', PushController.getPublicKey);
router.post('/status', PushController.getStatus);
router.post('/subscribe', PushController.subscribe);
router.post('/unsubscribe', PushController.unsubscribe);
router.post('/test', PushController.test);

module.exports = router;
