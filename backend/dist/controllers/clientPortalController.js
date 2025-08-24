"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateClientProfile = exports.sendClientMessage = exports.getClientMessages = exports.getClientCaseDetails = exports.getClientCases = exports.logoutClientUser = exports.loginClientUser = exports.registerClientUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const DatabaseService_1 = __importDefault(require("@/services/DatabaseService"));
const logger_1 = __importDefault(require("@/utils/logger"));
const db = new DatabaseService_1.default();
const registerClientUser = async (req, res) => {
    try {
        const { clientId, email, password, firstName, lastName, phone } = req.body;
        logger_1.default.info('Client portal user registration', { email, clientId });
        const existingUser = await db.query(SQLQueries.CLIENT_PORTAL_USERS.GET_BY_EMAIL, [email]);
        if (existingUser.rows[0]) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'EMAIL_ALREADY_EXISTS',
                    message: 'Email already registered'
                }
            });
        }
        const saltRounds = 12;
        const passwordHash = await bcrypt_1.default.hash(password, saltRounds);
        const result = await db.query(SQLQueries.CLIENT_PORTAL_USERS.CREATE, [
            clientId,
            email,
            passwordHash,
            firstName,
            lastName,
            phone || null
        ]);
        const clientUser = result.rows[0];
        logger_1.default.businessEvent('client_portal_user_registered', 'client_portal_user', clientUser.id, null);
        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: clientUser.id,
                    email: clientUser.email,
                    firstName: clientUser.first_name,
                    lastName: clientUser.last_name
                }
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error registering client portal user', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'CLIENT_REGISTRATION_ERROR',
                message: 'Failed to register client portal user'
            }
        });
    }
};
exports.registerClientUser = registerClientUser;
const loginClientUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        logger_1.default.info('Client portal user login attempt', { email });
        const userResult = await db.query(SQLQueries.CLIENT_PORTAL_USERS.GET_BY_EMAIL, [email]);
        const user = userResult.rows[0];
        if (!user) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'INVALID_CREDENTIALS',
                    message: 'Invalid email or password'
                }
            });
        }
        if (user.account_locked_until && new Date() < user.account_locked_until) {
            return res.status(423).json({
                success: false,
                error: {
                    code: 'ACCOUNT_LOCKED',
                    message: 'Account is temporarily locked'
                }
            });
        }
        const isValidPassword = await bcrypt_1.default.compare(password, user.password_hash);
        if (!isValidPassword) {
            const failedAttempts = user.failed_login_attempts + 1;
            const lockUntil = failedAttempts >= 5 ? new Date(Date.now() + 30 * 60 * 1000) : null;
            await db.query(SQLQueries.CLIENT_PORTAL_USERS.UPDATE_LOGIN_ATTEMPTS, [
                user.id,
                failedAttempts,
                lockUntil,
                user.last_login
            ]);
            return res.status(401).json({
                success: false,
                error: {
                    code: 'INVALID_CREDENTIALS',
                    message: 'Invalid email or password'
                }
            });
        }
        await db.query(SQLQueries.CLIENT_PORTAL_USERS.UPDATE_LOGIN_ATTEMPTS, [
            user.id,
            0,
            null,
            new Date()
        ]);
        const sessionToken = crypto_1.default.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await db.query(SQLQueries.CLIENT_PORTAL_SESSIONS.CREATE, [
            user.id,
            sessionToken,
            req.ip,
            req.get('User-Agent'),
            expiresAt
        ]);
        logger_1.default.businessEvent('client_portal_user_logged_in', 'client_portal_user', user.id, null);
        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    clientId: user.client_id
                },
                sessionToken,
                expiresAt
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error logging in client portal user', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'CLIENT_LOGIN_ERROR',
                message: 'Failed to log in'
            }
        });
    }
};
exports.loginClientUser = loginClientUser;
const logoutClientUser = async (req, res) => {
    try {
        const sessionToken = req.headers.authorization?.replace('Bearer ', '');
        if (sessionToken) {
            await db.query(SQLQueries.CLIENT_PORTAL_SESSIONS.DELETE_BY_TOKEN, [sessionToken]);
        }
        logger_1.default.info('Client portal user logged out');
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    }
    catch (error) {
        logger_1.default.error('Error logging out client portal user', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'CLIENT_LOGOUT_ERROR',
                message: 'Failed to log out'
            }
        });
    }
};
exports.logoutClientUser = logoutClientUser;
const getClientCases = async (req, res) => {
    try {
        const clientId = req.clientUser?.client_id;
        logger_1.default.info('Fetching client cases', { clientId });
        const result = await db.query(SQLQueries.CLIENT_PORTAL_CASES.GET_BY_CLIENT_ID, [clientId]);
        const cases = result.rows;
        logger_1.default.info('Client cases fetched successfully', { clientId, count: cases.length });
        res.json({
            success: true,
            data: { cases }
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching client cases', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'CLIENT_CASES_FETCH_ERROR',
                message: 'Failed to fetch cases'
            }
        });
    }
};
exports.getClientCases = getClientCases;
const getClientCaseDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const clientId = req.clientUser?.client_id;
        logger_1.default.info('Fetching client case details', { clientId, caseId: id });
        const result = await db.query(SQLQueries.CLIENT_PORTAL_CASES.GET_CASE_DETAILS, [id, clientId]);
        const caseDetails = result.rows[0];
        if (!caseDetails) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'CASE_NOT_FOUND',
                    message: 'Case not found'
                }
            });
        }
        const documentsResult = await db.query(SQLQueries.CLIENT_PORTAL_CASES.GET_CASE_DOCUMENTS, [id]);
        const documents = documentsResult.rows;
        const updatesResult = await db.query(SQLQueries.CLIENT_PORTAL_CASES.GET_CASE_UPDATES, [id]);
        const updates = updatesResult.rows;
        logger_1.default.info('Client case details fetched successfully', { clientId, caseId: id });
        res.json({
            success: true,
            data: {
                case: caseDetails,
                documents,
                updates
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching client case details', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'CLIENT_CASE_DETAILS_ERROR',
                message: 'Failed to fetch case details'
            }
        });
    }
};
exports.getClientCaseDetails = getClientCaseDetails;
const getClientMessages = async (req, res) => {
    try {
        const clientId = req.clientUser?.client_id;
        logger_1.default.info('Fetching client messages', { clientId });
        const result = await db.query(SQLQueries.CLIENT_PORTAL_MESSAGES.GET_CLIENT_MESSAGES, [clientId]);
        const messages = result.rows;
        logger_1.default.info('Client messages fetched successfully', { clientId, count: messages.length });
        res.json({
            success: true,
            data: { messages }
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching client messages', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'CLIENT_MESSAGES_FETCH_ERROR',
                message: 'Failed to fetch messages'
            }
        });
    }
};
exports.getClientMessages = getClientMessages;
const sendClientMessage = async (req, res) => {
    try {
        const clientUserId = req.clientUser?.id;
        const clientId = req.clientUser?.client_id;
        const { subject, content, caseId } = req.body;
        logger_1.default.info('Sending client message', { clientUserId, caseId });
        const result = await db.query(SQLQueries.CLIENT_PORTAL_MESSAGES.CREATE, [
            subject,
            content,
            clientUserId,
            'client_message',
            'normal',
            caseId || null,
            clientId
        ]);
        const message = result.rows[0];
        logger_1.default.businessEvent('client_message_sent', 'internal_message', message.id, clientUserId);
        res.status(201).json({
            success: true,
            data: { message }
        });
    }
    catch (error) {
        logger_1.default.error('Error sending client message', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'CLIENT_MESSAGE_SEND_ERROR',
                message: 'Failed to send message'
            }
        });
    }
};
exports.sendClientMessage = sendClientMessage;
const updateClientProfile = async (req, res) => {
    try {
        const clientUserId = req.clientUser?.id;
        const { firstName, lastName, phone } = req.body;
        logger_1.default.info('Updating client profile', { clientUserId });
        const result = await db.query(SQLQueries.CLIENT_PORTAL_USERS.UPDATE, [
            clientUserId,
            firstName,
            lastName,
            phone
        ]);
        const updatedUser = result.rows[0];
        logger_1.default.businessEvent('client_profile_updated', 'client_portal_user', clientUserId, clientUserId);
        res.json({
            success: true,
            data: {
                user: {
                    id: updatedUser.id,
                    email: updatedUser.email,
                    firstName: updatedUser.first_name,
                    lastName: updatedUser.last_name,
                    phone: updatedUser.phone
                }
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error updating client profile', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'CLIENT_PROFILE_UPDATE_ERROR',
                message: 'Failed to update profile'
            }
        });
    }
};
exports.updateClientProfile = updateClientProfile;
exports.default = {
    registerClientUser: exports.registerClientUser,
    loginClientUser: exports.loginClientUser,
    logoutClientUser: exports.logoutClientUser,
    getClientCases: exports.getClientCases,
    getClientCaseDetails: exports.getClientCaseDetails,
    getClientMessages: exports.getClientMessages,
    sendClientMessage: exports.sendClientMessage,
    updateClientProfile: exports.updateClientProfile
};
//# sourceMappingURL=clientPortalController.js.map