import { AlertTitle, Button, Collapse } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
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

    function handleFetchUnavailableItemsClick(playlist: Playlist, index: number) {
        if (playlist.id === null || playlist.id === undefined) {
            throw new Error(`playlist.id cannot be ${playlist.id}.`);
        }
        if (userChannelId === undefined) {
            throw new Error(`userChannelId cannot be undefined`);
        }

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
    }

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
        unavailableVideosHeader.current?.scrollIntoView();
    }, [unavailableItems, selectedPlaylist, isLoading]);

    return (
        <div>
            <GoogleSigninButton onClick={() => { onUserLoginRequest(); }} disabled={!isTokenClientReady} />
            <Button onClick={handleFetchMyPlaylistsButtonClick} style={{display: isUserLoggedIn ? "" : "none"}}>Refresh playlists</Button>

            <Collapse in={showError}>
                <ErrorAlert error={error} onClose={() => {setShowError(false);}}>
                    {isUnauthenticated(error) ? <>
                        <AlertTitle>Not signed in</AlertTitle>
                        You are not signed in to Google. Please sign in and try again.
                    </> : 
                    <>
                        <AlertTitle>Unknown error</AlertTitle>
                        An unknown error occured. Please try again or contact the developer.
                    </>}
                </ErrorAlert>
            </Collapse>
            {isLoading && <AdaptiveLinearProgress loadingProgress={loadingProgress} loadingTotal={loadingTotal} />}
            {playlists && <PlaylistList playlists={playlists} onGetUnavailableItemsClick={handleFetchUnavailableItemsClick} pl={1} pr={2} mt={2} mb={2} />}
            {unavailableItems && selectedPlaylist &&
                <UnavailableItemsDashboard
                    ref={unavailableVideosHeader}
                    unavailableItems={unavailableItems}
                    playlist={selectedPlaylist}
                    showRemoveVideosButton={true}
                />
            }
        </div>
    );
}