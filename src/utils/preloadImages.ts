export function preloadImages(urls: string[]) {
  const seen = new Set<string>();
  for (const url of urls) {
    if (seen.has(url)) continue;
    seen.add(url);
    const img = new Image();
    img.decoding = 'async';
    img.fetchPriority = 'high';
    img.src = url;
  }
}