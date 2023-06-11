import { LinearProgress } from "@mui/material";
import LinearProgressWithPercentLabel from "./LinearProgressWithLabel";

export interface Props {
    loadingProgress?: number;
    loadingTotal?: number;
}

export default function AdaptiveLinearProgress({ loadingProgress, loadingTotal }: Props) {
    if (loadingProgress === undefined || loadingTotal === undefined) {
        return (<LinearProgress variant="indeterminate" />);
    } else {
        return (<LinearProgressWithPercentLabel value={loadingProgress / loadingTotal * 100} />);
    }
}