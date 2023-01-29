/**
 * Types modified from gapi.client.youtube files to not have nullable fields.
 */
interface RegionListResponse {
    /** Identifies what kind of resource this is. Value: the fixed string "youtube#i18nRegionListResponse". */
    kind: "youtube#i18nRegionListResponse";
    /** Etag of this resource. */
    etag: string;
    /** A list of regions where YouTube is available. In this map, the i18n region ID is the map key, and its value is the corresponding i18nRegion resource. */
    items: Region[];
}

interface Region {
    kind: "youtube#i18nRegion";
    etag: string;
    id: string;
    snippet: RegionSnippet;
}

interface RegionSnippet {
    gl: string;
    name: string;
}