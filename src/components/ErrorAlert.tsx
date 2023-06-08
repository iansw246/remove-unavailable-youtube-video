import { Collapse, Alert, AlertTitle, Typography, IconButton, IconButtonProps, Icon } from "@mui/material";
import { error } from "console";
import { isUnauthenticated } from "../utils/requestHelpers";

export interface Props {
    error?: any;
    onClose?: IconButtonProps["onClick"];
    children?: React.ReactNode;
}

export default function ErrorAlert({ error, onClose, children }: Props) {
    return (<Alert severity="error" action={
            <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={onClose}
            ><Icon fontSize="inherit">close</Icon></IconButton>
        }>
            {children}
        </Alert>
    );
    // {/* {error && <Typography>An error has occured: {JSON.stringify(error)}</Typography>} */}
}