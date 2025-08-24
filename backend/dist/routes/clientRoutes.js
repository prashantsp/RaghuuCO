"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const clientController_1 = require("@/controllers/clientController");
const auth_1 = require("@/middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticateToken, (0, auth_1.authorizePermission)('client:read'), async (req, res, next) => {
    try {
        await (0, clientController_1.getClients)(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.get('/stats', auth_1.authenticateToken, (0, auth_1.authorizePermission)('client:read'), async (req, res, next) => {
    try {
        await (0, clientController_1.getClientStats)(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.get('/conflicts', auth_1.authenticateToken, (0, auth_1.authorizePermission)('client:read'), async (req, res, next) => {
    try {
        await (0, clientController_1.checkClientConflicts)(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.get('/:id', auth_1.authenticateToken, (0, auth_1.authorizePermission)('client:read'), async (req, res, next) => {
    try {
        await (0, clientController_1.getClientById)(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.post('/', auth_1.authenticateToken, (0, auth_1.authorizePermission)('client:create'), async (req, res, next) => {
    try {
        await (0, clientController_1.createClient)(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.put('/:id', auth_1.authenticateToken, (0, auth_1.authorizePermission)('client:update'), async (req, res, next) => {
    try {
        await (0, clientController_1.updateClient)(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.delete('/:id', auth_1.authenticateToken, (0, auth_1.authorizePermission)('client:delete'), async (req, res, next) => {
    try {
        await (0, clientController_1.deleteClient)(req, res);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=clientRoutes.js.map