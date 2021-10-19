import { Dispatch, FC, RefObject, SetStateAction, useRef, useState } from "react";
import styled from "styled-components";
import { StandaloneCheckTextButton } from "./StandaloneCheckTextButton";
import { DebugPanel } from "../common/debug-panel/DebugPanel";
import { FeatureFlagsContext, useFeatureFlagsState } from "../common/feature-flags/feature-flags";
import { LanguageToolClient } from "../common/language-tool-api/LanguageToolClient";
import { RuleMatch } from "../common/language-tool-api/types";
import { NavigationBar } from "./NavigationBar";
import { ResultsArea } from "../common/results-display/ResultsArea";
import { splitTextMatch } from "../common/splitTextMatch";
import { computeErrorCounts, SummaryBar } from "../common/summary-bar/SummaryBar";
import { UserSettingsPanel } from "../common/user-settings/UserSettingsPanel";
import { UserSettingsContext, useUserSettingsState } from "../common/user-settings/UserSettingsStorage";
import { newUuidv4 } from "../common/uuid";
import { MainTextArea } from "./MainTextArea";
import { StandaloneUserSettingsButton } from "./StandaloneUserSettingsButton";
import { CenteredContainer } from "./CenteredContainer";
import { WelcomeMessage } from "../common/message-panels/WelcomeMessage";
import { LoadingMessage } from "../common/message-panels/LoadingMessage";
import { ErrorMessage } from "../common/message-panels/ErrorMessage";

type UseState<S> = [S, Dispatch<SetStateAction<S>>];

const textAreaId = newUuidv4();

export const StandaloneApp: FC = () => {
  const [inputText, setInputText] = useState("");
  const [ltMatches, setLtMatches] = useState<RuleMatch[] | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [isError, setError] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [featureFlags, setFeatureFlags] = useFeatureFlagsState();
  const [userSettings, setUserSettings] = useUserSettingsState();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const errorCounts = computeErrorCounts(ltMatches || []);

  const checkText = async (text: string) => {
    setLoading(true);
    const matches = await new LanguageToolClient().check(text, userSettings, featureFlags);
    setLtMatches(matches);
    setLoading(false);
  };
  const submitHandler = () => {
    if (!isLoading) {
      setSettingsOpen(false);
      checkText(inputText);
    }
  };

  return (
    <div>
      <UserSettingsContext.Provider value={userSettings}>
        <FeatureFlagsContext.Provider value={featureFlags}>
          <NavigationBar />

          <CenteredContainer>
            <SummaryBarContainer>
              <SummaryBar {...errorCounts}>
                <StandaloneUserSettingsButton pressedState={[isSettingsOpen, setSettingsOpen]} />
              </SummaryBar>
            </SummaryBarContainer>
            <MainAreaContainer>
              <InputAreaContainer>
                <MainTextArea
                  key={textAreaId}
                  textAreaRef={textAreaRef}
                  onChange={(e) => setInputText(e.target.value)}
                  onSubmit={submitHandler}
                  value={inputText}
                />
                <ButtonBar>
                  <ButtonBarSpacer />
                  <StandaloneCheckTextButton onClick={submitHandler} disabled={isLoading} />
                </ButtonBar>
              </InputAreaContainer>
              <ResultsAreaContainer>
                {isSettingsOpen ? (
                  <UserSettingsPanel
                    userSettingsState={[userSettings, setUserSettings]}
                    onConfirmClicked={() => setSettingsOpen(false)}
                  />
                ) : isError ? (
                  <ErrorMessage />
                ) : isLoading ? (
                  <LoadingMessage />
                ) : ltMatches === null ? (
                  <WelcomeMessage />
                ) : (
                  <ResultsArea
                    ruleMatches={ltMatches}
                    applyReplacement={makeReplacementApplier([inputText, setInputText], checkText, textAreaRef)}
                    selectRuleMatch={(ruleMatch) => {
                      const ta = textAreaRef.current;
                      if (!!ta) {
                        setTextAreaSelection(ta, ruleMatch.offset, ruleMatch.offset + ruleMatch.length);
                      }
                    }}
                  />
                )}
              </ResultsAreaContainer>
            </MainAreaContainer>
          </CenteredContainer>
        </FeatureFlagsContext.Provider>
      </UserSettingsContext.Provider>
      <DebugPanel
        featureFlagsState={[featureFlags, setFeatureFlags]}
        userSettingsState={[userSettings, setUserSettings]}
      />
    </div>
  );
};

const SummaryBarContainer = styled.div`
  margin: 30px 0 24px;
`;

const MainAreaContainer = styled.div`
  display: flex;
  margin-bottom: 2rem;
`;

const InputAreaContainer = styled.div`
  flex-grow: 1;
  margin-right: 1.5em;
  display: flex;
  flex-direction: column;
`;

const ResultsAreaContainer = styled.div`
  width: 20rem;
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
  display: flex;
  gap: 1em;
  justify-content: flex-end;
`;

const ButtonBarSpacer = styled.div`
  flex-grow: 1;
`;
