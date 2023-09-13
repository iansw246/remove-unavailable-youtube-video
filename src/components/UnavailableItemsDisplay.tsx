import { Typography } from "@mui/material";
import { Playlist, PlaylistItem } from "../utils/requestHelpers";
import PlaylistItemList from "./PlaylistItemList";

export interface Props {
    unavailableItems: PlaylistItem[];
    playlist?: Playlist;
    allowRemoval?: boolean;
    onSelectionChanged?: (selectedItems: PlaylistItem[]) => void;
}

export default function UnavailableItemsDisplay({ unavailableItems, playlist, allowRemoval = false, onSelectionChanged }: Props) {
    return (
        <>
            <Typography>Found {unavailableItems?.length ?? 0} unavailable videos {playlist ? `in playlist ${playlist.snippet?.title}` : ""}</Typography>
            { unavailableItems &&
                <>
                    <PlaylistItemList
                        items={unavailableItems}
                        sx={{
                            maxHeight: "90vh",
                            minHeight: "200px",
                            overflowY: "auto",
                            m: 1,
                            py: 2,
                            pr: 2
                        }}
                        showCheckboxes={allowRemoval}
                        onSelectionChanged={onSelectionChanged}
                    />
                </>
            }
        </>
    );
}