"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("@/middleware/auth");
const calendarController_1 = require("@/controllers/calendarController");
const router = (0, express_1.Router)();
router.get('/events', auth_1.authenticateToken, calendarController_1.getCalendarEvents);
router.get('/events/upcoming', auth_1.authenticateToken, calendarController_1.getUpcomingEvents);
router.get('/events/:id', auth_1.authenticateToken, calendarController_1.getCalendarEventById);
router.post('/events', auth_1.authenticateToken, calendarController_1.createCalendarEvent);
router.put('/events/:id', auth_1.authenticateToken, calendarController_1.updateCalendarEvent);
router.delete('/events/:id', auth_1.authenticateToken, calendarController_1.deleteCalendarEvent);
router.post('/events/check-conflicts', auth_1.authenticateToken, calendarController_1.checkSchedulingConflicts);
exports.default = router;
//# sourceMappingURL=calendarRoutes.js.map