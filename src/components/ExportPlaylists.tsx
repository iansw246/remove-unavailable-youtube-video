import { Box, Button, FormControl, Icon, IconButton, InputLabel, MenuItem, Select, Snackbar } from "@mui/material";
import { useCallback, useEffect, useId, useState } from "react";
import { PlaylistItem } from "../utils/requestHelpers";
import usePlaylistItemsExportText, { DataFormat, dataFormatToFileExtension, isDataFormat } from "./usePlaylistItemsExportText";

export interface Props {
    playlistName: string;
    playlistItems: PlaylistItem[];
}

// Reference: https://stackoverflow.com/questions/1976007/what-characters-are-forbidden-in-windows-and-linux-directory-names
const invalidFilenameCharactersRegex = /\\|\/|<|>|:|"|\||\?|\*/g;

export default function ExportPlaylistItems({playlistName, playlistItems}: Props) {
    const [playlistDataTextObjectURL, setPlaylistDataTextObjectURL] = useState<string>();
    const [playlistDataFormat, setPlaylistDataFormat] = useState<DataFormat>(DataFormat.PlainText);
    const playlistItemsDataText = usePlaylistItemsExportText(playlistItems, playlistDataFormat);
    const playlistDataFormatLabelId: string = useId();

    const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);

    const handleCopyTextClicked = useCallback(() => {
        if (!playlistItemsDataText) {
            return;
        }
        const clipboard = navigator.clipboard;
        clipboard.writeText(playlistItemsDataText).then(
            () => {
                setIsSnackbarOpen(true);
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

    function handleSnackbarClose() {
        setIsSnackbarOpen(false);
    }

    return (
        <>
            <FormControl sx={{display: "block"}}>
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
                    <MenuItem value={DataFormat.PlainText}>Plain Text</MenuItem>
                    <MenuItem value={DataFormat.JSON}>JSON</MenuItem>
                </Select>
            </FormControl>
            {/* Raw text/JSON display */}
            <Box component="pre" sx={{
                paddingBottom: 1,
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
                display: "inline-block",
                padding: 1,
                overflow: "auto",
                width: "100%",
                maxHeight: "400px"
                }}>
                {playlistItemsDataText}
            </Box>
            <div>
                <Button variant="contained" onClick={handleCopyTextClicked} sx={{margin: 1}}>Copy text</Button>
                <Button
                    variant="contained"
                    component="a"
                    download={`${playlistName.replaceAll(invalidFilenameCharactersRegex, "_")}-unavailable videos.${dataFormatToFileExtension(playlistDataFormat) || ".txt"}`}
                    href={playlistDataTextObjectURL}
                    sx={{margin: 1}}
                >
                    Download List
                </Button>
            </div>
            <Snackbar
                open={isSnackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                action={<IconButton size="small" aria-label="close" onClick={handleSnackbarClose} color="inherit"><Icon>close</Icon></IconButton>}
                message="Text copied to clipboard"
            />
        </>
    );    
}