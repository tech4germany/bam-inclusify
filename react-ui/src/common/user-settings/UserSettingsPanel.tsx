import React, { FC, useState } from "react";
import styled from "styled-components";

type GenderingType = "neutral" | "double-notation" | "internal-i" | "gender-symbol";
type GenderSymbol = "star" | "colon" | "underscore" | "slash";
interface UserSettings {
  genderingType: GenderingType;
  genderSymbol: GenderSymbol;
  grammarCheckEnabled: boolean;
  spellCheckEnabled: boolean;
}

const DefaultUserSettings: UserSettings = {
  genderingType: "neutral",
  genderSymbol: "star",
  grammarCheckEnabled: false,
  spellCheckEnabled: false,
};

type OptionListOption<T> = { id: T; label: string };

const genderingTypes: OptionListOption<GenderingType>[] = [
  { id: "neutral", label: "Neutral" },
  { id: "double-notation", label: "Doppelnennung" },
  { id: "internal-i", label: "Binnen-I" },
  { id: "gender-symbol", label: "Gendersymbol" },
];

const genderSymbols: OptionListOption<GenderSymbol>[] = [
  { id: "star", label: "Sternchen" },
  { id: "colon", label: "Doppelpunkt" },
  { id: "underscore", label: "Unterstrich" },
  { id: "slash", label: "Schrägstrich" },
];

export const UserSettingsPanel: FC = () => {
  const [userSettings, setUserSettings] = useState(DefaultUserSettings);

  return (
    <UserSettingsPanelContainer>
      <UserSettingsTitle>Einstellungen</UserSettingsTitle>
      <DefaultSettingsExplanation>
        Standardeinstellungen basieren auf dem BAM Leitfaden für diversitätsensible Sprache.
      </DefaultSettingsExplanation>
      <SettingsSectionTitle>Gendersprache</SettingsSectionTitle>
      <OptionList
        optionGroupId="genderingType"
        options={genderingTypes}
        optionState={[
          userSettings.genderingType,
          (genderingType) => setUserSettings((oldSettings) => ({ ...oldSettings, genderingType })),
        ]}
      />
      <OptionList
        optionGroupId="genderSymbol"
        options={genderSymbols}
        optionState={[
          userSettings.genderSymbol,
          (genderSymbol) => setUserSettings((oldSettings) => ({ ...oldSettings, genderSymbol })),
        ]}
      />
      <SettingsSectionTitle>Grammatikkorrektur</SettingsSectionTitle>
      <OptionList
        optionGroupId="grammarCheckEnabled"
        options={[
          { id: true, label: "Aktiviert" },
          { id: false, label: "Deaktiviert" },
        ]}
        optionState={[
          userSettings.grammarCheckEnabled,
          (grammarCheckEnabled) => setUserSettings((oldSettings) => ({ ...oldSettings, grammarCheckEnabled })),
        ]}
      />
      <SettingsSectionTitle>Rechtschreibkorrektur</SettingsSectionTitle>
      <OptionList
        optionGroupId="spellCheckEnabled"
        options={[
          { id: true, label: "Aktiviert" },
          { id: false, label: "Deaktiviert" },
        ]}
        optionState={[
          userSettings.spellCheckEnabled,
          (spellCheckEnabled) => setUserSettings((oldSettings) => ({ ...userSettings, spellCheckEnabled })),
        ]}
      />
    </UserSettingsPanelContainer>
  );
};

const UserSettingsPanelContainer = styled.div``;

const UserSettingsTitle = styled.h2``;

const DefaultSettingsExplanation = styled.div``;

const SettingsSectionTitle = styled.h3``;

const OptionListContainer = styled.div``;

interface OptionListProps<OptionIdType> {
  optionGroupId: string;
  options: { id: OptionIdType; label: string }[];
  optionState: [OptionIdType, (newOption: OptionIdType) => void];
}
const OptionList = <OptionIdType extends unknown>({
  optionGroupId,
  options,
  optionState: [activeOption, setActiveOption],
}: OptionListProps<OptionIdType>) => (
  <OptionListContainer>
    {options.map(({ id, label }) => {
      const elementId = `${optionGroupId}+${id}`;
      return (
        <div key={elementId}>
          <input
            type="radio"
            name={optionGroupId}
            id={elementId}
            checked={activeOption === id}
            onChange={() => setActiveOption(id)}
          />
          <label htmlFor={elementId}>{label}</label>
        </div>
      );
    })}
  </OptionListContainer>
);
