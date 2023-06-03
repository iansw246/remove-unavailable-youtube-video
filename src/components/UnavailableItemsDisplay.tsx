import { Typography } from "@mui/material";
import { Playlist, PlaylistItem } from "../utils/requestHelpers";
import PlaylistItemList from "./PlaylistItemList";

export interface Props {
    unavailableItems: PlaylistItem[];
    playlist?: Playlist;
}

export default function UnavailableItemsDisplay({ unavailableItems, playlist }: Props) {
    return (
        <>
            <Typography>Found {unavailableItems?.length ?? 0} unavailable videos {playlist ? `in playlist ${playlist.snippet?.title}` : ""}</Typography>
            { unavailableItems && <PlaylistItemList items={unavailableItems} /> }
        </>
    );
}