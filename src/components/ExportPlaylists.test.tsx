import playlistItemsListResponse from "../testData/playlistItemsListResponse";
import ExportPlaylistItems from "./ExportPlaylists";

import { render, screen } from "@testing-library/react";

test("Shows playlists titles and channels in plain text", () => {
  const playlistName = "The best playlist";
  const playlistItems = playlistItemsListResponse.items;

  // JS-DOM did not implement URL.createObjectURL. Must mock
  // https://github.com/jsdom/jsdom/issues/1721
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
