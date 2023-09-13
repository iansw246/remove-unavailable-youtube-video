import { styled } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import { Playlist } from "../utils/requestHelpers";
import PlaylistRow from "./PlaylistRow";

export type Props = {
    playlists: Playlist[];
    onGetUnavailableItemsClick: (playlist: Playlist, index: number) => void;
} & Omit<React.ComponentProps<typeof Grid>, "container" | "columns">;

const ListGrid = styled(Grid)({
    maxHeight: "90vh",
    overflowY: "auto",
    paddingBottom: 2,
});

export default function PlaylistList({ playlists, onGetUnavailableItemsClick, ...rest }: Props) {
    return (
        <ListGrid container spacing={2} columns={{xs: 4, sm: 8, md: 12}} {...rest}>
            {playlists.map((playlist, index) =>
                <Grid xs={4} mt={2} key={playlist.etag} >
                    <PlaylistRow playlist={playlist} getUnavailableVideosCallback={(playlist) => { onGetUnavailableItemsClick(playlist, index) }} />
                </Grid>
            )}
        </ListGrid>
    );
}