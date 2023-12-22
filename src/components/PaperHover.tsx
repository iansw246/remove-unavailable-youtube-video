import { Paper, styled } from "@mui/material";

export const PaperHover = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1),
  ":hover": {
    backgroundColor: theme.palette.grey[200],
  },
  transition: "background-color 0.2s",
}));
