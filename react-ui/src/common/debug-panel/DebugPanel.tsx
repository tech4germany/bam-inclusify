import { FC, useEffect, useState } from "react";
import styled from "styled-components";
import { DefaultFeatureFlags, FeatureFlags, isDebugPanelEnabled } from "../feature-flags/feature-flags";
import { Fonts } from "../styles/Fonts";
import { UserSettings } from "../user-settings/user-settings";
import { DefaultUserSettings } from "../user-settings/UserSettingsStorage";
import { newUuidv4 } from "../uuid";

interface HasFeatureFlagsState {
  featureFlagsState: [FeatureFlags, (setState: (prevState: FeatureFlags) => FeatureFlags) => void];
}

interface DebugPanelProps extends HasFeatureFlagsState {
  userSettingsState: [UserSettings, (setState: (prevState: UserSettings) => UserSettings) => void];
}

const DebugPanelContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  background: #ffc5ae;
  border: 2px solid #f17a00;
  display: flex;
  flex-direction: column;
  padding: 2px 5px;
`;

const inputIds: { [Property in keyof FeatureFlags]: string } = Object.fromEntries(
  Object.keys(DefaultFeatureFlags).map((k) => [k, newUuidv4()])
) as any;

export const DebugPanel: FC<DebugPanelProps> = !isDebugPanelEnabled
  ? () => null
  : ({ featureFlagsState, userSettingsState }) => {
      const [isDebugPanelOpen, setDebugPanelOpen] = useState(false);

      const keyHandler = (e: KeyboardEvent) => {
        if (e.ctrlKey && e.shiftKey && e.key === "D") {
          e.preventDefault();
          setDebugPanelOpen(!isDebugPanelOpen);
        }
      };
      useEffect(() => {
        if (!isDebugPanelEnabled) return;

        document.body.addEventListener("keypress", keyHandler);
        return () => {
          document.body.removeEventListener("keypress", keyHandler);
        };
      });
      if (!isDebugPanelOpen) return null;

      return (
        <DebugPanelContainer>
          <DebugPanelHeader>
            <DebugPanelHeading>Feature Flags</DebugPanelHeading>
          </DebugPanelHeader>

          <Checkbox featureFlagsState={featureFlagsState} featureFlagId={"grammarCheckAvailable"}>
            Grammatikcheck verfügbar
          </Checkbox>
          <Checkbox featureFlagsState={featureFlagsState} featureFlagId={"spellCheckAvailable"}>
            Rechtschreibcheck verfügbar
          </Checkbox>
          <Checkbox featureFlagsState={featureFlagsState} featureFlagId={"allowMultiCharGenderSymbol"}>
            Mehr-Zeichen Gender-Symbol erlauben
          </Checkbox>
          <Checkbox featureFlagsState={featureFlagsState} featureFlagId={"isBamBuild"}>
            BAM-Variante
          </Checkbox>
          <Checkbox featureFlagsState={featureFlagsState} featureFlagId={"showIgnoreButton"}>
            "Match ignorieren" verfügbar
          </Checkbox>
          <NumberInput featureFlagId={"maxReplacementsPerRuleMatch"} featureFlagsState={featureFlagsState}>
            Max Vorschläge pro Regel-Match
          </NumberInput>
          <NumberInput featureFlagId={"minimumRequestDelayMs"} featureFlagsState={featureFlagsState}>
            Min. Dauer pro Request in ms
          </NumberInput>
          <TextInput featureFlagId={"apiBaseUrl"} featureFlagsState={featureFlagsState}>
            API Base URL
          </TextInput>
          <SettingsImportExport
            label="Feature Flags Import/Export"
            settingsState={featureFlagsState}
            defaultSettings={DefaultFeatureFlags}
          />
          <SettingsImportExport
            label="User Settings Import/Export"
            settingsState={userSettingsState}
            defaultSettings={DefaultUserSettings}
          />
        </DebugPanelContainer>
      );
    };

const DebugPanelHeader = styled.div`
  display: flex;
  align-items: center;
`;
const DebugPanelHeading = styled.div`
  font-size: 110%;
  font-family: ${Fonts.main.family};
  font-weight: ${Fonts.main.weights.bold};
  margin-bottom: 5px 0;
  flex-grow: 1;
`;

const CheckboxInputElement = styled.input`
  margin: 2px 5px;
`;

type FilterProperties<T, U> = { [P in keyof T]: T[P] extends U ? P : never }[keyof T];

interface CheckboxProps extends HasFeatureFlagsState {
  featureFlagId: FilterProperties<FeatureFlags, boolean>;
}
const Checkbox: FC<CheckboxProps> = ({
  children,
  featureFlagId,
  featureFlagsState: [featureFlags, setFeatureFlags],
}) => {
  const id = inputIds[featureFlagId];
  return (
    <label htmlFor={id}>
      <CheckboxInputElement
        id={id}
        type="checkbox"
        checked={featureFlags[featureFlagId]}
        onChange={() =>
          setFeatureFlags((prevFeatureFlags) => ({
            ...prevFeatureFlags,
            [featureFlagId]: !prevFeatureFlags[featureFlagId],
          }))
        }
      />
      <span>{children}</span>
    </label>
  );
};

const NumberInputElement = styled.input`
  width: 4em;
  margin: 0 5px;
`;
interface NumberInputProps extends HasFeatureFlagsState {
  featureFlagId: FilterProperties<FeatureFlags, number>;
}
const NumberInput: FC<NumberInputProps> = ({
  children,
  featureFlagId,
  featureFlagsState: [featureFlags, setFeatureFlags],
}) => {
  const id = inputIds[featureFlagId];
  return (
    <label htmlFor={id} key={id}>
      <NumberInputElement
        id={id}
        type="number"
        value={featureFlags[featureFlagId]}
        onChange={(e) =>
          setFeatureFlags((prevFeatureFlags) => ({
            ...prevFeatureFlags,
            [featureFlagId]: Number.parseInt(e.target.value),
          }))
        }
      />
      <span>{children}</span>
    </label>
  );
};

const TextInputElement = styled.input`
  width: 10em;
  margin: 0 5px;
`;
interface TextInputProps extends HasFeatureFlagsState {
  featureFlagId: FilterProperties<FeatureFlags, string>;
}
const TextInput: FC<TextInputProps> = ({
  children,
  featureFlagId,
  featureFlagsState: [featureFlags, setFeatureFlags],
}) => {
  const id = inputIds[featureFlagId];
  return (
    <label htmlFor={id} key={id}>
      <TextInputElement
        id={id}
        type="text"
        value={featureFlags[featureFlagId]}
        onChange={(e) =>
          setFeatureFlags((prevFeatureFlags) => ({
            ...prevFeatureFlags,
            [featureFlagId]: e.target.value,
          }))
        }
      />
      <span>{children}</span>
    </label>
  );
};

const SettingsImportExportContainer = styled.div`
  border-top: 1px solid orange;
  margin-top: 5px;
  padding-top: 5px;
`;
const SettingsImportExportInputRow = styled.div`
  display: flex;
  gap: 5px;
`;
const SettingsImportExportInput = styled.input`
  flex-grow: 1;
  font-family: monospace;

  &.has-error {
    border: 1px solid red;
  }
`;
const SettingsImportExportButton = styled.button`
  padding: 2px 5px;
`;

interface SettingsImportExportProps<T> {
  label: string;
  settingsState: [T, (setState: (prevState: T) => T) => void];
  defaultSettings: T;
}
function SettingsImportExport<T>({
  settingsState: [settings, setSettings],
  label,
  defaultSettings,
}: SettingsImportExportProps<T>) {
  const [json, setJson] = useState(JSON.stringify(settings));
  const [isError, setError] = useState(false);

  return (
    <SettingsImportExportContainer>
      <span>{label}</span>
      <SettingsImportExportInputRow>
        <SettingsImportExportInput
          className={isError ? "has-error" : ""}
          type={"text"}
          value={json}
          onChange={(e) => setJson(e.target.value)}
        />
        <SettingsImportExportButton
          onClick={() => {
            try {
              const newSettings = JSON.parse(json);
              setSettings(() => newSettings);
              setError(false);
            } catch (e) {
              setError(true);
              console.error(`Error while parsing JSON for '${label}':`, e);
            }
          }}
        >
          Import
        </SettingsImportExportButton>
        <SettingsImportExportButton onClick={() => setSettings(() => defaultSettings)}>
          Reset
        </SettingsImportExportButton>
      </SettingsImportExportInputRow>
    </SettingsImportExportContainer>
  );
}
