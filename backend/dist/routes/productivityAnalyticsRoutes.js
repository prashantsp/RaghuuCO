"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("@/middleware/auth");
const roleAccess_1 = require("@/utils/roleAccess");
const productivityAnalyticsController_1 = __importDefault(require("@/controllers/productivityAnalyticsController"));
const router = (0, express_1.Router)();
router.get('/overview', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.VIEW_PRODUCTIVITY_REPORTS), productivityAnalyticsController_1.default.getProductivityOverview);
router.get('/user/:userId', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.VIEW_PRODUCTIVITY_REPORTS), productivityAnalyticsController_1.default.getUserProductivityAnalytics);
router.get('/team', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.VIEW_PRODUCTIVITY_REPORTS), productivityAnalyticsController_1.default.getTeamProductivityAnalytics);
router.get('/efficiency', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.VIEW_PRODUCTIVITY_REPORTS), productivityAnalyticsController_1.default.getEfficiencyMetrics);
router.get('/benchmarking', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.VIEW_PRODUCTIVITY_REPORTS), productivityAnalyticsController_1.default.getPerformanceBenchmarking);
exports.default = router;
//# sourceMappingURL=productivityAnalyticsRoutes.js.map