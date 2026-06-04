import { Sun } from 'lucide-react';
import type { HTMLAttributes } from 'react';
// Dark mode removed; appearance is fixed to light
import { cn } from '@/lib/utils';

export default function AppearanceToggleTab({
    className = '',
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    // Render a non-interactive light-only indicator now that dark mode is removed.
    return (
        <div className={cn('inline-flex gap-1 rounded-lg bg-neutral-100 p-1', className)} {...props}>
            <div className="flex items-center rounded-md px-3.5 py-1.5 bg-white shadow-xs">
                <Sun className="-ml-1 h-4 w-4" />
                <span className="ml-1.5 text-sm">Light</span>
            </div>
        </div>
    );
}
