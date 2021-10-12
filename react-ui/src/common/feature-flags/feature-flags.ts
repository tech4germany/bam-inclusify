import { createContext, useState } from "react";
import { LocalStorageService } from "../local-storage/LocalStorageService";

export const isDebugPanelEnabled = true;

export const DefaultFeatureFlags = Object.freeze({
  grammarCheckAvailable: true,
  spellCheckAvailable: true,
  maxReplacementsPerRuleMatch: 5,
});

export type FeatureFlags = typeof DefaultFeatureFlags;

export const FeatureFlagsContext = createContext(DefaultFeatureFlags);

export const FeatureFlagsStorage = new LocalStorageService("inclusify_app_feature_flags", DefaultFeatureFlags, {});

export const useFeatureFlagsState: () => [FeatureFlags, (setState: (prevState: FeatureFlags) => FeatureFlags) => void] =
  () => {
    const [featureFlags, setFeatureFlags] = useState(FeatureFlagsStorage.load());
    const setFeatureFlagsWithSave = (setState: (prevState: FeatureFlags) => FeatureFlags) =>
      setFeatureFlags((prevFeatureFlags) => {
        const newFeatureFlags = setState(prevFeatureFlags);
        FeatureFlagsStorage.save(newFeatureFlags);
        return newFeatureFlags;
      });
    return [featureFlags, setFeatureFlagsWithSave];
  };
