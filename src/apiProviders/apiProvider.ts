import { Playlist, PlaylistItem, PlaylistItemListResponse, PlaylistListResponse } from "../utils/requestHelpers";

/**
 * Interface for any YouTube API calls.
 * Allows switching between client-side calls via GAPI and an external backend
 */
type ApiProvider = Readonly<{
    // Fetches playlists that match the given playlistId
    fetchPlaylist: (playlistId: string) => Promise<Playlist[]>;
    
    /**
     * Gets all playlists owned by the given user.
     * Requires authentication to have already happened.
     * @returns The pages of the PlaylistListReponses 
     */
    fetchPlaylistsOwnedByChannel: (channelId: string) => Promise<PlaylistListResponse[]>;
    fetchVideosInPlaylist(playlistId: string): Promise<gapi.client.youtube.PlaylistItemListResponse[]>;
    /**
     * Gets unavailable playlist items from given playlist as the given user user in the given country
     * @param playlistId 
     * @param userChannelId 
     * @param userCountryCode 
     * @returns 
     */
    fetchUnavailablePlaylistItems: (playlistId: string, userChannelId: string | null, userCountryCode: string) => Promise<PlaylistItem[]>;
    // Fetches items that are unavailable to a public user (not signed into an account) in a given playlist within a given country.
    fetchUnavailablePublicPlaylistItems: (playlistId: string, userCountryCode: string) => Promise<PlaylistItem[]>;
}>;

export default ApiProvider;