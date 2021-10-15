import { isString } from "../type-helpers";
import { UserSettings } from "../user-settings/user-settings";

const GENDER_STAR = "*";

export function mapUserSettingsToReplacementPostProcessing(
  userSettings: UserSettings
): (value: string | undefined) => string | undefined {
  if (userSettings.genderingType === "neutral") return mapNeutral;
  if (userSettings.genderingType === "double-notation") return removeGenderStar;
  if (userSettings.genderingType === "internal-i") return mapInternalI;

  const customSymbol =
    userSettings.genderSymbol === "star"
      ? GENDER_STAR
      : userSettings.genderSymbol === "colon"
      ? ":"
      : userSettings.customGenderSymbol;
  return (value) => mapGenderSymbol(value, customSymbol);
}

function mapNeutral(value: string | undefined): string | undefined {
  return removeGenderStar(removeDoubleNotation(value));
}

function mapInternalI(originalValue: string | undefined): string | undefined {
  const value = removeDoubleNotation(originalValue);
  return isString(value) ? value.replace(GENDER_STAR + "i", "I") : undefined;
}

function mapGenderSymbol(originalValue: string | undefined, genderSymbol: string): string | undefined {
  const value = removeDoubleNotation(originalValue);
  return isString(value) ? value.replaceAll(GENDER_STAR, genderSymbol) : value;
}

function removeDoubleNotation(value: string | undefined): string | undefined {
  return isString(value) && !value.includes(" und ") && !value.includes(" bzw. ") ? value : undefined;
}
function removeGenderStar(value: string | undefined): string | undefined {
  return isString(value) && !value.includes(GENDER_STAR) ? value : undefined;
}
