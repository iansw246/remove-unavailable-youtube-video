import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { useMemo } from "react";

import COUNTRY_NAME_TO_CODE from "../data/countryCodes";

function createCountryMenuItems(countryNameToCode: Map<string, string>): JSX.Element[] {
    const result: JSX.Element[] = [];
    // Should use for of loop over .entries() or .keys()
    // But to support older browsers, forEach is used instead.
    // Otherweise, we receive the error:
    // Type 'Generator<Element, void, unknown>' can only be iterated through when using the '--downlevelIteration' flag or with a '--target' of 'es2015' or higher.
    countryNameToCode.forEach((countryCode, countryName) => {
        result.push(<MenuItem key={countryCode}>{countryName}</MenuItem>);
    });
    return result;
}

export default function CountrySelector() {
    const countryMenuItems: JSX.Element[] = useMemo(() => createCountryMenuItems(COUNTRY_NAME_TO_CODE), []);
    return (
        <FormControl>
            <InputLabel>Country</InputLabel>
            <Select>
                {countryMenuItems}
            </Select>
        </FormControl>
    );
}