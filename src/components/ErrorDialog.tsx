import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import React, { useCallback } from "react";

export interface Props {
    open: boolean;
    errorTitle?: string;
    errorBody?: string;
    onClose?: (event: {}, reason: "backdropClick" | "escapeKeyDown" | "okButtonClick") => void;
}

export default function ErrorDialog({ open, errorTitle, errorBody, onClose } : Props) {
    const handleOkButtonClick: React.MouseEventHandler<HTMLButtonElement> = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        if (onClose) {
            onClose(event, "okButtonClick");
        }
    }, [onClose]);
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{errorTitle}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {errorBody}
                </DialogContentText>
                <br />
                <DialogContentText>
                    Try clicking the show playlists button and signing into Google if prompted. If the error persists, report the error to the developer.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleOkButtonClick}>Ok</Button>
            </DialogActions>
        </Dialog>
    );
}