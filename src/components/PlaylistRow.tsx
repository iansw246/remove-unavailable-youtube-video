import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { Playlist } from "../utils/requestHelpers";
import { thumbnailURL } from "../utils/youtubeResourceHelpers";
import NewTabLink from "./NewTabLink";
import YouTubeThumbnail from "./YouTubeThumbnail";

function youtubePlaylistLink(playlistId: string) {
    return `https://www.youtube.com/playlist?list=${playlistId}`;
}

export interface Props {
    playlist: Playlist,
    getUnavailableVideosCallback: (playlist: Playlist) => void,
}

export default function PlaylistRow({playlist, getUnavailableVideosCallback}: Props): JSX.Element {
    const playlistTitleText = playlist.snippet?.title || "[No title]";
    return (
        <Paper elevation={2} sx={{
            "&:hover": {
                backgroundColor: (theme) => theme.palette.grey[100],
            },
            transition: "background-color 0.2s",
            padding: 1,
            paddingBottom: 0,
            height: "100%"
        }} key={playlist.etag}>
            <Stack direction="row" flexWrap="wrap">
                <YouTubeThumbnail
                    thumbnailURL={thumbnailURL(playlist.snippet?.thumbnails)}
                    alt={playlist.snippet?.title + " thumbnail"}
                    sx={{mr: 1.5, alignSelf: "center"}}
                />
                {/* <Box component="img"
                    width="120px" height="90px"
                    borderRadius="4px"
                    sx={{objectFit: "cover"}}
                    alignSelf="center"
                    mr={1.5}
                    src={thumbnailURL(playlist.snippet?.thumbnails)}
                /> */}
                <Box flex="1 0" minWidth="0">
                    <Typography fontWeight="bold" maxHeight={"2rem"} textOverflow="ellipsis" overflow="hidden" whiteSpace="nowrap">
                        {playlist.id ? <NewTabLink href={youtubePlaylistLink(playlist.id)}>{playlistTitleText}</NewTabLink>
                            : playlistTitleText
                        }
                    </Typography>
                    <Typography fontSize="0.8rem">{playlist.contentDetails?.itemCount} {" "} Videos</Typography>
                    <Typography fontSize="0.8rem">Privacy status: {playlist.status?.privacyStatus}</Typography>
                    {/* <Typography fontSize="0.8rem">{playlist.snippet?.description}</Typography> */}
                    <Button variant="contained" size="small" sx={{ml: "auto", mt: 0.5}} onClick={() => {
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