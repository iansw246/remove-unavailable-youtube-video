import { useEffect, useState } from "react";
import { Playlist, PlaylistItem, PlaylistItemListResponse, PlaylistListResponse } from "../utils/requestHelpers";
import { fetchOwnedPlaylists, fetchUnavailablePublicPlaylistItems } from "../youtubeApi";

interface useYoutubePlaylistsReturn {

}

// Makes Key on Type required (not optional)
type KeyRequired<Type, Key extends keyof Type> = Pick<Required<Type>, Key> & Omit<Type, Key>

type NotNullPlaylistResponse = KeyRequired<PlaylistListResponse, "items">;

function useYoutubeUserPlaylists(channelId: string, country: Region) {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [playlists, setPlaylists] = useState<Playlist[]>();

    const [isError, setIsError] = useState<boolean>(false);
    const [error, setError] = useState<any>();
    
    useEffect(() => {
        setIsLoading(true);
        fetchOwnedPlaylists().then((listResponses) => {
            const newPlaylists: Playlist[] = listResponses
                .filter((response): response is NotNullPlaylistResponse => response.items !== undefined)
                .flatMap(response => response.items);

            setIsError(false);
            setPlaylists(newPlaylists);
        }).catch((error) => {
            setIsError(true);
            setError(error);
            setIsLoading(false);
            console.error("An error occured fetching owned playlists: ", error);
        });
    }, []);
}