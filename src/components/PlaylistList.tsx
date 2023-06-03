import { Stack } from "@mui/material";
import { Playlist } from "../utils/requestHelpers";
import PlaylistRow from "./PlaylistRow";

export interface Props {
    playlists: Playlist[];
    onGetUnavailableItemsClick: (playlist: Playlist, index: number) => void
}

export default function PlaylistList({ playlists, onGetUnavailableItemsClick }: Props) {
    return (
        <Stack spacing={2}>
            {playlists.map((playlist, index) =>
                <PlaylistRow key={playlist.id} playlist={playlist} getUnavailableVideosCallback={(playlist) => { onGetUnavailableItemsClick(playlist, index) }} />
            )}
        </Stack>
    );
}