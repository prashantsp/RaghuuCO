export declare class DocumentSecurityService {
    private encryptionKey;
    private algorithm;
    constructor();
    encryptDocument(content: Buffer, documentId: string): Promise<{
        encryptedContent: Buffer;
        iv: Buffer;
        authTag: Buffer;
    }>;
    decryptDocument(encryptedContent: Buffer, _iv: Buffer, _authTag: Buffer, documentId: string): Promise<Buffer>;
    addWatermarkToPDF(pdfBuffer: Buffer, watermarkText: string, position?: string): Promise<Buffer>;
    addWatermarkToImage(imageBuffer: Buffer, watermarkText: string, position?: string): Promise<Buffer>;
    saveSecureDocument(documentId: string, content: Buffer, securityLevel: string, watermarkText?: string, watermarkPosition?: string): Promise<void>;
    getSecureDocument(documentId: string, userId: string): Promise<Buffer>;
    checkDocumentAccess(documentId: string, userId: string): Promise<boolean>;
    logDocumentAccess(documentId: string, userId: string, action: string): Promise<void>;
    updateDocumentSecurity(documentId: string, securityLevel: string, watermarkText?: string, watermarkPosition?: string): Promise<void>;
    getDocumentSecurityMetadata(documentId: string): Promise<any>;
}
export declare const documentSecurityService: DocumentSecurityService;
//# sourceMappingURL=documentSecurityService.d.ts.map