import { Dispatch, FC, RefObject, SetStateAction, useRef, useState } from "react";
import styled from "styled-components";
import { CheckTextButton } from "../common/buttons/Buttons";
import { DebugPanel } from "../common/debug-panel/DebugPanel";
import { FeatureFlagsContext, useFeatureFlagsState } from "../common/feature-flags/feature-flags";
import { FontFamilies } from "../common/Fonts";
import { LanguageToolClient } from "../common/language-tool-api/LanguageToolClient";
import { RuleMatch } from "../common/language-tool-api/types";
import { NavigationBar } from "../common/nav-bar/NavigationBar";
import { ResultsArea } from "../common/results-display/ResultsArea";
import { mapRuleCategory } from "../common/rule-categories";
import { splitTextMatch } from "../common/splitTextMatch";
import { SummaryBar } from "../common/summary-bar/SummaryBar";
import { UserSettingsPanel } from "../common/user-settings/UserSettingsPanel";
import { UserSettingsContext, useUserSettingsState } from "../common/user-settings/UserSettingsStorage";
import { newUuidv4 } from "../common/uuid";
import { MainTextArea } from "./MainTextArea";

type UseState<S> = [S, Dispatch<SetStateAction<S>>];

const textAreaId = newUuidv4();

export const StandaloneApp: FC = () => {
  const [inputText, setInputText] = useState("");
  const [ltMatches, setLtMatches] = useState<RuleMatch[] | null>(null);
  const [isLoading, setLoading] = useState(false);
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
            <SummaryBar pressedState={[isSettingsOpen, setSettingsOpen]} {...errorCounts} />
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
                  <CheckTextButton topCornersFlush onClick={submitHandler} disabled={isLoading} />
                </ButtonBar>
              </InputAreaContainer>
              <ResultsAreaContainer>
                {isSettingsOpen ? (
                  <UserSettingsPanel
                    userSettingsState={[userSettings, setUserSettings]}
                    onConfirmClicked={() => setSettingsOpen(false)}
                  />
                ) : isLoading ? (
                  <div>Text wird überprüft...</div>
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

const CenteredContainer = styled.div`
  max-width: 1024px;
  margin: 0 auto;
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
  return (ruleMatch: RuleMatch, index: number, allMatches: RuleMatch[], replacementText: string) => {
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

function computeErrorCounts(ltMatches: RuleMatch[]): {
  diversityErrorCount: number;
  grammarErrorCount: number;
  spellingErrorCount: number;
} {
  const diversityErrorCount = ltMatches.filter((m) => mapRuleCategory(m) === "diversity").length;
  const grammarErrorCount = ltMatches.filter((m) => mapRuleCategory(m) === "grammar").length;
  const spellingErrorCount = ltMatches.filter((m) => mapRuleCategory(m) === "spelling").length;
  return { diversityErrorCount, grammarErrorCount, spellingErrorCount };
}

const WelcomeMessageContainer = styled.div`
  font-family: ${FontFamilies.bam};
  font-size: 20px;
  font-style: italic;
`;

const WelcomeMessageIntro = styled.p`
  font-weight: 400;
  margin: 0;
`;
const WelcomeMessageBody = styled.p`
  margin: 1em 0 0;
  font-weight: 300;
`;

const WelcomeMessage = () => (
  <WelcomeMessageContainer>
    <WelcomeMessageIntro>
      Herzlich Willkommen bei INCLUSIFY, deiner Assistentin für diversitätssensible Sprache bei der BAM.
    </WelcomeMessageIntro>
    <WelcomeMessageBody>
      Prüfe Deine Texte auf Diversitätslücken. INCLUSIFY ist aktuell basierend auf den Präferenzen des BAM Leitfadens
      für geschlechtersensible Sprache eingestellt. Wenn Du eine anderes Gendersprache bevorzugst, kannst Du das in den
      Einstellungen anpassen.
    </WelcomeMessageBody>
  </WelcomeMessageContainer>
);
