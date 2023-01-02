import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { Playlist } from "../requestHelpers";
import { getThumbnailURL } from "../youtubeResourceHelpers";
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
            "padding": 1,
        }} key={playlist.etag}>
            <Stack direction="row" flexWrap="wrap">
                <Box component="img" width="130px" height="90px" sx={{border: "2px solid white", borderRadius: "15px", mr: 2, objectFit: "cover"}}
                    src={getThumbnailURL(playlist.snippet?.thumbnails)}></Box>
                <Box>
                    {playlist.id ? 
                        <NewTabLink href={youtubePlaylistLink(playlist.id)} fontWeight="bold">{playlist.snippet?.title || "[No title]"}</NewTabLink>
                        :
                        <Typography fontWeight="bold">{playlist.snippet?.title || "[No title]"}</Typography>
                    }
                    <Typography fontSize="0.8rem">{playlist.contentDetails?.itemCount} {" "} Videos</Typography>
                    <Typography fontSize="0.8rem">Id: {playlist.id}</Typography>
                    <Typography fontSize="0.8rem">Status: {playlist.status?.privacyStatus}</Typography>
                    <Typography fontSize="0.8rem">{playlist.snippet?.description}</Typography>
                </Box>
                <Box ml="auto">
                    <Button sx={{height: "100%"}} onClick={() => {
                        if (!playlist.id) {
                            return;
                        }
                        getUnavailableVideosCallback(playlist);
                    }}>Get unavailable videos</Button>
                </Box>
            </Stack>
        </Paper>
    );
}