"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("@/controllers/userController");
const auth_1 = require("@/middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticateToken, userController_1.getUsers);
router.get('/assignable-roles', auth_1.authenticateToken, userController_1.getAssignableRoles);
router.get('/:id', auth_1.authenticateToken, userController_1.getUserById);
router.get('/:id/activity', auth_1.authenticateToken, userController_1.getUserActivity);
router.post('/', auth_1.authenticateToken, userController_1.createUser);
router.put('/:id', auth_1.authenticateToken, userController_1.updateUser);
router.delete('/:id', auth_1.authenticateToken, userController_1.deleteUser);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map