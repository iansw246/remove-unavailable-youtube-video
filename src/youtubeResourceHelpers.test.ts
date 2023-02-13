import { getThumbnailURL } from "./youtubeResourceHelpers";

const thumbnailDetailWithDefault: gapi.client.youtube.ThumbnailDetails = {
    "default": {
        "url": "https://i.ytimg.com/vi/jbZU6QyZ8Nc/default.jpg",
        "width": 120,
        "height": 90
    },
    "medium": {
        "url": "https://i.ytimg.com/vi/jbZU6QyZ8Nc/mqdefault.jpg",
        "width": 320,
        "height": 180
    },
    "high": {
        "url": "https://i.ytimg.com/vi/jbZU6QyZ8Nc/hqdefault.jpg",
        "width": 480,
        "height": 360
    },
    "standard": {
        "url": "https://i.ytimg.com/vi/jbZU6QyZ8Nc/sddefault.jpg",
        "width": 640,
        "height": 480
    },
    "maxres": {
        "url": "https://i.ytimg.com/vi/jbZU6QyZ8Nc/maxresdefault.jpg",
        "width": 1280,
        "height": 720
    }
};

test("getThumbnailURL retrieves default thumbnail first", () => {
    expect(getThumbnailURL(thumbnailDetailWithDefault))
        .toEqual("https://i.ytimg.com/vi/jbZU6QyZ8Nc/default.jpg");
});

// https://stackoverflow.com/questions/161738/what-is-the-best-regular-expression-to-check-if-a-string-is-a-valid-url
function isValidURL(url: string): boolean {
    const regex = /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[/?#]\S*)?$/i;
    return regex.test(url);
}


test("getThumbnailURL returns valid no_thumbnail url for null", async () => {
    const url = getThumbnailURL(null);
    expect(typeof url).toBe("string");
    expect(isValidURL(url)).toBeTruthy();
});

test("getThumbnailURL returns valid no_thumbnail url for undefined", async () => {
    const url = getThumbnailURL(undefined);
    expect(typeof url).toBe("string");
    expect(isValidURL(url)).toBeTruthy();
})