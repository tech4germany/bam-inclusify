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
      {/* <TopBar /> */}

      <CenteredContainer>
        <SummaryBar />
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
              <GradientButton leftColor="#0189BB" rightColor="#00AFF0" onClick={() => checkText(inputText)}>
                Prüfen
              </GradientButton>
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
      </CenteredContainer>
    </>
  );
};

const TopBar = () => <TopBarContainer>Top Bar</TopBarContainer>;

const TopBarContainer = styled.div`
  background: white;
  border-bottom: 1px solid green;
`;

const SummaryBar = () => (
  <SummaryBarContainer>
    <ButtonBarSpacer />
    <GradientButton leftColor="#E69B00" rightColor="#CD7D00">
      Grammatik
    </GradientButton>
    <GradientButton leftColor="#B40F1F" rightColor="#8C1318">
      Rechtschreibung
    </GradientButton>
    <GradientButton leftColor="#8F4DBF" rightColor="#6C3A90">
      Diversitätslücken
    </GradientButton>
    <GradientButton leftColor="#0189BB" rightColor="#00AFF0">
      ES
    </GradientButton>
  </SummaryBarContainer>
);

const SummaryBarContainer = styled.div`
  margin: 24px 0;
  display: flex;
  gap: 10px;
`;

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

interface GradientButtonProps {
  leftColor: string;
  rightColor: string;
}
const GradientButton = styled.button<GradientButtonProps>`
  font-size: 14px;
  background: linear-gradient(68deg, ${(props) => props.leftColor} 0%, ${(props) => props.rightColor} 100%);
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  color: white;
  box-shadow: 0px 3px 6px #00000029;
`;
