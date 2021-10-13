import { FeatureFlags } from "../feature-flags/feature-flags";

const genderingTypes = ["neutral", "double-notation", "internal-i", "gender-symbol"] as const;
export type GenderingType = typeof genderingTypes[number];
export const GenderingTypes = Object.freeze(genderingTypes);

const genderSymbols = ["star", "colon", "custom"] as const;
export type GenderSymbol = typeof genderSymbols[number];
export const GenderSymbols = Object.freeze(genderSymbols);

export interface UserSettings {
  genderingType: GenderingType;
  genderSymbol: GenderSymbol;
  customGenderSymbol: string;
  grammarCheckEnabled: boolean;
  spellCheckEnabled: boolean;
}
export function isSpellCheckOn(userSettings: UserSettings, featureFlags: FeatureFlags): boolean {
  return userSettings.spellCheckEnabled && featureFlags.spellCheckAvailable;
}
export function isGrammarCheckOn(userSettings: UserSettings, featureFlags: FeatureFlags): boolean {
  return userSettings.grammarCheckEnabled && featureFlags.grammarCheckAvailable;
}
