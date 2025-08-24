"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const clientController_1 = require("@/controllers/clientController");
const auth_1 = require("@/middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticateToken, clientController_1.getClients);
router.get('/stats', auth_1.authenticateToken, clientController_1.getClientStats);
router.get('/conflicts', auth_1.authenticateToken, clientController_1.checkClientConflicts);
router.get('/:id', auth_1.authenticateToken, clientController_1.getClientById);
router.post('/', auth_1.authenticateToken, clientController_1.createClient);
router.put('/:id', auth_1.authenticateToken, clientController_1.updateClient);
router.delete('/:id', auth_1.authenticateToken, clientController_1.deleteClient);
exports.default = router;
//# sourceMappingURL=clientRoutes.js.map