"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("@/middleware/auth");
const taskController_1 = require("@/controllers/taskController");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticateToken, taskController_1.getTasks);
router.get('/stats', auth_1.authenticateToken, taskController_1.getTaskStats);
router.get('/:id', auth_1.authenticateToken, taskController_1.getTaskById);
router.post('/', auth_1.authenticateToken, taskController_1.createTask);
router.put('/:id', auth_1.authenticateToken, taskController_1.updateTask);
router.delete('/:id', auth_1.authenticateToken, taskController_1.deleteTask);
router.post('/:id/start-timer', auth_1.authenticateToken, taskController_1.startTaskTimer);
router.post('/:id/stop-timer', auth_1.authenticateToken, taskController_1.stopTaskTimer);
exports.default = router;
//# sourceMappingURL=taskRoutes.js.map