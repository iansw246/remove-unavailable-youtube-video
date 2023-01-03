import { Typography } from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import { PlaylistItem } from "../requestHelpers";
import { getThumbnailURL, makeVideoURL } from "../youtubeResourceHelpers";
import NewTabLink from "./NewTabLink";
import YouTubeThumbnail from "./YouTubeThumbnail";

export interface Props {
    playlistItem: PlaylistItem;
}

export default function PlaylistItemView({playlistItem}: Props) {
    return (
        <Grid2 container spacing={1}>
            <Grid2 xs={12} md={3}>
                <YouTubeThumbnail thumbnailURL={getThumbnailURL(playlistItem.snippet?.thumbnails)} alt={playlistItem.snippet?.title + " thumbnail"} />
            </Grid2>
            <Grid2 xs={12} md={9}>
                <NewTabLink href={makeVideoURL(playlistItem.contentDetails?.videoId || "", playlistItem.snippet?.playlistId, playlistItem.snippet?.position)}>{playlistItem.snippet?.title}</NewTabLink>
                <Typography>{playlistItem.snippet?.videoOwnerChannelTitle}</Typography>
                <Typography>Published on {(new Date(playlistItem.snippet?.publishedAt || "")).toLocaleString()}</Typography>
            </Grid2>
        </Grid2>
    )
}