import { AlertTitle, Button, Collapse, LinearProgress, Paper, Stack, Typography } from "@mui/material";
import useUnavailableItems from "./useUnavailableItems";
import PlaylistItemCard from "./PlaylistItemView";
import { Playlist, PlaylistItem, hasProperty } from "../utils/requestHelpers";
import { useState, useEffect } from "react";
import { fetchPlaylist, fetchUnavailablePublicPlaylistItems } from "../youtubeApi";
import PlaylistInput from "./PlaylistInput";
import PlaylistItemList from "./PlaylistItemList";
import UnavailableItemsDisplay from "./UnavailableItemsDisplay";
import UnavailableItemsDashboard from "./UnavailableItemsDashboard";
import ErrorAlert from "./ErrorAlert";

function isErrorNotFound(error: unknown) {
    return error !== null
        && typeof error === "object"
        && hasProperty(error, "status")
        && error.status === 404;
}

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

    const [showError, setShowError] = useState<boolean>(false);
    const [error, setError] = useState<any>();

    function onGetUnavailableItemsClick() {
        if (typeof playlistId !== "string"
            || playlistId.length === 0
        ) {
            return;
        }

        setIsLoading(true);
        setUnavailableItems(undefined);

        Promise.all([
                fetchPlaylist(playlistId),
                fetchUnavailablePublicPlaylistItems(playlistId, region.id),
            ])
            .then(([playlist, playlistItems]) => {
                setIsLoading(false);
                // Assume that first response is the desired (and only) reponse
                setPlaylist(playlist?.[0]);
                setUnavailableItems(playlistItems);
                setShowError(false);
                setError(undefined);
            }, (error) => {
                setIsLoading(false);
                setShowError(true);
                setError(error);
                console.error(error);
            });
    }

    return (
        <div>
            <PlaylistInput onChange={ (playlistId) => setPlaylistId(playlistId ?? undefined) } />
            <Button sx={{mt: 2, mb: 2}} variant="contained" onClick={ onGetUnavailableItemsClick }>Get unavailable items</Button>
            
            {isLoading ? (<>
                <LinearProgress variant="indeterminate"></LinearProgress>
                <Typography>Loading unavailable items...</Typography>
            </>) : null}
            <Collapse in={showError}>
                <ErrorAlert error={error} onClose={() => { setShowError(false); }}>
                    {isErrorNotFound(error) ? <>
                        <AlertTitle>Playlist not found</AlertTitle>
                    </> : <>
                        <AlertTitle>Unexpected error</AlertTitle>
                        An unexpected error occured. Please try again. Contact the developer if this issue persists.
                    </>}
                </ErrorAlert>
            </Collapse>
            {playlist ? (
                <UnavailableItemsDashboard playlist={playlist} unavailableItems={unavailableItems ?? []} showRemoveVideosButton={false} />
            ) : null}
        </div>
    );
}