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
interface HasId {
  id: string;
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

          <Checkbox
            id={inputIds.grammarCheckAvailable}
            featureFlagsState={featureFlagsState}
            valueSelector={(f) => f.grammarCheckAvailable}
            valueUpdater={(g, pf) => ({ ...pf, grammarCheckAvailable: g })}
          >
            Grammatikcheck verfügbar
          </Checkbox>
          <Checkbox
            id={inputIds.spellCheckAvailable}
            featureFlagsState={featureFlagsState}
            valueSelector={(f) => f.spellCheckAvailable}
            valueUpdater={(g, pf) => ({ ...pf, spellCheckAvailable: g })}
          >
            Rechtschreibcheck verfügbar
          </Checkbox>
          <Checkbox
            id={inputIds.allowMultiCharGenderSymbol}
            featureFlagsState={featureFlagsState}
            valueSelector={(f) => f.allowMultiCharGenderSymbol}
            valueUpdater={(g, pf) => ({ ...pf, allowMultiCharGenderSymbol: g })}
          >
            Mehr-Zeichen Gender-Symbol erlauben
          </Checkbox>
          <Checkbox
            id={inputIds.useBamLogo}
            featureFlagsState={featureFlagsState}
            valueSelector={(f) => f.useBamLogo}
            valueUpdater={(g, pf) => ({ ...pf, useBamLogo: g })}
          >
            BAM-Logo verwenden
          </Checkbox>
          <NumberInput
            id={inputIds.maxReplacementsPerRuleMatch}
            featureFlagsState={featureFlagsState}
            valueSelector={(f) => f.maxReplacementsPerRuleMatch}
            valueUpdater={(g, pf) => ({ ...pf, maxReplacementsPerRuleMatch: g })}
          >
            Max Vorschläge pro Regel-Match
          </NumberInput>
          <NumberInput
            id={inputIds.minimumRequestDelayMs}
            featureFlagsState={featureFlagsState}
            valueSelector={(f) => f.minimumRequestDelayMs}
            valueUpdater={(g, pf) => ({ ...pf, minimumRequestDelayMs: g })}
          >
            Min. Dauer pro Request
          </NumberInput>
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

interface FeatureFlagUpdater<T> {
  valueSelector: (featureFlags: FeatureFlags) => T;
  valueUpdater: (newValue: T, prevFeatureFlags: FeatureFlags) => FeatureFlags;
}

const CheckboxInputElement = styled.input`
  margin: 2px 5px;
`;

interface CheckboxProps extends HasFeatureFlagsState, HasId, FeatureFlagUpdater<boolean> {}
const Checkbox: FC<CheckboxProps> = ({
  children,
  id,
  valueSelector,
  valueUpdater,
  featureFlagsState: [featureFlags, setFeatureFlags],
}) => {
  return (
    <label htmlFor={id}>
      <CheckboxInputElement
        id={id}
        type="checkbox"
        checked={valueSelector(featureFlags)}
        onChange={() =>
          setFeatureFlags((prevFeatureFlags) => valueUpdater(!valueSelector(prevFeatureFlags), prevFeatureFlags))
        }
      />
      <span>{children}</span>
    </label>
  );
};

interface NumberInputProps extends HasFeatureFlagsState, HasId, FeatureFlagUpdater<number> {}
const NumberInput: FC<NumberInputProps> = ({
  children,
  id,
  valueSelector,
  valueUpdater,
  featureFlagsState: [featureFlags, setFeatureFlags],
}) => {
  return (
    <label htmlFor={id} key={id}>
      <input
        id={id}
        type="number"
        value={valueSelector(featureFlags)}
        onChange={(e) =>
          setFeatureFlags((prevFeatureFlags) => valueUpdater(Number.parseInt(e.target.value), prevFeatureFlags))
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
