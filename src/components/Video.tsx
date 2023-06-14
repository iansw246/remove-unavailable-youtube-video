import { Box, Link, Stack } from "@mui/material";
import { Video } from "../utils/requestHelpers";
import { thumbnailURL, makeVideoURL } from "../utils/youtubeResourceHelpers";
import NewTabLink from "./NewTabLink";
import YouTubeThumbnail from "./YouTubeThumbnail";
export interface Props {
    video: Video;
}

export default function Video({video}: Props) {
    return (
        <Stack direction="row">
            <YouTubeThumbnail thumbnailURL={thumbnailURL(video.snippet?.thumbnails)} alt={video.snippet?.title + " thumbnail"} />
            <Box>
                <NewTabLink href={video.id ? makeVideoURL(video.id) : ""}>{video.snippet?.title}</NewTabLink>
            </Box>
        </Stack>
    )
}