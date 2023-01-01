type PlaylistListResponse = gapi.client.youtube.PlaylistListResponse
type PlaylistResponse = gapi.client.Response<PlaylistListResponse>;
type PlaylistItemListResponse = gapi.client.youtube.PlaylistItemListResponse;
type PlaylistItemResource = gapi.client.youtube.PlaylistItemsResource;
type PlaylistItem = gapi.client.youtube.PlaylistItem;
type Playlist = gapi.client.youtube.Playlist;
type Video = gapi.client.youtube.Video;

function isUnauthenticated(error: any): boolean {
    if (error.result.error.code === 401 || (error.result.error.code === 403 && error.result.error.status === "PERMISSION_DENIED")) {
        // Errors unrelated to authorization: server errors, exceeding quota, bad requests, and so on.
        return true;
    }
    return false;
}

export { isUnauthenticated }

export type { PlaylistListResponse, PlaylistResponse, PlaylistItemListResponse, PlaylistItemResource, PlaylistItem, Playlist, Video }