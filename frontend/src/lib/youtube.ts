export function extractYouTubeVideoId(url: string): string | null {
  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname === "youtu.be") {
      return parsedUrl.pathname.slice(1) || null;
    }

    if (
      parsedUrl.hostname === "youtube.com" ||
      parsedUrl.hostname === "www.youtube.com"
    ) {
      return parsedUrl.searchParams.get("v");
    }

    return null;
  } catch {
    return null;
  }
}

export function isYoutubeUrl(url: string): boolean {
  return extractYouTubeVideoId(url) !== null;
}

export function getYouTubeThumbnailUrl(url: string): string | null {
  const videoId = extractYouTubeVideoId(url);

  if (!videoId) {
    return null;
  }

  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}
