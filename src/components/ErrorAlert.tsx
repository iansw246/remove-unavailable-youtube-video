import { Alert, Icon, IconButton, IconButtonProps } from "@mui/material";

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
}