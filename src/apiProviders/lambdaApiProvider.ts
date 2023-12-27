import ApiProvider from "./apiProvider";
import { getEnvVarSafe } from "../utils/getEnvVarSafe";
import { Playlist, PlaylistItem } from "../utils/requestHelpers";

const lambdaBaseURL = getEnvVarSafe("REACT_APP_LAMBDA_URL");

const fetchPlaylistURL = new URL("playlists", lambdaBaseURL);
const fetchOwnedPlaylistsURL = new URL("owned-playlists", lambdaBaseURL);
const fetchPlaylistItemsURL = new URL("playlist-items", lambdaBaseURL);
const unavailablePlaylistItemsURL = new URL("unavailable-playlist-items", lambdaBaseURL);
const removePlaylistItemsURL = new URL("playlist-items", lambdaBaseURL);


async function fetchPlaylist(playlistId: string, googleOAuthAccessToken?: string): Promise<Playlist[]> {
    const params = new URLSearchParams({
        playlistId
    });

    const headers = new Headers();
    if (googleOAuthAccessToken) {
        headers.append("Authorization", googleOAuthAccessToken);
    }

    const response = await fetch(fetchPlaylistURL + "?" + params, {
        method: "GET",
        headers,
    });

    const responseObj = await response.json();

    if (!("playlists" in responseObj) || !validatePlaylistResponse(responseObj.playlists)) {
        throw new Error("Invalid response from API");
    }
    return responseObj.playlists;
}

async function fetchVideosInPlaylist(playlistId: string, googleOAuthAccessToken?: string) {
    const params = new URLSearchParams({
        playlistId,
    });

    const headers = new Headers();
    if (googleOAuthAccessToken) {
        headers.append("Authorization", googleOAuthAccessToken);
    }

    const response = await fetch(fetchPlaylistItemsURL + "?" + params, {
        method: "GET",
        headers,
    });

    const responseObj = await response.json();

    if (!("playlistItems" in responseObj)) {
        throw new Error("Invalid response from API");
    }
    return responseObj.playlistItems;
}

async function fetchOwnedPlaylists(googleOAuthAccessToken?: string) {
    const headers = new Headers();
    if (googleOAuthAccessToken) {
        headers.append("Authorization", googleOAuthAccessToken);
    }

    const response = await fetch(fetchOwnedPlaylistsURL, {
        method: "GET",
        headers,
    });

    const responseObj = await response.json();

    if (!("playlists" in responseObj) || !validatePlaylistResponse(responseObj.playlists)) {
        throw new Error("Invalid response from API");
    }
    return responseObj.playlists.items;
}

async function fetchUnavailablePlaylistItems(playlistId: string, userCountryCode: string, userChannelId?: string, googleOAuthAccessToken?: string) {
    const headers = new Headers();

    console.log(googleOAuthAccessToken);
    if (googleOAuthAccessToken) {
        headers.append("Authorization", googleOAuthAccessToken);
    }
    
    const params = new URLSearchParams({
        playlistId,
        "countryCode": userCountryCode,
    });

    if (userChannelId) {
        params.append("channelId", userChannelId);
    }

    const response = await fetch(unavailablePlaylistItemsURL + "?" + params, {
        method: "GET",
        headers,
    });

    const responseObj = await response.json();

    console.log("playlistItems" in responseObj);
    console.log(validatePlaylistItemResponse(responseObj.playlistItems));

    if (!("playlistItems" in responseObj) || !validatePlaylistItemResponse(responseObj.playlistItems)) {
        throw new Error("Invalid response from API");
    }
    return responseObj.playlistItems;
}

async function fetchUnavailablePublicPlaylistItems(playlistId: string, userCountryCode: string) {
    return fetchUnavailablePlaylistItems(playlistId, userCountryCode);
}

async function removeItemsFromPlaylist(itemsToRemove: PlaylistItem[], googleOAuthAccessToken: string, onItemDelete?: (index: number) => void) {
    const headers = new Headers({
        Authorization: googleOAuthAccessToken,
    });

    const params = new URLSearchParams({
        playlistItemIDs: itemsToRemove.map(item => item.id).join(","),
    });

    await fetch(removePlaylistItemsURL + "?" + params, {
        method: "delete",
        headers,
    });

    onItemDelete?.(itemsToRemove.length - 1);
}

function validatePlaylistResponse(responsePlaylists: object): responsePlaylists is Playlist[] {
    if (!("items" in responsePlaylists) || !Array.isArray(responsePlaylists.items)) {
        return false;
    }

    const items = responsePlaylists.items;

    if (items.length === 0) {
        return true;
    }
    const firstItem = items[0];
    // Validate a few properties. There's a lot to check that I won't bother with
    // Assume that if these few exists, the rest should be correct too
    if (typeof firstItem !== "object"
        || firstItem === null
        || typeof firstItem.etag !== "string"
        || typeof firstItem.id !== "string"
        || typeof firstItem.snippet !== "object"
    ) {
        return false;
    }
    return true;
}

function validatePlaylistItemResponse(responsePlaylistItems: object): responsePlaylistItems is PlaylistItem[] {
    if (!Array.isArray(responsePlaylistItems)) {
        return false;
    }

    if (responsePlaylistItems.length === 0) {
        return true;
    }
    const firstItem = responsePlaylistItems[0];
    if (typeof firstItem !== "object"
        || firstItem === null
        || typeof firstItem.etag !== "string"
        || typeof firstItem.id !== "string"
        || typeof firstItem.snippet !== "object"
        || typeof firstItem.contentDetails !== "object"
        || firstItem.kind !== "youtube#playlistItem"
    ) {
        return false;
    }
    return true;
}

export const LambdaApiProvider: ApiProvider = {
    fetchPlaylist,
    fetchOwnedPlaylists,
    fetchVideosInPlaylist,
    fetchUnavailablePlaylistItems,
    fetchUnavailablePublicPlaylistItems,
    removeItemsFromPlaylist,
}