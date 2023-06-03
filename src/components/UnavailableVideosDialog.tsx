import { Dialog, DialogTitle, DialogContent, DialogContentText, Box, Tabs, Tab, Stack, Paper, DialogActions, Button, DialogProps } from "@mui/material";
import { Playlist, PlaylistItem } from "../utils/requestHelpers";
import ExportPlaylistItems from "./ExportPlaylists";
import PlaylistItemView from "./PlaylistItemView";
import { useState, useCallback, MouseEventHandler } from "react";

export interface Props {
    open: boolean,
    selectedPlaylist: Playlist,
    unavailablePlaylistItems: PlaylistItem[],
    // Handle dialog being closed
    onClose: DialogProps["onClose"],
    // Handle "Remove" button click
    onDeleteUnavailableVideos?: MouseEventHandler<HTMLButtonElement>,
    // Handle "Cancel" button click
    onCancel?: MouseEventHandler<HTMLButtonElement>
}

export function UnavailableVideosDialog({open, selectedPlaylist, unavailablePlaylistItems, onClose, onDeleteUnavailableVideos, onCancel}: Props) {
    const [selectedTab, setSelectedTab] = useState<number>(0);
    const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
        setSelectedTab(newValue);
    }, []);

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>
                Unavailable Videos
            </DialogTitle>
            <DialogContent>
                <DialogContentText>Found {unavailablePlaylistItems.length} unavailable video{unavailablePlaylistItems.length === 1 ? "" : "s"}.</DialogContentText>
            </DialogContent>
            <Box borderBottom={1} borderColor="divider" paddingLeft={2} paddingRight={2}>
                <Tabs value={selectedTab} onChange={handleTabChange}>
                    <Tab label="Remove videos" />
                    <Tab label="Download list" />
                </Tabs>
            </Box>
            {selectedTab === 0 && 
                <>
                    <DialogContent>
                        <DialogContentText>Remove the following videos from playlist {(selectedPlaylist && selectedPlaylist?.snippet?.title) || ""}?</DialogContentText>
                        <Stack spacing={2}>
                            {unavailablePlaylistItems.map((item) =>
                                <Paper key={item.id} sx={{padding: 1}}>
                                    <PlaylistItemView playlistItem={item}></PlaylistItemView>
                                </Paper>
                            )}
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={onDeleteUnavailableVideos}>Remove</Button>
                        <Button onClick={onCancel}>Cancel</Button>
                    </DialogActions>
                </>
            }
            {selectedTab === 1 &&
                <ExportPlaylistItems
                    playlistName={selectedPlaylist?.snippet?.title || "[untitled]"}
                    playlistItems={unavailablePlaylistItems} />}
        </Dialog>
    );
}