"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("@/middleware/auth");
const dashboardController_1 = __importDefault(require("@/controllers/dashboardController"));
const router = express_1.default.Router();
router.get('/stats', auth_1.authenticateToken, dashboardController_1.default.getDashboardStats);
router.get('/activities', auth_1.authenticateToken, dashboardController_1.default.getRecentActivities);
router.get('/summary', auth_1.authenticateToken, dashboardController_1.default.getDashboardSummary);
exports.default = router;
//# sourceMappingURL=dashboardRoutes.js.map