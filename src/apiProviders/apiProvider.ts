import { Playlist, PlaylistItem, PlaylistItemListResponse, PlaylistListResponse } from "../utils/requestHelpers";

/**
 * Interface for any YouTube API calls.
 * Allows switching between client-side calls via GAPI and an external backend
 * For any method that takes in googleOAuthAccessToken, an access token is required to view private
 * videos owned by that user
 */
type ApiProvider = Readonly<{
    // Fetches playlists that match the given playlistId
    fetchPlaylist: (playlistId: string, googleOAuthAccessToken?: string) => Promise<Playlist[]>;
    /**
     * Gets all playlists owned by the signed-in user.
     * @returns The pages of the PlaylistListReponses 
     */
    fetchOwnedPlaylists: (googleOAuthAccessToken?: string) => Promise<PlaylistListResponse[]>;
    
    /**
     * Gets all playlists owned by the given user.
     * Requires authentication to have already happened.
     * @returns The pages of the PlaylistListReponses 
     */
    // fetchPlaylistsOwnedByChannel: (channelId: string, googleOAuthAccessToken?: string) => Promise<PlaylistListResponse[]>;
    fetchVideosInPlaylist(playlistId: string, googleOAuthAccessToken?: string): Promise<PlaylistItemListResponse[]>;
    /**
     * Gets unavailable playlist items from given playlist as the given user user in the given country
     * @param playlistId 
     * @param userChannelId 
     * @param userCountryCode 
     * @returns 
     */
    fetchUnavailablePlaylistItems: (playlistId: string, userChannelId: string | null, userCountryCode: string, googleOAuthAccessToken?: string) => Promise<PlaylistItem[]>;
    // Fetches items that are unavailable to a public user (not signed into an account) in a given playlist within a given country.
    fetchUnavailablePublicPlaylistItems: (playlistId: string, userCountryCode: string) => Promise<PlaylistItem[]>;

    /**
     * Removes the given playlist items from their respective playlists
     * @param unavailableItems Playlist items to remove
     * @param onItemDelete Callback when the item at the index has been successfully deleted. Useful for user feedback while deletion is happening
     * @param googleOAuthAccessToken 
     * @returns 
     */
    removeItemsFromPlaylist: (unavailableItems: PlaylistItem[], onItemDelete?: (index: number) => void, googleOAuthAccessToken?: string) => Promise<void>
}>;

export default ApiProvider;