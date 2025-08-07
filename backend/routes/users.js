const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middlewares/auth');
const { getUsers, createUser, updateUser, banUser, unbanUser, addCredits, removeCredits, addDays, removeDays, changeUserRole, setUserModuleLimit, login, register, getUserMetrics, deleteUser } = require('../controllers/userController');

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
router.put('/:id/role', requireRole(['admin']), changeUserRole);
router.post('/:id/module-limit', requireRole(['admin']), setUserModuleLimit);
router.delete('/:id', requireRole(['admin', 'revendedor']), deleteUser);

router.get('/me', (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
