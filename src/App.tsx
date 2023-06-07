import { Box, Tab, Tabs, Typography } from '@mui/material';
import React, { useCallback, useState } from 'react';
import './App.css';
import Layout from './components/Layout';
import { PlaylistItem, PlaylistListResponse } from './utils/requestHelpers';
import OwnedPlaylistsDashboard from './components/OwnedPlaylistsDashboard';
import RegionSelector, { loadOrInitializeSavedRegion } from './components/RegionSelector';
import ErrorDialog from './components/ErrorDialog';
import useGapiTokenClient from './components/useGapiTokenClient';
import EnterPlaylistDashboard from './components/EnterPlaylistDashboard';
import TabPanel from './components/TabPanel';

type TokenClient = google.accounts.oauth2.TokenClient;

enum ApiRequest {
    OwnPlaylists
}

enum Action {
    USER_LOGGED_IN,
    PLAYLIST_ID_ENTERED,
    TOKEN_CLIENT_LOADING_FAILED,
    TOKEN_CLIENT_LOADED,
    SHOW_PLAYLIST_BUTTON_CLICKED,
    SHOW_OWNED_PLAYLIST_BUTTON_CLICKED,
    ERROR_OCCURED
}

interface AppState {
    isUserLoggedIn: boolean,

    selectedPlaylistId: string | null,
    userRegion: Region,
    userChannelId?: string,

    showUnavailableItems: boolean,
    playlistResponses: PlaylistListResponse[],
    unavailableItems: PlaylistItem[],

    isLoading: boolean,
    loadingMessage: React.ReactNode,
    loadingProgress: number,
    loadingTotal: number,

    showError: boolean,
    errorTitle: string,
    errorBody: React.ReactNode,

    tokenClient: TokenClient
}

enum TabTypes {
    ENTER_PLAYLIST = 0,
    MY_PLAYLISTS
}

function App() {
    const [isUserLoggedIn, setIsUserLoggedIn] = useState<boolean>(false);

    const [userRegion, setUserRegion] = useState<Region>(loadOrInitializeSavedRegion);

    const [showError, setShowError] = useState<boolean>(false);
    const [errorTitle, setErrorTitle] = useState<string>();
    const [errorBody, setErrorBody] = useState<React.ReactNode>();

    const [tokenClient, setTokenClient] = useState<TokenClient>();
    const onTokenClientLoadFail = useCallback((error: unknown) => {
        setShowError(true);
        setErrorTitle("Failed to load gapi token client");
        setErrorBody("Details: " + error);
    }, [setShowError, setErrorTitle, setErrorBody]);
    const onTokenResponse = useCallback((tokenResponse: google.accounts.oauth2.TokenResponse) => {
        // If successfully got scopes desired
        if (tokenResponse.access_token) {
            setIsUserLoggedIn(true);
        } else {
            setIsUserLoggedIn(false);
        }
    }, [setIsUserLoggedIn]);
    useGapiTokenClient(setTokenClient, onTokenClientLoadFail, onTokenResponse);

    const [tabIndex, setTabIndex] = useState<TabTypes>(TabTypes.ENTER_PLAYLIST);

    return (
        <div className="App">
            <Layout>
                {showError &&
                    <ErrorDialog open={true} errorBody={errorBody} errorTitle={errorTitle} onClose={() => setShowError(false)} />
                }

                <Typography variant="h3" component="h1">
                    Unavailable Video Remover
                </Typography>
                <Typography>
                    Annoyed by the "unavailable videos are hidden" banner in YouTube?
                    This app will allow you to find and remove all unavailable videos from your YouTube playlists.
                </Typography>
                <Typography>Note: This app is unaffiliated with YouTube or Google. </Typography>
                <Typography>
                    To get started, click the button below to load your playlists
                    (requires a Google account). Then select the region you watch videos in.
                </Typography>
                <br />

                <RegionSelector onChange={(event, newRegion) => { newRegion !== null && setUserRegion(newRegion) }} value={userRegion} />

                <Box mb={2}>
                    <Tabs value={tabIndex} onChange={(event, newValue) => setTabIndex(newValue)}>
                        <Tab label="Enter playlist" value={TabTypes.ENTER_PLAYLIST} />
                        <Tab label="Your playlists" value={TabTypes.MY_PLAYLISTS} />
                    </Tabs>
                </Box>
                
                {/* Use TabPanes which are always rendered because  */}
                <TabPanel value={tabIndex} index={TabTypes.ENTER_PLAYLIST}>
                    <EnterPlaylistDashboard region={userRegion} />
                </TabPanel>
                <TabPanel value={tabIndex} index={TabTypes.MY_PLAYLISTS}>
                    <OwnedPlaylistsDashboard userRegion={userRegion} isUserLoggedIn={isUserLoggedIn} onUserLoginRequest={() => {
                        tokenClient?.requestAccessToken();
                    }} />
                </TabPanel>

                <div style={{ backgroundColor: "lightgreen" }}>
                    <p>Token client: {tokenClient === undefined ? "undefined" : "is defined"}</p>
                    <p>Is user logged in: {isUserLoggedIn.toString()}</p>
                </div>
            </Layout>
        </div>
    );
}
export default App;
