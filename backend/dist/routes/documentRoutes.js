"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const documentController_1 = require("@/controllers/documentController");
const auth_1 = require("@/middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticateToken, documentController_1.getDocuments);
router.get('/stats', auth_1.authenticateToken, documentController_1.getDocumentStats);
router.get('/search', auth_1.authenticateToken, documentController_1.searchDocuments);
router.get('/:id', auth_1.authenticateToken, documentController_1.getDocumentById);
router.get('/:id/download', auth_1.authenticateToken, documentController_1.downloadDocument);
router.post('/', auth_1.authenticateToken, documentController_1.uploadDocument);
router.put('/:id', auth_1.authenticateToken, documentController_1.updateDocument);
router.delete('/:id', auth_1.authenticateToken, documentController_1.deleteDocument);
exports.default = router;
//# sourceMappingURL=documentRoutes.js.map