export type GenderingType = "neutral" | "double-notation" | "internal-i" | "gender-symbol";
export type GenderSymbol = "star" | "colon" | "underscore" | "slash";
export interface UserSettings {
  genderingType: GenderingType;
  genderSymbol: GenderSymbol;
  grammarCheckEnabled: boolean;
  spellCheckEnabled: boolean;
}
