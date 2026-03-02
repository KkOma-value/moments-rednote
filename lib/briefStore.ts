interface BriefEntry {
    brief: string;
    platform?: string;
    createdAt: number;
}

const store = new Map<string, BriefEntry>();
const TTL = 30 * 60 * 1000; // 30 minutes

function cleanup() {
    const now = Date.now();
    for (const [id, entry] of store) {
        if (now - entry.createdAt > TTL) {
            store.delete(id);
        }
    }
}

export function storeBrief(id: string, brief: string, platform?: string) {
    cleanup();
    store.set(id, { brief, platform, createdAt: Date.now() });
}

export function getBrief(id: string): BriefEntry | undefined {
    cleanup();
    const entry = store.get(id);
    if (!entry) return undefined;
    if (Date.now() - entry.createdAt > TTL) {
        store.delete(id);
        return undefined;
    }
    return entry;
}
