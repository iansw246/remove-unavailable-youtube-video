import { AlertTitle, Button, Collapse, Icon, IconButton, Snackbar, Typography } from "@mui/material";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { isUnauthenticated, Playlist, PlaylistItem } from "../utils/requestHelpers";
import { fetchOwnedPlaylists, fetchUnavailablePlaylistItems } from "../youtubeApi";
import AdaptiveLinearProgress from "./AdaptiveLinearProgress";
import ErrorAlert from "./ErrorAlert";
import GoogleSigninButton from "./GoogleSignInButton/GoogleSignInButton";
import PlaylistList from "./PlaylistList";
import UnavailableItemsDashboard from "./UnavailableItemsDashboard";

export interface Props {
    isUserLoggedIn: boolean;
    onUserLoginRequest: () => void;
    userRegion: Region;
    isTokenClientReady: boolean;
}

const PlaylistListMemoized = memo(PlaylistList);

export default function OwnedPlaylistsDashboard({isUserLoggedIn, onUserLoginRequest, userRegion, isTokenClientReady}: Props) {
    const [userChannelId, setUserChannelId] = useState<string>();

    const [playlists, setPlaylists] = useState<Playlist[]>();

    const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist>();
    const [unavailableItems, setUnavailableItems] = useState<PlaylistItem[]>();

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingProgress, setLoadingProgress] = useState<number>();
    const [loadingTotal, setLoadingTotal] = useState<number>();

    const [showError, setShowError] = useState<boolean>(false);
    const [error, setError] = useState<any>();

    const unavailableVideosHeader = useRef<HTMLDivElement>(null);

    const fetchPlaylists = useCallback(() => {
        if (!isUserLoggedIn) {
            setShowError(true);
            setError("User is not logged in");
            console.error("User is not logged in");
        }
        setIsLoading(true);
        setLoadingProgress(undefined);
        setLoadingTotal(undefined);

        fetchOwnedPlaylists().then((responses) => {
            setPlaylists(responses.flatMap((item) => {
                return item.items ?? [];
            }));

            // Assume that the first playlist returned is owned by the user's channel
            setUserChannelId(responses[0].items?.[0]?.snippet?.channelId);

            setIsLoading(false);

            setShowError(false);
        }, (error) => {
            setIsLoading(false);

            setShowError(true);
            setError(error);
            console.error(error);
        });
    }, [isUserLoggedIn]);

    function handleFetchMyPlaylistsButtonClick() {
        fetchPlaylists();
    }

    const handleFetchUnavailableItemsClick = useCallback((playlist: Playlist, index: number) => {
        if (playlist.id === null || playlist.id === undefined) {
            throw new Error(`playlist.id cannot be ${playlist.id}.`);
        }
        if (userChannelId === undefined) {
            throw new Error(`userChannelId cannot be undefined`);
        }

        setUnavailableItems(undefined);
        setSelectedPlaylist(playlist);

        setIsLoading(true);
        setLoadingProgress(undefined);
        setLoadingTotal(undefined);

        fetchUnavailablePlaylistItems(playlist.id, userChannelId, userRegion.id).then((fetchedUnavailableItems) => {
            setUnavailableItems(fetchedUnavailableItems);
            setIsLoading(false);
        }, (error) => {
            setIsLoading(false);

            setShowError(true);
            setError(error);
            console.error(error);
        });
    }, [userChannelId, userRegion.id]);

    const [isSnackbarOpen, setIsSnackbarOpen] = useState<boolean>(false);

    const handleVideosRemoved = useCallback(() => {
        // UnavailableItems must be falsey, not just selectedPlaylist,
        // or else when clicking on another video,
        // the old unavailable items will pop up of this playlist will show up
        setUnavailableItems(undefined);

        setIsSnackbarOpen(true);
    }, []);

    useEffect(() => {
        if (!isUserLoggedIn) {
            return;
        }
        fetchPlaylists();
    }, [isUserLoggedIn, fetchPlaylists]);

    useEffect(() => {
        if (!unavailableItems || !selectedPlaylist || isLoading) {
            return;
        }
        unavailableVideosHeader.current?.scrollIntoView({
            behavior: "smooth"
        });
    }, [unavailableItems, selectedPlaylist, isLoading]);

    function handleSnackbarClose(event: React.SyntheticEvent | Event, reason?: string) {
        if (reason === "clickaway") {
            return;
        }
        setIsSnackbarOpen(false);
    }

    const snackbarAction = (<>
        <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={handleSnackbarClose}
        ><Icon fontSize="inherit">close</Icon></IconButton>
    </>)

    return (
        <div>
            <GoogleSigninButton onClick={() => { onUserLoginRequest(); }} disabled={!isTokenClientReady} />
            {isUserLoggedIn ? 
                <Button onClick={handleFetchMyPlaylistsButtonClick} style={{display: isUserLoggedIn ? "" : "none"}}>Refresh playlists</Button>
                : 
                <Typography style={{display: isUserLoggedIn ? "none" : ""}}>In order to show your playlists and remove unavailable videos from them, please sign in with Google. </Typography>
            }
            

            <Collapse in={showError}>
                <ErrorAlert error={error} onClose={() => {setShowError(false);}}>
                    {getErrorAlertBody(error)}
                </ErrorAlert>
            </Collapse>
            {isLoading && <AdaptiveLinearProgress loadingProgress={loadingProgress} loadingTotal={loadingTotal} />}
            {playlists && <PlaylistListMemoized
                            playlists={playlists}
                            onGetUnavailableItemsClick={handleFetchUnavailableItemsClick}
                            pl={1} pr={2}
                            mt={2} mb={2}
                        />
            }
            {unavailableItems && selectedPlaylist &&
                <UnavailableItemsDashboard
                    key={selectedPlaylist.etag}
                    ref={unavailableVideosHeader}
                    unavailableItems={unavailableItems}
                    playlist={selectedPlaylist}
                    showRemoveVideosButton={true}
                    onVideosRemoved={handleVideosRemoved}
                />
            }

            <Snackbar
                open={isSnackbarOpen}
                autoHideDuration={10000}
                onClose={handleSnackbarClose}
                message="Videos removed successfully"
                action={snackbarAction}
            />
        </div>
    );
}

function getErrorAlertBody(error: unknown) {
    if (isUnauthenticated(error)) {
        return (
            <>
                <AlertTitle>Not signed in</AlertTitle>
                You are not signed in to Google. Please sign in and try again.
            </>
        );
    } else if (error instanceof TypeError && error.message === "gapi.client.youtube is undefined") {
        return (
            <>
                <AlertTitle>YouTube API not loaded</AlertTitle>
                The YouTube API client could not be loaded. Please check your network connection and ad blocker, or contact the developer.
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