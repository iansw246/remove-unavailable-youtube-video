import { styled } from "@mui/material";
import { VIDEO_THUMBNAIL_DIMENSIONS } from "../utils/youtubeResourceHelpers";

const YouTubeThumbnailComponent = styled("img")({
    width: VIDEO_THUMBNAIL_DIMENSIONS.default.width,
    height: VIDEO_THUMBNAIL_DIMENSIONS.default.height,
    borderRadius: "4px",
    objectFit: "cover"
});

export interface Props extends React.ComponentPropsWithoutRef<typeof YouTubeThumbnailComponent> {
    thumbnailURL: string;
    alt: string;
}

export default function YouTubeThumbnail({thumbnailURL, alt, ...rest}: Props): JSX.Element {
    return (
        <YouTubeThumbnailComponent src={thumbnailURL} alt={alt} {...rest} />
    );
}