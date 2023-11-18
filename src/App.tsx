import { Tab, Tabs, Typography } from '@mui/material';
import React, { useCallback, useState } from 'react';
import './App.css';
import EnterPlaylistDashboard from './components/EnterPlaylistDashboard';
import ErrorDialog from './components/ErrorDialog';
import OwnedPlaylistsDashboard from './components/OwnedPlaylistsDashboard';
import RegionSelector, { loadOrInitializeSavedRegion, saveRegion } from './components/RegionSelector';
import TabPanel from './components/TabPanel';
import useGapiTokenClient from './components/useGapiTokenClient';
import { GApiApiProvider } from './apiProviders/gapiApiProvider';
import { LambdaApiProvider } from './apiProviders/lambdaApiProvider';

type TokenClient = google.accounts.oauth2.TokenClient;

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
        setErrorBody(<Typography>Please check your network connection or browser blocking settings.</Typography>);
        console.error(`Failed to load gapi token client: ${JSON.stringify(error)}`);
    }, []);
    const onTokenResponse = useCallback((tokenResponse: google.accounts.oauth2.TokenResponse) => {
        // If successfully got scopes desired
        if (tokenResponse.access_token) {
            setIsUserLoggedIn(true);
        } else {
            setIsUserLoggedIn(false);
        }
    }, []);
    useGapiTokenClient(setTokenClient, onTokenClientLoadFail, onTokenResponse);

    const [tabIndex, setTabIndex] = useState<TabTypes>(TabTypes.ENTER_PLAYLIST);

    function onRegionChange(event: React.SyntheticEvent<Element, Event>, newRegion: Region | null) {
        if (newRegion === null) {
            return;
        }
        setUserRegion(newRegion);
        saveRegion(newRegion);
    }

    return (
        <>
            {showError &&
                <ErrorDialog open={true} errorBody={errorBody} errorTitle={errorTitle} onClose={() => setShowError(false)} />
            }

            <Typography variant="h1">
                Remove Unavailable Videos
            </Typography>
            <Typography>
                Annoyed by the "unavailable videos are hidden" banner in YouTube?
                Remove Unavailable Videos (RUV) lets you find videos that have been deleted, privated, or blocked in your country
                and automatically remove them from your YouTube playlists.
            </Typography>
            
            <Typography>To get started, first select your region. Then choose whether to find videos in a specific playlist or all your own playlists.</Typography>

            <Typography variant="caption">This app is unaffiliated with YouTube or Google. </Typography>

            <RegionSelector onChange={onRegionChange} value={userRegion} sx={{mt: 2}} />

            <Tabs value={tabIndex} onChange={(event, newValue) => setTabIndex(newValue)} sx={{marginBottom: 2, borderBottom: 1, borderColor: "divider"}}>
                <Tab label="Enter playlist" value={TabTypes.ENTER_PLAYLIST} />
                <Tab label="Your playlists" value={TabTypes.MY_PLAYLISTS} />
            </Tabs>
            
            {/* Use TabPanes which are always rendered because  */}
            <TabPanel value={tabIndex} index={TabTypes.ENTER_PLAYLIST}>
                <EnterPlaylistDashboard apiProvider={LambdaApiProvider} region={userRegion} />
            </TabPanel>
            <TabPanel value={tabIndex} index={TabTypes.MY_PLAYLISTS}>
                <OwnedPlaylistsDashboard
                    userRegion={userRegion}
                    isUserLoggedIn={isUserLoggedIn}
                    onUserLoginRequest={() => {
                        tokenClient?.requestAccessToken();
                    }}
                    isTokenClientReady={tokenClient !== undefined}
                />
            </TabPanel>
        </>
    );
}
export default App;
