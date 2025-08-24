"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const clientPortalAuth_1 = require("@/middleware/clientPortalAuth");
const clientPortalController_1 = __importDefault(require("@/controllers/clientPortalController"));
const router = (0, express_1.Router)();
router.use(clientPortalAuth_1.clientPortalRateLimit);
router.post('/register', (0, clientPortalAuth_1.logClientActivity)('client_registration'), clientPortalController_1.default.registerClientUser);
router.post('/login', (0, clientPortalAuth_1.logClientActivity)('client_login'), clientPortalController_1.default.loginClientUser);
router.post('/logout', clientPortalAuth_1.authenticateClientUser, (0, clientPortalAuth_1.logClientActivity)('client_logout'), clientPortalController_1.default.logoutClientUser);
router.get('/cases', clientPortalAuth_1.authenticateClientUser, (0, clientPortalAuth_1.logClientActivity)('view_cases'), clientPortalController_1.default.getClientCases);
router.get('/cases/:id', clientPortalAuth_1.authenticateClientUser, clientPortalAuth_1.validateCaseAccess, (0, clientPortalAuth_1.logClientActivity)('view_case_details'), clientPortalController_1.default.getClientCaseDetails);
router.get('/messages', clientPortalAuth_1.authenticateClientUser, (0, clientPortalAuth_1.logClientActivity)('view_messages'), clientPortalController_1.default.getClientMessages);
router.post('/messages', clientPortalAuth_1.authenticateClientUser, (0, clientPortalAuth_1.logClientActivity)('send_message'), clientPortalController_1.default.sendClientMessage);
router.put('/profile', clientPortalAuth_1.authenticateClientUser, (0, clientPortalAuth_1.logClientActivity)('update_profile'), clientPortalController_1.default.updateClientProfile);
exports.default = router;
//# sourceMappingURL=clientPortalRoutes.js.map