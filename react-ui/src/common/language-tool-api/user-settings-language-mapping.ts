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
      switch (userSettings.genderSymbol) {
        case "star":
          return languageCodes.genderStar;
        case "colon":
          return languageCodes.genderColon;
        case "underscore":
          return languageCodes.genderUnderscore;
        case "slash":
          return languageCodes.genderSlash;
        default:
          console.error(`Unmapped gender symbol "${userSettings.genderSymbol}", falling back to gender star`);
          return languageCodes.genderStar;
      }
    default:
      console.error(`Unmapped genderingType "${userSettings.genderingType}", falling back to "neutral"`);
      return languageCodes.neutral;
  }
}
