import { AppBar, Container, Drawer, Icon, IconButton, Link, List, ListItem, Toolbar, Typography } from '@mui/material';
import { useCallback, useState } from 'react';
import './App.css';
import GoogleLogin from './components/GoogleLogin';
import Layout from './components/Layout';

function App() {
    return (
        <div className="App">
            <Layout>
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
                <GoogleLogin />
            </Layout>
        </div>
    );
}
export default App;
