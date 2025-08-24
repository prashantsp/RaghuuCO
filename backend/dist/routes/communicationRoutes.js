"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("@/middleware/auth");
const communicationController_1 = require("@/controllers/communicationController");
const router = (0, express_1.Router)();
router.get('/messages', auth_1.authenticateToken, communicationController_1.getInternalMessages);
router.get('/messages/received', auth_1.authenticateToken, communicationController_1.getReceivedMessages);
router.get('/messages/:id', auth_1.authenticateToken, communicationController_1.getInternalMessageById);
router.post('/messages', auth_1.authenticateToken, communicationController_1.createInternalMessage);
router.put('/messages/:id', auth_1.authenticateToken, communicationController_1.updateInternalMessage);
router.delete('/messages/:id', auth_1.authenticateToken, communicationController_1.deleteInternalMessage);
router.put('/messages/:id/status', auth_1.authenticateToken, communicationController_1.updateMessageStatus);
router.get('/email-templates', auth_1.authenticateToken, communicationController_1.getEmailTemplates);
router.post('/email-templates', auth_1.authenticateToken, communicationController_1.createEmailTemplate);
router.put('/email-templates/:id', auth_1.authenticateToken, communicationController_1.updateEmailTemplate);
exports.default = router;
//# sourceMappingURL=communicationRoutes.js.map