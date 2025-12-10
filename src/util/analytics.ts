export function trackEvent(eventName: string, params: Record<string, any> = {}) {
    if (typeof window === "undefined") return;
    const w = window as any;
    if (typeof w.dataLayer === "undefined") {
        w.dataLayer = [];
    }
    if (typeof w.gtag === "function") {
        w.gtag("event", eventName, params);
    } else {
        // Queue the event in case gtag loads after this call
        w.dataLayer.push(["event", eventName, params]);
    }

    // Mirror the event to a simple logging endpoint (Caddy access logs) without impacting gameplay
    try {
        const allowedParams = ["reason", "chapter", "id"];
        const queryParts = [`event=${encodeURIComponent(eventName)}`];
        for (const key of allowedParams) {
            const value = (params as any)[key];
            if (value !== undefined && value !== null) {
                queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
            }
        }
        const url = `/api/log?${queryParts.join("&")}`;
        if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
            navigator.sendBeacon(url);
        } else if (typeof fetch === "function") {
            fetch(url, { method: "GET", keepalive: true }).catch(() => {});
        }
    } catch {
        // Intentionally swallow errors to keep analytics from affecting gameplay
    }
}
