import PlaylistList from "./PlaylistList";
import playlistListResponse from "../testData/ownedPlaylistsListResponse";
import { render, screen } from "@testing-library/react";

const playlists = playlistListResponse.items;

test("PlaylistList displays playlists", () => {
    render(<PlaylistList playlists={playlists} onGetUnavailableItemsClick={() => {}}/>);
    for (const playlist of playlists) {
        expect(screen.getByText(playlist.snippet.title)).toBeInTheDocument();
    }
});

// test("PlaylistList displays playlists", () => {
//     const onePlaylist = playlists.slice(1);
//     const handleGetUnavailableItems = jest.fn();
//     render(<PlaylistList playlists={onePlaylist} onGetUnavailableItemsClick={() => {}}/>);
// });