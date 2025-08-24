export declare class ContentManagementService {
    createCategory(categoryData: any): Promise<any>;
    getCategories(): Promise<any>;
    getHierarchicalCategories(): Promise<any>;
    createArticle(articleData: any): Promise<any>;
    getArticleById(articleId: string): Promise<any>;
    getArticleBySlug(slug: string): Promise<any>;
    getPublishedArticles(categoryId?: string, limit?: number, offset?: number): Promise<any>;
    searchArticles(query: string, limit?: number, offset?: number): Promise<any>;
    getFeaturedArticles(limit?: number): Promise<any>;
    createComment(commentData: any): Promise<any>;
    getArticleComments(articleId: string): Promise<any>;
    createNewsletter(newsletterData: any): Promise<any>;
    getNewsletters(limit?: number, offset?: number): Promise<any>;
    subscribeToNewsletter(subscriberData: any): Promise<any>;
    unsubscribeFromNewsletter(email: string, reason?: string): Promise<any>;
    getNewsletterStats(): Promise<any>;
    trackContentAnalytics(analyticsData: any): Promise<any>;
    getContentStats(contentId: string, contentType: string): Promise<any>;
}
export declare const contentManagementService: ContentManagementService;
//# sourceMappingURL=contentManagementService.d.ts.map