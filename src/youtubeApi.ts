import { Playlist, PlaylistItem, PlaylistItemListResponse, PlaylistListResponse, Video } from "./utils/requestHelpers";

/**
 * Gets all playlists owned by the signed-in user.
 * Requires authentication to have already happened.
 * @returns The pages of the PlaylistListReponses 
 */
async function fetchOwnedPlaylists(): Promise<PlaylistListResponse[]> {
    const responses: PlaylistListResponse[] = [];

    let response: gapi.client.Response<PlaylistListResponse>;
    response = await gapi.client.youtube.playlists.list({
        part: "contentDetails,id,snippet,status",
        mine: true,
        maxResults: 50,
    });
    responses.push(response.result);

    // Fetch remaining pages
    while (Object.hasOwn(response.result, "nextPageToken")) {
        response = await gapi.client.youtube.playlists.list({
            part: "contentDetails,id,snippet,status",
            mine: true,
            maxResults: 50,
            pageToken: response.result.nextPageToken,
        });
        responses.push(response.result);
    }
    return responses;
}

function isVideoAvailableInCountry(video: Video, countryCode: string): boolean {
    const regionRestriction = video.contentDetails?.regionRestriction;
    if (!regionRestriction) {
        return true;
    }
    /**
     * See https://developers.google.com/youtube/v3/docs/videos#contentDetails.regionRestriction
     * regionRestriction must contain either allowed or blocked
     * If this property is present and a country is not listed in its value,
     * then the video is blocked from appearing in that country. If this property is present and contains an empty list, the video is blocked in all countries.
     */
    if (regionRestriction.allowed) {
        return regionRestriction.allowed.length !== 0 || regionRestriction.allowed.includes(countryCode);
    }
    else {
        // If the blocked property is present and a country is not listed in its value, then the video is viewable in that country. If this property is present and contains an empty list, the video is viewable in all countries.
        return !regionRestriction.blocked || regionRestriction.blocked.length === 0 || !regionRestriction.blocked.includes(countryCode);
    }
}

async function fetchVideosInPlaylist(playlistId: string): Promise<gapi.client.youtube.PlaylistItemListResponse[]> {
    const results: gapi.client.youtube.PlaylistItemListResponse[] = [];

    let response = await gapi.client.youtube.playlistItems.list({
        part: "contentDetails,id,snippet,status",
        maxResults: 50,
        playlistId
    });
    // Should have thrown error if not successful
    console.assert(response.status === 200, response);
    let itemsResult = response.result;
    results.push(itemsResult);

    while (Object.hasOwn(itemsResult, "nextPageToken")) {
        let response = await gapi.client.youtube.playlistItems.list({
            part: "contentDetails,id,snippet,status",
            maxResults: 50,
            playlistId,
            pageToken: itemsResult.nextPageToken,
        });
        itemsResult = response.result;
        results.push(itemsResult);
    }

    return results;
}

// Gets unavailable playlist items as a non-signed-in user in the given country
async function fetchUnavailablePublicPlaylistItems(playlistId: string, userCountryCode: string): Promise<PlaylistItem[]> {
    return fetchUnavailablePlaylistItems(playlistId, null, userCountryCode);
}

// Gets unavailable playlist items from given playlist as the given user user in the given country
async function fetchUnavailablePlaylistItems(playlistId: string, userChannelId: string | null, userCountryCode: string): Promise<PlaylistItem[]> {
    const playlistItems = await fetchVideosInPlaylist(playlistId);
    return includeUnavailablePlaylistItems(playlistItems, userChannelId, userCountryCode);
}

// 
/**
 * Returns all playlistItems that are unavailable for the given user in the given region from the given list
 * @param playlistItems List of playlistItems to check if unavailble
 * @param userChannelId Channel id of user to check as. If userChannelId is null, will get unavailable playlist items as a public user, not signed in, and
 * all private videos will be unavailable
 * @param userCountryCode Country code of YouTube region for user. Get from Region.id
 * @returns 
 */
async function includeUnavailablePlaylistItems(playlistItems: PlaylistItemListResponse[], userChannelId: string | null, userCountryCode: string): Promise<PlaylistItem[]> {
    const unavailableItems: PlaylistItem[] = [];
    // Videos public, but possibly unavailable due to region blocking
    const possiblyUnavailableItems: PlaylistItem[] = [];

    for (const response of playlistItems) {
        if (!response.items) {
            continue;
        }
        for (const item of response.items) {
            // Handles video privacy status change
            // A video that is private, "privacyStatusUnspecified", or something else is unavailable.
            // Deleted videos have a privacyStatus that is "privacyStatusUnspecified" and videoOwnerChannelId is undefined
            // If a video is private, then must check video owner id to see if user owns that video.
            // If userChannelId is null, then all private videos will be added to the unavailableItems list
            // because no video has null videoOwnerChannelId
            if (!(item.status?.privacyStatus === "public" || item.status?.privacyStatus === "unlisted") && item.snippet?.videoOwnerChannelId !== userChannelId) {
                unavailableItems.push(item);
            } else {
                // Still need to check region/copyright blocking
                possiblyUnavailableItems.push(item);
            }
        }
    }

    // Return early so we don't make request checking nothing
    if (possiblyUnavailableItems.length === 0) {
        return unavailableItems;
    }

    const batch = gapi.client.newBatch();
    const MAX_VIDEO_IDS_PER_REQUEST = 50;
    let startIndex = 0;

    const videoIds = possiblyUnavailableItems.map((item) => {
        console.assert(Boolean(item.contentDetails), item);
        if (!item.contentDetails) {
            throw new Error("playlistItem must have contentDetails");
        }
        return item.contentDetails.videoId;
    });


    while (startIndex < videoIds.length) {
        batch.add(gapi.client.youtube.videos.list({
            part: "contentDetails,status",
            id: videoIds.slice(startIndex, startIndex + MAX_VIDEO_IDS_PER_REQUEST).join(","),
            maxResults: 50
        }));
        startIndex += 50;
    }

    const batchResults = (await batch).result;
    const allVideoItems: Video[] = [];
    for (const responseId in batchResults) {
        const response = batchResults[responseId] as gapi.client.Response<gapi.client.youtube.VideoListResponse>;
        const result = response.result;
        if (result.items) {
            allVideoItems.push(...result.items);
        }
    }
    if (allVideoItems.length === 0) {
        return unavailableItems;
    }

    const videoIdToPlaylistItem = new Map();
    for (const playlistItem of possiblyUnavailableItems) {
        const videoId = playlistItem.contentDetails?.videoId;
        if (!videoId) {
            throw new Error("Playlist Item should have video id");
        }
        if (videoIdToPlaylistItem.has(videoId)) {
            videoIdToPlaylistItem.get(playlistItem.contentDetails?.videoId).push(playlistItem);
        } else {
            videoIdToPlaylistItem.set(videoId, [playlistItem]);
        }
    }

    for (const video of allVideoItems) {
        if (!isVideoAvailableInCountry(video, userCountryCode)) {
            unavailableItems.push(...videoIdToPlaylistItem.get(video.id));
        }
    }
    return unavailableItems;
}

async function removeItemsFromPlaylist(unavailableItems: PlaylistItem[], onItemDelete?: (index: number) => void): Promise<void> {
    if (unavailableItems.length <= 0) {
        return;
    }

    /**
     * Can't use batching because, after deleting an item, we must wait for a response
     * before deleting another. I guess batching is too fast and doesn't wait for a response.
     */
    for (let i = 0; i < unavailableItems.length; ++i) {
        const item: gapi.client.youtube.PlaylistItem = unavailableItems[i];
        if (!item.id) {
            continue;
        }
        const response = await gapi.client.youtube.playlistItems.delete({
            id: item.id
        });
        // Successful deletion should responsd with error 204
        if (response.status !== 204) {
            throw response;
        }
        onItemDelete?.(i);
    }
}

async function fetchPlaylist(playlistId: string): Promise<Playlist[]> {
    return (await gapi.client.youtube.playlists.list({
        id: playlistId,
        part: "contentDetails,id,snippet,status",
        maxResults: 50,
    })).result.items ?? [];
}

export { fetchOwnedPlaylists, includeUnavailablePlaylistItems, fetchUnavailablePublicPlaylistItems, fetchUnavailablePlaylistItems, fetchVideosInPlaylist, removeItemsFromPlaylist, fetchPlaylist }