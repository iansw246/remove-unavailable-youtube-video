import ApiProvider from "./apiProvider";
import { getEnvVarSafe } from "../utils/getEnvVarSafe";
import { Playlist, PlaylistItem } from "../utils/requestHelpers";

const lambdaBaseURL = getEnvVarSafe("REACT_APP_LAMBDA_URL");

const fetchPlaylistURL = new URL("playlists", lambdaBaseURL);
const unavailablePlaylistItemsURL = new URL("playlist-items", lambdaBaseURL);

async function fetchPlaylist(playlistId: string): Promise<Playlist[]> {
    const params = new URLSearchParams({
        playlistId
    });

    const response = await fetch(fetchPlaylistURL + "?" + params, {
        method: "GET",
    });

    const responseObj = await response.json();

    if (!("playlists" in responseObj) || !validatePlaylistResponse(responseObj.playlists)) {
        throw new Error("Invalid response from API");
    }
    return responseObj.playlists;
}

async function fetchUnavailablePublicPlaylistItems(playlistId: string, userCountryCode: string): Promise<PlaylistItem[]> {
    const params = new URLSearchParams({
        playlistId,
        "countryCode": userCountryCode,
    });

    const response = await fetch(unavailablePlaylistItemsURL + "?" + params, {
        method: "GET"
    });

    const responseObj = await response.json();

    console.log("playlistItems" in responseObj);
    console.log(validatePlaylistItemResponse(responseObj.playlistItems));

    if (!("playlistItems" in responseObj) || !validatePlaylistItemResponse(responseObj.playlistItems)) {
        throw new Error("Invalid response from API");
    }
    return responseObj.playlistItems;
}

function validatePlaylistResponse(responsePlaylists: unknown): responsePlaylists is Playlist[] {
    if (!Array.isArray(responsePlaylists)) {
        return false;
    }
    if (responsePlaylists.length === 0) {
        return true;
    }
    const firstItem = responsePlaylists[0];
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

function validatePlaylistItemResponse(responsePlaylistItems: unknown): responsePlaylistItems is PlaylistItem[] {
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
    fetchUnavailablePublicPlaylistItems,
}