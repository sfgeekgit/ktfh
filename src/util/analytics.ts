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
}
