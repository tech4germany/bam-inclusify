import React, { Dispatch, FC, SetStateAction, useState } from "react";
import styled from "styled-components";
import { CheckTextButton } from "../common/buttons/Buttons";
import { LanguageToolClient } from "../common/language-tool-api/LanguageToolClient";
import { RuleMatch } from "../common/language-tool-api/types";
import { NavigationBar } from "../common/nav-bar/NavigationBar";
import { ResultsArea } from "../common/results-display/ResultsArea";
import { mapRuleCategory } from "../common/rule-categories";
import { splitTextMatch } from "../common/splitTextMatch";
import { SummaryBar } from "../common/summary-bar/SummaryBar";

type UseState<S> = [S, Dispatch<SetStateAction<S>>];

export const StandaloneApp: FC = () => {
  const [inputText, setInputText] = useState("");
  const [ltMatches, setLtMatches] = useState<RuleMatch[]>([]);
  const [isLoading, setLoading] = useState(false);

  const checkText = async (text: string) => {
    setLoading(true);
    await checkTextWithApi(text, setLtMatches);
    setLoading(false);
  };

  const errorCounts = computeErrorCounts(ltMatches);

  return (
    <>
      <NavigationBar />

      <CenteredContainer>
        <SummaryBar {...errorCounts} />
        <MainAreaContainer>
          <MainTextAreaContainer>
            <MainTextArea
              spellCheck={false}
              autoFocus
              onChange={(e) => setInputText(e.target.value)}
              value={inputText}
            />
            <ButtonBar>
              <ButtonBarSpacer />
              <CheckTextButton onClick={() => checkText(inputText)} />
            </ButtonBar>
          </MainTextAreaContainer>
          <ResultsAreaContainer>
            {isLoading ? (
              <div>Loading...</div>
            ) : (
              <ResultsArea
                ruleMatches={ltMatches}
                applyReplacement={makeReplacementApplier([inputText, setInputText], checkText)}
              />
            )}
          </ResultsAreaContainer>
        </MainAreaContainer>
      </CenteredContainer>
    </>
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

const MainTextAreaContainer = styled.div`
  flex-grow: 1;
  margin-right: 1.5em;
`;

const MainTextArea = styled.textarea`
  padding: 2.5rem 2rem;
  font-size: 15px;
  font-weight: 300;
  line-height: 25px;
  width: 100%;
  box-sizing: border-box;
  border-radius: 0;
  border: none;
  resize: vertical;
  box-shadow: 0px 9px 18px #00000029;
  height: 30em;
  margin-bottom: 1em;
`;

const ResultsAreaContainer = styled.div`
  width: 20rem;
`;

function makeReplacementApplier([inputText, setInputText]: UseState<string>, triggerRecheck: (text: string) => void) {
  return (ruleMatch: RuleMatch, index: number, allMatches: RuleMatch[], replacementText: string) => {
    const [preMatch, , postMatch] = splitTextMatch(inputText, ruleMatch.offset, ruleMatch.length);
    const newText = preMatch + replacementText + postMatch;
    setInputText(newText);
    triggerRecheck(newText);
  };
}

const checkTextWithApi = async (inputText: string, setLtMatches: Dispatch<SetStateAction<RuleMatch[]>>) => {
  const request = {
    text: inputText,
    language: "de-DE",
  };
  const content = await new LanguageToolClient().check(request);
  setLtMatches(() => content.matches || []);
};

const ButtonBar = styled.div`
  display: flex;
  gap: 1em;
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
