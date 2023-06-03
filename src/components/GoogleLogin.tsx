import { Button, Dialog, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { isUnauthenticated, Playlist, PlaylistListResponse, TokenClient } from "../utils/requestHelpers";
import OwnedPlaylistsDashboard from "./OwnedPlaylistsDashboard";
import GoogleSigninButton from "./GoogleSignInButton/GoogleSignInButton";
import PlaylistInput from "./PlaylistInput";

enum ApiRequest {
    OwnPlaylists
}


export interface Props {
    tokenClient?: TokenClient,
    disabled?: boolean,
}

export default function GoogleLogin({tokenClient, disabled}: Props) {
    const [showAuthentication, setShowAuthentication] = useState<boolean>(false);

    const handleLoginButtonClick = useCallback(() => {
        tokenClient?.requestAccessToken();
    }, [tokenClient]);
    
    function handleDialogClose() {
        setShowAuthentication(false);
    }

    return (
        <>
            <Dialog open={showAuthentication} onClose={handleDialogClose}>
                <DialogTitle>Login to Google</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        In order to show your playlists, please login to Google and grant this app permission to view and modify your playlists.
                    </DialogContentText>
                    <Button onClick={handleLoginButtonClick}>Login</Button>
                    <Button onClick={handleDialogClose}>Cancel</Button>
                </DialogContent>
            </Dialog>
            <GoogleSigninButton onClick={handleLoginButtonClick} disabled={disabled} />
        </>
    );
}