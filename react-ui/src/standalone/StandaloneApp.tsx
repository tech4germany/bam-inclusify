import { FC, RefObject, useRef, useState } from "react";
import styled from "styled-components";
import { StandaloneCheckTextButton } from "./StandaloneCheckTextButton";
import { DebugPanel } from "../common/debug-panel/DebugPanel";
import { useFeatureFlagsState } from "../common/feature-flags/feature-flags";
import { LanguageToolClient } from "../common/language-tool-api/LanguageToolClient";
import { RuleMatch } from "../common/language-tool-api/types";
import { NavigationBar } from "./NavigationBar";
import { ResultsArea } from "../common/results-display/ResultsArea";
import { splitTextMatch } from "../common/splitTextMatch";
import { computeErrorCounts, SummaryBar } from "../common/summary-bar/SummaryBar";
import { useUserSettingsState } from "../common/user-settings/UserSettingsStorage";
import { newUuidv4 } from "../common/uuid";
import { MainTextArea } from "./MainTextArea";
import { StandaloneUserSettingsButton } from "./StandaloneUserSettingsButton";
import { CenteredContainer } from "./CenteredContainer";
import { UserSettingsAndFeatureFlagsContext } from "../common/UserSettingsAndFeatureFlagsContext";
import { UseState } from "../common/UseState";
import { PilotPhaseBanner } from "../common/PilotPhaseBanner";
import { rightMargin } from "../office-taskpane/taskpane-style-constants";
import { ImpressumAndDatenschutzLinks } from "./ImpressumAndDatenschutzLinks";

const textAreaId = newUuidv4();

export const StandaloneApp: FC = () => {
  const [inputText, setInputText] = useState("");
  const [ruleMatches, setRuleMatches] = useState<RuleMatch[] | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [isError, setError] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isTextModified, setTextModified] = useState(false);
  const [featureFlags, setFeatureFlags] = useFeatureFlagsState();
  const [userSettings, setUserSettings] = useUserSettingsState();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const errorCounts = computeErrorCounts(ruleMatches || []);

  const checkText = async (text: string) => {
    setLoading(true);
    setError(false);
    try {
      const matches = await LanguageToolClient.check(text, userSettings, featureFlags);
      setRuleMatches(matches);
    } catch (e) {
      setError(true);
      console.error("Error while checking text: ", e);
    }
    setTextModified(false);
    setLoading(false);
  };
  const submitHandler = async () => {
    if (!isLoading) {
      setSettingsOpen(false);
      await checkText(inputText);
    }
  };

  return (
    <StandaloneAppContainer>
      <UserSettingsAndFeatureFlagsContext.Provider value={{ userSettings, featureFlags }}>
        <NavigationBar />
        <div>
          <CenteredContainer>
            <TopBarContainer>
              <PilotPhaseBannerContainer>
                <PilotPhaseBanner />
              </PilotPhaseBannerContainer>
              <SummaryBarContainer>
                <SummaryBar showSummaryBoxes={ruleMatches !== null} {...errorCounts}>
                  <StandaloneUserSettingsButton pressedState={[isSettingsOpen, setSettingsOpen]} />
                </SummaryBar>
              </SummaryBarContainer>
            </TopBarContainer>
          </CenteredContainer>
        </div>

        <div style={{ flex: "1", overflow: "auto" }}>
          <CenteredContainer>
            <MainAreaContainer>
              <InputAreaContainer>
                <MainTextArea
                  key={textAreaId}
                  textAreaRef={textAreaRef}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    setTextModified(true);
                  }}
                  onSubmit={submitHandler}
                  value={inputText}
                />
                <ButtonBar>
                  <ButtonBarSpacer />
                  <StandaloneCheckTextButton onClick={submitHandler} disabled={isLoading} />
                </ButtonBar>
              </InputAreaContainer>
              <ResultsAreaContainer>
                <ResultsArea
                  isError={isError}
                  isLoading={isLoading}
                  isSettingsOpen={isSettingsOpen}
                  userSettingsPanelProps={{
                    userSettingsState: [userSettings, setUserSettings],
                    onConfirmClicked: () => setSettingsOpen(false),
                  }}
                  ruleMatches={ruleMatches}
                  matchesDisabled={isTextModified}
                  applyReplacement={makeReplacementApplier([inputText, setInputText], checkText, textAreaRef)}
                  selectRuleMatch={(ruleMatch) => {
                    const ta = textAreaRef.current;
                    if (!!ta) {
                      setTextAreaSelection(ta, ruleMatch.offset, ruleMatch.offset + ruleMatch.length);
                    }
                  }}
                />
              </ResultsAreaContainer>
            </MainAreaContainer>
          </CenteredContainer>
        </div>

        <ImpressumAndDatenschutzLinks />
      </UserSettingsAndFeatureFlagsContext.Provider>
      <DebugPanel
        featureFlagsState={[featureFlags, setFeatureFlags]}
        userSettingsState={[userSettings, setUserSettings]}
      />
    </StandaloneAppContainer>
  );
};

const StandaloneAppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const TopBarContainer = styled.div`
  display: flex;
  align-items: flex-end;
  margin-right: ${rightMargin};
`;
const PilotPhaseBannerContainer = styled.div`
  flex-grow: 1;
`;
const SummaryBarContainer = styled.div`
  margin: 30px 0 14px;
`;

const MainAreaContainer = styled.div`
  display: flex;
  height: 100%;
  gap: 20px;
  box-sizing: border-box;
  padding-top: 10px;

  flex-direction: row;

  @media (max-width: 650px) {
    flex-direction: column;
  }
`;

const InputAreaContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: auto;
  padding: 0 15px;
  margin: 0 -15px;
  min-height: 200px;
`;

const ResultsAreaContainer = styled.div`
  width: 20rem;
  min-height: 200px;
`;

function makeReplacementApplier(
  [inputText, setInputText]: UseState<string>,
  triggerRecheck: (text: string) => void,
  textAreaRef: RefObject<HTMLTextAreaElement>
) {
  return async (ruleMatch: RuleMatch, replacementText: string) => {
    const [preMatch, , postMatch] = splitTextMatch(inputText, ruleMatch.offset, ruleMatch.length);
    const newText = preMatch + replacementText + postMatch;
    setInputText(newText);
    const ta = textAreaRef.current;
    if (!!ta) {
      setTextAreaSelection(ta, preMatch.length, preMatch.length + replacementText.length);
    }
    triggerRecheck(newText);
  };
}

function setTextAreaSelection(textArea: HTMLTextAreaElement, selectionStart: number, selectionEnd: number) {
  // Note: scrolling selection into view based on https://stackoverflow.com/a/53082182
  const value = textArea.value;
  textArea.value = value.substring(0, selectionEnd);
  textArea.scrollTop = textArea.scrollHeight;
  textArea.value = value;
  textArea.setSelectionRange(selectionStart, selectionEnd);
  textArea.focus();
}

const ButtonBar = styled.div`
  flex: 0;
  display: flex;
  gap: 1em;
  justify-content: flex-end;
  margin-bottom: 45px;
`;

const ButtonBarSpacer = styled.div`
  flex-grow: 1;
`;
