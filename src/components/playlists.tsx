import { Stack, Container, Box, Typography, Paper, Link, Button, useTheme } from "@mui/material"
import { PlaylistListResponse, PlaylistResponse } from "./googleLogin";

type PlaylistItemListResponse = gapi.client.youtube.PlaylistItemListResponse
type PlaylistItemResource = gapi.client.youtube.PlaylistItemsResource
type PlaylistItem = gapi.client.youtube.PlaylistItem
type Video = gapi.client.youtube.Video;

function youtubePlaylistLink(playlistId: string) {
    return `https://www.youtube.com/playlist?list=${playlistId}`;
}

function firstAvailableThumbnail(thumbnails: gapi.client.youtube.ThumbnailDetails): gapi.client.youtube.Thumbnail | null {
    // Key for preferred thumbnail in order of preference. This function gets the first thumbnail in order of keys
    const THUMBNAIL_KEYS: (keyof gapi.client.youtube.ThumbnailDetails)[] = ["default", "medium", "high", "standard", "maxres"];
    for (const key of THUMBNAIL_KEYS) {
        if (Object.hasOwn(thumbnails, key)) {
            return thumbnails[key] as gapi.client.youtube.Thumbnail;
        }
    }
    return null;
}

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

export default function PlaylistsDisplay({playlists, currentUserChannelId}: {playlists: PlaylistListResponse, currentUserChannelId: string}) {
    const theme = useTheme();
    return (
        <Paper sx={{
            padding: "6px"
        }}>
            <Stack spacing={2}>
                {playlists.items?.map((playlist) =>
                    <Paper elevation={2} sx={{
                        "&:hover": {
                            backgroundColor: theme.palette.grey[100],
                        }
                    }} key={playlist.etag}>
                        <Stack direction="row" >
                            <Box component="img" width="130px" height="90px" sx={{border: "2px solid white", borderRadius: "15px", mr: 2, objectFit: "cover"}} src={playlist.snippet?.thumbnails ? firstAvailableThumbnail(playlist.snippet?.thumbnails)?.url : ""}></Box>
                            <Box>
                                <Typography>{playlist.snippet?.title}</Typography>
                                <Typography fontSize="0.8rem">{playlist.contentDetails?.itemCount} {" "} Videos</Typography>
                                <Typography fontSize="0.8rem">Id: {playlist.id}</Typography>
                                <Typography fontSize="0.8rem">Status: {playlist.status?.privacyStatus}</Typography>
                                <Typography fontSize="0.8rem">{playlist.snippet?.description}</Typography>
                                {playlist.id && <Link href={youtubePlaylistLink(playlist.id)}>Link to playlist</Link>}
                            </Box>
                            <Box ml="auto">
                                <Button sx={{height: "100%"}} onClick={() => {
                                    if (!playlist.id) {
                                        return;
                                    }
                                    getVideosInPlaylist(playlist.id)
                                        .then((itemResponses) => {
                                            return getUnavailablePlaylistItems(itemResponses, currentUserChannelId, "US");
                                        }).then((unavailableItems) => {
                                            console.log(unavailableItems);
                                        });
                                }}>Remove unavailable videos</Button>
                            </Box>
                        </Stack>
                    </Paper>
                )}
            </Stack>
        </Paper>
    );
}