"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("@/middleware/auth");
const roleAccess_1 = require("@/utils/roleAccess");
const globalSearchController_1 = __importDefault(require("@/controllers/globalSearchController"));
const router = (0, express_1.Router)();
router.get('/global', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.USE_GLOBAL_SEARCH), globalSearchController_1.default.globalSearch);
router.get('/suggestions', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.USE_GLOBAL_SEARCH), globalSearchController_1.default.getSearchSuggestions);
router.get('/statistics', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.VIEW_SEARCH_STATISTICS), globalSearchController_1.default.getSearchStatistics);
router.get('/popular', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.USE_GLOBAL_SEARCH), globalSearchController_1.default.getPopularSearchTerms);
exports.default = router;
//# sourceMappingURL=globalSearchRoutes.js.map