export interface GalaxyApi {
    loggedIn: boolean;
    supportsSaving?: boolean;
    supportsSaveManager?: boolean;
    getSaveList(): Promise<Record<number, { label: string; content: string }>>;
    save(slot: number, content: string, label?: string): Promise<void>;
}

interface InitOptions {
    supportsSaving?: boolean;
    supportsSaveManager?: boolean;
    onLoggedInChanged?: (api: GalaxyApi) => void;
}

/**
 * Lightweight fallback implementation so builds don't depend on the external Galaxy SDK.
 * This stub keeps cloud save features disabled (loggedIn=false) but preserves the shape expected by callers.
 */
export async function initGalaxy(options: InitOptions = {}): Promise<GalaxyApi> {
    const api: GalaxyApi = {
        loggedIn: false,
        supportsSaving: !!options.supportsSaving,
        supportsSaveManager: !!options.supportsSaveManager,
        async getSaveList() {
            return {};
        },
        async save() {
            // no-op in fallback
        }
    };

    options.onLoggedInChanged?.(api);
    return api;
}
