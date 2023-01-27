import { Button, DialogActions, DialogContent, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { PlaylistItem } from "../requestHelpers";

enum DataFormats {
    PlainText = "plaintext",
    JSON = "json",
}

const dataFormatToExtensionMap = new Map<DataFormats, string>([
    [DataFormats.PlainText, "txt"],
    [DataFormats.JSON, "json"]
]);

function isDataFormat(obj: any): obj is DataFormats {
    return Object.values(DataFormats).includes(obj);
}

export interface Props {
    playlistName: string;
    playlistItems: PlaylistItem[];
}

// Reference: https://stackoverflow.com/questions/1976007/what-characters-are-forbidden-in-windows-and-linux-directory-names
const invalidFilenameCharactersRegex = /\\|\/|<|>|:|"|\||\?|\*/g;

export default function ExportPlaylistItems({playlistName, playlistItems}: Props) {
    const [playlistDataTextObjectURL, setPlaylistDataTextObjectURL] = useState<string>();
    const [playlistDataFormat, setPlaylistDataFormat] = useState<DataFormats>(DataFormats.PlainText);
    const playlistDataFormatLabelId: string = useId();

    const playlistItemsDataText: string = useMemo(() => {
        if (playlistDataFormat === DataFormats.JSON) {
            return JSON.stringify(playlistItems, null, 2);
        } else if (playlistDataFormat === DataFormats.PlainText) {
            const dataLines: string[] = playlistItems.map((item) =>
                `${item.snippet?.videoOwnerChannelTitle || "[Unknown channel]"} - ${item.snippet?.title}`
            );
            return dataLines.join("\n");
        } else {
            return "Invalid data format. Please report this error";
        }
    }, [playlistItems, playlistDataFormat]);

    const copyTextCallback = useCallback(() => {
        if (!playlistItemsDataText) {
            return;
        }
        const clipboard = navigator.clipboard;
        clipboard.writeText(playlistItemsDataText).then(
            () => { 
                console.log("Text written successfully");
            },
            (err) => {
                console.error("Error copying text to clipboard: ", err);
            }
        )
    }, [playlistItemsDataText]);

    useEffect(() => {
        setPlaylistDataTextObjectURL(URL.createObjectURL(new Blob([playlistItemsDataText], { type: "application/json" })));
    }, [playlistItemsDataText]);

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
                <FormControl>
                    <InputLabel id={playlistDataFormatLabelId}>Format</InputLabel>
                    <Select
                        labelId={playlistDataFormatLabelId}
                        label="Format"
                        value={playlistDataFormat}
                        sx={{ minWidth: "12rem" }}
                        onChange={(event) => {
                            if (isDataFormat(event.target.value)) {
                                setPlaylistDataFormat(event.target.value);
                            }
                        }}
                    >
                        <MenuItem value={DataFormats.PlainText}>Plain Text</MenuItem>
                        <MenuItem value={DataFormats.JSON}>JSON</MenuItem>
                    </Select>
                </FormControl>
                <pre style={{overflow: "scroll", paddingBottom: "1rem"}}>
                    {playlistItemsDataText}
                </pre>
            </DialogContent>
            <DialogActions>
                <Button onClick={copyTextCallback}>Copy text</Button>
                <Button
                    component="a"
                    download={`${playlistName.replaceAll(invalidFilenameCharactersRegex, "_")}-unavailable videos.${dataFormatToExtensionMap.get(playlistDataFormat) || ".txt"}`}
                    href={playlistDataTextObjectURL}
                >
                    Download List
                </Button>
            </DialogActions>
        </>
    );    
}