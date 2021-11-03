import { useState } from "react";
import { LocalStorageService } from "../local-storage/LocalStorageService";

export const isDebugPanelEnabled =
  process.env.NODE_ENV === "development" || process.env.REACT_APP_ENABLE_DEBUG_PANEL === "1";

export const DefaultFeatureFlags = Object.freeze({
  grammarCheckAvailable: false,
  spellCheckAvailable: false,
  allowMultiCharGenderSymbol: false,
  maxReplacementsPerRuleMatch: 5,
  isBamBuild: process.env.REACT_APP_BUILD_FOR_BAM === "1",
  minimumRequestDelayMs: 0,
  apiBaseUrl: "/v2",
  showIgnoreButton: false,
});

export type FeatureFlags = typeof DefaultFeatureFlags;

export const FeatureFlagsStorage = new LocalStorageService("inclusify_app_feature_flags", DefaultFeatureFlags, {});

export const useFeatureFlagsState: () => [FeatureFlags, (setState: (prevState: FeatureFlags) => FeatureFlags) => void] =
  () => {
    const [featureFlags, setFeatureFlags] = useState(FeatureFlagsStorage.load());
    if (!isDebugPanelEnabled) {
      return [DefaultFeatureFlags, () => {}];
    }
    const setFeatureFlagsWithSave = (setState: (prevState: FeatureFlags) => FeatureFlags) =>
      setFeatureFlags((prevFeatureFlags) => {
        const newFeatureFlags = setState(prevFeatureFlags);
        return FeatureFlagsStorage.save(newFeatureFlags);
      });
    return [featureFlags, setFeatureFlagsWithSave];
  };
