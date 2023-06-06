const UNAVAILABLE_THUMBNAIL_URL = "https://i.ytimg.com/img/no_thumbnail.jpg";

// Dimensions of a "thumbnail for a video – or a resource that refers to a video, such as a playlist item or search result."
// Channel images have different resolutions
const VIDEO_THUMBNAIL_DIMENSIONS = {
    default: {
        width: 120,
        height: 90,
    },
    medium: {
        width: 320,
        height: 180,
    },
    high: {
        width: 480,
        height: 360,
    },
    standard: {
        width: 640,
        height: 480,
    },
    maxres: {
        width: 1280,
        height: 720
    },
};

/**
 * Returns first available thumbnail in the order of "default", "medium", "high", and "standard"
 * @param thumbnailDetails 
 * @returns First avaialble thumbnail
 */
function firstAvailableThumbnail(thumbnailDetails: gapi.client.youtube.ThumbnailDetails): gapi.client.youtube.Thumbnail | null {
    // Key for preferred thumbnail in order of preference. This function gets the first thumbnail in order of keys
    const THUMBNAIL_KEYS: (keyof gapi.client.youtube.ThumbnailDetails)[] = ["default", "medium", "high", "standard", "maxres"];
    for (const key of THUMBNAIL_KEYS) {
        if (Object.hasOwn(thumbnailDetails, key)) {
            return thumbnailDetails[key] as gapi.client.youtube.Thumbnail;
        }
    }
    return null;
}

/**
 * Returns url for one of the thumbnails in thumbnailDetails
 * @param thumbnailDetails
 * @returns url for thumbnail, or a "no thumbnail" image if no valid thumbnails are found
 */
function thumbnailURL(thumbnailDetails: gapi.client.youtube.ThumbnailDetails | null | undefined): string {
    if (!thumbnailDetails) {
        return UNAVAILABLE_THUMBNAIL_URL;
    }
    const firstThumbnail = firstAvailableThumbnail(thumbnailDetails);
    if (!firstThumbnail || !firstThumbnail.url) {
        return UNAVAILABLE_THUMBNAIL_URL;
    }
    return firstThumbnail.url;
}

function makeVideoURL(videoId: string, playlistId?: string, playlistPosition?: number) {
    return `https://www.youtube.com/watch?v=${videoId}${playlistId ? `&list=${playlistId}` : ""}${playlistPosition ? `&position=${playlistPosition}` : null}`;
}

function makeChannelURL(channelId: string) {
    return `https://www.youtube.com/channel/${channelId}`;
}

export { thumbnailURL, makeVideoURL, makeChannelURL, UNAVAILABLE_THUMBNAIL_URL, VIDEO_THUMBNAIL_DIMENSIONS }