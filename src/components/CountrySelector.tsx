import { Autocomplete, TextField } from "@mui/material";
import { CountryType, countryOptions } from "../data/countryOptions";

export interface Props {
    value: CountryType;
    onChange: (event: React.SyntheticEvent<Element, Event>, newValue: CountryType | null) => void | undefined;
}

export default function CountrySelector({ value, onChange }: Props) {
    return (
        <Autocomplete 
            options={countryOptions}
            autoHighlight
            value={value}
            renderInput={(params) => <TextField {...params} label="Country" />}
            onChange={onChange}
        />
    );
}