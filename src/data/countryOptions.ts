import COUNTRY_NAME_TO_CODE from "../data/countryCodes";

const DEFAULT_COUNTRY_CODE: string = "US";

export interface CountryType {
    label: string;
    code: string;
}

/**
 * 
 * @param countryNameToCode 
 * @returns Two element array where first element is an array of options, and the second is the default country
 */
function makeCountryOptions(countryNameToCode: Map<string, string>, defaultCountryCode: string): [CountryType[], CountryType | null] {
    /**
     * Should use for of loop over .entries() or .keys()
     * But to support older browsers, forEach is used instead.
     * Otherweise, we receive the error:
     * Type 'Generator<Element, void, unknown>' can only be iterated through when using the '--downlevelIteration' flag or with a '--target' of 'es2015' or higher.
     */
    const options: CountryType[] = [];
    let defaultOption: CountryType | null = null;
    countryNameToCode.forEach((countryCode, countryName) => {
        const newOption: CountryType = { label: countryName, code: countryCode };
        options.push(newOption);
        if (defaultOption === null && countryCode === defaultCountryCode) {
            defaultOption = newOption;
        }
    });
    return [options, defaultOption];
}

const [countryOptions, defaultCountryOption] = makeCountryOptions(COUNTRY_NAME_TO_CODE, DEFAULT_COUNTRY_CODE) as [CountryType[], CountryType];
if (defaultCountryOption === null) {
    throw new Error("defaultCountryOption should not be null");
}

export { DEFAULT_COUNTRY_CODE, countryOptions, defaultCountryOption };