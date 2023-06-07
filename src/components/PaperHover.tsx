import { Paper, styled } from "@mui/material";

export const PaperHover = styled(Paper)({
    padding: 1,
    ":hover": {
        backgroundColor: "rgba(0, 0, 0, 0.05)"
    },
    transition: "background-color 0.3s"
});