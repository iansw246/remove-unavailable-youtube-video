import { Box } from "@mui/material";
import { VIDEO_THUMBNAIL_DIMENSIONS } from "../youtubeResourceHelpers";

export interface Props {
    thumbnailURL: string;
    alt: string;
}

export default function YouTubeThumbnail({thumbnailURL, alt}: Props): JSX.Element {
    return (
        <Box component="img" src={thumbnailURL} width={VIDEO_THUMBNAIL_DIMENSIONS.default.width} height={VIDEO_THUMBNAIL_DIMENSIONS.default.height} alt={alt} sx={{borderWidth: 2, borderRadius: 2}}></Box>
    )
}