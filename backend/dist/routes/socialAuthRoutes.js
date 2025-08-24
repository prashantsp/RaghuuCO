"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const socialAuthController_1 = require("@/controllers/socialAuthController");
const auth_1 = require("@/middleware/auth");
const logger_1 = __importDefault(require("@/utils/logger"));
const router = (0, express_1.Router)();
router.get('/google', (req, res, next) => {
    logger_1.default.info('Google OAuth initiation', { ip: req.ip });
    passport_1.default.authenticate('google', {
        scope: ['profile', 'email']
    })(req, res, next);
});
router.get('/google/callback', async (req, res, next) => {
    try {
        logger_1.default.info('Google OAuth callback received', { ip: req.ip });
        await (0, socialAuthController_1.googleAuth)(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.get('/linkedin', (req, res, next) => {
    logger_1.default.info('LinkedIn OAuth initiation', { ip: req.ip });
    passport_1.default.authenticate('linkedin', {
        scope: ['r_emailaddress', 'r_liteprofile']
    })(req, res, next);
});
router.get('/linkedin/callback', async (req, res, next) => {
    try {
        logger_1.default.info('LinkedIn OAuth callback received', { ip: req.ip });
        await (0, socialAuthController_1.linkedinAuth)(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.get('/microsoft', (req, res, next) => {
    logger_1.default.info('Microsoft OAuth initiation', { ip: req.ip });
    passport_1.default.authenticate('microsoft', {
        scope: ['user.read', 'email']
    })(req, res, next);
});
router.get('/microsoft/callback', async (req, res, next) => {
    try {
        logger_1.default.info('Microsoft OAuth callback received', { ip: req.ip });
        await (0, socialAuthController_1.microsoftAuth)(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.post('/link-social', auth_1.authenticateToken, async (req, res, next) => {
    try {
        logger_1.default.info('Social account linking attempt', {
            userId: req.user?.id,
            provider: req.body.provider,
            ip: req.ip
        });
        await (0, socialAuthController_1.linkSocialAccount)(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.delete('/unlink-social/:provider', auth_1.authenticateToken, async (req, res, next) => {
    try {
        logger_1.default.info('Social account unlinking attempt', {
            userId: req.user?.id,
            provider: req.params.provider,
            ip: req.ip
        });
        await (0, socialAuthController_1.unlinkSocialAccount)(req, res);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=socialAuthRoutes.js.map