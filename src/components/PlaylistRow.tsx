import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { Playlist } from "../utils/requestHelpers";
import { thumbnailURL } from "../utils/youtubeResourceHelpers";
import NewTabLink from "./NewTabLink";

function youtubePlaylistLink(playlistId: string) {
    return `https://www.youtube.com/playlist?list=${playlistId}`;
}

export interface Props {
    playlist: Playlist,
    getUnavailableVideosCallback: (playlist: Playlist) => void,
}

export default function PlaylistRow({playlist, getUnavailableVideosCallback}: Props): JSX.Element {
    return (
        <Paper elevation={2} sx={{
            "&:hover": {
                backgroundColor: (theme) => theme.palette.grey[200],
            },
            paddingTop: 0,
            paddingLeft: 0,
            paddingRight: 1,
            height: "100%"
        }} key={playlist.etag}>
            <Stack direction="row" flexWrap="wrap">
                <Box component="img"
                    width="120px" height="90px"
                    mr={2}
                    borderRadius="4px"
                    sx={{mr: 2, objectFit: "cover"}}
                    alignSelf="center"
                    src={thumbnailURL(playlist.snippet?.thumbnails)}
                />
                <Box sx={{paddingTop: 1, paddingBottom: 1}}>
                    <Box>
                        {playlist.id ? 
                            <NewTabLink href={youtubePlaylistLink(playlist.id)} fontWeight="bold">{playlist.snippet?.title || "[No title]"}</NewTabLink>
                            :
                            <Typography fontWeight="bold">{playlist.snippet?.title || "[No title]"}</Typography>
                        }
                        <Typography fontSize="0.8rem">{playlist.contentDetails?.itemCount} {" "} Videos</Typography>
                        <Typography fontSize="0.8rem">Privacy status: {playlist.status?.privacyStatus}</Typography>
                        {/* <Typography fontSize="0.8rem">{playlist.snippet?.description}</Typography> */}
                    </Box>
                    <Button variant="contained" size="small" sx={{ml: "auto"}} onClick={() => {
                        if (!playlist.id) {
                            return;
                        }
                        getUnavailableVideosCallback(playlist);
                    }}>Load videos</Button>
                </Box>
            </Stack>
        </Paper>
    );
}