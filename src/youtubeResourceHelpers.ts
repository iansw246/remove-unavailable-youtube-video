const UNAVAILABLE_THUMBNAIL_URL = "https://i.ytimg.com/img/no_thumbnail.jpg";

function firstAvailableThumbnail(thumbnails: gapi.client.youtube.ThumbnailDetails): gapi.client.youtube.Thumbnail | null {
    // Key for preferred thumbnail in order of preference. This function gets the first thumbnail in order of keys
    const THUMBNAIL_KEYS: (keyof gapi.client.youtube.ThumbnailDetails)[] = ["default", "medium", "high", "standard", "maxres"];
    for (const key of THUMBNAIL_KEYS) {
        if (Object.hasOwn(thumbnails, key)) {
            return thumbnails[key] as gapi.client.youtube.Thumbnail;
        }
    }
    return null;
}

function getThumbnailUrl(thumbnails: gapi.client.youtube.ThumbnailDetails | null | undefined): string {
    if (!thumbnails) {
        return UNAVAILABLE_THUMBNAIL_URL;
    }
    const firstThumbnail = firstAvailableThumbnail(thumbnails);
    if (!firstThumbnail || !firstThumbnail.url) {
        return UNAVAILABLE_THUMBNAIL_URL;
    }
    return firstThumbnail.url;
}

function makeVideoUrl(videoId: string) {
    return `https://www.youtube.com/watch?v=${videoId}`;
}

export { getThumbnailUrl, firstAvailableThumbnail, makeVideoUrl, UNAVAILABLE_THUMBNAIL_URL }