import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import React, { useCallback } from "react";

export interface Props {
    open: boolean;
    errorTitle?: string;
    errorBody?: React.ReactNode;
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
                    If the error persists, please report the error to the developer.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleOkButtonClick}>Ok</Button>
            </DialogActions>
        </Dialog>
    );
}