// Remove hosting watermark div in the bottom right corner
const ad = document.querySelector(
    "body > div:last-of-type") as HTMLDivElement | null;
if (ad)
    ad.remove();

// Remove tracking script
const tracking = document.querySelector(
    "body > script:last-of-type") as HTMLScriptElement | null;
if (tracking)
    tracking.remove();
