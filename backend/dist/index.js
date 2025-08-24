"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = __importDefault(require("./utils/logger"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const socialAuthRoutes_1 = __importDefault(require("./routes/socialAuthRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const clientRoutes_1 = __importDefault(require("./routes/clientRoutes"));
const caseRoutes_1 = __importDefault(require("./routes/caseRoutes"));
const documentRoutes_1 = __importDefault(require("./routes/documentRoutes"));
const dashboardRoutes_1 = __importDefault(require("./routes/dashboardRoutes"));
const billingRoutes_1 = __importDefault(require("./routes/billingRoutes"));
const calendarRoutes_1 = __importDefault(require("./routes/calendarRoutes"));
const communicationRoutes_1 = __importDefault(require("./routes/communicationRoutes"));
const reportingRoutes_1 = __importDefault(require("./routes/reportingRoutes"));
const taskRoutes_1 = __importDefault(require("./routes/taskRoutes"));
const documentSecurityRoutes_1 = __importDefault(require("./routes/documentSecurityRoutes"));
const financialDashboardRoutes_1 = __importDefault(require("./routes/financialDashboardRoutes"));
const productivityAnalyticsRoutes_1 = __importDefault(require("./routes/productivityAnalyticsRoutes"));
const customReportBuilderRoutes_1 = __importDefault(require("./routes/customReportBuilderRoutes"));
const clientPortalRoutes_1 = __importDefault(require("./routes/clientPortalRoutes"));
const contentManagementRoutes_1 = __importDefault(require("./routes/contentManagementRoutes"));
const expensesRoutes_1 = __importDefault(require("./routes/expensesRoutes"));
const globalSearchRoutes_1 = __importDefault(require("./routes/globalSearchRoutes"));
const passport_1 = __importDefault(require("./config/passport"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests from this IP, please try again later.'
        }
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);
app.use((0, compression_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use(passport_1.default.initialize());
app.use((0, morgan_1.default)('combined', {
    stream: {
        write: (message) => {
            logger_1.default.http(message.trim());
        }
    }
}));
app.use((req, res, next) => {
    const startTime = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        logger_1.default.apiRequest(req.method, req.url, undefined, duration);
    });
    next();
});
app.get('/health', async (req, res) => {
    try {
        const health = {
            status: 'OK',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
            version: process.env.npm_package_version || '1.0.0'
        };
        res.status(200).json(health);
    }
    catch (error) {
        logger_1.default.error('Health check failed', error);
        res.status(503).json({
            status: 'ERROR',
            timestamp: new Date().toISOString(),
            message: 'Service unavailable'
        });
    }
});
app.get('/api/v1', (req, res) => {
    res.json({
        success: true,
        message: 'RAGHUU CO Legal Practice Management System API',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});
app.use('/api/v1/auth', authRoutes_1.default);
app.use('/api/v1/auth', socialAuthRoutes_1.default);
app.use('/api/v1/users', userRoutes_1.default);
app.use('/api/v1/clients', clientRoutes_1.default);
app.use('/api/v1/cases', caseRoutes_1.default);
app.use('/api/v1/documents', documentRoutes_1.default);
app.use('/api/v1/dashboard', dashboardRoutes_1.default);
app.use('/api/v1/billing', billingRoutes_1.default);
app.use('/api/v1/calendar', calendarRoutes_1.default);
app.use('/api/v1/communication', communicationRoutes_1.default);
app.use('/api/v1/reporting', reportingRoutes_1.default);
app.use('/api/v1/tasks', taskRoutes_1.default);
app.use('/api/v1/document-security', documentSecurityRoutes_1.default);
app.use('/api/v1/financial-dashboard', financialDashboardRoutes_1.default);
app.use('/api/v1/productivity-analytics', productivityAnalyticsRoutes_1.default);
app.use('/api/v1/custom-report-builder', customReportBuilderRoutes_1.default);
app.use('/api/v1/client-portal', clientPortalRoutes_1.default);
app.use('/api/v1/content', contentManagementRoutes_1.default);
app.use('/api/v1/expenses', expensesRoutes_1.default);
app.use('/api/v1/search', globalSearchRoutes_1.default);
//# sourceMappingURL=index.js.map