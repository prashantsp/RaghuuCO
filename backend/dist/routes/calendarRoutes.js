"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("@/middleware/auth");
const roleAccess_1 = require("@/utils/roleAccess");
const calendarController_1 = __importDefault(require("@/controllers/calendarController"));
const router = (0, express_1.Router)();
router.get('/events', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.VIEW_CALENDAR), calendarController_1.default.getCalendarEvents);
router.get('/events/upcoming', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.VIEW_CALENDAR), calendarController_1.default.getUpcomingEvents);
router.get('/events/:id', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.VIEW_CALENDAR), calendarController_1.default.getCalendarEventById);
router.post('/events', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.CREATE_EVENTS), calendarController_1.default.createCalendarEvent);
router.put('/events/:id', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.UPDATE_EVENTS), calendarController_1.default.updateCalendarEvent);
router.delete('/events/:id', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.DELETE_EVENTS), calendarController_1.default.deleteCalendarEvent);
router.post('/events/check-conflicts', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.CREATE_EVENTS), calendarController_1.default.checkSchedulingConflicts);
exports.default = router;
//# sourceMappingURL=calendarRoutes.js.map