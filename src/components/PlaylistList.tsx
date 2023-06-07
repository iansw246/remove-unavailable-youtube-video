import { Stack } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import { Playlist } from "../utils/requestHelpers";
import PlaylistRow from "./PlaylistRow";

export type Props = {
    playlists: Playlist[];
    onGetUnavailableItemsClick: (playlist: Playlist, index: number) => void;
} & React.ComponentProps<typeof Grid>;

export default function PlaylistList({ playlists, onGetUnavailableItemsClick, ...rest }: Props) {
    return (
        <Grid container spacing={2} columns={{xs: 4, sm: 8, md: 12}} maxHeight="400px" sx={{overflowY: "auto"}} pb={2} {...rest}>
            {playlists.map((playlist, index) =>
                <Grid xs={4} mt={2}>
                    <PlaylistRow key={playlist.id} playlist={playlist} getUnavailableVideosCallback={(playlist) => { onGetUnavailableItemsClick(playlist, index) }} />
                </Grid>
            )}
        </Grid>
    );
}