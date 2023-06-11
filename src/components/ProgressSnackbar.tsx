import { CircularProgress, LinearProgress, Snackbar } from "@mui/material";
import { useMemo } from "react";
import LinearProgressWithPercentLabel from "./LinearProgressWithLabel";

export interface Props {
    /** Whether the snackbar is open */
    open: boolean;
    /** The value of the progress, for a determinate progress. Ranges from 0 to 100 */
    value?: number;
}

export default function ProgressSnackbar({open, value}: Props) {
    const progressBar = useMemo(() => {
        if (value === undefined) {
            return (
                <CircularProgress variant="indeterminate" />
            );
        } else {
            return (
                <CircularProgress variant="determinate" value={value} />
            );
        }
    }, [value]);
    return (
        <Snackbar open={open} message="Snackbar">
            {progressBar}
        </Snackbar>
        );
    // {/* <>
    //     Snackbar
    //     {progressBar}
    // </> */}
}