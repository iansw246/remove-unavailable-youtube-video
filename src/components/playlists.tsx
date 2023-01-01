import { Stack, Box, Paper, useTheme, DialogActions, DialogTitle, DialogContent, DialogContentText, Dialog, Button } from "@mui/material"
import { useState } from "react";
import { Playlist, PlaylistItem, PlaylistItemListResponse, Video } from "../requestHelpers";
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
            pageToken: itemsResult.nextPageToken
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
            continue;
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

export interface Props {
    playlists: Playlist[],
    currentUserChannelId: string,
}

export default function PlaylistsDisplay({playlists, currentUserChannelId}: Props) {
    const theme = useTheme();
    const [isRemoveVideoDialogOpen, setIsRemoveVideoDialogOpen] = useState<boolean>(false);
    const [unavailableItems, setUnavailableItems] = useState<PlaylistItem[]>();
    return (
        <Paper sx={{
            padding: "6px"
        }}>
            <Dialog open={isRemoveVideoDialogOpen}>
                <DialogTitle>
                    Remove videos?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Found {unavailableItems?.length} videos. Confirm removal from playlist?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button>Ok</Button>
                    <Button>Cancel</Button>
                </DialogActions>
            </Dialog>
            <Stack spacing={2}>
                {playlists.map((playlist: Playlist) =>
                    <PlaylistRow key={playlist.id} playlist={playlist} removeUnavailableVideosCallback={(playlist: Playlist) => {
                        if (!playlist.id) {
                            throw new Error("Playlist has no id");
                        }
                        getVideosInPlaylist(playlist.id)
                            .then((itemResponses) => {
                                return getUnavailablePlaylistItems(itemResponses, currentUserChannelId, "US");
                            }).then((unavailableItems) => {
                                setUnavailableItems(unavailableItems);
                            });
                    }}></PlaylistRow>
                )}
            </Stack>
        </Paper>
    );
}