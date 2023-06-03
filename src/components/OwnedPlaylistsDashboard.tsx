import { Stack, Paper, DialogActions, DialogTitle, DialogContent, DialogContentText, Dialog, Button, CircularProgress, Tabs, Tab, Box, Typography, LinearProgress } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { Playlist, PlaylistItem, PlaylistItemListResponse, PlaylistListResponse, TokenClient, Video } from "../utils/requestHelpers";
import RegionSelector, { saveRegion } from "./RegionSelector";
import ErrorDialog from "./ErrorDialog";
import ExportPlaylistItems from "./ExportPlaylists";
import PlaylistItemView from "./PlaylistItemView";
import PlaylistRow from "./PlaylistRow";
import { defaultRegion } from "../data/regionOptions";
import regionListResponse from "../data/regions";
import PlaylistInput from "./PlaylistInput";
import EnterPlaylistDashboard from "./EnterPlaylistDashboard";
import GoogleLogin from "./GoogleLogin";
import GoogleSigninButton from "./GoogleSignInButton/GoogleSignInButton";
import { createAction, Action, BaseAction } from "../reducerActions";
import { fetchOwnedPlaylists, fetchUnavailablePlaylistItems, includeUnavailablePlaylistItems, removeItemsFromPlaylist } from "../youtubeApi";
import PlaylistList from "./PlaylistList";
import PlaylistItemList from "./PlaylistItemList";
import UnavailableItemsDisplay from "./UnavailableItemsDisplay";
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

    function handleGetMyPlaylistsButtonClick() {
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
            <Button onClick={handleGetMyPlaylistsButtonClick}>Get my playlists</Button>

            <p>User logged in: {isUserLoggedIn.toString()}</p>

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

// export default function PlaylistsDashboard({userChannelId, userRegion}: Props) {
//     const [isUnavailableVideosDialogOpen, setIsUnavailableVideosDialogOpen] = useState<boolean>(false);
//     const [unavailableItems, setUnavailableItems] = useState<PlaylistItem[]>([]);
//     const [currentlySelectedPlaylist, setCurrentlySelectedPlaylist] = useState<Playlist>();

//     const [loadingProgressValue, setLoadingProgressValue] = useState<number>();
//     const [loadingProgressTotal, setLoadingProgressTotal] = useState<number>();
//     const [loadingMessage, setLoadingMessage] = useState<string>();
//     const [selectedTab, setSelectedTab] = useState<number>(0);

//     const [isErrorDialogOpen, setIsErrorDialogOpen] = useState<boolean>(false);
//     const [errorTitle, setErrorTitle] = useState<string>();
//     const [errorBody, setErrorBody] = useState<string>();
//     const handleErrorDialogClose = useCallback(() => {
//         setIsErrorDialogOpen(false);
//     }, []);

//     function handleUnavailableVideosDialogClose() {
//         setIsUnavailableVideosDialogOpen(false);
//     }

//     async function deleteUnavailableVideos(unavailableItems: PlaylistItem[]): Promise<void> {
//         if (unavailableItems.length <= 0) {
//             return;
//         }
//         setLoadingProgressValue(0);
//         setLoadingProgressTotal(unavailableItems.length);
    
//         /**
//          * Can't use batching because, after deleting a vide, we must wait for a response
//          * before deleting another. I guess batching is too fast and doesn't wait for a response.
//          */
//         for (let i = 0; i < unavailableItems.length; ++i) {
//             const item: gapi.client.youtube.PlaylistItem = unavailableItems[i];
//             if (!item.id) {
//                 continue;
//             }
//             setLoadingProgressValue(i + 1);
//             const response = await gapi.client.youtube.playlistItems.delete({
//                 id: item.id
//             });
//             // Successful deletion should responsd with error 204
//             if (response.status !== 204) {
//                 throw response;
//             }
//         }
//     }

//     function handleConfirmDeleteUnavailableVideos() {
//         setLoadingMessage("Deleting unavailable videos.");
//         deleteUnavailableVideos(unavailableItems).finally(() => {
//             setLoadingMessage(undefined);
//             setLoadingProgressValue(0);
//             setLoadingProgressTotal(0);

//             setIsUnavailableVideosDialogOpen(false);
//             setUnavailableItems([]);
//             setCurrentlySelectedPlaylist(undefined);
//             reloadPlaylists();
//         });
//     }

//     const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
//         setSelectedTab(newValue);
//     }, []);

//     return (
//         <>
//             {/* Loading dialog */}
//             <Dialog open={Boolean(loadingMessage)} fullWidth={true}>
//                 <DialogTitle textAlign="center">
//                     {loadingMessage}
//                 </DialogTitle>
//                 <DialogContent sx={{display: "flex", justifyContent: "center"}}>
//                     <CircularProgress
//                         variant={loadingProgressValue ? "determinate" : "indeterminate"}
//                         sx={{marginLeft: "auto", marginRight: "auto"}}
//                         value={loadingProgressValue && loadingProgressTotal
//                             ? Math.floor(loadingProgressValue / loadingProgressTotal * 100)
//                             : 0}
//                     />
//                 </DialogContent>
//             </Dialog>

//             <ErrorDialog open={isErrorDialogOpen} errorTitle={errorTitle} errorBody={errorBody} onClose={handleErrorDialogClose} />

//             {/* Unavailable videos dialog */}
//             <Dialog open={isUnavailableVideosDialogOpen} onClose={handleUnavailableVideosDialogClose}>
//                 <DialogTitle>
//                     Unavailable Videos
//                 </DialogTitle>
//                 <DialogContent>
//                     <DialogContentText>Found {unavailableItems.length} unavailable video{unavailableItems.length === 1 ? "" : "s"}.</DialogContentText>
//                 </DialogContent>
//                 <Box borderBottom={1} borderColor="divider" paddingLeft={2} paddingRight={2}>
//                     <Tabs value={selectedTab} onChange={handleTabChange}>
//                         <Tab label="Remove videos" />
//                         <Tab label="Download list" />
//                     </Tabs>
//                 </Box>
//                 {selectedTab === 0 && 
//                     <>
//                         <DialogContent>
//                             <DialogContentText>Remove the following videos from playlist {(currentlySelectedPlaylist && currentlySelectedPlaylist?.snippet?.title) || ""}?</DialogContentText>
//                             <Stack spacing={2}>
//                                 {unavailableItems.map((item) =>
//                                     <Paper key={item.id} sx={{padding: 1}}>
//                                         <PlaylistItemView playlistItem={item}></PlaylistItemView>
//                                     </Paper>
//                                 )}
//                             </Stack>
//                         </DialogContent>
//                         <DialogActions>
//                             <Button onClick={handleConfirmDeleteUnavailableVideos}>Remove</Button>
//                             <Button onClick={handleUnavailableVideosDialogClose}>Cancel</Button>
//                         </DialogActions>
//                     </>
//                 }
//                 {selectedTab === 1 &&
//                     <ExportPlaylistItems
//                         playlistName={currentlySelectedPlaylist?.snippet?.title || "[untitled]"}
//                         playlistItems={unavailableItems} />}
//             </Dialog>
//             <Stack spacing={2}>
//                 <RegionSelector
//                     value={selectedCountry}
//                     onChange={(event, newValue) => {
//                         if (newValue) {
//                             setSelectedCountry(newValue);
//                             localStorage.setItem(SELECTED_REGION_KEY, newValue.id);
//                         }
//                     }}
//                 />

//                 {playlists.map((playlist: Playlist) =>
//                     <PlaylistRow
//                         key={playlist.id}
//                         playlist={playlist}
//                         getUnavailableVideosCallback={(playlist: Playlist) => {
//                             if (!playlist.id) {
//                                 throw new Error("Playlist has no id");
//                             }
//                             setLoadingMessage("Loading unavailable videos in playlist.");
//                             getVideosInPlaylist(playlist.id)
//                                 .then((itemResponses) => {
//                                     return getUnavailablePlaylistItems(itemResponses, userChannelId, selectedCountry.snippet.gl);
//                                 }).then((unavailableItems) => {
//                                     setLoadingMessage(undefined);
//                                     setUnavailableItems(unavailableItems);
//                                     setIsUnavailableVideosDialogOpen(true);
//                                     setCurrentlySelectedPlaylist(playlist);
//                                 }).catch((error) => {
//                                     console.error(error);
//                                     setIsErrorDialogOpen(true);
//                                     if (isGapiError(error)) {
//                                         setErrorTitle(`Error ${error.status}: ${error.statusText}`);
//                                         setErrorBody(error.result.error.message);
//                                     }
//                                     setLoadingMessage(undefined);
//                                     setUnavailableItems([]);
//                                     setIsUnavailableVideosDialogOpen(false);
//                                     setCurrentlySelectedPlaylist(undefined);
//                                 })
//                     }}></PlaylistRow>
//                 )}
//             </Stack>
//         </>
//     );
// }