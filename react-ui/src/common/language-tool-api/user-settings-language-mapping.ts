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
  // TODO: for completeness' sake, we should use "replaceAll" instead of "replace" here. Even though
  // there will probably only ever be one gender star per word, we might have multi-word replacements
  // in the future, e.g. an article and noun like "der*die Beamt*in".
  // This is currently not using String.replaceAll because the Windows Word app uses an IE 11 webview for
  // add-ins (in certain constellations, see https://docs.microsoft.com/en-us/office/dev/add-ins/concepts/browsers-used-by-office-web-add-ins )
  // and @babel/preset-env used by CRA doesn't currently correctly polyfill String replaceAll
  // (see https://github.com/babel/babel/issues/13701 )
  return isString(value) ? value.replace(GENDER_STAR, genderSymbol) : value;
}

function removeDoubleNotation(value: string | undefined): string | undefined {
  return isString(value) && !value.includes(" und ") && !value.includes(" oder ") ? value : undefined;
}
function removeGenderStar(value: string | undefined): string | undefined {
  return isString(value) && !value.includes(GENDER_STAR) ? value : undefined;
}
