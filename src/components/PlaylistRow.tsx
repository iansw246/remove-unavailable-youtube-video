import { Box, Button, Link, Paper, Stack, Typography } from "@mui/material";
import { ReactNode } from "react";
import { Playlist } from "../requestHelpers";

function youtubePlaylistLink(playlistId: string) {
    return `https://www.youtube.com/playlist?list=${playlistId}`;
}

function firstAvailableThumbnail(thumbnails: gapi.client.youtube.ThumbnailDetails): gapi.client.youtube.Thumbnail | null {
    // Key for preferred thumbnail in order of preference. This function gets the first thumbnail in order of keys
    const THUMBNAIL_KEYS: (keyof gapi.client.youtube.ThumbnailDetails)[] = ["default", "medium", "high", "standard", "maxres"];
    for (const key of THUMBNAIL_KEYS) {
        if (Object.hasOwn(thumbnails, key)) {
            return thumbnails[key] as gapi.client.youtube.Thumbnail;
        }
    }
    return null;
}

export interface Props {
    playlist: Playlist,
    removeUnavailableVideosCallback: (playlist: Playlist) => void,
}

export default function PlaylistRow({playlist, removeUnavailableVideosCallback}: Props): JSX.Element {
    return (
        <Paper elevation={2} sx={{
            "&:hover": {
                backgroundColor: (theme) => theme.palette.grey[100],
            }
        }} key={playlist.etag}>
            <Stack direction="row" >
                <Box component="img" width="130px" height="90px" sx={{border: "2px solid white", borderRadius: "15px", mr: 2, objectFit: "cover"}} src={playlist.snippet?.thumbnails ? firstAvailableThumbnail(playlist.snippet?.thumbnails)?.url : ""}></Box>
                <Box>
                    {playlist.id ? 
                        <Link href={youtubePlaylistLink(playlist.id)} fontWeight="bold">{playlist.snippet?.title || "[No title]"}</Link>
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
                        removeUnavailableVideosCallback(playlist);
                    }}>Remove unavailable videos</Button>
                </Box>
            </Stack>
        </Paper>
    );
}