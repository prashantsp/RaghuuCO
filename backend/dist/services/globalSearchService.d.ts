export declare class GlobalSearchService {
    globalSearch(query: string, entityTypes?: string[], limit?: number, offset?: number): Promise<any>;
    getSearchSuggestions(query: string, limit?: number): Promise<any>;
    getSearchStatistics(): Promise<any>;
    getPopularSearchTerms(limit?: number): Promise<any>;
}
export declare const globalSearchService: GlobalSearchService;
//# sourceMappingURL=globalSearchService.d.ts.map