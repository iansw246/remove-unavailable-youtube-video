import { useEffect, useState } from "react";
import { fetchUnavailablePublicPlaylistItems } from "../youtubeApi";
import { PlaylistItem } from "../utils/requestHelpers";

function isRegion(obj: any): obj is Region {
    return typeof obj === "object"
        && obj.kind === "youtube#i18nRegion"
        && typeof obj.etag === "string"
        && typeof obj.id === "string"
        // For more complete check, should check properties on the RegionSnippet snippet
        && typeof obj.snippet === "object";
}

type UseUnavailableItemsReturn = [PlaylistItem[] | undefined, boolean, number | undefined, number | undefined, boolean, any | undefined];

export default function useUnavailableItems(playlistId: string, regionId: string): UseUnavailableItemsReturn {
    const [unavailableItems, setUnavailableItems] = useState<PlaylistItem[]>();

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingProgress, setLoadingProgress] = useState<number>();
    const [loadingTotal, setLoadingTotal] = useState<number>();

    const [isError, setIsError] = useState<boolean>(false);
    const [error, setError] = useState<any>();

    useEffect(() => {
        if (typeof playlistId !== "string"
            || playlistId.length === 0
        ) {
            return;
        }

        setIsLoading(true);
        setUnavailableItems(undefined);
        
        fetchUnavailablePublicPlaylistItems(playlistId, regionId)
            .then((playlistItems) => {
                console.log("New playlist Items:", playlistItems);
                setIsLoading(false);
                setUnavailableItems(playlistItems);
                setIsError(false);
                setError(undefined);
            }, (error) => {
                setIsLoading(false);
                setIsError(true);
                setError(error);
            });
    }, [playlistId, regionId]);

    return [unavailableItems, isLoading, loadingProgress, loadingTotal, isError, error];
}