import { Typography, TypographyProps } from "@mui/material";

export default function HeadingsTest() {
    const variants: TypographyProps["variant"][] = [
        "h1", "h2", "h3", "h4", "h5", "h6"
    ];

    return (
        <div>
            {variants.map((variant) => {
                return (
                    <Typography key={variant} variant={variant}>{variant}</Typography>
                );
            })}
        </div>
    )
}