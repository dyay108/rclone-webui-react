import React from 'react';
import { createRoot } from 'react-dom/client';
import DefaultFooter from '../DefaultFooter';

it('renders without crashing', () => {
    const div = document.createElement('div');
    const root = createRoot(div);
    root.render(<DefaultFooter/>);
    root.unmount();
});
