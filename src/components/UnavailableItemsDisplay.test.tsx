import { render } from "@testing-library/react";
import playlistItemsListResponse from "../testData/playlistItemsListResponse";
import playlistListResponse from "../testData/playlistsListResponse";
import UnavailableItemsDisplay from "./UnavailableItemsDisplay";

test("Renders correctly", () => {
  const { asFragment } = render(
    <UnavailableItemsDisplay
      unavailableItems={playlistItemsListResponse.items}
      playlist={playlistListResponse.items[0]}
    />,
  );

  expect(asFragment()).toMatchSnapshot();
});

test("Renders playlist item names", () => {
  const { getByText } = render(
    <UnavailableItemsDisplay
      unavailableItems={playlistItemsListResponse.items}
      playlist={playlistListResponse.items[0]}
    />,
  );

  for (const item of playlistItemsListResponse.items) {
    expect(getByText(item.snippet.title)).toBeInTheDocument();
  }
});
