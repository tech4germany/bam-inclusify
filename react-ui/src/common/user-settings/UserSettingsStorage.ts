import { useState } from "react";
import { DefaultFeatureFlags } from "../feature-flags/feature-flags";
import { GenderingTypes, GenderSymbols, UserSettings } from "./user-settings";

const UserSettingsStorageId = "inclusify_app_user_settings";

const DefaultUserSettings: UserSettings = {
  genderingType: "neutral",
  genderSymbol: "star",
  grammarCheckEnabled: DefaultFeatureFlags.grammarCheckAvailable,
  spellCheckEnabled: DefaultFeatureFlags.spellCheckAvailable,
};

class UserSettingsStorageService {
  load(): UserSettings {
    const loadedValue = localStorage.getItem(UserSettingsStorageId);
    if (loadedValue === null) return DefaultUserSettings;
    return this.normalize(JSON.parse(loadedValue));
  }

  save(userSettings: UserSettings): void {
    localStorage.setItem(UserSettingsStorageId, JSON.stringify(this.normalize(userSettings)));
  }

  private normalize(userSettings: UserSettings): UserSettings {
    const normalizedEntries = Object.keys(DefaultUserSettings).map((k) => [k, (userSettings as any)[k]]);
    const normalizedUserSettings = Object.fromEntries(normalizedEntries) as UserSettings;
    return {
      ...normalizedUserSettings,
      genderingType: GenderingTypes.includes(normalizedUserSettings.genderingType)
        ? normalizedUserSettings.genderingType
        : DefaultUserSettings.genderingType,
      genderSymbol: GenderSymbols.includes(normalizedUserSettings.genderSymbol)
        ? normalizedUserSettings.genderSymbol
        : DefaultUserSettings.genderSymbol,
    };
  }
}

export const UserSettingsStorage = new UserSettingsStorageService();

export const useUserSettingsState: () => [UserSettings, (setState: (prevState: UserSettings) => UserSettings) => void] =
  () => {
    const [userSettings, setUserSettings] = useState(UserSettingsStorage.load());
    const setUserSettingsWithSave = (setState: (prevState: UserSettings) => UserSettings) =>
      setUserSettings((prevSettings) => {
        const newSettings = setState(prevSettings);
        UserSettingsStorage.save(newSettings);
        return newSettings;
      });
    return [userSettings, setUserSettingsWithSave];
  };
