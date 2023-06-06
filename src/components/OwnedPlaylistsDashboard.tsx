import { Button, Typography, LinearProgress } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Playlist, PlaylistItem } from "../utils/requestHelpers";
import GoogleSigninButton from "./GoogleSignInButton/GoogleSignInButton";
import { createAction, BaseAction } from "../reducerActions";
import { fetchOwnedPlaylists, fetchUnavailablePlaylistItems, removeItemsFromPlaylist } from "../youtubeApi";
import PlaylistList from "./PlaylistList";
import UnavailableItemsDashboard from "./UnavailableItemsDashboard";

function isGapiError(obj: any): obj is gapi.client.HttpRequestRejected {
    return Object.hasOwn(obj, "result") && Object.hasOwn(obj, "body") && Object.hasOwn(obj, "headers") &&
    Object.hasOwn(obj, "status") && Object.hasOwn(obj, "statusText");
}

interface State {
    isUserLoggedIn: boolean,

    userChannelId?: string,

    unavailablePlaylists: Playlist[],

    selectedPlaylist: Playlist,
    unavailableItems: PlaylistItem[],

    isLoading: boolean,
    loadingMessage: React.ReactNode,
    loadingProgress?: number,
    loadingTotal?: number,

    showError: boolean,
    errorTitle: string,
    errorBody: React.ReactNode,
}

enum ActionType {
    USER_LOGGED_IN = "userLoggedIn",
    SHOW_OWNED_PLAYLIST_BUTTON_CLICKED = "showOwnedPlaylistButtonClicked",
    PLAYLISTS_LOADED = "playlistsLoaded",
    ERROR_OCCURED = "errorOccured",
}

const userLoggedInAction = createAction<undefined, ActionType.USER_LOGGED_IN>(ActionType.USER_LOGGED_IN);
const showOwnedPlaylistButtonClickedAction = createAction<undefined, ActionType.SHOW_OWNED_PLAYLIST_BUTTON_CLICKED>(ActionType.SHOW_OWNED_PLAYLIST_BUTTON_CLICKED);
const playlistsLoadedAction = createAction<Playlist[], ActionType.PLAYLISTS_LOADED>(ActionType.PLAYLISTS_LOADED);


function reducer(state: State, action: BaseAction): State {
    if (userLoggedInAction.match(action)) {
        return { ...state, isUserLoggedIn: true };
    } else if (showOwnedPlaylistButtonClickedAction.match(action)) {
        return { ...state, isLoading: true, loadingMessage: "Loading your playlists", loadingProgress: undefined, loadingTotal: undefined };
    }
    // Temporary
    return state;
}

export interface Props {
    isUserLoggedIn: boolean;
    onUserLoginRequest: () => void;
    userRegion: Region;
}

export default function OwnedPlaylistsDashboard({isUserLoggedIn, onUserLoginRequest, userRegion}: Props) {
    const [userChannelId, setUserChannelId] = useState<string>();

    const [playlists, setPlaylists] = useState<Playlist[]>();

    const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist>();
    const [unavailableItems, setUnavailableItems] = useState<PlaylistItem[]>();

    const [isLoading, setIsLoading] = useState<boolean>();
    const [loadingProgress, setLoadingProgress] = useState<number>();
    const [loadingTotal, setLoadingTotal] = useState<number>();

    const [error, setError] = useState<any>();

    useEffect(() => {
        if (!isUserLoggedIn) {
            return;
        }
        fetchPlaylists();
    }, [isUserLoggedIn]);

    function fetchPlaylists() {
        if (!isUserLoggedIn) {
            setError("User is not logged in");
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
        }, (error) => {
            setIsLoading(false);
            setError(error);
        });
    }

    function handleGetMyPlaylistsButtonClick() {
        fetchPlaylists();
    }

    function handleGetUnavailableItemsClick(playlist: Playlist, index: number) {
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

        fetchUnavailablePlaylistItems(playlist.id, userChannelId, userRegion.id).then((fetchedUnavailbleItems) => {
            setUnavailableItems(fetchedUnavailbleItems);
            setIsLoading(false);
        }, (error) => {
            setError(error);
            setIsLoading(false);
        });
    }

    function handleRemoveVideosButtonClick() {
        if (!unavailableItems) {
            return;
        }

        setIsLoading(true);
        setLoadingProgress(0);
        setLoadingTotal(unavailableItems.length);

        removeItemsFromPlaylist(unavailableItems, (index) => {
            setLoadingProgress(index);
        }).then(() => {
            setIsLoading(false);
            setSelectedPlaylist(undefined);
        }, (error) => {
            setIsLoading(false);
            setError(error);
            setSelectedPlaylist(undefined);
        });
    }

    return (
        <div>
            <GoogleSigninButton onClick={() => { onUserLoginRequest(); }} />
            <Button onClick={handleGetMyPlaylistsButtonClick} style={{display: isUserLoggedIn ? "" : "none"}}>Refresh playlists</Button>

            <p style={{border: "2px solid green", padding: "0.2rem"}}>[Debug] User logged in: {isUserLoggedIn.toString()}</p>

            {error && <Typography>An error has occured: {JSON.stringify(error)}</Typography>}
            {isLoading && <LinearProgress variant="indeterminate" />}
            {playlists && <PlaylistList playlists={playlists} onGetUnavailableItemsClick={handleGetUnavailableItemsClick} />}
            {unavailableItems && selectedPlaylist &&
                <UnavailableItemsDashboard
                    unavailableItems={unavailableItems}
                    playlist={selectedPlaylist}
                    handleRemoveVideosButtonClick={handleRemoveVideosButtonClick}
                    showRemoveVideosButton={true}
                />
            }
        </div>
    )
}