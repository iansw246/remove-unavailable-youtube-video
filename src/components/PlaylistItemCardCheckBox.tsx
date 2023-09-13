import { Box, Checkbox, CheckboxProps, Typography } from "@mui/material";
import { PlaylistItem } from "../utils/requestHelpers";
import { thumbnailURL, makeChannelURL, makeVideoURL } from "../utils/youtubeResourceHelpers";
import NewTabLink from "./NewTabLink";
import YouTubeThumbnail from "./YouTubeThumbnail";
import { PaperHover } from "./PaperHover";

export interface Props {
    playlistItem: PlaylistItem;
    checked?: boolean;
    onChange?: CheckboxProps["onChange"];
}

export default function PlaylistItemCardCheckBox({ playlistItem, checked, onChange }: Props) {
    return (
        <PaperHover elevation={2}>
            <Box display="flex" flexDirection="row" flexWrap="wrap">
                <YouTubeThumbnail thumbnailURL={thumbnailURL(playlistItem.snippet?.thumbnails)} alt={playlistItem.snippet?.title + " thumbnail"} sx={{marginRight: 1}} />
                <Box minWidth="200px">
                    <Typography><NewTabLink href={makeVideoURL(playlistItem.contentDetails?.videoId ?? "", playlistItem.snippet?.playlistId, playlistItem.snippet?.position)}>{playlistItem.snippet?.title}</NewTabLink></Typography>
                    <Typography variant="body2"><NewTabLink href={makeChannelURL(playlistItem.snippet?.videoOwnerChannelId ?? "")}>{playlistItem.snippet?.videoOwnerChannelTitle}</NewTabLink></Typography>
                    <Typography>Published on {(new Date(playlistItem.snippet?.publishedAt || "")).toLocaleString()}</Typography>
                </Box>
                <Checkbox
                    aria-label="Select video to remove"
                    checked={checked}
                    onChange={onChange}
                    sx={{
                        alignSelf: "center",
                        ml: "auto",
                        height: "fit-content"
                    }}
                />
            </Box>
        </PaperHover>
    );
}