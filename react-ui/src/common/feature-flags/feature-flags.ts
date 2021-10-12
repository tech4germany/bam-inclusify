import { createContext } from "react";

export const isDebugPanelEnabled = true;

export const DefaultFeatureFlags = Object.freeze({
  grammarCheckAvailable: true,
  spellCheckAvailable: true,
  maxReplacementsPerRuleMatch: 5,
});

export type FeatureFlags = typeof DefaultFeatureFlags;

export const FeatureFlagsContext = createContext(DefaultFeatureFlags);
