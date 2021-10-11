const genderingTypes = ["neutral", "double-notation", "internal-i", "gender-symbol"] as const;
export type GenderingType = typeof genderingTypes[number];
export const GenderingTypes = Object.freeze(genderingTypes);

const genderSymbols = ["star", "colon", "underscore", "slash"] as const;
export type GenderSymbol = typeof genderSymbols[number];
export const GenderSymbols = Object.freeze(genderSymbols);

export interface UserSettings {
  genderingType: GenderingType;
  genderSymbol: GenderSymbol;
  grammarCheckEnabled: boolean;
  spellCheckEnabled: boolean;
}
