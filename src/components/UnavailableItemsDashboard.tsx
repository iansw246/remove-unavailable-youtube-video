import { Button, Stack, Tab, Tabs, Typography } from "@mui/material";
import { PlaylistItem, Playlist } from "../utils/requestHelpers";
import UnavailableItemsDisplay from "./UnavailableItemsDisplay";
import ExportPlaylistItems from "./ExportPlaylists";
import { useState } from "react";
import TabPanel from "./TabPanel";

interface Props {
    unavailableItems: PlaylistItem[];
    playlist: Playlist;
    handleRemoveVideosButtonClick?: () => void;
    showRemoveVideosButton?: boolean
}

export default function UnavailableItemsDashboard({ unavailableItems, playlist, handleRemoveVideosButtonClick, showRemoveVideosButton = true }: Props) {
    const [tabIndex, setTabIndex] = useState<number>(0);
    return (
        <div>
            <Typography variant="h4">Unavailable videos in selected playlist</Typography>
            <Tabs value={tabIndex} onChange={(event, newTabIndex) => setTabIndex(newTabIndex)} sx={{mb: 2}}>
                <Tab label="Delete videos" />
                <Tab label="Export list" />
            </Tabs>
            <TabPanel value={tabIndex} index={0}>
                <Typography variant="h5"> Unavailable videos</Typography>
                <UnavailableItemsDisplay unavailableItems={unavailableItems} playlist={playlist} />
                {showRemoveVideosButton && <Button variant="contained" onClick={handleRemoveVideosButtonClick}>Remove videos?</Button>}
            </TabPanel>
            <TabPanel value={tabIndex} index={1}>
                <Typography variant="h5" mb={2}>Export list</Typography>
                <ExportPlaylistItems playlistItems={unavailableItems} playlistName={playlist.snippet?.title ?? "untitled_playlist"} />
            </TabPanel>
        </div>
    );
    return (<Stack direction="row" flexWrap="wrap" spacing={2} style={{columnGap: 2}}>
        <div style={{maxWidth: "48%"}}>
            <Typography variant="h4" mb={2}>Unavailable videos</Typography>
            <UnavailableItemsDisplay unavailableItems={unavailableItems} playlist={playlist} />
            {showRemoveVideosButton && <Button variant="contained" onClick={handleRemoveVideosButtonClick}>Remove videos?</Button>}
        </div>
        <div style={{maxWidth: "48%"}}>
            <Typography variant="h4" mb={2}>Export list</Typography>
            <ExportPlaylistItems playlistItems={unavailableItems} playlistName={playlist.snippet?.title ?? "untitled_playlist"} />
        </div>
    </Stack>);
}