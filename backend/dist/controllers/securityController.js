"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSecuritySettings = exports.verifyBackupCode = exports.generateBackupCodes = exports.get2FAStatus = exports.disable2FA = exports.verify2FA = exports.setup2FA = void 0;
const otplib_1 = require("otplib");
const crypto_1 = __importDefault(require("crypto"));
const DatabaseService_1 = __importDefault(require("@/services/DatabaseService"));
const logger_1 = __importDefault(require("@/utils/logger"));
const db = new DatabaseService_1.default();
const setup2FA = async (req, res) => {
    try {
        const userId = req.user?.id;
        logger_1.default.info('Setting up 2FA for user', { userId });
        const secret = otplib_1.authenticator.generateSecret();
        const otpauth = otplib_1.authenticator.keyuri(userId, 'RAGHUU CO', secret);
        const tempSecret = crypto_1.default.randomBytes(32).toString('hex');
        req.session.temp2FASecret = secret;
        logger_1.default.info('2FA setup initiated', { userId });
        res.json({
            success: true,
            data: {
                secret,
                otpauth,
                qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauth)}`
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error setting up 2FA', error);
        res.status(500).json({
            success: false,
            error: {
                code: '2FA_SETUP_ERROR',
                message: 'Failed to setup two-factor authentication'
            }
        });
    }
};
exports.setup2FA = setup2FA;
const verify2FA = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { totpToken } = req.body;
        if (!totpToken) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'TOTP_TOKEN_REQUIRED',
                    message: 'TOTP token is required'
                }
            });
        }
        const tempSecret = req.session.temp2FASecret;
        if (!tempSecret) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'NO_TEMP_SECRET',
                    message: 'No temporary 2FA secret found. Please setup 2FA first.'
                }
            });
        }
        const isValid = otplib_1.authenticator.verify({
            token: totpToken,
            secret: tempSecret
        });
        if (!isValid) {
            logger_1.default.warn('Invalid TOTP token during 2FA verification', { userId });
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_TOTP_TOKEN',
                    message: 'Invalid TOTP token'
                }
            });
        }
        await db.query(SQLQueries.SECURITY.UPDATE_2FA_SECRET, [tempSecret, userId]);
        delete req.session.temp2FASecret;
        logger_1.default.businessEvent('2fa_enabled', 'user', userId, userId);
        res.json({
            success: true,
            message: 'Two-factor authentication enabled successfully'
        });
    }
    catch (error) {
        logger_1.default.error('Error verifying 2FA', error);
        res.status(500).json({
            success: false,
            error: {
                code: '2FA_VERIFICATION_ERROR',
                message: 'Failed to verify two-factor authentication'
            }
        });
    }
};
exports.verify2FA = verify2FA;
const disable2FA = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { totpToken } = req.body;
        if (!totpToken) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'TOTP_TOKEN_REQUIRED',
                    message: 'TOTP token is required to disable 2FA'
                }
            });
        }
        const userResult = await db.query(SQLQueries.SECURITY.GET_2FA_SECRET, [userId]);
        const user = userResult.rows[0];
        if (!user?.two_factor_secret) {
            return res.status(400).json({
                success: false,
                error: {
                    code: '2FA_NOT_ENABLED',
                    message: 'Two-factor authentication is not enabled'
                }
            });
        }
        const isValid = otplib_1.authenticator.verify({
            token: totpToken,
            secret: user.two_factor_secret
        });
        if (!isValid) {
            logger_1.default.warn('Invalid TOTP token during 2FA disable', { userId });
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_TOTP_TOKEN',
                    message: 'Invalid TOTP token'
                }
            });
        }
        await db.query(SQLQueries.SECURITY.DISABLE_2FA, [userId]);
        logger_1.default.businessEvent('2fa_disabled', 'user', userId, userId);
        res.json({
            success: true,
            message: 'Two-factor authentication disabled successfully'
        });
    }
    catch (error) {
        logger_1.default.error('Error disabling 2FA', error);
        res.status(500).json({
            success: false,
            error: {
                code: '2FA_DISABLE_ERROR',
                message: 'Failed to disable two-factor authentication'
            }
        });
    }
};
exports.disable2FA = disable2FA;
const get2FAStatus = async (req, res) => {
    try {
        const userId = req.user?.id;
        const userResult = await db.query(SQLQueries.SECURITY.GET_2FA_STATUS, [userId]);
        const user = userResult.rows[0];
        res.json({
            success: true,
            data: {
                enabled: user?.two_factor_enabled || false
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error getting 2FA status', error);
        res.status(500).json({
            success: false,
            error: {
                code: '2FA_STATUS_ERROR',
                message: 'Failed to get two-factor authentication status'
            }
        });
    }
};
exports.get2FAStatus = get2FAStatus;
const generateBackupCodes = async (req, res) => {
    try {
        const userId = req.user?.id;
        const backupCodes = Array.from({ length: 10 }, () => crypto_1.default.randomBytes(4).toString('hex').toUpperCase());
        const hashedCodes = backupCodes.map(code => crypto_1.default.createHash('sha256').update(code).digest('hex'));
        await db.query(SQLQueries.SECURITY.UPDATE_BACKUP_CODES, [hashedCodes, userId]);
        logger_1.default.businessEvent('backup_codes_generated', 'user', userId, userId);
        res.json({
            success: true,
            data: {
                backupCodes,
                message: 'Store these codes securely. Each code can only be used once.'
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error generating backup codes', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'BACKUP_CODES_ERROR',
                message: 'Failed to generate backup codes'
            }
        });
    }
};
exports.generateBackupCodes = generateBackupCodes;
const verifyBackupCode = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { backupCode } = req.body;
        if (!backupCode) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'BACKUP_CODE_REQUIRED',
                    message: 'Backup code is required'
                }
            });
        }
        const userResult = await db.query(SQLQueries.SECURITY.GET_BACKUP_CODES, [userId]);
        const user = userResult.rows[0];
        if (!user?.backup_codes || user.backup_codes.length === 0) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'NO_BACKUP_CODES',
                    message: 'No backup codes available'
                }
            });
        }
        const hashedCode = crypto_1.default.createHash('sha256').update(backupCode).digest('hex');
        const codeIndex = user.backup_codes.indexOf(hashedCode);
        if (codeIndex === -1) {
            logger_1.default.warn('Invalid backup code used', { userId });
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_BACKUP_CODE',
                    message: 'Invalid backup code'
                }
            });
        }
        const updatedCodes = user.backup_codes.filter((_, index) => index !== codeIndex);
        await db.query(SQLQueries.SECURITY.UPDATE_BACKUP_CODES, [updatedCodes, userId]);
        logger_1.default.businessEvent('backup_code_used', 'user', userId, userId);
        res.json({
            success: true,
            message: 'Backup code verified successfully'
        });
    }
    catch (error) {
        logger_1.default.error('Error verifying backup code', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'BACKUP_CODE_VERIFICATION_ERROR',
                message: 'Failed to verify backup code'
            }
        });
    }
};
exports.verifyBackupCode = verifyBackupCode;
const getSecuritySettings = async (req, res) => {
    try {
        const userId = req.user?.id;
        const userResult = await db.query(SQLQueries.SECURITY.GET_USER_SECURITY_SETTINGS, [userId]);
        const user = userResult.rows[0];
        res.json({
            success: true,
            data: {
                twoFactorEnabled: user?.two_factor_enabled || false,
                lastPasswordChange: user?.last_password_change,
                failedLoginAttempts: user?.failed_login_attempts || 0,
                accountLockedUntil: user?.account_locked_until,
                hasBackupCodes: user?.backup_codes && user.backup_codes.length > 0
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error getting security settings', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SECURITY_SETTINGS_ERROR',
                message: 'Failed to get security settings'
            }
        });
    }
};
exports.getSecuritySettings = getSecuritySettings;
exports.default = {
    setup2FA: exports.setup2FA,
    verify2FA: exports.verify2FA,
    disable2FA: exports.disable2FA,
    get2FAStatus: exports.get2FAStatus,
    generateBackupCodes: exports.generateBackupCodes,
    verifyBackupCode: exports.verifyBackupCode,
    getSecuritySettings: exports.getSecuritySettings
};
//# sourceMappingURL=securityController.js.map