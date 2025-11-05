"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.escapeHtml = escapeHtml;
const htmlEscapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
};
function escapeHtml(value) {
    return value.replace(/[&<>"']/g, (character) => htmlEscapeMap[character] ?? character);
}
//# sourceMappingURL=text.js.map