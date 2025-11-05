"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecretStorageService = void 0;
const TRANSLATION_API_KEY_SECRET = 'babelMdViewer.translation.apiKey.secret';
class SecretStorageService {
    constructor(secretStorage, logger) {
        this.secretStorage = secretStorage;
        this.logger = logger;
    }
    async getTranslationApiKey() {
        try {
            const value = await this.secretStorage.get(TRANSLATION_API_KEY_SECRET);
            return value?.trim() || undefined;
        }
        catch (error) {
            this.logger.error('Failed to retrieve translation API key from secret storage.', error);
            return undefined;
        }
    }
    async storeTranslationApiKey(apiKey) {
        try {
            await this.secretStorage.store(TRANSLATION_API_KEY_SECRET, apiKey.trim());
            this.logger.info('Stored translation API key in VS Code SecretStorage.');
        }
        catch (error) {
            this.logger.error('Failed to store translation API key in secret storage.', error);
            throw error;
        }
    }
    async clearTranslationApiKey() {
        try {
            await this.secretStorage.delete(TRANSLATION_API_KEY_SECRET);
            this.logger.info('Cleared translation API key from VS Code SecretStorage.');
        }
        catch (error) {
            this.logger.error('Failed to clear translation API key from secret storage.', error);
            throw error;
        }
    }
}
exports.SecretStorageService = SecretStorageService;
//# sourceMappingURL=SecretStorageService.js.map