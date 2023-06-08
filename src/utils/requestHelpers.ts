/**
 * Type aliases and helper functions for gapi requests
 */

type PlaylistListResponse = gapi.client.youtube.PlaylistListResponse
type PlaylistResponse = gapi.client.Response<PlaylistListResponse>;
type PlaylistItemListResponse = gapi.client.youtube.PlaylistItemListResponse;
type PlaylistItemResource = gapi.client.youtube.PlaylistItemsResource;
type PlaylistItem = gapi.client.youtube.PlaylistItem;
type Playlist = gapi.client.youtube.Playlist;
type Video = gapi.client.youtube.Video;
type TokenClient = google.accounts.oauth2.TokenClient;

function hasProperty<KnownT extends object, WithPropT extends PropertyKey>(obj: KnownT, prop: WithPropT): obj is KnownT & Record<WithPropT, unknown> {
    return Object.hasOwn(obj, prop);
}

function isUnauthenticatedError(error: any): boolean {
    // Errors unrelated to authorization: server errors, exceeding quota, bad requests, and so on.
    return error?.result?.error?.code === 401 || (error?.result?.error?.code === 403 && error.result.error?.status === "PERMISSION_DENIED");
}

export { isUnauthenticatedError as isUnauthenticated, hasProperty }

export type {
    PlaylistListResponse,
    PlaylistResponse,
    PlaylistItemListResponse,
    PlaylistItemResource,
    PlaylistItem,
    Playlist,
    Video,
    TokenClient
}