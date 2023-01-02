import { Box, Stack, Typography } from "@mui/material";
import { PlaylistItem } from "../requestHelpers";
import { getThumbnailURL, makeVideoURL } from "../youtubeResourceHelpers";
import NewTabLink from "./NewTabLink";
import YouTubeThumbnail from "./YouTubeThumbnail";

export interface Props {
    playlistItem: PlaylistItem;
}

export default function PlaylistItemView({playlistItem}: Props) {
    return (
        <Stack direction="row" flexWrap="wrap">
            <YouTubeThumbnail thumbnailURL={getThumbnailURL(playlistItem.snippet?.thumbnails)} alt={playlistItem.snippet?.title + " thumbnail"} />
            <Box ml={{
                "sm": 0,
                "md": 1
            }}>
                <NewTabLink href={makeVideoURL(playlistItem.contentDetails?.videoId || "", playlistItem.snippet?.playlistId, playlistItem.snippet?.position)}>{playlistItem.snippet?.title}</NewTabLink>
                <Typography>{playlistItem.snippet?.description}</Typography>
            </Box>
        </Stack>
    )
}