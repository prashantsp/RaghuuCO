"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("@/controllers/userController");
const auth_1 = require("@/middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticateToken, (0, auth_1.authorizePermission)('user:read'), async (req, res, next) => {
    try {
        await (0, userController_1.getUsers)(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.get('/assignable-roles', auth_1.authenticateToken, async (req, res, next) => {
    try {
        await (0, userController_1.getAssignableRoles)(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.get('/:id', auth_1.authenticateToken, async (req, res, next) => {
    try {
        await (0, userController_1.getUserById)(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.get('/:id/activity', auth_1.authenticateToken, async (req, res, next) => {
    try {
        await (0, userController_1.getUserActivity)(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.post('/', auth_1.authenticateToken, (0, auth_1.authorizePermission)('user:create'), async (req, res, next) => {
    try {
        await (0, userController_1.createUser)(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.put('/:id', auth_1.authenticateToken, async (req, res, next) => {
    try {
        await (0, userController_1.updateUser)(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.delete('/:id', auth_1.authenticateToken, (0, auth_1.authorizePermission)('user:delete'), async (req, res, next) => {
    try {
        await (0, userController_1.deleteUser)(req, res);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=userRoutes.js.map