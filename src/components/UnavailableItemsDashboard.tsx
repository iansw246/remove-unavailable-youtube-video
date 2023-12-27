import { AlertTitle, Button, Collapse, Tab, Tabs, Typography } from "@mui/material";
import React, { forwardRef, useCallback, useRef, useState } from "react";
import { isUnauthenticated, Playlist, PlaylistItem } from "../utils/requestHelpers";
import AdaptiveLinearProgress from "./AdaptiveLinearProgress";
import ErrorAlert from "./ErrorAlert";
import ExportPlaylistItems from "./ExportPlaylists";
import TabPanel from "./TabPanel";
import UnavailableItemsDisplay from "./UnavailableItemsDisplay";
import ApiProvider from "../apiProviders/apiProvider";

interface Props {
    unavailableItems: PlaylistItem[];
    playlist: Playlist;

    showRemoveVideosButton?: boolean;
    onVideosRemoved?: () => void;
    
    ref?: React.RefObject<HTMLDivElement>;

    apiProvider: ApiProvider;
    googleOAuthAccessToken?: string;
}

enum ErrorType {
    General,
    YouTubeApiError,
    Unknown
}

function createErrorAlertBody(error: unknown): React.ReactNode {
    try {
        if (isUnauthenticated(error)) {
            return (<>
                <AlertTitle>Not signed in</AlertTitle>
                You are not signed in to Google. Please sign in and try again.
            </>);
        } else if (error && typeof error === "object") {
            let errorAny = error as any;
            if (errorAny.type === ErrorType.General && typeof errorAny.message === "string") {
                return (<>
                    <AlertTitle>Error</AlertTitle>
                    {errorAny.message}
                </>);
            } else if (errorAny.type === ErrorType.YouTubeApiError && typeof errorAny.response === "object") {
                return (<>
                    <AlertTitle>YouTube API Error</AlertTitle>
                    {errorAny.response.result.error.message}
                </>);
            }
        }
    } catch (e) {
        console.error(`Error creating error alert body: ${e}`);
    }
    return (<>
        <AlertTitle>Unknown Error</AlertTitle>
        An unknown error occured. Please try again or contact the developer.
    </>);
}

const UnavailableItemsDashboard = forwardRef(({ unavailableItems, playlist, showRemoveVideosButton: allowRemoval = true, onVideosRemoved, apiProvider, googleOAuthAccessToken }: Props, ref: React.ForwardedRef<HTMLDivElement>) => {
    const [tabIndex, setTabIndex] = useState<number>(0);
    const selectedPlaylistItemsRef = useRef<PlaylistItem[]>([]);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingProgress, setLoadingProgress] = useState<number>();
    const [loadingTotal, setLoadingTotal] = useState<number>();

    const [showError, setShowError] = useState<boolean>(false);
    const [error, setError] = useState<any>();

    const removeVideos = useCallback((playlistItems: PlaylistItem[]) => {
        if (!googleOAuthAccessToken) {
            setError("Missing googleOAuthAccessToken");
            setShowError(true);
            return;
        }

        if (!playlistItems) {
            return;
        }
        setIsLoading(true);
        setLoadingProgress(0);
        setLoadingTotal(playlistItems.length);

        apiProvider.removeItemsFromPlaylist(
            playlistItems,
            googleOAuthAccessToken,
            (index) => {
                setLoadingProgress(index);
            },
        ).then(() => {
            setIsLoading(false);
            onVideosRemoved?.();
        }, (error) => {
            setIsLoading(false);

            setShowError(true);
            setError({
                type: ErrorType.YouTubeApiError,
                response: error,
            });
            console.error(error);
        });
    }, [onVideosRemoved, apiProvider, googleOAuthAccessToken]);

    const handleRemoveSelectedVideosButtonClick = useCallback(() => {
        if (selectedPlaylistItemsRef.current.length <= 0) {
            setError({
                type: ErrorType.General,
                message: "No videos selected",
            });
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
                        {createErrorAlertBody(error)}
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