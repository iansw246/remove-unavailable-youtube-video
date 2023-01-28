import { Autocomplete, TextField } from "@mui/material";
import { useMemo } from "react";
import { CountryType, countryOptions, DEFAULT_COUNTRY_CODE } from "../data/countryOptions";

export interface Props {
    value: CountryType;
    onChange: (event: React.SyntheticEvent<Element, Event>, newValue: CountryType | null) => void | undefined;
}

export default function CountrySelector({ value, onChange }: Props) {
    // const countryMenuItems: JSX.Element[] = useMemo(() => createCountryMenuItems(COUNTRY_NAME_TO_CODE), []);
    const defaultCountryOption = useMemo(() => {
        return countryOptions.find((option) => option.code === DEFAULT_COUNTRY_CODE);
    }, [countryOptions]);
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