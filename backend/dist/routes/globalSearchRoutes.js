"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("@/middleware/auth");
const globalSearchController_1 = require("@/controllers/globalSearchController");
const router = (0, express_1.Router)();
router.get('/global', auth_1.authenticateToken, globalSearchController_1.globalSearch);
router.get('/suggestions', auth_1.authenticateToken, globalSearchController_1.getSearchSuggestions);
router.get('/statistics', auth_1.authenticateToken, globalSearchController_1.getSearchStatistics);
router.get('/popular', auth_1.authenticateToken, globalSearchController_1.getPopularSearchTerms);
exports.default = router;
//# sourceMappingURL=globalSearchRoutes.js.map