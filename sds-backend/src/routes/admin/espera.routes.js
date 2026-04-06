const express = require('express');
const router = express.Router();
const EsperaController = require('../../controllers/admin/espera.controller');

const { publicFormLimiter } = require('../../middlewares/rateLimiters');

// Public: Join waiting list
router.post('/', publicFormLimiter, EsperaController.joinWaitingList);

module.exports = router;
