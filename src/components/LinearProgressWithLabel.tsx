import { Box, LinearProgress, LinearProgressProps, Typography } from "@mui/material";

export type Props = Omit<LinearProgressProps, "value"> & Required<Pick<LinearProgressProps, "value">>;

export default function LinearProgressWithPercentLabel({ variant = "determinate", value, ...rest }: Props) {
    return (
        <Box display="flex" sx={{alignItems: "center"}}>
            <LinearProgress variant={variant} {...rest} value={value} sx={{flex: "1", mr: 2}} />
            <Typography variant="body2" color="text.secondary" component="span">{Math.round(value)}%</Typography>
        </Box>
    )
}