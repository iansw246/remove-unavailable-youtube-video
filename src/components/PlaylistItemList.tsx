import { Stack } from "@mui/material";
import { PlaylistItem } from "../utils/requestHelpers";
import PlaylistItemCard from "./PlaylistItemView";
import { PaperHover } from "./PaperHover";

export interface Props {
    items: PlaylistItem[]
}

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
                    <PlaylistItemCard playlistItem={item} key={item.etag}/>
                ))
            }
        </Stack>
    );
}