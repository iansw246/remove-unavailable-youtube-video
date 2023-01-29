import { Autocomplete, TextField } from "@mui/material";
import regionListResponse from "../data/regions";

export interface Props {
    value: Region;
    onChange: (event: React.SyntheticEvent<Element, Event>, newValue: Region | null) => void | undefined;
}

export default function RegionSelector({ value, onChange }: Props) {
    return (
        <Autocomplete 
            options={regionListResponse.items}
            getOptionLabel={(option: Region) => option.snippet.name}
            autoHighlight
            value={value}
            renderInput={(params) => <TextField {...params} label="Region" />}
            onChange={onChange}
        />
    );
}