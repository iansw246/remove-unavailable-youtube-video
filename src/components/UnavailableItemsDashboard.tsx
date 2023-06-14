import { AlertTitle, Button, Collapse, Tab, Tabs, Typography } from "@mui/material";
import { forwardRef, useState } from "react";
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
    
    ref?: React.RefObject<HTMLDivElement>;
}

const UnavailableItemsDashboard = forwardRef(({ unavailableItems, playlist, showRemoveVideosButton = true }: Props, ref: React.ForwardedRef<HTMLDivElement>) => {
    const [tabIndex, setTabIndex] = useState<number>(0);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingProgress, setLoadingProgress] = useState<number>();
    const [loadingTotal, setLoadingTotal] = useState<number>();

    const [showError, setShowError] = useState<boolean>(false);
    const [error, setError] = useState<any>();

    function handleRemoveVideosButtonClick() {
        if (!unavailableItems) {
            return;
        }

        setIsLoading(true);
        setLoadingProgress(0);
        setLoadingTotal(unavailableItems.length);

        removeItemsFromPlaylist(unavailableItems, (index) => {
            setLoadingProgress(index);
        }).then(() => {
            setIsLoading(false);

        }, (error) => {
            setIsLoading(false);

            setShowError(true);
            setError(error);
            console.error(error);
        });
    }
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
                        {isUnauthenticated(error) ? <>
                            <AlertTitle>Not signed in</AlertTitle>
                            You are not signed in to Google. Please sign in and try again.
                        </> : 
                        <>
                            <AlertTitle>Unknown error</AlertTitle>
                            An unknown error occured. Please try again or contact the developer.
                        </>}
                    </ErrorAlert>
                </Collapse>
                <UnavailableItemsDisplay unavailableItems={unavailableItems} playlist={playlist} />
                {showRemoveVideosButton && <Button variant="contained" onClick={handleRemoveVideosButtonClick} sx={{margin: 1}}>Remove videos?</Button>}
            </TabPanel>
            <TabPanel value={tabIndex} index={1}>
                <Typography variant="h5" mb={2}>Export list</Typography>
                <ExportPlaylistItems playlistItems={unavailableItems} playlistName={playlist.snippet?.title ?? "untitled_playlist"} />
            </TabPanel>
        </div>
    );
});

export default UnavailableItemsDashboard;