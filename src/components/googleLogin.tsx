// import google from "google-one-tap";
import { useEffect, useId, useState } from "react";
import PlaylistsDisplay from "./playlists";

type TokenClient = google.accounts.oauth2.TokenClient;
type PlaylistListResponse = gapi.client.youtube.PlaylistListResponse
type PlaylistResponse = gapi.client.Response<PlaylistListResponse>;

export type { PlaylistListResponse, PlaylistResponse }

const youtubeApiName: string = "youtube";
const youtubeApiVersion: string = "v3";
const YouTubeApiDiscoveryURL = "https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest";
const CLIENT_ID: string = "110467423049-1d9811vpeei0ogsfr0q4fif4vokkhfip.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/youtube";

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
                prompt: "consent",
                callback: (tokenResponse) => {},

            });
            resolve(tokenClient);
        }
        catch(err) {
            reject(err);
        }
    });
    return tokenClient;
}

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

async function listOwnedPlaylists(): Promise<PlaylistResponse> {
    return gapi.client.youtube.playlists.list({
        part: "contentDetails,id,snippet,status",
        mine: true,
        maxResults: 50
    });
}

async function getPlaylists(tokenClient: TokenClient): Promise<gapi.client.youtube.PlaylistListResponse> {
    let request: PlaylistResponse;
    try {
        request = await listOwnedPlaylists();
    } catch (err) {
        await getToken(tokenClient, err);
        request = await listOwnedPlaylists();
    }
    return request.result;
}

async function getOwnedChannels(): Promise<gapi.client.youtube.ChannelListResponse> {
    const response = await gapi.client.youtube.channels.list({
        part: "contentDetails,contentOwnerDetails,id,snippet,status",
        mine: true
    });
    return response.result;
}

export default function GoogleLogin() {
    const [tokenClient, setTokenClient] = useState<TokenClient>();
    const [playlists, setPlaylists] = useState<PlaylistListResponse>();
    const [currentUserChannelId, setCurrentUserChannelId] = useState<string>();
    useEffect(() => {
        initTokenClient().then((tokenClient) => {
            setTokenClient(tokenClient);
        })
    }, []);
    function handleButtonClick() {
        if (!tokenClient) {
            return;
        }
        getPlaylists(tokenClient).then((response) => {
            setPlaylists(response);
            // Get Channel ID for current user to check for unavailable videos later
            // If found playlist, then get id from the playlist
            if (response.items && response.items.length > 0 && response.items[0].snippet?.channelId){
                setCurrentUserChannelId(response.items[0].snippet.channelId);
            } else {
                getOwnedChannels().then((channelResponse) => {
                    if (!channelResponse || !channelResponse.items || channelResponse?.items?.length <= 0) {
                        throw new Error("No channel found");
                    }
                    setCurrentUserChannelId(channelResponse?.items[0].id);
                });
            }
        });
    }
    console.log(currentUserChannelId);
    return (
        <>
            Google Login
            <button onClick={handleButtonClick}>Show Playlists</button>
            {playlists && currentUserChannelId ?
                <PlaylistsDisplay playlists={playlists} currentUserChannelId={currentUserChannelId} />
                : null
            }
        </>
    );
}