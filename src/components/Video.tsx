import { Box, Link, Stack } from "@mui/material";
import { Video } from "../requestHelpers";
import { firstAvailableThumbnail, getThumbnailUrl, makeVideoUrl } from "../youtubeResourceHelpers";
import NewTabLink from "./NewTabLink";
export interface Props {
    video: Video;
}

export default function Video({video}: Props) {
    return (
        <Stack direction="row">
            <Box component="img" src={getThumbnailUrl(video.snippet?.thumbnails)}></Box>
            <Box>
                <NewTabLink href={video.id ? makeVideoUrl(video.id) : ""}>{video.snippet?.title}</NewTabLink>
            </Box>
        </Stack>
    )
}