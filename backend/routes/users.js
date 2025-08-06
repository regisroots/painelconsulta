const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middlewares/auth');
const { getUsers, createUser, updateUser, banUser, unbanUser, addCredits, removeCredits, addDays, removeDays, addHours, changeUserRole, setUserModuleLimit, login, register, getUserMetrics } = require('../controllers/userController');

router.post('/login', login);

router.post('/register', register);

router.use(authenticateToken);

router.get('/metrics', requireRole(['admin', 'revendedor']), getUserMetrics);
router.get('/', requireRole(['admin', 'revendedor']), getUsers);

router.post('/', requireRole(['admin', 'revendedor']), createUser);

router.put('/:id', requireRole(['admin', 'revendedor']), updateUser);

router.post('/:id/ban', requireRole(['admin', 'revendedor']), banUser);
router.post('/:id/unban', requireRole(['admin', 'revendedor']), unbanUser);
router.post('/:id/credits/add', requireRole(['admin', 'revendedor']), addCredits);
router.post('/:id/credits/remove', requireRole(['admin', 'revendedor']), removeCredits);
router.post('/:id/days/add', requireRole(['admin', 'revendedor']), addDays);
router.post('/:id/days/remove', requireRole(['admin', 'revendedor']), removeDays);
router.post('/:id/hours/add', requireRole(['admin', 'revendedor']), addHours);
router.put('/:id/role', requireRole(['admin']), changeUserRole);
router.post('/:id/module-limit', requireRole(['admin']), setUserModuleLimit);

module.exports = router;
