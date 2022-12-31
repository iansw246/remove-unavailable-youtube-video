import { AppBar, Box, Container, Toolbar, Typography } from '@mui/material';
import React from 'react';
import './App.css';
import GoogleLogin from './components/googleLogin';

function App() {
    return (
        <div className="App">
            <header>
                <AppBar position="static">
                    <Toolbar>
                        <Typography variant="h1" sx={{fontSize: "16px", fontWeight: 700, mr: 2}}>Unavailable Youtube Video Remover</Typography>
                        <Typography>Remove unavailable videos from your playlists and hide the "Unavailable video" message</Typography>
                    </Toolbar>
                </AppBar>
            </header>
            <Container component="main">
                <GoogleLogin />
            </Container>
        </div>
    );
}

export default App;
