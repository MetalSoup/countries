// Dark mode removed: no runtime subscription needed

export type ResolvedAppearance = 'light';
export type Appearance = ResolvedAppearance;

export type UseAppearanceReturn = {
    readonly appearance: Appearance;
    readonly resolvedAppearance: ResolvedAppearance;
    readonly updateAppearance: (mode: Appearance) => void;
};

// Dark mode removed: always return light and make updates no-ops.
export function initializeTheme(): void {
    if (typeof document === 'undefined') {
        return;
    }

    // Ensure dark class is removed and color scheme set to light
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
}

export function useAppearance(): UseAppearanceReturn {
    const appearance: Appearance = 'light';

    const resolvedAppearance: ResolvedAppearance = 'light';

    const updateAppearance = (_mode: Appearance): void => {
        // no-op: appearance is fixed to light
        // reference the param so linters don't complain about unused vars
        void _mode;
        return;
    };

    return { appearance, resolvedAppearance, updateAppearance } as const;
}
