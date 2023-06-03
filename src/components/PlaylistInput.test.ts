import { parseYoutubePlaylistInput } from "./PlaylistInput";

function throwTest() {
    try {
        const url = new URL("Potato cheese");
        console.log(url);
    } catch (e) {
        console.log(e instanceof TypeError);
        console.log(e instanceof Error);
    }

    try {
        ([] as any).f()
    } catch (e) {
        console.log(e instanceof TypeError);
        console.log(e instanceof Error);
    }
}

describe("parseYoutubePlaylistInput", () => {
    test("reads valids YouTube playlist url", () => {
        expect(parseYoutubePlaylistInput("https://www.youtube.com/playlist?list=PLBB4108C5CB4E1DD6"))
            .toBe("PLBB4108C5CB4E1DD6");
    });
    test("returns null for URL that is not a YouTube playlist", () => {
        expect(parseYoutubePlaylistInput("https://www.youtube.com/feed/library")).toBeNull();
    });
    test("returns null for URL that is not YouTube", () => {
        expect(parseYoutubePlaylistInput("https://mui.com/material-ui/react-text-field/#validation")).toBeNull();
    });
    test("reads YouTube playlist url with other parameters and fragment", () => {
        expect(parseYoutubePlaylistInput(
            "https://www.youtube.com/playlist?list=PLe1jcCJWvkWg9PnsWDEbQvIa_XmkMzjzk&otherStuff=blabla&pp=iAQB#ExampleHash"
        ))
            .toBe("PLe1jcCJWvkWg9PnsWDEbQvIa_XmkMzjzk");
    });
    test("reads YouTube playlist ID", () => {
        expect(parseYoutubePlaylistInput("PLe1jcCJWvkWg9PnsWDEbQvIa_XmkMzjzk"))
            .toBe("PLe1jcCJWvkWg9PnsWDEbQvIa_XmkMzjzk");
    });
    test("returns null for invalid YouTube playlist ID", () => {
        expect(parseYoutubePlaylistInput("PLe1jcCJWvkWg9PnsWDEbQvIa_XmkMzjzk , #@js!"))
            .toBeNull();
    });
});

test("throwTest", () => {
    throwTest();
});