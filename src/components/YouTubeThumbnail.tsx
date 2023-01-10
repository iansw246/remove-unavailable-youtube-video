import { styled } from "@mui/material";
import { VIDEO_THUMBNAIL_DIMENSIONS } from "../youtubeResourceHelpers";

const YouTubeThumbnailComponent = styled("img")({
    width: VIDEO_THUMBNAIL_DIMENSIONS.default.width,
    height: VIDEO_THUMBNAIL_DIMENSIONS.default.height,
    borderWidth: 2,
    borderRadius: 6,
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