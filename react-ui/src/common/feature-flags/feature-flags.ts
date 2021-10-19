import { useState } from "react";
import { LocalStorageService } from "../local-storage/LocalStorageService";

export const isDebugPanelEnabled = true;

export const DefaultFeatureFlags = Object.freeze({
  grammarCheckAvailable: false,
  spellCheckAvailable: false,
  allowMultiCharGenderSymbol: false,
  maxReplacementsPerRuleMatch: 5,
  useBamLogo: true,
  minimumRequestDelayMs: 1000,
});

export type FeatureFlags = typeof DefaultFeatureFlags;

export const FeatureFlagsStorage = new LocalStorageService("inclusify_app_feature_flags", DefaultFeatureFlags, {});

export const useFeatureFlagsState: () => [FeatureFlags, (setState: (prevState: FeatureFlags) => FeatureFlags) => void] =
  () => {
    const [featureFlags, setFeatureFlags] = useState(FeatureFlagsStorage.load());
    const setFeatureFlagsWithSave = (setState: (prevState: FeatureFlags) => FeatureFlags) =>
      setFeatureFlags((prevFeatureFlags) => {
        const newFeatureFlags = setState(prevFeatureFlags);
        return FeatureFlagsStorage.save(newFeatureFlags);
      });
    return [featureFlags, setFeatureFlagsWithSave];
  };
