"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("@/middleware/auth");
const roleAccess_1 = require("@/utils/roleAccess");
const taskController_1 = __importDefault(require("@/controllers/taskController"));
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.VIEW_TASKS), taskController_1.default.getTasks);
router.get('/stats', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.VIEW_TASKS), taskController_1.default.getTaskStats);
router.get('/:id', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.VIEW_TASKS), taskController_1.default.getTaskById);
router.post('/', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.CREATE_TASKS), taskController_1.default.createTask);
router.put('/:id', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.UPDATE_TASKS), taskController_1.default.updateTask);
router.delete('/:id', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.DELETE_TASKS), taskController_1.default.deleteTask);
router.post('/:id/start-timer', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.CREATE_TIME_ENTRIES), taskController_1.default.startTaskTimer);
router.post('/:id/stop-timer', auth_1.authenticateToken, (0, auth_1.authorizePermission)(roleAccess_1.Permission.UPDATE_TIME_ENTRIES), taskController_1.default.stopTaskTimer);
exports.default = router;
//# sourceMappingURL=taskRoutes.js.map