import { AppBar, Container, Drawer, Icon, IconButton, Link, List, ListItem, Toolbar, Typography } from '@mui/material';
import { useCallback, useState } from 'react';
import './App.css';
import GoogleLogin from './components/GoogleLogin';

function App() {
    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>();
    const onClose = useCallback(() => {
        setIsDrawerOpen(!isDrawerOpen);
    }, [isDrawerOpen]);
    return (
        <div className="App">
            <header>
                <AppBar position="static">
                    <Toolbar>
                        <IconButton onClick={onClose} sx={{ color: "white" }}>
                            <Icon>menu</Icon>
                        </IconButton>
                        <Typography sx={{fontSize: "16px", fontWeight: 700, mr: 2}}>Unavailable Youtube Video Remover</Typography>
                        <Typography sx={{
                            display: {
                                "xs": "none",
                                "md": "unset"
                            }
                        }}>Remove unavailable videos from your playlists and hide the "Unavailable video" message</Typography>
                    </Toolbar>
                </AppBar>
            </header>
            <Container component="main" maxWidth="md">
                <Drawer open={isDrawerOpen} onClose={onClose}>
                    <List sx={{width: 200}}>
                        <ListItem>
                            <Link>Home</Link>
                        </ListItem>
                        <ListItem>
                            <Link>About</Link>
                        </ListItem>
                    </List>
                </Drawer>
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
            </Container>
        </div>
    );
}
export default App;
