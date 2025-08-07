const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middlewares/auth');
const { getAdminStats } = require('../controllers/adminController');

router.use(authenticateToken);
router.use(requireRole(['admin']));

router.get('/stats', getAdminStats);

module.exports = router;
