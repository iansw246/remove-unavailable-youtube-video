import { Dialog, DialogTitle, DialogContent, CircularProgress } from "@mui/material"

export interface Props {
    open: boolean,
    progressValue?: number,
    progressTotal?: number,
    loadingMessage?: React.ReactNode
}

export default function LoadingDialog({open, progressValue, progressTotal, loadingMessage}: Props) {
    return (
        <Dialog open={open} fullWidth={true}>
            <DialogTitle textAlign="center">
                {loadingMessage}
            </DialogTitle>
            <DialogContent sx={{display: "flex", justifyContent: "center"}}>
                <CircularProgress
                    variant={progressValue ? "determinate" : "indeterminate"}
                    sx={{marginLeft: "auto", marginRight: "auto"}}
                    value={progressValue && progressTotal
                        ? Math.floor(progressValue / progressTotal * 100)
                        : 0}
                />
            </DialogContent>
        </Dialog>
    )
}