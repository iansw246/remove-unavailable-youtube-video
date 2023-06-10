import { Box, LinearProgress, LinearProgressProps, Typography } from "@mui/material";

export type Props = Omit<LinearProgressProps, "value"> & Required<Pick<LinearProgressProps, "value">>;

export default function LinearProgressWithPercentLabel({ variant = "determinate", value, ...rest }: Props) {
    return (
        <Box>
            <Box>
                <LinearProgress variant={variant} {...rest} />
            </Box>
            <Box>
                <Typography variant="body2" color="text.secondary">{Math.round(value)}%</Typography>
            </Box>
        </Box>
    )
}