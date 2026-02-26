// Polyfill TextDecoder/TextEncoder for jest + jsdom environment.
// Newer enzyme pulls in undici via cheerio, which requires these globals.
const { TextDecoder, TextEncoder } = require('util');
global.TextDecoder = TextDecoder;
global.TextEncoder = TextEncoder;
