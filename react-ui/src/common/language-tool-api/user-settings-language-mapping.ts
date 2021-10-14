import { UserSettings } from "../user-settings/user-settings";

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
