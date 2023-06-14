import { Typography } from "@mui/material";
import { isRouteErrorResponse, useRouteError } from "react-router-dom";

export default function ErrorPage() {
    const error = useRouteError();
    if (isRouteErrorResponse(error)) {
        return (
            <main>
                <Typography variant="h1">Error</Typography>
                <Typography>An error has occured: </Typography>
                <Typography>{error.status}: {error.statusText}</Typography>
                <Typography>{error.data}</Typography>
            </main>
        );
    } else {
        return (
            <main>
                <Typography variant="h1">Error</Typography>
                <Typography>An unknown error has occured.</Typography>
            </main>
        )
    }
}