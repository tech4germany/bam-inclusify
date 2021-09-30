import React, { Dispatch, FC, SetStateAction, useState } from "react";
import styled from "styled-components";
import { LanguageToolClient } from "../common/language-tool-api/LanguageToolClient";
import { RuleMatch } from "../common/language-tool-api/types";
import { ResultsArea } from "../common/results-display/ResultsArea";
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
          <MainTextArea spellCheck={false} />
        </MainTextAreaContainer>
        <ResultAreaContainer>
          <ResultListEntry>Entry 1</ResultListEntry>
          <ResultListEntry>Entry 2</ResultListEntry>
        </ResultAreaContainer>
      </MainAreaContainer>

      <MainContainer>
        <StandaloneHeading>OpenMinDEd</StandaloneHeading>
        <div>
          <h3>Text eingeben:</h3>
          <InputArea onChange={(e) => setInputText(e.target.value)} value={inputText} />
        </div>
        <ButtonBar>
          <Button onClick={() => checkText(inputText)}>Prüfen</Button>
        </ButtonBar>

        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <ResultsArea
            ruleMatches={ltMatches}
            applyReplacement={makeReplacementApplier([inputText, setInputText], checkText)}
          />
        )}
      </MainContainer>
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
  max-width: 800px;
  margin: 1em auto;
`;

const MainTextAreaContainer = styled.div`
  flex-grow: 1;
  margin-right: 1.5em;
`;

const MainTextArea = styled.textarea`
  padding: 1em;
  font-family: sans-serif;
  width: 100%;
  box-sizing: border-box;
  border-radius: 0;
  border: none;
  resize: vertical;
  box-shadow: 3px 3px 15px 2px rgba(179, 179, 179, 1);
  height: 20em;
`;

const ResultAreaContainer = styled.div``;

const ResultListEntry = styled.div`
  background: white;
  border-radius: 5px;
  padding: 0.5em;
  box-shadow: 3px 3px 15px 2px rgba(179, 179, 179, 1);
  margin-bottom: 0.8em;
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

const StandaloneHeading = styled.h1`
  color: darkblue;
`;

const MainContainer = styled.div`
  max-width: 800px;
  margin: 4em auto;
  font-family: sans-serif;
`;

const InputArea = styled.textarea`
  width: 100%;
  height: 10em;
`;

const ButtonBar = styled.div`
  display: flex;
`;

const Button = styled.button`
  font-size: 150%;
  margin-left: auto;
`;
