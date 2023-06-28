import { AppBar, Toolbar, Typography, Container, Theme, Box, Link } from "@mui/material";

import DevelopedWithYoutubeImage from "./developed-with-youtube-sentence-case-dark.png";
import logo from "../../public/logo192.png"

export interface Props {
    children: React.ReactNode
}

export default function Layout({ children }: Props) {
    return (
        <>
            <AppBar position="static" sx={{mb: 1}}>
                <Toolbar sx={{ width: "100%", maxWidth: (theme: Theme) => theme.breakpoints.values.lg, ml: "auto", mr: "auto" }}>
                    {/* Margin should be the same as the main container's padding */}
                    <Box
                        sx={{ ml: "24px", mr: 2, height: 32, width: 32 }}
                        component="img"
                        alt="RUV icon"
                        src="favicon.ico" />
                    <Typography sx={{ fontSize: "16px", fontWeight: 700}}>Unavailable Video Remover</Typography>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" component="main" sx={{pt: 2, pb: 4}}>
                {children}
            </Container>

            {/* Spacer to push footer to bottom */}
            <Box sx={{flex: 2}}></Box>

            <footer id="footer">
                <a href="https://www.youtube.com" rel="noreferrer" target="_blank"><img src={DevelopedWithYoutubeImage} style={{height: "100px"}} alt="Developed with YouTube"/></a>
                <Link href="privacy-policy.html">Privacy policy</Link>
            </footer>
        </>
    );
}