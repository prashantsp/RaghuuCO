"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("@/middleware/auth");
const roleAccess_1 = require("@/utils/roleAccess");
const communicationController_1 = __importDefault(require("@/controllers/communicationController"));
const router = (0, express_1.Router)();
router.get('/messages', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.VIEW_COMMUNICATION), communicationController_1.default.getInternalMessages);
router.get('/messages/received', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.VIEW_COMMUNICATION), communicationController_1.default.getReceivedMessages);
router.get('/messages/:id', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.VIEW_COMMUNICATION), communicationController_1.default.getInternalMessageById);
router.post('/messages', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.CREATE_COMMUNICATION), communicationController_1.default.createInternalMessage);
router.put('/messages/:id', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.UPDATE_COMMUNICATION), communicationController_1.default.updateInternalMessage);
router.delete('/messages/:id', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.DELETE_COMMUNICATION), communicationController_1.default.deleteInternalMessage);
router.put('/messages/:id/status', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.UPDATE_COMMUNICATION), communicationController_1.default.updateMessageStatus);
router.get('/email-templates', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.VIEW_COMMUNICATION), communicationController_1.default.getEmailTemplates);
router.post('/email-templates', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.CREATE_COMMUNICATION), communicationController_1.default.createEmailTemplate);
router.put('/email-templates/:id', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.UPDATE_EVENTS), communicationController_1.default.updateEmailTemplate);
exports.default = router;
//# sourceMappingURL=communicationRoutes.js.map