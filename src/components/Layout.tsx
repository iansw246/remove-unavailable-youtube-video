import { AppBar, Toolbar, IconButton, Icon, Typography, Container, Drawer, List, ListItem, Theme, Box, Link } from "@mui/material";
import { useState, useCallback } from "react";

import DevelopedWithYoutubeImage from "./developed-with-youtube-sentence-case-dark.png"

export interface Props {
    children: React.ReactNode
}

export default function Layout({ children }: Props) {
    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>();
    const onClose = useCallback(() => {
        setIsDrawerOpen(!isDrawerOpen);
    }, [isDrawerOpen]);
    
    return (
        <>
            <header>
                <AppBar position="static" sx={{mb: 1}}>
                    <Box sx={{width: "100%", maxWidth: (theme: Theme) => theme.breakpoints.values.lg, ml: "auto", mr: "auto"}}>
                        <Toolbar>
                            <Typography sx={{ fontSize: "16px", fontWeight: 700, mr: 2 }}>Unavailable Youtube Video Remover</Typography>
                            <Typography sx={{
                                display: {
                                    "xs": "none",
                                    "md": "unset"
                                }
                            }}>Remove unavailable videos from your playlists and hide the "Unavailable video" message</Typography>
                        </Toolbar>
                    </Box>
                </AppBar>
            </header>

            <Container maxWidth="lg" component="main" sx={{pt: 2, pb: 4}}>
                {children}
            </Container>

            <Box sx={{flex: 2}} ></Box>

            <footer id="footer">
                <a href="https://www.youtube.com" rel="noreferrer" target="_blank"><img src={DevelopedWithYoutubeImage} style={{height: "100px"}} alt="Developed with YouTube"/></a>
                <Link href="privacy-policy.html">Privacy policy</Link>
            </footer>
        </>
    );
}