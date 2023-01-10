import { Button, Dialog, DialogActions, DialogContentText, DialogTitle } from "@mui/material";
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
            <DialogContentText>
                {errorBody}
            </DialogContentText>
            <DialogActions>
                <Button onClick={handleOkButtonClick}>Ok</Button>
            </DialogActions>
        </Dialog>
    );
}