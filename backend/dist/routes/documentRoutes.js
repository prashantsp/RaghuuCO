"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const documentController_1 = require("@/controllers/documentController");
const auth_1 = require("@/middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticateToken, (0, auth_1.authorizePermission)('document:read'), async (req, res, next) => {
    try {
        await (0, documentController_1.getDocuments)(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.get('/stats', auth_1.authenticateToken, (0, auth_1.authorizePermission)('document:read'), async (req, res, next) => {
    try {
        await (0, documentController_1.getDocumentStats)(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.get('/search', auth_1.authenticateToken, (0, auth_1.authorizePermission)('document:read'), async (req, res, next) => {
    try {
        await (0, documentController_1.searchDocuments)(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.get('/:id', auth_1.authenticateToken, (0, auth_1.authorizePermission)('document:read'), async (req, res, next) => {
    try {
        await (0, documentController_1.getDocumentById)(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.get('/:id/download', auth_1.authenticateToken, (0, auth_1.authorizePermission)('document:read'), async (req, res, next) => {
    try {
        await (0, documentController_1.downloadDocument)(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.post('/', auth_1.authenticateToken, (0, auth_1.authorizePermission)('document:create'), documentController_1.uploadDocument);
router.put('/:id', auth_1.authenticateToken, (0, auth_1.authorizePermission)('document:update'), async (req, res, next) => {
    try {
        await (0, documentController_1.updateDocument)(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.delete('/:id', auth_1.authenticateToken, (0, auth_1.authorizePermission)('document:delete'), async (req, res, next) => {
    try {
        await (0, documentController_1.deleteDocument)(req, res);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=documentRoutes.js.map