import { render, screen } from "@testing-library/react";
import PlaylistItemList from "./PlaylistItemList";
import playlistsItemsListResponse from "../testData/playlistItemsListResponse";

const playlistItems = playlistsItemsListResponse.items;

test("PlaylistItemList shows playlists", () => {
    render(<PlaylistItemList items={playlistItems} />);
    for (const playlistItem of playlistItems) {
        expect(screen.getByText(playlistItem.snippet.title)).toBeInTheDocument();
    }
});

// test("PlaylistItemList calls callbacks", () => {
//     
//     const handleSelectionChanged = jest.fn();

//     render(<PlaylistItemList items={playlistItems} onSelectionChanged={handleSelectionChanged}/>);

// })