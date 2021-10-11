import { useState } from "react";
import { FeatureFlags } from "../feature-flags/feature-flags";

export type GenderingType = "neutral" | "double-notation" | "internal-i" | "gender-symbol";
export type GenderSymbol = "star" | "colon" | "underscore" | "slash";
export interface UserSettings {
  genderingType: GenderingType;
  genderSymbol: GenderSymbol;
  grammarCheckEnabled: boolean;
  spellCheckEnabled: boolean;
}

const DefaultUserSettings: UserSettings = {
  genderingType: "neutral",
  genderSymbol: "star",
  grammarCheckEnabled: FeatureFlags.grammarCheckAvailable,
  spellCheckEnabled: FeatureFlags.spellCheckAvailable,
};

export const useUserSettingsState: () => [UserSettings, React.Dispatch<React.SetStateAction<UserSettings>>] = () =>
  useState(DefaultUserSettings);
