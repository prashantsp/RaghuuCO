"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const caseController_1 = require("@/controllers/caseController");
const auth_1 = require("@/middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticateToken, caseController_1.getCases);
router.get('/stats', auth_1.authenticateToken, caseController_1.getCaseStats);
router.get('/:id', auth_1.authenticateToken, caseController_1.getCaseById);
router.post('/', auth_1.authenticateToken, caseController_1.createCase);
router.put('/:id', auth_1.authenticateToken, caseController_1.updateCase);
router.delete('/:id', auth_1.authenticateToken, caseController_1.deleteCase);
exports.default = router;
//# sourceMappingURL=caseRoutes.js.map