import { Stack } from "@mui/material";
import { PlaylistItem } from "../utils/requestHelpers";
import PlaylistItemCard from "./PlaylistItemView";
import { StackProps } from "@mui/material/Stack"

export interface Props extends StackProps {
    items: PlaylistItem[];
} 

/**
 * Requires that all playlist items are unique
 * @param param0 
 * @returns 
 */
export default function PlaylistItemList({ items, ...rest }: Props) {
    return (
        <Stack spacing={2} {...rest}>
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
                    <PlaylistItemCard playlistItem={item} key={item.id}/>
                ))
            }
        </Stack>
    );
}