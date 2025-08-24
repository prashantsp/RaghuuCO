"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPopularSearchTerms = exports.getSearchStatistics = exports.getSearchSuggestions = exports.globalSearch = void 0;
const globalSearchService_1 = require("@/services/globalSearchService");
const logger_1 = __importDefault(require("@/utils/logger"));
const globalSearch = async (req, res) => {
    try {
        const { q, entityTypes, limit = 20, offset = 0 } = req.query;
        if (!q) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'SEARCH_QUERY_REQUIRED',
                    message: 'Search query is required'
                }
            });
        }
        const entityTypesArray = entityTypes ? entityTypes.split(',') : [];
        logger_1.default.info('Performing global search', { query: q, entityTypes: entityTypesArray });
        const result = await globalSearchService_1.globalSearchService.globalSearch(q, entityTypesArray, parseInt(limit), parseInt(offset));
        return res.json(result);
    }
    catch (error) {
        logger_1.default.error('Error performing global search', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'GLOBAL_SEARCH_ERROR',
                message: 'Failed to perform global search'
            }
        });
    }
};
exports.globalSearch = globalSearch;
const getSearchSuggestions = async (req, res) => {
    try {
        const { q, limit = 10 } = req.query;
        if (!q) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'SEARCH_QUERY_REQUIRED',
                    message: 'Search query is required'
                }
            });
        }
        logger_1.default.info('Getting search suggestions', { query: q, limit });
        const result = await globalSearchService_1.globalSearchService.getSearchSuggestions(q, parseInt(limit));
        return res.json(result);
    }
    catch (error) {
        logger_1.default.error('Error getting search suggestions', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'SEARCH_SUGGESTIONS_ERROR',
                message: 'Failed to get search suggestions'
            }
        });
    }
};
exports.getSearchSuggestions = getSearchSuggestions;
const getSearchStatistics = async (req, res) => {
    try {
        logger_1.default.info('Getting search statistics');
        const result = await globalSearchService_1.globalSearchService.getSearchStatistics();
        res.json(result);
    }
    catch (error) {
        logger_1.default.error('Error getting search statistics', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SEARCH_STATISTICS_ERROR',
                message: 'Failed to get search statistics'
            }
        });
    }
};
exports.getSearchStatistics = getSearchStatistics;
const getPopularSearchTerms = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        logger_1.default.info('Getting popular search terms', { limit });
        const result = await globalSearchService_1.globalSearchService.getPopularSearchTerms(parseInt(limit));
        res.json(result);
    }
    catch (error) {
        logger_1.default.error('Error getting popular search terms', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'POPULAR_SEARCH_TERMS_ERROR',
                message: 'Failed to get popular search terms'
            }
        });
    }
};
exports.getPopularSearchTerms = getPopularSearchTerms;
exports.default = {
    globalSearch: exports.globalSearch,
    getSearchSuggestions: exports.getSearchSuggestions,
    getSearchStatistics: exports.getSearchStatistics,
    getPopularSearchTerms: exports.getPopularSearchTerms
};
//# sourceMappingURL=globalSearchController.js.map