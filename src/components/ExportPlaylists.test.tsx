import playlistItemsListResponse from "../testData/playlistItemsListResponse";
import ExportPlaylistItems from "./ExportPlaylists";

import { render, screen } from "@testing-library/react";
import { PlaylistItem } from "../utils/requestHelpers";

function setupURL() {
  global.URL.createObjectURL = jest.fn();
}

function teardownURL(oldCreateObjectURL: any) {
  global.URL.createObjectURL = oldCreateObjectURL;
}

test("Shows playlists titles and channels in plain text", () => {
  const playlistName = "Mock playlist name";
  const playlistItems = playlistItemsListResponse.items;

  // JS-DOM did not implement URL.createObjectURL. Must mock
  // https://github.com/jsdom/jsdom/issues/1721
  const oldCreateObjectURL = global.URL.createObjectURL;

  setupURL();

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

  teardownURL(oldCreateObjectURL);
});

test("Handles empty playlistItems", () => {
  const oldCreateObjectURL = global.URL.createObjectURL;
  setupURL();

  const playlistName = "Mock Playlist Name";
  const playlistItems: PlaylistItem[] = [];

  render(
    <ExportPlaylistItems
      playlistName={playlistName}
      playlistItems={playlistItems}
    />,
  );

  teardownURL(oldCreateObjectURL);
});
