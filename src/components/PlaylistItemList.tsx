import { Box, Checkbox, FormControlLabel, Stack, Typography } from "@mui/material";
import { PlaylistItem } from "../utils/requestHelpers";
import PlaylistItemCard from "./PlaylistItemCard";
import { StackProps } from "@mui/material/Stack"
import PlaylistItemCardCheckBox from "./PlaylistItemCardCheckBox";
import { useState } from "react";

export interface Props extends StackProps {
    items: PlaylistItem[];
    showCheckboxes?: boolean;
    onSelectionChanged?: (selectedItems: PlaylistItem[]) => void;
}

enum CheckAllCheckboxState {
    CHECKED,
    UNCHECKED,
    INDETERMINATE,
}

/**
 * Requires that all playlist items are unique
 * To reset the checkbox selection and prevent weird bugs, make sure to change the key
 * when changing items. A good idea is to make the key use the selected playlist id
 * It's important to only change the key when items has the correct contents
 * Otherwise, it will state the initial state to an incorrect size and won't change
 * @param param0 
 * @returns 
 */
export default function PlaylistItemList({ items, showCheckboxes = false, onSelectionChanged, ...rest }: Props) {
    const [checkedPlaylistItems, setCheckedPlaylistItems] = useState<boolean[]>(() => {
        return Array(items.length).fill(false);
    });

    const [checkAllCheckboxState, setCheckAllCheckboxState] = useState<CheckAllCheckboxState>(CheckAllCheckboxState.UNCHECKED);

    function handleCheckAllPlaylistItemsButtonClick() {
        switch (checkAllCheckboxState) {
            case CheckAllCheckboxState.INDETERMINATE:
            case CheckAllCheckboxState.CHECKED:
                setCheckedPlaylistItems(Array(items.length).fill(false));
                setCheckAllCheckboxState(CheckAllCheckboxState.UNCHECKED);
                break;
            case CheckAllCheckboxState.UNCHECKED:
                setCheckedPlaylistItems(Array(items.length).fill(true));
                setCheckAllCheckboxState(CheckAllCheckboxState.CHECKED);
                break;
        }
    }

    return (
        <Box>
            { showCheckboxes
                ? <>
                    <Box ml="auto" mr={5.5} width="fit-content" display="flex" flexDirection="column" alignItems="flex-end">
                        <Typography>
                            Remove video?
                        </Typography>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    onChange={() => handleCheckAllPlaylistItemsButtonClick()}
                                    checked={checkAllCheckboxState === CheckAllCheckboxState.CHECKED}
                                    indeterminate={checkAllCheckboxState === CheckAllCheckboxState.INDETERMINATE}
                                />
                            }
                            label="Select All"
                            labelPlacement="start"
                        />
                    </Box>
                </>
                : null
            }
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
                        ).map((item: Required<PlaylistItem>, i) => (
                        showCheckboxes
                            ? (<PlaylistItemCardCheckBox
                                    playlistItem={item}
                                    key={item.id}
                                    checked={checkedPlaylistItems[i]}
                                    onChange={(e) => {
                                        if (e.currentTarget.checked === checkedPlaylistItems[i]) {
                                            return;
                                        }
                                        const newCheckedItems = [...checkedPlaylistItems];
                                        newCheckedItems[i] = e.currentTarget.checked;
                                        setCheckedPlaylistItems(newCheckedItems);

                                        if (newCheckedItems.every(item => item)) {
                                            // All true
                                            setCheckAllCheckboxState(CheckAllCheckboxState.CHECKED);
                                        } else if (newCheckedItems.every(item => !item)) {
                                            setCheckAllCheckboxState(CheckAllCheckboxState.UNCHECKED);
                                        } else {
                                            setCheckAllCheckboxState(CheckAllCheckboxState.INDETERMINATE);
                                        }


                                        if (onSelectionChanged) {
                                            onSelectionChanged(items.filter((_, j) => newCheckedItems[j]));
                                        }
                                    }}
                                />)
                            : (<PlaylistItemCard playlistItem={item} key={item.id} />)
                            ))
                }
            </Stack>
        </Box>
    );
}