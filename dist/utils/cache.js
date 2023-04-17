"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.memoryCache = void 0;
const cache_manager_1 = require("cache-manager");
exports.memoryCache = (0, cache_manager_1.caching)('memory', {
    max: 100,
    ttl: 10000,
});
//# sourceMappingURL=cache.js.map