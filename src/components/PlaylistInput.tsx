import { Box, Input, InputLabel, TextField, Typography } from "@mui/material"
import React, { ChangeEvent, useCallback, useId, useState } from "react"

export interface Props {
    onChange?: (playlistId: string | null) => void;
}

// (Assumed) characters not allowed in IDs
// There is no official documentation on allowed/disallowed characters
// These are assumed from the fact that the YouTube API allows for comma separated IDs in requests
const PLAYLIST_ID_DISALLOWED_CHARACTERS: string[] = [",", " "];

function parseYoutubeUrl(url: URL) {
    if (
        (url.hostname !== "www.youtube.com" && url.hostname !== "youtube.com")
        || url.pathname !== "/playlist"
    ) {
        return null;
    }
    const params = url.searchParams;
    // If list search param doesn't exist, returns null
    return params.get("list");
}

function parseYoutubePlaylistInput(input: string) {
    let url;
    // First try interpreting input as youtube URL
    try {
        url = new URL(input);
    } catch (e) {
        // URL constructor throws TypeError if malformed url.
        // Rethrow all other unexpected exceptions.
        
        // Issue: On NodeJS, the error isn't an instanceof TypeError and doesn't get caught.
        // Not sure how to fix this
        if (!(e instanceof TypeError)) {
            throw e;
        }
    }

    if (url !== undefined) {
        const playlistId = parseYoutubeUrl(url);
        if (playlistId !== null) {
            return playlistId;
        } else {
            // If is a valid URL but not a YouTube playlist URL, assume is not a YouTube playlist ID and return null
            return null;
        }
    }

    // Check if input has any disallowed chars
    if (PLAYLIST_ID_DISALLOWED_CHARACTERS.some(
        (disallowedChar) => input.includes(disallowedChar)
    )) {
        return null;
    }

    return input;
}

export default function PlaylistInput({ onChange }: Props) {
    const [isPlaylistInputValid, setIsPlaylistInputValid] = useState<boolean>(true);
    const playlistInputId = useId();

    const onPlaylistInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        const parsedPlaylistId = parseYoutubePlaylistInput(event.target.value);
        if (parsedPlaylistId) {
            if (onChange) {      
                onChange(parsedPlaylistId);
            }
            setIsPlaylistInputValid(true);
        } else {
            setIsPlaylistInputValid(false);
        }
    }, [onChange]);

    return (
        <Box>
            <TextField
                id={playlistInputId}
                label="Playlist ID/link"
                onChange={onPlaylistInputChange}
                error={!isPlaylistInputValid}
                helperText={isPlaylistInputValid ? undefined : "Invalid playlist ID/link"} />
        </Box>
    );
}

// For testing
export { parseYoutubePlaylistInput };