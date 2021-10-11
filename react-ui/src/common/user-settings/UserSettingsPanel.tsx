import React, { FC, useState } from "react";
import styled from "styled-components";
import { Colors } from "../Colors";

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
        disabled={userSettings.genderingType !== "gender-symbol"}
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

const UserSettingsPanelContainer = styled.div`
  background: white;
`;

const UserSettingsTitle = styled.h2``;

const DefaultSettingsExplanation = styled.div``;

const SettingsSectionTitle = styled.h3``;

const OptionListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
  margin: 1em;
`;

const OptionListOption = styled.label`
  display: block;
  font-size: 13px;
  padding: 7px;
  text-align: center;
  background: ${Colors.paleYellow};
  color: ${Colors.darkYellow};

  &:first-child {
    border-top-left-radius: 7px;
    border-top-right-radius: 7px;
  }

  &:last-child {
    border-bottom-left-radius: 7px;
    border-bottom-right-radius: 7px;
  }

  &.disabled {
    background: #eeeeee;
    color: gray;
  }

  &:not(.disabled) {
    &.selected {
      background: ${Colors.darkYellow};
      color: ${Colors.paleBlue};
    }

    &:not(.selected) {
      cursor: pointer;
      &:hover {
        background: ${Colors.evenPalerYellow};
      }
    }
  }
`;

const OptionListRadio = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
`;

interface OptionListProps<OptionIdType> {
  optionGroupId: string;
  options: { id: OptionIdType; label: string }[];
  optionState: [OptionIdType, (newOption: OptionIdType) => void];
  disabled?: boolean;
}
const OptionList = <OptionIdType extends unknown>({
  optionGroupId,
  options,
  optionState: [activeOption, setActiveOption],
  disabled,
}: OptionListProps<OptionIdType>) => (
  <OptionListContainer>
    {options.map(({ id, label }) => {
      const elementId = `${optionGroupId}+${id}`;
      return (
        <OptionListOption
          htmlFor={elementId}
          key={elementId}
          className={(activeOption === id ? "selected" : "") + " " + (!!disabled ? "disabled" : "")}
        >
          <OptionListRadio
            type="radio"
            name={optionGroupId}
            id={elementId}
            checked={activeOption === id}
            onChange={() => setActiveOption(id)}
            disabled={disabled}
          />
          <span>{label}</span>
        </OptionListOption>
      );
    })}
  </OptionListContainer>
);
