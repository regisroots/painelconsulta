const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const { getProfile, updateProfile, changePassword } = require('../controllers/profileController');

router.use(authenticateToken);

router.get('/', getProfile);
router.put('/', updateProfile);
router.post('/change-password', changePassword);

module.exports = router;
