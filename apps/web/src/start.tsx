import { createRoot, hydrateRoot } from 'react-dom/client';
import { StartClient } from '@tanstack/react-start/client';
import { createStart } from "@tanstack/react-start";
import { getRouter } from './router';

export const startInstance = createStart(() => {
    return {
        defaultSsr: true,
    };
});

if (typeof document !== 'undefined') {
    const router = getRouter();
    const rootElement = document.getElementById('root');

    if (rootElement) {
        if (rootElement.children.length === 0) {
            createRoot(rootElement).render(<StartClient router={router as any} />);
        } else {
            hydrateRoot(rootElement, <StartClient router={router as any} />);
        }
    }
}
