import { Box, TextField } from "@mui/material";
import { ChangeEvent, useCallback, useId, useState } from "react";

export interface Props {
    onChange?: (playlistId: string | null) => void;
}

// (Assumed) characters not allowed in IDs
// There is no official documentation on allowed/disallowed characters
// These are assumed from the fact that the YouTube API allows for comma separated IDs in requests
const PLAYLIST_ID_DISALLOWED_CHARACTERS: string[] = [",", " "];

/**
 * Get the playlist id from the search parameters of a YouTube playlist URL
 * @param url URL of YouTube playlist
 * @returns playlist id or null if playlist URL is not valid
 */
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

/**
 * Try to parse str as URL
 * @param str url string to parse
 * @returns URL object of url string, or null if url string was invalid
 */
function defaultStringToUrl(str: string): URL | null {
    try {
        return new URL(str);
    } catch (e) {
        // URL constructor throws TypeError if malformed url.
        // Rethrow all other unexpected exceptions.
        
        // Issue: On NodeJS, the error isn't an instanceof TypeError and doesn't get caught.
        // This function exists so it can be mocked in testing
        if (!(e instanceof TypeError)) {
            throw e;
        }
        return null;
    }
}

function parseYoutubePlaylistInput(input: string, stringToUrl: ((str: string) => URL | null) = defaultStringToUrl) {
    const url = stringToUrl(input);

    if (url !== null && url !== undefined) {
        const playlistId = parseYoutubeUrl(url);
        if (playlistId !== null) {
            return playlistId;
        } else {
            // If is a valid URL but not a YouTube playlist URL, assume is not a YouTube playlist ID and return null
            return null;
        }
    }

    // input string is not a url. Check if it is a playlist id

    // Check if input has any disallowed chars
    // If so, it's not a playlist id
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
        if (parsedPlaylistId === null) {
            setIsPlaylistInputValid(false);
        } else {
            if (onChange) {      
                onChange(parsedPlaylistId);
            }
            setIsPlaylistInputValid(true);
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
