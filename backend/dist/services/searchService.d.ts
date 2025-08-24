export declare enum SearchEntityType {
    CASES = "cases",
    CLIENTS = "clients",
    DOCUMENTS = "documents",
    USERS = "users",
    EXPENSES = "expenses",
    ARTICLES = "articles",
    TASKS = "tasks",
    INVOICES = "invoices",
    TIME_ENTRIES = "time_entries"
}
export interface SearchResult {
    id: string;
    type: SearchEntityType;
    title: string;
    description?: string;
    relevance: number;
    metadata: Record<string, any>;
    url: string;
    timestamp: string;
}
export interface SearchOptions {
    query: string;
    entities?: SearchEntityType[];
    filters?: Record<string, any>;
    sortBy?: 'relevance' | 'date' | 'title';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
    userId?: string;
    includeArchived?: boolean;
}
export interface SearchStats {
    totalResults: number;
    resultsByEntity: Record<SearchEntityType, number>;
    queryTime: number;
    suggestions: string[];
    popularTerms: string[];
}
declare class SearchService {
    globalSearch(options: SearchOptions): Promise<{
        results: SearchResult[];
        stats: SearchStats;
    }>;
    private searchEntity;
    private searchCases;
    private searchClients;
    private searchDocuments;
    private searchUsers;
    private searchExpenses;
    private searchArticles;
    private searchTasks;
    private searchInvoices;
    private searchTimeEntries;
    private prepareSearchQuery;
    generateSearchSuggestions(query: string): Promise<string[]>;
    getPopularSearchTerms(): Promise<string[]>;
    logSearchQuery(query: string, userId?: string, resultsCount?: number): Promise<void>;
    getSearchStats(): Promise<any>;
}
declare const _default: SearchService;
export default _default;
export { SearchService, SearchEntityType };
//# sourceMappingURL=searchService.d.ts.map