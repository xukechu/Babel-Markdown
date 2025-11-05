"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.BabelMarkdownService = void 0;
const vscode = __importStar(require("vscode"));
const crypto_1 = require("crypto");
const config_1 = require("../utils/config");
const text_1 = require("../utils/text");
class BabelMarkdownService {
    constructor(logger) {
        this.logger = logger;
    }
    async transformDocument(document) {
        const configuration = (0, config_1.getExtensionConfiguration)(document);
        const theme = configuration.previewTheme;
        const plugins = configuration.transformPlugins;
        this.logger.info(`Applying ${plugins.length} Babel plugin${plugins.length === 1 ? '' : 's'} to ${vscode.workspace.asRelativePath(document.uri)}`);
        const markdownContent = document.getText();
        const transformedHtml = await this.applyTransformations(markdownContent, plugins);
        const hash = this.computeContentHash(document, markdownContent, plugins);
        return {
            html: transformedHtml,
            theme,
            contentHash: hash,
        };
    }
    async applyTransformations(content, plugins) {
        if (!content.trim()) {
            return '<p><em>This document is empty.</em></p>';
        }
        if (plugins.length > 0) {
            this.logger.warn('Babel plugins are declared but the pipeline is not implemented yet.');
        }
        const escaped = (0, text_1.escapeHtml)(content);
        return `<pre>${escaped}</pre>`;
    }
    computeContentHash(document, markdown, plugins) {
        const hash = (0, crypto_1.createHash)('sha256');
        hash.update(document.uri.toString());
        hash.update(String(document.version));
        hash.update(markdown);
        hash.update(JSON.stringify(plugins));
        return hash.digest('hex');
    }
}
exports.BabelMarkdownService = BabelMarkdownService;
//# sourceMappingURL=BabelMarkdownService.js.map