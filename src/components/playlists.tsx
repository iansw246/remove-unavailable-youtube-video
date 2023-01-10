import { Stack, Paper, DialogActions, DialogTitle, DialogContent, DialogContentText, Dialog, Button, CircularProgress } from "@mui/material";
import { useState } from "react";
import { Playlist, PlaylistItem, PlaylistItemListResponse, Video } from "../requestHelpers";
import ExportPlaylistItems from "./ExportPlaylists";
import PlaylistItemView from "./PlaylistItemView";
import PlaylistRow from "./PlaylistRow";

async function getVideosInPlaylist(playlistId: string): Promise<gapi.client.youtube.PlaylistItemListResponse[]> {
    const results: gapi.client.youtube.PlaylistItemListResponse[] = [];
    let response = await gapi.client.youtube.playlistItems.list({
        part: "contentDetails,id,snippet,status",
        maxResults: 50,
        playlistId
    });
    let itemsResult = response.result;
    results.push(itemsResult);
    while (Object.hasOwn(itemsResult, "nextPageToken")) {
        let response = await gapi.client.youtube.playlistItems.list({
            part: "contentDetails,id,snippet,status",
            maxResults: 50,
            playlistId,
            pageToken: itemsResult.nextPageToken,
        });
        itemsResult = response.result;
        results.push(itemsResult);
    }
    return results;
}

function videoAvailableInCountry(video: Video, countryCode: string): boolean {
    const regionRestriction = video.contentDetails?.regionRestriction;
    if (!regionRestriction) {
        return true;
    }
    // regionRestriction must contain either allowed or blocked
    // If this property is present and a country is not listed in its value, then the video is blocked from appearing in that country. If this property is present and contains an empty list, the video is blocked in all countries.
    if (regionRestriction.allowed) {
        return regionRestriction.allowed.length !== 0 || regionRestriction.allowed.includes(countryCode);
    }
    else {
        // If this property is present and a country is not listed in its value, then the video is viewable in that country. If this property is present and contains an empty list, the video is viewable in all countries.
        return !regionRestriction.blocked || regionRestriction.blocked.length === 0 || !regionRestriction.blocked.includes(countryCode);
    }
}

async function getUnavailablePlaylistItems(playlistItems: PlaylistItemListResponse[], userChannelId: string, userCountryCode: string): Promise<PlaylistItem[]> {
    const unavailableItems: PlaylistItem[] = [];
    // Videos public, but possibly unavailable due to region blocking
    const possiblyUnavailableItems: PlaylistItem[] = [];
    for (const response of playlistItems) {
        if (!response.items) {
            continue;
        }
        for (const item of response.items) {
            // Handles other videos's privacy status change
            // Also holds deleted videos because privacyStatus is "privacyStatusUnspecified" and videoOwnerChannelId is undefined
            if (!(item.status?.privacyStatus === "public" || item.status?.privacyStatus === "unlisted") && item.snippet?.videoOwnerChannelId !== userChannelId) {
                unavailableItems.push(item);
            } else {
                possiblyUnavailableItems.push(item);
            }
        }
    }
    // Return early so we don't make request checking 0 ids
    if (possiblyUnavailableItems.length === 0) {
        return unavailableItems;
    }
    const batch = gapi.client.newBatch();
    const MAX_VIDEO_IDS_PER_REQUEST = 50;
    let startIndex = 0;
    const videoIds = possiblyUnavailableItems.map((item) => {
        console.assert(Boolean(item.contentDetails), item);
        if (!item.contentDetails) {
            throw new Error("playlistItem must have contentDetails");
        }
        return item.contentDetails.videoId;
    });
    while (startIndex < videoIds.length) {
        batch.add(gapi.client.youtube.videos.list({
            part: "contentDetails,status",
            id: videoIds.slice(startIndex, startIndex + MAX_VIDEO_IDS_PER_REQUEST).join(","),
            maxResults: 50
        }));
        startIndex += 50;
    }
    const batchResults = (await batch).result;
    const allVideoItems: Video[] = [];
    for (const responseId in batchResults) {
        const response = batchResults[responseId] as gapi.client.Response<gapi.client.youtube.VideoListResponse>;
        const result = response.result;
        if (result.items) {
            allVideoItems.push(...result.items);
        }
    }
    if (allVideoItems.length === 0) {
        return unavailableItems;
    }
    const videoIdToPlaylistItem = new Map();
    for (const playlistItem of possiblyUnavailableItems) {
        const videoId = playlistItem.contentDetails?.videoId;
        if (!videoId) {
            throw new Error("Playlist Item should have video id");
        }
        if (videoIdToPlaylistItem.has(videoId)) {
            videoIdToPlaylistItem.get(playlistItem.contentDetails?.videoId).push(playlistItem);
        } else {
            videoIdToPlaylistItem.set(videoId, [playlistItem]);
        }
    }
    for (const video of allVideoItems) {
        if (!videoAvailableInCountry(video, "US")) {
            unavailableItems.push(...videoIdToPlaylistItem.get(video.id));
        }
    }
    return unavailableItems;
}

async function deleteUnavailableVideos(unavailableItems: PlaylistItem[]): Promise<gapi.client.Response<gapi.client.ResponseMap<any>> | undefined> {
    if (unavailableItems.length <= 0) {
        return;
    }
    const batch = gapi.client.newBatch();
    for (const item of unavailableItems)
    {
        if (item.id) {
            batch.add(gapi.client.youtube.playlistItems.delete({
                id: item.id
            }));
        }
    }
    // batch.then()
    return await batch;
}

export interface Props {
    playlists: Playlist[];
    currentUserChannelId: string;
    reloadPlaylists: () => void;
}

export default function PlaylistsDisplay({playlists, currentUserChannelId, reloadPlaylists}: Props) {
    const [isUnavailableVideosDialogOpen, setIsUnavailableVideosDialogOpen] = useState<boolean>(false);
    const [unavailableItems, setUnavailableItems] = useState<PlaylistItem[]>([]);
    const [currentlySelectedPlaylist, setCurrentlySelectedPlaylist] = useState<Playlist>();
    const [loadingMessage, setLoadingMessage] = useState<string>();

    function handleDialogClose() {
        setIsUnavailableVideosDialogOpen(false);
    }

    function handleConfirmDeleteUnavailableVideos() {
        setLoadingMessage("Deleting unavailable videos.");
        deleteUnavailableVideos(unavailableItems).then(() => {
            setLoadingMessage(undefined);
            setIsUnavailableVideosDialogOpen(false);
            setUnavailableItems([]);
            setCurrentlySelectedPlaylist(undefined);
            reloadPlaylists();
        });
    }

    return (
        <>
            {/* Loading dialog */}
            <Dialog open={Boolean(loadingMessage)} fullWidth={true}>
                <DialogTitle textAlign="center">
                    {loadingMessage}
                </DialogTitle>
                <DialogContent sx={{display: "flex", justifyContent: "center"}}>
                    <CircularProgress sx={{marginLeft: "auto", marginRight: "auto"}} />
                </DialogContent>
            </Dialog>
            {/* Unavailable videos dialog */}
            <Dialog open={isUnavailableVideosDialogOpen} onClose={handleDialogClose}>
                <DialogTitle>
                    Unavailable Videos
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Found {unavailableItems.length} unavailable video{unavailableItems.length === 1 ? "" : "s"}.
                        Removal from playlist {(currentlySelectedPlaylist && currentlySelectedPlaylist?.snippet?.title) || ""}?
                    </DialogContentText>
                    <Stack spacing={2}>
                        {unavailableItems.map((item) =>
                            <Paper key={item.id} sx={{padding: 1}}>
                                <PlaylistItemView playlistItem={item}></PlaylistItemView>
                            </Paper>
                        )}
                    </Stack>
                    <ExportPlaylistItems playlistName={currentlySelectedPlaylist?.snippet?.title || "[untitled]"} playlistItems={unavailableItems}></ExportPlaylistItems>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleConfirmDeleteUnavailableVideos}>Remove</Button>
                    <Button onClick={handleDialogClose}>Cancel</Button>
                </DialogActions>
            </Dialog>
            <Stack spacing={2}>
                {playlists.map((playlist: Playlist) =>
                    <PlaylistRow
                        key={playlist.id}
                        playlist={playlist}
                        getUnavailableVideosCallback={(playlist: Playlist) => {
                            if (!playlist.id) {
                                throw new Error("Playlist has no id");
                            }
                            setLoadingMessage("Loading unavailable videos in playlist.");
                            getVideosInPlaylist(playlist.id)
                                .then((itemResponses) => {
                                    return getUnavailablePlaylistItems(itemResponses, currentUserChannelId, "US");
                                }).then((unavailableItems) => {
                                    setLoadingMessage(undefined);
                                    setUnavailableItems(unavailableItems);
                                    setIsUnavailableVideosDialogOpen(true);
                                    setCurrentlySelectedPlaylist(playlist);
                                });
                    }}></PlaylistRow>
                )}
            </Stack>
        </>
    );
}