import { createContext, useState } from "react";
import { DefaultFeatureFlags } from "../feature-flags/feature-flags";
import { LocalStorageService } from "../local-storage/LocalStorageService";
import { GenderingTypes, GenderSymbols, UserSettings } from "./user-settings";

const UserSettingsStorageId = "inclusify_app_user_settings";

export const DefaultUserSettings: UserSettings = Object.freeze({
  genderingType: "neutral",
  genderSymbol: "star",
  grammarCheckEnabled: DefaultFeatureFlags.grammarCheckAvailable,
  spellCheckEnabled: DefaultFeatureFlags.spellCheckAvailable,
});

export const UserSettingsStorage = new LocalStorageService(UserSettingsStorageId, DefaultUserSettings, {
  genderingType: (gt) => (GenderingTypes.includes(gt) ? gt : DefaultUserSettings.genderingType),
  genderSymbol: (gs) => (GenderSymbols.includes(gs) ? gs : DefaultUserSettings.genderSymbol),
});

export const useUserSettingsState: () => [UserSettings, (setState: (prevState: UserSettings) => UserSettings) => void] =
  () => {
    const [userSettings, setUserSettings] = useState(UserSettingsStorage.load());
    const setUserSettingsWithSave = (setState: (prevState: UserSettings) => UserSettings) =>
      setUserSettings((prevSettings) => {
        const newSettings = setState(prevSettings);
        return UserSettingsStorage.save(newSettings);
      });
    return [userSettings, setUserSettingsWithSave];
  };

export const UserSettingsContext = createContext(DefaultUserSettings);
