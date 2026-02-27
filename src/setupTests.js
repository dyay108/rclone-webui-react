// Must use require() (not import) so execution order is preserved —
// Babel hoists import statements above require() calls, but enzyme
// must be loaded after globals are set.

// react-router v7 includes server runtime code that uses TextEncoder/TextDecoder.
// jsdom doesn't provide them, so polyfill from Node's util module.
const { TextEncoder, TextDecoder } = require('util');
if (typeof global.TextEncoder === 'undefined') global.TextEncoder = TextEncoder;
if (typeof global.TextDecoder === 'undefined') global.TextDecoder = TextDecoder;

const { configure } = require('enzyme');
const Adapter = require('@cfaester/enzyme-adapter-react-18').default;

configure({ adapter: new Adapter() });

const originalConsoleError = console.error;

console.error = message => {
    if (/(Failed prop type)/.test(message)) {
        throw new Error(message);
    }

    originalConsoleError(message);
};

// const originalConsoleLog = console.log;

console.log = message => {

    throw new Error(`Not allowed to print to console from components. Remove any console.log() statements. console.error still works.->${message}`);

    // originalConsoleLog(message);
};

if (global.document) {
    document.queryCommandSupported = jest.fn().mockImplementation((e) => true);
    document.createRange = () => ({
        setStart: () => {
        },
        setEnd: () => {
        },
        commonAncestorContainer: {
            nodeName: 'BODY',
            ownerDocument: document,
        },
    });
}
