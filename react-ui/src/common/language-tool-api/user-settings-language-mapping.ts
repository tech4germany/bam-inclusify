import { UserSettings } from "../user-settings/user-settings";

const deLanguagePrefix = "de-DE-x-";
const genderingVariantsPrefix = deLanguagePrefix + "diversity";

const languageCodes = Object.freeze({
  neutral: genderingVariantsPrefix,
  doubleNotation: genderingVariantsPrefix + "-double",
  internalI: genderingVariantsPrefix + "-internal-i",
  genderStar: genderingVariantsPrefix + "-star",
  genderColon: genderingVariantsPrefix + "-colon",
  genderUnderscore: genderingVariantsPrefix + "-underscore",
  genderSlash: genderingVariantsPrefix + "-slash",
  genderInterpunct: genderingVariantsPrefix + "-interpunct",
});

export function mapUserSettingsToLanguage(userSettings: UserSettings): string {
  switch (userSettings.genderingType) {
    case "neutral":
      return languageCodes.neutral;
    case "double-notation":
      return languageCodes.doubleNotation;
    case "internal-i":
      return languageCodes.internalI;
    case "gender-symbol":
      return languageCodes.genderStar;
    default:
      console.error(`Unmapped genderingType "${userSettings.genderingType}", falling back to "neutral"`);
      return languageCodes.neutral;
  }
}

export function mapUserSettingsToReplacementPostProcessing(
  userSettings: UserSettings
): (value: string | undefined) => string | undefined {
  if (userSettings.genderingType !== "gender-symbol") return identity;
  if (userSettings.genderSymbol === "star") return identity;
  const customSymbol = userSettings.genderSymbol === "colon" ? ":" : userSettings.customGenderSymbol;
  return (value) => (typeof value === "string" ? value.replaceAll("*", customSymbol) : value);
}

function identity(value: string | undefined): string | undefined {
  return value;
}
