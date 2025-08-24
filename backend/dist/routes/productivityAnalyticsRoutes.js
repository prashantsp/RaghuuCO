"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("@/middleware/auth");
const productivityAnalyticsController_1 = require("@/controllers/productivityAnalyticsController");
const router = (0, express_1.Router)();
router.get('/overview', auth_1.authenticateToken, productivityAnalyticsController_1.getProductivityOverview);
router.get('/user/:userId', auth_1.authenticateToken, productivityAnalyticsController_1.getUserProductivityAnalytics);
router.get('/team', auth_1.authenticateToken, productivityAnalyticsController_1.getTeamProductivityAnalytics);
router.get('/efficiency', auth_1.authenticateToken, productivityAnalyticsController_1.getEfficiencyMetrics);
router.get('/benchmarking', auth_1.authenticateToken, productivityAnalyticsController_1.getPerformanceBenchmarking);
exports.default = router;
//# sourceMappingURL=productivityAnalyticsRoutes.js.map