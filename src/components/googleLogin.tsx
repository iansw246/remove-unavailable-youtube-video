// import google from "google-one-tap";
import { Backdrop, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography } from "@mui/material";
import { useEffect, useId, useRef, useState } from "react";
import { isUnauthenticated, Playlist, PlaylistListResponse } from "../requestHelpers";
import PlaylistsDisplay from "./playlists";

type TokenClient = google.accounts.oauth2.TokenClient;

enum GoogleApiRequest {
    OwnPlaylists
}

const youtubeApiName: string = "youtube";
const youtubeApiVersion: string = "v3";
const YouTubeApiDiscoveryURL = "https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest";
const CLIENT_ID: string = "914337747127-r085lu3ktrko5dhgn677eh1jsk3mt8bn.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/youtube";

async function getToken(tokenClient: TokenClient, error: any) {
    if (error.result.error.code !== 401 && !(error.result.error.code === 403 && error.result.error.status === "PERMISSION_DENIED")) {
        // Errors unrelated to authorization: server errors, exceeding quota, bad requests, and so on.
        throw new Error(error);
    }
    await new Promise((resolve, reject) => {
        try {
            (tokenClient as any).callback = (resp: any) => {
                if (resp.error !== undefined) {
                    reject(resp);
                }
                console.log("gapi.client access token: " + JSON.stringify(gapi.client.getToken()));
                resolve(resp);
            };
            tokenClient.requestAccessToken();
        }
        catch(err) {
            console.error(err);
        }
    });
}

// async function getPlaylists(tokenClient: TokenClient): Promise<gapi.client.youtube.PlaylistListResponse> {
//     let request: PlaylistResponse;
//     try {
//         request = await listOwnedPlaylists();
//     } catch (err) {
//         await getToken(tokenClient, err);
//         request = await listOwnedPlaylists();
//     }
//     return request.result;
// }

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
    const tokenClient = useRef<TokenClient>();
    const [playlistResponses, setPlaylistResponses] = useState<PlaylistListResponse[]>([]);
    const [currentUserChannelId, setCurrentUserChannelId] = useState<string>();
    const [showAuthentication, setShowAuthentication] = useState<boolean>(false);
    const interruptedRequest = useRef<GoogleApiRequest>();
    useEffect(() => {
        initTokenClient().then((newTokenClient) => {
            tokenClient.current = newTokenClient;
        })
    }, []);
    function handleShowPlaylistButtonClick() {
        if (!tokenClient.current) {
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
                    setShowAuthentication(true);
                    interruptedRequest.current = GoogleApiRequest.OwnPlaylists;
                }
            });
    }

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
                        if (interruptedRequest.current === GoogleApiRequest.OwnPlaylists) {
                            handleShowPlaylistButtonClick();
                        }
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
        tokenClient.current?.requestAccessToken();
    }

    console.log(currentUserChannelId);
    const playlists: Playlist[] = playlistResponses.flatMap(playlistResponse => playlistResponse.items).filter(Boolean) as Playlist[];
    return (
        <>
            <Dialog open={showAuthentication}>
                <DialogTitle>Login to Google</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        In order to show your playlists, please login to Google and grant this app permission to view and modify your playlists.
                    </DialogContentText>
                    <Button onClick={handleLoginButtonClick}>Login</Button>
                </DialogContent>
            </Dialog>
            {/* {showAuthentication && <Button onClick={handleLoginButtonClick}>Login with Google</Button>} */}
            <Button onClick={handleShowPlaylistButtonClick}>Show Playlists</Button>
            {playlistResponses && currentUserChannelId ?
                <PlaylistsDisplay playlists={playlists} currentUserChannelId={currentUserChannelId} />
                : null
            }
        </>
    );
}