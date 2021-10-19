import { createContext } from "react";
import { DefaultFeatureFlags } from "./feature-flags/feature-flags";
import { DefaultUserSettings } from "./user-settings/UserSettingsStorage";

export const UserSettingsAndFeatureFlagsContext = createContext({
  userSettings: DefaultUserSettings,
  featureFlags: DefaultFeatureFlags,
});
