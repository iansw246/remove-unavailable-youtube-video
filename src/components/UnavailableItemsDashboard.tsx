import { AlertTitle, Button, Collapse, Tab, Tabs, Typography } from "@mui/material";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { isUnauthenticated, Playlist, PlaylistItem } from "../utils/requestHelpers";
import { removeItemsFromPlaylist } from "../youtubeApi";
import AdaptiveLinearProgress from "./AdaptiveLinearProgress";
import ErrorAlert from "./ErrorAlert";
import ExportPlaylistItems from "./ExportPlaylists";
import TabPanel from "./TabPanel";
import UnavailableItemsDisplay from "./UnavailableItemsDisplay";

interface Props {
    unavailableItems: PlaylistItem[];
    playlist: Playlist;

    showRemoveVideosButton?: boolean;
    onVideosRemoved?: () => void;
    
    ref?: React.RefObject<HTMLDivElement>;
}

const UnavailableItemsDashboard = forwardRef(({ unavailableItems, playlist, showRemoveVideosButton: allowRemoval = true, onVideosRemoved }: Props, ref: React.ForwardedRef<HTMLDivElement>) => {
    const [tabIndex, setTabIndex] = useState<number>(0);
    const selectedPlaylistItemsRef = useRef<PlaylistItem[]>([]);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingProgress, setLoadingProgress] = useState<number>();
    const [loadingTotal, setLoadingTotal] = useState<number>();

    const [showError, setShowError] = useState<boolean>(false);
    const [error, setError] = useState<any>();

    const removeVideos = useCallback((playlistItems: PlaylistItem[]) => {
        if (!playlistItems) {
            return;
        }
        setIsLoading(true);
        setLoadingProgress(0);
        setLoadingTotal(playlistItems.length);

        removeItemsFromPlaylist(playlistItems, (index) => {
            setLoadingProgress(index);
        }).then(() => {
            setIsLoading(false);
            onVideosRemoved?.();
        }, (error) => {
            setIsLoading(false);

            setShowError(true);
            setError(error);
            console.error(error);
        });
    }, [onVideosRemoved]);

    const handleRemoveSelectedVideosButtonClick = useCallback(() => {
        if (selectedPlaylistItemsRef.current.length <= 0) {
            setError("No videos selected");
            setShowError(true);
            return;
        }
        removeVideos(selectedPlaylistItemsRef.current);
    }, [removeVideos, selectedPlaylistItemsRef]);

    const handleSelectedVideosChanged = useCallback((selectedItems: PlaylistItem[]) => {
        selectedPlaylistItemsRef.current = selectedItems;
    }, [selectedPlaylistItemsRef]);

    return (
        <div ref={ref}>

            <Typography variant="h4">Unavailable videos in selected playlist</Typography>
            <Tabs value={tabIndex} onChange={(event, newTabIndex) => setTabIndex(newTabIndex)} sx={{mb: 2, borderBottom: 1, borderColor: "divider"}}>
                <Tab label="Delete videos" />
                <Tab label="Export list" />
            </Tabs>
            <TabPanel value={tabIndex} index={0}>
                <Typography variant="h5"> Unavailable videos</Typography>
                {isLoading && <AdaptiveLinearProgress loadingProgress={loadingProgress} loadingTotal={loadingTotal} />}
                <Collapse in={showError}>
                    <ErrorAlert error={error} onClose={() => {setShowError(false);}}>
                        {isUnauthenticated(error)
                            ? <>
                                <AlertTitle>Not signed in</AlertTitle>
                                You are not signed in to Google. Please sign in and try again.
                            </>
                            : (
                                error
                                ? <>
                                    <AlertTitle>Error</AlertTitle>
                                    {error}
                                </>
                                : <>
                                    <AlertTitle>Unknown error</AlertTitle>
                                    An unknown error occured. Please try again or contact the developer.
                                </>
                            )
                        }
                    </ErrorAlert>
                </Collapse>
                <UnavailableItemsDisplay
                    unavailableItems={unavailableItems}
                    playlist={playlist}
                    allowRemoval={allowRemoval}
                    onSelectionChanged={handleSelectedVideosChanged}
                />
                {
                    allowRemoval
                        ? (<>
                            <Button variant="contained" onClick={handleRemoveSelectedVideosButtonClick} sx={{margin: 1}}>Remove selected videos</Button>
                        </>)
                        : null
                }
            </TabPanel>
            <TabPanel value={tabIndex} index={1}>
                <Typography variant="h5" mb={2}>Export list</Typography>
                <ExportPlaylistItems playlistItems={unavailableItems} playlistName={playlist.snippet?.title ?? "untitled_playlist"} />
            </TabPanel>
        </div>
    );
});

export default UnavailableItemsDashboard;