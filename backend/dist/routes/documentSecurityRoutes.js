"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const auth_1 = require("@/middleware/auth");
const documentSecurityController_1 = require("@/controllers/documentSecurityController");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024
    }
});
router.post('/upload', auth_1.authenticateToken, upload.single('file'), documentSecurityController_1.uploadSecureDocument);
router.get('/:id/download', auth_1.authenticateToken, documentSecurityController_1.downloadSecureDocument);
router.put('/:id/security', auth_1.authenticateToken, documentSecurityController_1.updateDocumentSecurity);
router.get('/:id/metadata', auth_1.authenticateToken, documentSecurityController_1.getDocumentSecurityMetadata);
router.get('/:id/audit', auth_1.authenticateToken, documentSecurityController_1.getDocumentAuditLog);
router.get('/:id/access', auth_1.authenticateToken, documentSecurityController_1.checkDocumentAccess);
exports.default = router;
//# sourceMappingURL=documentSecurityRoutes.js.map