import { FC, useEffect, useState } from "react";
import styled from "styled-components";
import { DefaultFeatureFlags, FeatureFlags, isDebugPanelEnabled } from "../feature-flags/feature-flags";
import { UserSettings } from "../user-settings/user-settings";
import { newUuidv4 } from "../uuid";

interface HasFeatureFlagsState {
  featureFlagsState: [FeatureFlags, (setState: (prevState: FeatureFlags) => FeatureFlags) => void];
}

interface DebugPanelProps extends HasFeatureFlagsState {
  userSettingsState: [UserSettings, (setState: (prevState: UserSettings) => UserSettings) => void];
}

export function useDebugPanel(): FC<DebugPanelProps> {
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

  if (!isDebugPanelEnabled) {
    return () => null;
  }

  return (props) => <>{isDebugPanelOpen && <DebugPanel {...props} />}</>;
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

const DebugPanel: FC<DebugPanelProps> = ({ featureFlagsState, userSettingsState }) => (
  <DebugPanelContainer>
    <DebugPanelHeader>
      <DebugPanelHeading>Feature Flags</DebugPanelHeading>
      <ResetButton onClick={() => featureFlagsState[1](() => DefaultFeatureFlags)}>Reset</ResetButton>
    </DebugPanelHeader>

    <Checkbox
      featureFlagsState={featureFlagsState}
      valueSelector={(f) => f.grammarCheckAvailable}
      valueUpdater={(g, pf) => ({ ...pf, grammarCheckAvailable: g })}
    >
      Grammatikcheck verfügbar
    </Checkbox>
    <Checkbox
      featureFlagsState={featureFlagsState}
      valueSelector={(f) => f.spellCheckAvailable}
      valueUpdater={(g, pf) => ({ ...pf, spellCheckAvailable: g })}
    >
      Rechtschreibcheck verfügbar
    </Checkbox>
    <NumberInput
      featureFlagsState={featureFlagsState}
      valueSelector={(f) => f.maxReplacementsPerRuleMatch}
      valueUpdater={(g, pf) => ({ ...pf, maxReplacementsPerRuleMatch: g })}
    >
      Max Vorschläge pro Regel-Match
    </NumberInput>
    <SettingsImportExport label="Feature Flags Import/Export" settingsState={featureFlagsState} />
    <SettingsImportExport label="User Settings Import/Export" settingsState={userSettingsState} />
  </DebugPanelContainer>
);

const DebugPanelHeader = styled.div`
  display: flex;
  align-items: center;
`;
const DebugPanelHeading = styled.div`
  font-size: 110%;
  font-weight: 400;
  margin-bottom: 5px 0;
  flex-grow: 1;
`;
const ResetButton = styled.button`
  padding: 3px 5px;
`;

interface FeatureFlagUpdater<T> {
  valueSelector: (featureFlags: FeatureFlags) => T;
  valueUpdater: (newValue: T, prevFeatureFlags: FeatureFlags) => FeatureFlags;
}

interface CheckboxProps extends HasFeatureFlagsState, FeatureFlagUpdater<boolean> {}
const Checkbox: FC<CheckboxProps> = ({
  children,
  valueSelector,
  valueUpdater,
  featureFlagsState: [featureFlags, setFeatureFlags],
}) => {
  const id = newUuidv4();
  return (
    <label htmlFor={id}>
      <input
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

interface NumberInputProps extends HasFeatureFlagsState, FeatureFlagUpdater<number> {}
const NumberInput: FC<NumberInputProps> = ({
  children,
  valueSelector,
  valueUpdater,
  featureFlagsState: [featureFlags, setFeatureFlags],
}) => {
  const id = newUuidv4();
  return (
    <label htmlFor={id}>
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
const SettingsImportExportSetButton = styled.button`
  padding: 2px 5px;
`;

interface SettingsImportExportProps<T> {
  label: string;
  settingsState: [T, (setState: (prevState: T) => T) => void];
}
function SettingsImportExport<T>({ settingsState: [settings, setSettings], label }: SettingsImportExportProps<T>) {
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
        <SettingsImportExportSetButton
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
        </SettingsImportExportSetButton>
      </SettingsImportExportInputRow>
    </SettingsImportExportContainer>
  );
}
