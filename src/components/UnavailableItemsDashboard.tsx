import { Button, Stack, Typography } from "@mui/material";
import { PlaylistItem, Playlist } from "../utils/requestHelpers";
import UnavailableItemsDisplay from "./UnavailableItemsDisplay";
import ExportPlaylistItems from "./ExportPlaylists";

interface Props {
    unavailableItems: PlaylistItem[];
    playlist: Playlist;
    handleRemoveVideosButtonClick?: () => void;
    showRemoveVideosButton?: boolean
}

export default function UnavailableItemsDashboard({ unavailableItems, playlist, handleRemoveVideosButtonClick, showRemoveVideosButton = true }: Props) {
    return (<Stack direction="row" flexWrap="wrap" spacing={2}>
        <div>
            <Typography variant="h4" mb={2}>Owned playlists</Typography>
            <UnavailableItemsDisplay unavailableItems={unavailableItems} playlist={playlist} />
            {showRemoveVideosButton && <Button onClick={handleRemoveVideosButtonClick}>Remove videos?</Button>}
        </div>
        <div>
            <Typography variant="h4" mb={2}>Export playlists</Typography>
            <ExportPlaylistItems playlistItems={unavailableItems} playlistName={playlist.snippet?.title ?? "untitled_playlist"} />
        </div>
    </Stack>);
}