import { Autocomplete, AutocompleteProps, TextField } from "@mui/material";
import { useMemo } from "react";

import COUNTRY_NAME_TO_CODE from "../data/countryCodes";

const DEFAULT_COUNTRY_CODE: string = "US";

interface CountryType {
    label: string;
    code: string;
}

function makeCountryOptions(countryNameToCode: Map<string, string>): CountryType[] {
    /**
     * Should use for of loop over .entries() or .keys()
     * But to support older browsers, forEach is used instead.
     * Otherweise, we receive the error:
     * Type 'Generator<Element, void, unknown>' can only be iterated through when using the '--downlevelIteration' flag or with a '--target' of 'es2015' or higher.
     */
    const options: CountryType[] = [];
    countryNameToCode.forEach((countryCode, countryName) => {
        options.push({ label: countryName, code: countryCode });
    });
    return options;
}

export default function CountrySelector() {
    // const countryMenuItems: JSX.Element[] = useMemo(() => createCountryMenuItems(COUNTRY_NAME_TO_CODE), []);
    const countryOptions = useMemo(() => {
        return makeCountryOptions(COUNTRY_NAME_TO_CODE);
    }, []);
    const defaultCountryOption = useMemo(() => {
        return countryOptions.find((option) => option.code === DEFAULT_COUNTRY_CODE);
    }, [countryOptions]);
    return (
        <Autocomplete 
            options={countryOptions}
            autoHighlight
            defaultValue={defaultCountryOption}
            renderInput={(params) => <TextField {...params} label="Country" />}
        />
    );
}