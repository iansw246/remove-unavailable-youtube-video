import { Playlist, PlaylistItem } from "../utils/requestHelpers";

type ApiProvider = Readonly<{
    // Fetches playlists that match the given playlistId
    fetchPlaylist: (playlistId: string) => Promise<Playlist[]>;
    // Fetches items that are unavailable to a public user (not signed into an account) in a given playlist within a given country.
    fetchUnavailablePublicPlaylistItems: (playlistId: string, userCountryCode: string) => Promise<PlaylistItem[]>;
}>;

export default ApiProvider;