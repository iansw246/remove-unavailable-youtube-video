import { LinearProgress } from "@mui/material";
import LinearProgressWithPercentLabel from "./LinearProgressWithLabel";

export interface Props {
    isLoading: boolean;
    loadingProgress?: number;
    loadingTotal?: number;
}

export default function AdaptiveLinearProgress({ isLoading, loadingProgress, loadingTotal }: Props) {
    if (!isLoading) {
        return null;
    }
    if (loadingProgress === undefined || loadingTotal === undefined) {
        return (<LinearProgress variant="indeterminate" />);
    } else {
        return (<LinearProgressWithPercentLabel value={loadingProgress / loadingTotal * 100} />);
    }
}