"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const auth_1 = require("@/middleware/auth");
const roleAccess_1 = require("@/utils/roleAccess");
const documentSecurityController_1 = __importDefault(require("@/controllers/documentSecurityController"));
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024
    }
});
router.post('/upload', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.UPLOAD_DOCUMENTS), upload.single('file'), documentSecurityController_1.default.uploadSecureDocument);
router.get('/:id/download', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.DOWNLOAD_DOCUMENTS), documentSecurityController_1.default.downloadSecureDocument);
router.put('/:id/security', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.UPDATE_DOCUMENTS), documentSecurityController_1.default.updateDocumentSecurity);
router.get('/:id/metadata', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.VIEW_DOCUMENTS), documentSecurityController_1.default.getDocumentSecurityMetadata);
router.get('/:id/audit', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.VIEW_AUDIT_LOGS), documentSecurityController_1.default.getDocumentAuditLog);
router.get('/:id/access', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.VIEW_DOCUMENTS), documentSecurityController_1.default.checkDocumentAccess);
exports.default = router;
//# sourceMappingURL=documentSecurityRoutes.js.map