import regionlistResponse from "./regions"

const DEFAULT_COUNTRY_CODE: string = "US";

let defaultRegion: Region;

for (const region of regionlistResponse.items) {
    if (region.snippet.gl === DEFAULT_COUNTRY_CODE) {
        defaultRegion = region;
        break;
    }
}

export { DEFAULT_COUNTRY_CODE, defaultRegion };