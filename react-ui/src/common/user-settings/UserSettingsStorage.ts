import { useState } from "react";
import { DefaultFeatureFlags } from "../feature-flags/feature-flags";
import { LocalStorageService } from "../local-storage/LocalStorageService";
import { GenderingTypes, GenderSymbols, UserSettings } from "./user-settings";

const UserSettingsStorageId = "inclusify_app_user_settings";

export const DefaultUserSettings: UserSettings = Object.freeze({
  genderingType: DefaultFeatureFlags.isBamBuild ? "gender-symbol" : "double-notation",
  genderSymbol: "star",
  customGenderSymbol: "",
  grammarCheckEnabled: true,
  spellCheckEnabled: true,
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
