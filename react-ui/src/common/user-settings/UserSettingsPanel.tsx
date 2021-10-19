import React, { FC } from "react";
import styled from "styled-components";
import { Colors } from "../styles/Colors";
import { GenderingType, GenderSymbol, UserSettings } from "./user-settings";
import { Fonts } from "../styles/Fonts";
import { GearIcon } from "../icons";
import { DefaultUserSettings } from "./UserSettingsStorage";
import { UserSettingsAndFeatureFlagsContext } from "../UserSettingsAndFeatureFlagsContext";

type OptionListEntryInfo<T> = { id: T; label: string };

const genderingTypes: OptionListEntryInfo<GenderingType>[] = [
  { id: "neutral", label: "Neutral" },
  { id: "double-notation", label: "Doppelnennung" },
  { id: "internal-i", label: "Binnen-I" },
  { id: "gender-symbol", label: "Gendersymbol" },
];

const genderSymbols: OptionListEntryInfo<GenderSymbol>[] = [
  { id: "star", label: "Sternchen" },
  { id: "colon", label: "Doppelpunkt" },
  { id: "custom", label: "Eigene" },
];

export interface UserSettingsPanelProps {
  userSettingsState: [UserSettings, (setState: (prevState: UserSettings) => UserSettings) => void];
  onConfirmClicked: () => void;
}
export const UserSettingsPanel: FC<UserSettingsPanelProps> = ({ userSettingsState, onConfirmClicked }) => {
  const [userSettings, setUserSettings] = userSettingsState;

  return (
    <UserSettingsAndFeatureFlagsContext.Consumer>
      {({ featureFlags }) => (
        <UserSettingsPanelContainer>
          <UserSettingsTitle>Einstellungen</UserSettingsTitle>
          <UserSettingsContent>
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
            <HorizontalOptionList
              optionGroupId="genderSymbol"
              options={genderSymbols}
              optionState={[
                userSettings.genderSymbol,
                (genderSymbol) => setUserSettings((oldSettings) => ({ ...oldSettings, genderSymbol })),
              ]}
              disabled={userSettings.genderingType !== "gender-symbol"}
            />
            <CustomGenderSymbolInput
              type="text"
              placeholder="Symbol einfügen..."
              value={userSettings.customGenderSymbol}
              minLength={1}
              maxLength={featureFlags.allowMultiCharGenderSymbol ? undefined : 1}
              spellCheck={false}
              autoCorrect="off"
              disabled={userSettings.genderingType !== "gender-symbol" || userSettings.genderSymbol !== "custom"}
              onChange={(e) =>
                setUserSettings((oldSettings) => ({ ...oldSettings, customGenderSymbol: e.target.value }))
              }
            />
            <GenderedExample userSettings={userSettingsState[0]} />
            {featureFlags.grammarCheckAvailable && (
              <>
                <SettingsSectionTitle>Grammatikkorrektur</SettingsSectionTitle>
                <OptionList
                  optionGroupId="grammarCheckEnabled"
                  options={[
                    { id: true, label: "Aktiviert" },
                    { id: false, label: "Deaktiviert" },
                  ]}
                  optionState={[
                    userSettings.grammarCheckEnabled,
                    (grammarCheckEnabled) =>
                      setUserSettings((oldSettings) => ({ ...oldSettings, grammarCheckEnabled })),
                  ]}
                />
              </>
            )}
            {featureFlags.spellCheckAvailable && (
              <>
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
              </>
            )}
            <ConfirmButtonBar>
              <ResetButton
                title="Auf Standardeinstellungen zurücksetzen"
                onClick={() => setUserSettings(() => DefaultUserSettings)}
              >
                Zurücksetzen
              </ResetButton>
              <ConfirmButton onClick={() => onConfirmClicked()}>Fertig</ConfirmButton>
            </ConfirmButtonBar>
          </UserSettingsContent>
        </UserSettingsPanelContainer>
      )}
    </UserSettingsAndFeatureFlagsContext.Consumer>
  );
};

const UserSettingsPanelContainer = styled.div`
  background: white;
  box-shadow: 0px 3px 6px #00000029;
  border-radius: 20px 0px 20px 20px;
`;

const UserSettingsTitle: FC = ({ children }) => (
  <UserSettingsTitleContainer>
    <UserSettingsTitleText>{children}</UserSettingsTitleText>
    <UserSettingsTitleIcon />
  </UserSettingsTitleContainer>
);
const UserSettingsTitleContainer = styled.div`
  padding: 10px 10px 10px 16px;
  background: transparent linear-gradient(90deg, ${Colors.mediumYellow} 0%, ${Colors.darkYellow} 100%) 0% 0% no-repeat
    padding-box;
  color: white;
  border-radius: 20px 0px 0px 0px;
  margin: 0;
  display: flex;
`;
const UserSettingsTitleText = styled.h2`
  font-size: 20px;
  font-style: italic;
  font-family: ${Fonts.main.family};
  font-weight: ${Fonts.main.weights.bold};
  line-height: 24px;
  letter-spacing: 0px;
  flex-grow: 1;
  margin: 0;
`;
const UserSettingsTitleIcon = styled(GearIcon)`
  fill: currentColor;
  width: 24px;
  height: 24px;
`;

const UserSettingsContent = styled.div`
  padding: 10px 14px 16px;
  display: flex;
  flex-direction: column;
`;

const DefaultSettingsExplanation = styled.div`
  font-size: 13px;
  line-height: 16px;
  font-style: italic;
  letter-spacing: 0px;
  font-family: ${Fonts.bam.family};
  font-weight: ${Fonts.bam.weights.bold};
  color: ${Colors.darkYellow};
`;

const SettingsSectionTitle = styled.h3`
  font-size: 15px;
  line-height: 18px;
  letter-spacing: 0px;
  margin: 9px 0;
  font-family: ${Fonts.bam.family};
  font-weight: ${Fonts.bam.weights.bold};
`;

const OptionListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;

  /* border: 1px solid white;
  border-radius: 7px;
  &:focus-within {
    outline: 2px solid ${Colors.darkYellow};
  } */
`;
const HorizontalOptionListContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1px;
  margin-top: 10px;

  /* border: 1px solid white;
  border-radius: 7px;
  &:focus-within {
    outline: 2px solid ${Colors.darkYellow};
  } */
`;

const BaseOptionListOption = styled.label`
  display: block;
  font-size: 13px;
  padding: 7px;
  text-align: center;
  background: ${Colors.paleYellow};
  color: ${Colors.darkYellow};

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

const OptionListOption = styled(BaseOptionListOption)`
  &:first-child {
    border-top-left-radius: 7px;
    border-top-right-radius: 7px;
  }

  &:last-child {
    border-bottom-left-radius: 7px;
    border-bottom-right-radius: 7px;
  }
`;
const HorizontalOptionListOption = styled(BaseOptionListOption)`
  flex-grow: 1;
  flex-basis: 0;
  &:first-child {
    border-top-left-radius: 7px;
    border-bottom-left-radius: 7px;
  }

  &:last-child {
    border-top-right-radius: 7px;
    border-bottom-right-radius: 7px;
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
const HorizontalOptionList = <OptionIdType extends unknown>({
  optionGroupId,
  options,
  optionState: [activeOption, setActiveOption],
  disabled,
}: OptionListProps<OptionIdType>) => (
  <HorizontalOptionListContainer>
    {options.map(({ id, label }) => {
      const elementId = `${optionGroupId}+${id}`;
      return (
        <HorizontalOptionListOption
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
        </HorizontalOptionListOption>
      );
    })}
  </HorizontalOptionListContainer>
);

const CustomGenderSymbolInput = styled.input`
  display: block;
  background: #f5f4f4;
  border: none;
  border-radius: 3px;
  font-size: 10px;
  padding: 7px;
  color: #3a3a3a;
  margin-top: 10px;

  &::placeholder {
    font-style: italic;
    color: #7c7c7c;
  }

  &[disabled] {
    opacity: 0.5;
  }
`;

const ConfirmButtonBar = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  gap: 5px;
`;
const ResetButton = styled.button`
  background: white;
  border: 1px solid ${Colors.darkYellow};
  border-radius: 5px;
  font-family: ${Fonts.main.family};
  font-weight: ${Fonts.main.weights.bold};
  font-size: 13px;
  color: ${Colors.darkYellow};
  padding: 7px 14px;

  &:hover {
    background: ${Colors.paleYellow};
  }
`;

const ConfirmButton = styled.button`
  background: ${Colors.darkYellow};
  border-radius: 5px;
  font-family: ${Fonts.main.family};
  font-weight: ${Fonts.main.weights.bold};
  font-size: 13px;
  color: white;
  border: none;
  padding: 7px 14px;

  &:hover {
    background: ${Colors.mediumYellow};
  }
`;

const GenderedExampleContainer = styled.div`
  display: flex;
  gap: 1ch;
  font-size: 13px;
  line-height: 16px;
  letter-spacing: 0;
  margin-top: 5px;
`;
const GenderedExampleTitle = styled.div`
  font-family: ${Fonts.bam.family};
  font-weight: ${Fonts.bam.weights.bold};
`;
const GenderedExampleList = styled.div`
  display: flex;
  flex-direction: column;
  font-family: ${Fonts.bam.family};
  font-weight: ${Fonts.main.weights.normal};
`;
const GenderedExamplePair = styled.div``;
const GenderedExampleBad = styled.span`
  text-decoration: line-through;
`;
const GenderedExampleGood = styled.span`
  font-style: italic;
`;
const GenderedExample: FC<{ userSettings: UserSettings }> = ({ userSettings }) => {
  const [nutzerGood, kollegenGood] = genderedExamples(userSettings);
  return (
    <GenderedExampleContainer>
      <GenderedExampleTitle>Beispiele:</GenderedExampleTitle>
      <GenderedExampleList>
        <GenderedExamplePair>
          <GenderedExampleBad>Nutzer</GenderedExampleBad> <GenderedExampleGood>{nutzerGood}</GenderedExampleGood>
        </GenderedExamplePair>
        <GenderedExamplePair>
          <GenderedExampleBad>Kollegen</GenderedExampleBad> <GenderedExampleGood>{kollegenGood}</GenderedExampleGood>
        </GenderedExamplePair>
      </GenderedExampleList>
    </GenderedExampleContainer>
  );
};

function genderedExamples(userSettings: UserSettings): [string, string] {
  switch (userSettings.genderingType) {
    case "double-notation":
      return ["Nutzerinnen und Nutzer", "Kolleginnen und Kollegen"];
    case "internal-i":
      return ["NutzerInnen", "KollegInnen"];
    case "neutral":
      return ["Nutzende", "Kollegschaft"];
    case "gender-symbol": {
      let genderSymbol: string;
      switch (userSettings.genderSymbol) {
        case "star":
          genderSymbol = "*";
          break;
        case "colon":
          genderSymbol = ":";
          break;
        case "custom":
          genderSymbol = userSettings.customGenderSymbol;
          break;
        default:
          console.error(`Unmapped gender symbol setting ${userSettings.genderSymbol}, falling back to star`);
          genderSymbol = "*";
          break;
      }
      return [`Nutzer${genderSymbol}innen`, `Kolleg${genderSymbol}innen`];
    }
    default:
      console.error(`Unmapped gendering type "${userSettings.genderingType}", showing neutral example`);
      return ["Nutzende", "Kollegschaft"];
  }
}
