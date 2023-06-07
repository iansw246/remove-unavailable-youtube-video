import { Button, LinearProgress, Paper, Stack, Typography } from "@mui/material";
import useUnavailableItems from "./useUnavailableItems";
import PlaylistItemCard from "./PlaylistItemView";
import { Playlist, PlaylistItem } from "../utils/requestHelpers";
import { useState, useEffect } from "react";
import { fetchPlaylist, fetchUnavailablePublicPlaylistItems } from "../youtubeApi";
import PlaylistInput from "./PlaylistInput";
import PlaylistItemList from "./PlaylistItemList";
import UnavailableItemsDisplay from "./UnavailableItemsDisplay";
import UnavailableItemsDashboard from "./UnavailableItemsDashboard";

export interface Props {
    region: Region;
}

export default function EnterPlaylistDashboard({region}: Props) {
    const [playlistId, setPlaylistId] = useState<string>();

    const [playlist, setPlaylist] = useState<Playlist>();
    const [unavailableItems, setUnavailableItems] = useState<PlaylistItem[]>();

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingProgress, setLoadingProgress] = useState<number>();
    const [loadingTotal, setLoadingTotal] = useState<number>();

    const [isError, setIsError] = useState<boolean>(false);
    const [error, setError] = useState<any>();

    function onGetUnavailableItemsClick() {
        if (typeof playlistId !== "string"
            || playlistId.length === 0
        ) {
            return;
        }

        setIsLoading(true);
        setUnavailableItems(undefined);

        Promise.all(
            [
                fetchPlaylist(playlistId),
                fetchUnavailablePublicPlaylistItems(playlistId, region.id),
            ])
            .then(([playlist, playlistItems]) => {
                console.log("New playlist Items:", playlistItems);
                setIsLoading(false);
                setPlaylist(playlist?.[0]);
                setUnavailableItems(playlistItems);
                setIsError(false);
                setError(undefined);
            }, (error) => {
                setIsLoading(false);
                setIsError(true);
                setError(error);
            });
    }

    return (
        <div>
            <PlaylistInput onChange={ (playlistId) => setPlaylistId(playlistId ?? undefined) } />
            <Button onClick={ onGetUnavailableItemsClick }>Get unavailable items</Button>
            <br />
            {
                isLoading ? (
                    <>
                        <LinearProgress variant="indeterminate"></LinearProgress>
                        <Typography>Loading unavailable items...</Typography>
                    </>
                ) : isError ? (
                    <>
                        <Typography>An error has occured</Typography>
                        <Typography>Details: {JSON.stringify(error)}</Typography>
                    </>
                ) :
                playlist ? (
                  <UnavailableItemsDashboard playlist={playlist} unavailableItems={unavailableItems ?? []} showRemoveVideosButton={false} />
                ) : null
            }
        </div>
    );
}