import playlistItemsListResponse from "../testData/playlistItemsListResponse";
import { PlaylistItem } from "../utils/requestHelpers";
import ExportPlaylistItems from "./ExportPlaylists";

import { render, screen } from "@testing-library/react";

test("Shows playlists titles and channels in plain text", () => {
  const playlistName = "The best playlist";
  const playlistItems = playlistItemsListResponse.items;

  const oldCreateObjectURL = global.URL.createObjectURL;

  global.URL.createObjectURL = jest.fn();

  render(
    <ExportPlaylistItems
      playlistName={playlistName}
      playlistItems={playlistItems}
    />,
  );

  for (const playlistItem of playlistItems) {
    expect(
      screen.getByText(playlistItem.snippet.title, {
        exact: false,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(playlistItem.snippet.videoOwnerChannelTitle, {
        exact: false,
      }),
    ).toBeInTheDocument();
  }

  global.URL.createObjectURL = oldCreateObjectURL;
});
