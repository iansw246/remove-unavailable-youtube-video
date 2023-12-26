import { AlertTitle, Button, Collapse, LinearProgress, Typography } from "@mui/material";
import { useState } from "react";
import ApiProvider from "../apiProviders/apiProvider";
import { hasProperty, Playlist, PlaylistItem } from "../utils/requestHelpers";
import ErrorAlert from "./ErrorAlert";
import PlaylistInput from "./PlaylistInput";
import UnavailableItemsDashboard from "./UnavailableItemsDashboard";

enum Error {
    NO_PLAYLIST_ID_ENTERED = "no playlist id entered"
}

function isErrorNotFound(error: unknown) {
    return error !== null
        && typeof error === "object"
        && hasProperty(error, "status")
        && error.status === 404;
}

function getErrorAlertBody(error: unknown) {
    if (isErrorNotFound(error)) {
        return (
            <>
                <AlertTitle>Playlist not found</AlertTitle>
                The playlist may be private.
            </>
        );
    } else if (error instanceof TypeError && error.message === "gapi.client.youtube is undefined") {
        return (
            <>
                <AlertTitle>YouTube API not loaded</AlertTitle>
                The YouTube API client could not be loaded. Please check your network connection and ad blocker, or contact the developer.
            </>
        )
    } else if (error === Error.NO_PLAYLIST_ID_ENTERED) {
        return (
            <>
                <AlertTitle>No playlist ID/link entered</AlertTitle>
            </>
        )
    } else {
        return (
            <>
                <AlertTitle>Unknown error</AlertTitle>
                An unknown error occured. Please try again or contact the developer.
            </>
        );
    }
}

export interface Props {
    // The region in which user is assumed to be when checking for unavailable playlist items.
    region: Region;
    apiProvider: ApiProvider;
}

/**
 * Tab where user can enter a playlist to find unavailable videos in
 * Does not require authentiation
 */
export default function EnterPlaylistDashboard({region, apiProvider}: Props) {
    const [playlistId, setPlaylistId] = useState<string>();

    const [playlist, setPlaylist] = useState<Playlist>();
    const [unavailableItems, setUnavailableItems] = useState<PlaylistItem[]>();

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [showError, setShowError] = useState<boolean>(false);
    const [error, setError] = useState<any>();

    function onGetUnavailableItemsClick() {
        if (typeof playlistId !== "string"
            || playlistId.length === 0
        ) {
            setError(Error.NO_PLAYLIST_ID_ENTERED);
            setShowError(true);
            return;
        }

        setError(undefined);
        setShowError(false);

        setIsLoading(true);
        setUnavailableItems(undefined);

        Promise.all([
                apiProvider.fetchPlaylist(playlistId),
                apiProvider.fetchUnavailablePublicPlaylistItems(playlistId, region.id),
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
                    {getErrorAlertBody(error)}
                </ErrorAlert>
            </Collapse>
            {playlist ? (
                <UnavailableItemsDashboard
                    playlist={playlist}
                    unavailableItems={unavailableItems ?? []}
                    showRemoveVideosButton={false}
                    apiProvider={apiProvider}
                />
            ) : null}
        </div>
    );
}