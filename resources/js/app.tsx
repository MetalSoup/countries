import { createInertiaApp } from '@inertiajs/react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';


const appName = import.meta.env.VITE_APP_NAME || '';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: () => {
        return AppLayout;

    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                {app}
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

