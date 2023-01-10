import { Box, Button } from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PlaylistItem } from "../requestHelpers";

export interface Props {
    playlistName: string;
    playlistItems: PlaylistItem[];
}

// function dataURIForJSON(json: string) {
//     return "data:application/octet-stream;charset=utf-8," + encodeURIComponent(json);
// }

// Reference: https://stackoverflow.com/questions/1976007/what-characters-are-forbidden-in-windows-and-linux-directory-names
const invalidFilenameCharactersRegex = /\\|\/|<|>|:|"|\||\?|\*/g;

export default function ExportPlaylistItems({playlistName, playlistItems}: Props) {
    const playlistDataTextRef = useRef<HTMLPreElement>(null);
    const [playlistDataTextObjectURL, setPlaylistDataTextObjectURL] = useState<string>();

    const playlistItemsJSON = useMemo(() => {
        return JSON.stringify(playlistItems, null, 2);
    }, [playlistItems]);

    const copyTextCallback = useCallback(() => {
        if (!playlistDataTextRef.current?.textContent) {
            return;
        }
        const clipboard = navigator.clipboard;
        clipboard.writeText(playlistDataTextRef.current?.textContent).then(
            () => { 
                console.log("Text written successfully");
            },
            (err) => {
                console.error("Error copying text to clipboard: ", err);
            }
        )
    }, [playlistDataTextRef]);

    useEffect(() => {
        setPlaylistDataTextObjectURL(URL.createObjectURL(new Blob([playlistItemsJSON], { type: "application/json" })));
        return () => {
            if (playlistDataTextObjectURL) {
                URL.revokeObjectURL(playlistDataTextObjectURL);
            }
            setPlaylistDataTextObjectURL(undefined);
        }
    }, [playlistItemsJSON]);

    return (
        <Box>
            <pre ref={playlistDataTextRef}>
                {playlistItemsJSON}
            </pre>
            <Button onClick={copyTextCallback}>Copy text</Button>
            <Button component="a" download={`${playlistName.replaceAll(invalidFilenameCharactersRegex, "_")}-unavailable videos.json`} href={playlistDataTextObjectURL}>Download JSON</Button>
        </Box>
    )
}