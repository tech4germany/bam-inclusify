import React, { Dispatch, FC, SetStateAction, useState } from "react";
import styled from "styled-components";
import { LanguageToolClient } from "../common/language-tool-api/LanguageToolClient";
import { RuleMatch } from "../common/language-tool-api/types";
import { ResultsArea as OldResultsArea } from "../common/results-display/ResultsArea";
import { splitTextMatch } from "../common/splitTextMatch";

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

  return (
    <>
      <TopBar />
      <SummaryBar />

      <MainAreaContainer>
        <MainTextAreaContainer>
          <MainTextArea spellCheck={false} autoFocus onChange={(e) => setInputText(e.target.value)} value={inputText} />
          <ButtonBar>
            <ButtonBarSpacer />
            <Button onClick={() => checkText(inputText)}>Prüfen</Button>
          </ButtonBar>
        </MainTextAreaContainer>
        <ResultsAreaContainer>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <OldResultsArea
              ruleMatches={ltMatches}
              applyReplacement={makeReplacementApplier([inputText, setInputText], checkText)}
            />
          )}
        </ResultsAreaContainer>
      </MainAreaContainer>
    </>
  );
};

const TopBar = () => <TopBarContainer>Top Bar</TopBarContainer>;

const TopBarContainer = styled.div`
  background: white;
  border-bottom: 1px solid green;
`;

const SummaryBar = () => <SummaryBarContainer>Summary Bar</SummaryBarContainer>;

const SummaryBarContainer = styled.div`
  border-bottom: 1px solid blue;
`;

const MainAreaContainer = styled.div`
  display: flex;
  max-width: 1024px;
  margin: 1em auto;
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

const Button = styled.button`
  font-size: 150%;
`;
