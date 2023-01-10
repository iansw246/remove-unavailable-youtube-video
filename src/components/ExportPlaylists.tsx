import { Button, DialogActions, DialogContent } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
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
    const [playlistDataTextObjectURL, setPlaylistDataTextObjectURL] = useState<string>();

    const playlistItemsJSON = useMemo(() => {
        return JSON.stringify(playlistItems, null, 2);
    }, [playlistItems]);

    const copyTextCallback = useCallback(() => {
        if (!playlistItemsJSON) {
            return;
        }
        const clipboard = navigator.clipboard;
        clipboard.writeText(playlistItemsJSON).then(
            () => { 
                console.log("Text written successfully");
            },
            (err) => {
                console.error("Error copying text to clipboard: ", err);
            }
        )
    }, [playlistItemsJSON]);

    useEffect(() => {
        setPlaylistDataTextObjectURL(URL.createObjectURL(new Blob([playlistItemsJSON], { type: "application/json" })));
    }, [playlistItemsJSON]);

    useEffect(() => {
        return () => {
            if (playlistDataTextObjectURL) {
                URL.revokeObjectURL(playlistDataTextObjectURL);
            }
        }
    }, [playlistDataTextObjectURL]);

    return (
        <>
            <DialogContent>
                <pre>
                    {playlistItemsJSON}
                </pre>
            </DialogContent>
            <DialogActions>
                <Button onClick={copyTextCallback}>Copy text</Button>
                <Button component="a" download={`${playlistName.replaceAll(invalidFilenameCharactersRegex, "_")}-unavailable videos.json`} href={playlistDataTextObjectURL}>Download JSON</Button>
            </DialogActions>
        </>
    );    
}