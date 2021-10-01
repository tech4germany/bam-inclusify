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
          <MainTextArea spellCheck={false} autoFocus />
          <ButtonBar>
            <ButtonBarSpacer />
            <Button disabled>Kopieren</Button>
            <Button disabled>Prüfen</Button>
          </ButtonBar>
        </MainTextAreaContainer>
        <ResultsAreaContainer>
          <OldResultsArea
            ruleMatches={ltMatches}
            applyReplacement={makeReplacementApplier([inputText, setInputText], checkText)}
          />
        </ResultsAreaContainer>
      </MainAreaContainer>

      <MainContainer>
        <StandaloneHeading>Inclusify</StandaloneHeading>
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
          <OldResultsArea
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
  padding: 2.5rem 2rem;
  /* font-family: sans-serif; */
  width: 100%;
  box-sizing: border-box;
  border-radius: 0;
  border: none;
  resize: vertical;
  box-shadow: 0px 9px 18px #00000029;
  height: 20em;
  margin-bottom: 1em;
`;

const ResultsAreaContainer = styled.div``;

interface ResultListEntryProps extends EntryTopBarProps {
  matchText: string;
}
const ResultListEntry: FC<ResultListEntryProps> = ({ categoryName, matchText }) => (
  <ResultListEntryContainer>
    <EntryTopBar categoryName={categoryName} />
  </ResultListEntryContainer>
);

const ResultListEntryContainer = styled.div`
  background: white;
  border-radius: 10px;
  box-shadow: 0px 6px 12px #00000029;
  margin-bottom: 0.8125rem;
  padding: 20px 10px;
`;

interface EntryTopBarProps {
  categoryName: string;
}
const EntryTopBar: FC<EntryTopBarProps> = ({ categoryName }) => (
  <EntryTopBarContainer>
    <EntryColorDot />
    <EntryCategoryContainer>{categoryName}</EntryCategoryContainer>
  </EntryTopBarContainer>
);

const EntryTopBarContainer = styled.div`
  font-size: 0.7rem;
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const EntryColorDot = styled.div`
  background: #8f4dbf;
  border-radius: 50%;
  height: 0.625rem;
  width: 0.625rem;
`;

const EntryCategoryContainer = styled.div`
  color: gray;
`;

const EntryShortMatchContainer = styled.div``;

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
`;

const InputArea = styled.textarea`
  width: 100%;
  height: 10em;
`;

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
