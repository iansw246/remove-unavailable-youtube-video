import { Paper, Stack, styled } from "@mui/material";
import { PlaylistItem } from "../utils/requestHelpers";
import PlaylistItemView from "./PlaylistItemView";

export interface Props {
    items: PlaylistItem[]
}

const PaperHover = styled(Paper)({
    padding: 1,
    ":hover": {
        backgroundColor: "rgba(0, 0, 0, 0.05)"
    },
    transition: "background-color 0.3s"
})

export default function PlaylistItemList({ items }: Props) {
    return (
        <Stack spacing={2}>
            {items
                .filter((item): item is Required<PlaylistItem> =>
                    item !== undefined
                    && item.contentDetails !== undefined
                    && item.etag !== undefined
                    && item.id !== undefined
                    && item.kind !== undefined
                    && item.snippet !== undefined
                    && item.status !== undefined
                ).map((item: Required<PlaylistItem>) => (
                    <PaperHover key={item.id}>
                        <PlaylistItemView playlistItem={item} />
                    </PaperHover>
                ))
            }
        </Stack>
    );
}