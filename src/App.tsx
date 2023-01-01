import { AppBar, Container, Toolbar, Typography } from '@mui/material';
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
            <Container component="main" maxWidth="md">
                <Typography variant="h2" component="h1">
                    Unavailable Video Remover
                </Typography>
                <Typography>
                    Annoyed by the "unavailable videos are hidden" banner in YouTube? This app will allow you to find and remove all unavailable videos from your YouTube playlists.
                </Typography>
                <Typography>Note: This app is unaffiliated with YouTube or Google. </Typography>
                <Typography>To get started, click the button below to load your playlists (requires a Google account).</Typography>
                <GoogleLogin />
            </Container>
        </div>
    );
}
export default App;
