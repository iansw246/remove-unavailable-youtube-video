import { parseYoutubePlaylistInput } from "./PlaylistInput";

function mockStringToUrl(str: string): URL | null {
  try {
    return new URL(str);
  } catch (e) {
    // Cannot just use typeof e === TypeError because in Jest, objects in this module differ from
    // the imported module
    // see https://github.com/jestjs/jest/issues/2549
    if (
      typeof e === "object" &&
      e !== null &&
      e.constructor.name === "TypeError"
    ) {
      return null;
    } else {
      throw e;
    }
  }
}

function mockParseYoutubePlaylistInput(input: string) {
  return parseYoutubePlaylistInput(input, mockStringToUrl);
}

describe("parseYoutubePlaylistInput", () => {
  test("reads valids YouTube playlist url", () => {
    expect(
      mockParseYoutubePlaylistInput(
        "https://www.youtube.com/playlist?list=PLBB4108C5CB4E1DD6",
      ),
    ).toBe("PLBB4108C5CB4E1DD6");
  });
  test("returns null for URL that is not a YouTube playlist", () => {
    expect(
      mockParseYoutubePlaylistInput("https://www.youtube.com/feed/library"),
    ).toBeNull();
  });
  test("returns null for URL that is not YouTube", () => {
    expect(
      mockParseYoutubePlaylistInput(
        "https://mui.com/material-ui/react-text-field/#validation",
      ),
    ).toBeNull();
  });
  test("reads YouTube playlist url with other parameters and fragment", () => {
    expect(
      mockParseYoutubePlaylistInput(
        "https://www.youtube.com/playlist?list=PLe1jcCJWvkWg9PnsWDEbQvIa_XmkMzjzk&otherStuff=blabla&pp=iAQB#ExampleHash",
      ),
    ).toBe("PLe1jcCJWvkWg9PnsWDEbQvIa_XmkMzjzk");
  });
  test("reads YouTube playlist ID", () => {
    expect(
      mockParseYoutubePlaylistInput("PLe1jcCJWvkWg9PnsWDEbQvIa_XmkMzjzk"),
    ).toBe("PLe1jcCJWvkWg9PnsWDEbQvIa_XmkMzjzk");
  });
  test("returns null for invalid YouTube playlist ID", () => {
    expect(
      mockParseYoutubePlaylistInput(
        "PLe1jcCJWvkWg9PnsWDEbQvIa_XmkMzjzk , #@js!",
      ),
    ).toBeNull();
  });
});
