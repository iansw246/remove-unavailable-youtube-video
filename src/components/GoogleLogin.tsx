import { Button, Dialog, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { isUnauthenticated, Playlist, PlaylistListResponse } from "../requestHelpers";
import PlaylistsDashboard from "./PlaylistsDashboard";

type TokenClient = google.accounts.oauth2.TokenClient;

enum ApiRequest {
    OwnPlaylists
}

const youtubeApiName: string = "youtube";
const youtubeApiVersion: string = "v3";
const {REACT_APP_CLIENT_ID: CLIENT_ID}: {REACT_APP_CLIENT_ID: string} = (process.env as any);
console.log(process.env);
const SCOPES = "https://www.googleapis.com/auth/youtube";

async function getOwnedChannels(): Promise<gapi.client.youtube.ChannelListResponse> {
    const response = await gapi.client.youtube.channels.list({
        part: "contentDetails,contentOwnerDetails,id,snippet,status",
        mine: true
    });
    return response.result;
}

async function listOwnedPlaylists(): Promise<PlaylistListResponse[]> {
    const responses: PlaylistListResponse[] = [];
    let response: gapi.client.Response<PlaylistListResponse>;
    try {
        response = await gapi.client.youtube.playlists.list({
            part: "contentDetails,id,snippet,status",
            mine: true,
            maxResults: 50,
        });
    } catch (err) {
        throw err;
    }
    responses.push(response.result);
    while (Object.hasOwn(response.result, "nextPageToken")) {
        try {
            response = await gapi.client.youtube.playlists.list({
                part: "contentDetails,id,snippet,status",
                mine: true,
                maxResults: 50,
                pageToken: response.result.nextPageToken,
            });
        } catch (err) {
            throw err;
        }
        responses.push(response.result);
    }
    return responses;
}

export default function GoogleLogin() {
    const [tokenClient, setTokenClient] = useState<TokenClient>();
    const [playlistResponses, setPlaylistResponses] = useState<PlaylistListResponse[]>([]);
    const [currentUserChannelId, setCurrentUserChannelId] = useState<string>();
    const [showAuthentication, setShowAuthentication] = useState<boolean>(false);
    const [pendingRequest, setPendingRequest] = useState<ApiRequest>();
    const [isUserLoggedIn, setIsUserLoggedIn] = useState<boolean>(true);

    const handleShowPlaylistButtonClick = useCallback(() => {
        if (!tokenClient) {
            return;
        }
        listOwnedPlaylists()
            .then((responses) => {
                setPlaylistResponses(responses);
                if (responses.length > 0 && responses[0].items && responses[0].items.length > 0 && responses[0].items[0].snippet?.channelId){
                    setCurrentUserChannelId(responses[0].items[0].snippet.channelId);
                } else {
                    // Get Channel ID for current user to check for unavailable videos later
                    // If found playlist, then get id from the playlist
                    getOwnedChannels().then((channelResponse) => {
                        if (!channelResponse || !channelResponse.items || channelResponse?.items?.length <= 0) {
                            throw new Error("No channel found");
                        }
                        setCurrentUserChannelId(channelResponse?.items[0].id);
                    });
                }
            }, (error: any) => {
                if (isUnauthenticated(error)) {
                    setIsUserLoggedIn(false);
                    setShowAuthentication(true);
                    setPendingRequest(ApiRequest.OwnPlaylists);
                }
            });
    }, [tokenClient]);
    
    useEffect(() => {
        initTokenClient().then((newTokenClient) => {
            setTokenClient(newTokenClient);
        })
    }, []);
    useEffect(() => {
        if (!isUserLoggedIn) {
            return;
        }
        if (pendingRequest === ApiRequest.OwnPlaylists) {
            handleShowPlaylistButtonClick();
            setPendingRequest(undefined);
        }
    }, [isUserLoggedIn, pendingRequest, handleShowPlaylistButtonClick]);

    async function initTokenClient(): Promise<google.accounts.oauth2.TokenClient> {
        await (window as any).gapiLoadPromise;
        await new Promise((resolve, reject) => {
            gapi.load("client", {callback: resolve, onerror: reject});
        });
        await gapi.client.init({});
        await gapi.client.load(youtubeApiName, youtubeApiVersion);
        await (window as any).gisLoadPromise;
        let tokenClient: google.accounts.oauth2.TokenClient = await new Promise<google.accounts.oauth2.TokenClient>((resolve, reject) => {
            try {
                let tokenClient = google.accounts.oauth2.initTokenClient({
                    client_id: CLIENT_ID,
                    scope: SCOPES,
                    prompt: "",
                    callback: (tokenResponse) => {
                        console.log(tokenResponse);
                        setShowAuthentication(false);
                        setIsUserLoggedIn(true);
                    },
                });
                resolve(tokenClient);
            }
            catch(err) {
                reject(err);
            }
        });
        return tokenClient;
    }

    function handleLoginButtonClick() {
        tokenClient?.requestAccessToken();
    }

    function handleDialogClose() {
        setShowAuthentication(false);
    }

    const reloadPlaylistsCallback = useCallback(() => {
        setPendingRequest(ApiRequest.OwnPlaylists);
    }, []);

    console.log(currentUserChannelId);
    console.log(CLIENT_ID);
    const playlists: Playlist[] = useMemo(() => 
        playlistResponses.flatMap(playlistResponse => playlistResponse.items).filter(Boolean) as Playlist[],
        [playlistResponses]
    );
    return (
        <>
            <Dialog open={showAuthentication} onClose={handleDialogClose}>
                <DialogTitle>Login to Google</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        In order to show your playlists, please login to Google and grant this app permission to view and modify your playlists.
                    </DialogContentText>
                    <Button onClick={handleLoginButtonClick}>Login</Button>
                    <Button onClick={handleDialogClose}>Cancel</Button>
                </DialogContent>
            </Dialog>
            {/* {showAuthentication && <Button onClick={handleLoginButtonClick}>Login with Google</Button>} */}
            <Button onClick={handleShowPlaylistButtonClick} disabled={!tokenClient}>Show Playlists</Button>
            {playlistResponses && currentUserChannelId ?
                <PlaylistsDashboard playlists={playlists} currentUserChannelId={currentUserChannelId} reloadPlaylists={reloadPlaylistsCallback} />
                : null
            }
        </>
    );
}