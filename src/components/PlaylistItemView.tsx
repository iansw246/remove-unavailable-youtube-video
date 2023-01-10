import { Box, Typography } from "@mui/material";
import { PlaylistItem } from "../requestHelpers";
import { getThumbnailURL, makeVideoURL } from "../youtubeResourceHelpers";
import NewTabLink from "./NewTabLink";
import YouTubeThumbnail from "./YouTubeThumbnail";

export interface Props {
    playlistItem: PlaylistItem;
}

export default function PlaylistItemView({playlistItem}: Props) {
    return (
        <Box display="flex" flexDirection="row" flexWrap="wrap">
            <YouTubeThumbnail thumbnailURL={getThumbnailURL(playlistItem.snippet?.thumbnails)} alt={playlistItem.snippet?.title + " thumbnail"} sx={{marginRight: 1}} />
            <Box minWidth="200px">
                <NewTabLink href={makeVideoURL(playlistItem.contentDetails?.videoId || "", playlistItem.snippet?.playlistId, playlistItem.snippet?.position)}>{playlistItem.snippet?.title}</NewTabLink>
                <Typography>{playlistItem.snippet?.videoOwnerChannelTitle}</Typography>
                <Typography>Published on {(new Date(playlistItem.snippet?.publishedAt || "")).toLocaleString()}</Typography>
            </Box>
        </Box>
    );
}