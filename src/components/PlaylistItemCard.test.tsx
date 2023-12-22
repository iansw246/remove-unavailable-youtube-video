import PlaylistItemCard from "./PlaylistItemCard";
import playlistItemsListResponse from "../testData/playlistItemsListResponse";
import { render, screen } from "@testing-library/react";

test("Displays playlist item correctly", () => {
  const playlistItem = playlistItemsListResponse.items[0];

  render(<PlaylistItemCard playlistItem={playlistItem} />);

  expect(screen.getByText(playlistItem.snippet.title)).toBeInTheDocument();
  expect(
    screen.getByText(playlistItem.snippet.videoOwnerChannelTitle),
  ).toBeInTheDocument();
});
