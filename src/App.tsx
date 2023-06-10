import { Tab, Tabs, Typography } from '@mui/material';
import React, { useCallback, useState } from 'react';
import './App.css';
import EnterPlaylistDashboard from './components/EnterPlaylistDashboard';
import ErrorDialog from './components/ErrorDialog';
import Layout from './components/Layout';
import OwnedPlaylistsDashboard from './components/OwnedPlaylistsDashboard';
import RegionSelector, { loadOrInitializeSavedRegion } from './components/RegionSelector';
import TabPanel from './components/TabPanel';
import useGapiTokenClient from './components/useGapiTokenClient';

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

                <Typography variant="h1">
                    Unavailable Video Remover
                </Typography>
                <Typography>
                    Annoyed by the "unavailable videos are hidden" banner in YouTube?
                    This app will allow you to find and remove all unavailable videos from your YouTube playlists.
                </Typography>
                <Typography>Note: This app is unaffiliated with YouTube or Google. </Typography>
                
                <Typography>To get started, first <strong>select your region</strong>.</Typography>

                <RegionSelector onChange={(event, newRegion) => { newRegion !== null && setUserRegion(newRegion) }} value={userRegion} sx={{mt: 2}} />

                <Tabs value={tabIndex} onChange={(event, newValue) => setTabIndex(newValue)} sx={{marginBottom: 2, borderBottom: 1, borderColor: "divider"}}>
                    <Tab label="Enter playlist" value={TabTypes.ENTER_PLAYLIST} />
                    <Tab label="Your playlists" value={TabTypes.MY_PLAYLISTS} />
                </Tabs>
                
                {/* Use TabPanes which are always rendered because  */}
                <TabPanel value={tabIndex} index={TabTypes.ENTER_PLAYLIST}>
                    <EnterPlaylistDashboard region={userRegion} />
                </TabPanel>
                <TabPanel value={tabIndex} index={TabTypes.MY_PLAYLISTS}>
                    <OwnedPlaylistsDashboard userRegion={userRegion} isUserLoggedIn={isUserLoggedIn} onUserLoginRequest={() => {
                        tokenClient?.requestAccessToken();
                    }} />
                </TabPanel>
            </Layout>
        </div>
    );
}
export default App;
