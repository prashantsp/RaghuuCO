"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("@/controllers/authController");
const auth_1 = require("@/middleware/auth");
const logger_1 = __importDefault(require("@/utils/logger"));
const router = (0, express_1.Router)();
router.post('/register', async (req, res, next) => {
    try {
        logger_1.default.info('User registration attempt', { email: req.body.email, ip: req.ip });
        await (0, authController_1.register)(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.post('/login', async (req, res, next) => {
    try {
        logger_1.default.info('User login attempt', { email: req.body.email, ip: req.ip });
        await (0, authController_1.login)(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.post('/refresh', async (req, res, next) => {
    try {
        logger_1.default.info('Token refresh attempt', { ip: req.ip });
        await (0, authController_1.refreshToken)(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.post('/logout', auth_1.authenticateToken, async (req, res, next) => {
    try {
        logger_1.default.info('User logout attempt', { userId: req.user?.id, ip: req.ip });
        await (0, authController_1.logout)(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.get('/profile', auth_1.authenticateToken, async (req, res, next) => {
    try {
        logger_1.default.info('Profile fetch attempt', { userId: req.user?.id, ip: req.ip });
        await (0, authController_1.getProfile)(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.put('/profile', auth_1.authenticateToken, async (req, res, next) => {
    try {
        logger_1.default.info('Profile update attempt', { userId: req.user?.id, ip: req.ip });
        await (0, authController_1.updateProfile)(req, res);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=authRoutes.js.map