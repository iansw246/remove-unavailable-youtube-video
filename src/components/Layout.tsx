import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Link,
} from "@mui/material";
import NewTabLink from "./NewTabLink";

import gitHubIcon from "./github-mark.svg";
import DevelopedWithYoutubeImage from "./developed-with-youtube-sentence-case-dark.png";

export interface Props {
  children: React.ReactNode;
}

export default function Layout({ children }: Props) {
  return (
    <>
      <AppBar position="static" sx={{ mb: 1 }}>
        <Toolbar>
          {/* Margin should be the same as the main container's padding */}
          <Box
            sx={{ mr: 2, height: 32, width: 32 }}
            component="img"
            alt="RUV icon"
            src="favicon.ico"
          />
          <Typography sx={{ fontSize: "16px", fontWeight: 700 }}>
            Remove Unavailable Videos
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" component="main" sx={{ pt: 2, pb: 4 }}>
        {children}
      </Container>

      {/* Spacer to push footer to bottom */}
      <Box sx={{ flex: 2 }}></Box>

      <footer id="footer">
        <Link href="https://www.youtube.com" rel="noreferrer" target="_blank">
          <img
            src={DevelopedWithYoutubeImage}
            style={{ height: "100px" }}
            alt="Developed with YouTube"
          />
        </Link>
        <Link href="privacy-policy.html">Privacy policy</Link>
        <NewTabLink href="https://github.com/iansw246/remove-unavailable-youtube-video">
          <img
            src={gitHubIcon}
            style={{ marginLeft: "32px", width: "30px", height: "30px" }}
            alt="GitHub"
          />
        </NewTabLink>
      </footer>
    </>
  );
}
