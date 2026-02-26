// Must use require() (not import) so execution order is preserved —
// Babel hoists import statements above require() calls, but enzyme
// must be loaded after globals are set.
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
