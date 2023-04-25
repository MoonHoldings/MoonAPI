import { caching } from 'cache-manager';

export const memoryCache = caching('memory', {
    max: 100,
    ttl: 10000, /*milliseconds*/
});