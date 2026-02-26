// Stub for undici in jest tests.
// enzyme pulls in cheerio which imports undici for fetch, but enzyme
// doesn't actually do network fetching during tests. Stubbing undici
// avoids needing to polyfill a dozen Web APIs that old jsdom lacks.
module.exports = {
    fetch: () => Promise.reject(new Error('fetch is not available in the test environment')),
    Headers: class Headers {},
    Request: class Request {},
    Response: class Response {},
    FormData: class FormData {},
};
