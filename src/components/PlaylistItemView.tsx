import { Box, Link, Stack, Typography } from "@mui/material";
import { PlaylistItem } from "../requestHelpers";
import { getThumbnailUrl, makeVideoUrl } from "../youtubeResourceHelpers";
import NewTabLink from "./NewTabLink";

export interface Props {
    playlistItem: PlaylistItem;
}

export default function PlaylistItemView({playlistItem}: Props) {
    return (
        <Stack direction="row">
            <Box component="img" src={getThumbnailUrl(playlistItem.snippet?.thumbnails)}></Box>
            <Box>
                <NewTabLink href={makeVideoUrl(playlistItem.contentDetails?.videoId || "")}>{playlistItem.snippet?.title}</NewTabLink>
                <Typography>{playlistItem.snippet?.description}</Typography>
            </Box>
        </Stack>
    )
}