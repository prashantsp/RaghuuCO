"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const caseController_1 = require("@/controllers/caseController");
const auth_1 = require("@/middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticateToken, (0, auth_1.authorizePermission)('case:read'), async (req, res, next) => {
    try {
        await (0, caseController_1.getCases)(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.get('/stats', auth_1.authenticateToken, (0, auth_1.authorizePermission)('case:read'), async (req, res, next) => {
    try {
        await (0, caseController_1.getCaseStats)(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.get('/:id', auth_1.authenticateToken, (0, auth_1.authorizePermission)('case:read'), async (req, res, next) => {
    try {
        await (0, caseController_1.getCaseById)(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.post('/', auth_1.authenticateToken, (0, auth_1.authorizePermission)('case:create'), async (req, res, next) => {
    try {
        await (0, caseController_1.createCase)(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.put('/:id', auth_1.authenticateToken, (0, auth_1.authorizePermission)('case:update'), async (req, res, next) => {
    try {
        await (0, caseController_1.updateCase)(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.delete('/:id', auth_1.authenticateToken, (0, auth_1.authorizePermission)('case:delete'), async (req, res, next) => {
    try {
        await (0, caseController_1.deleteCase)(req, res);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=caseRoutes.js.map