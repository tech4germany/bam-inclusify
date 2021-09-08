import React, { Dispatch, FC, SetStateAction, useState } from "react";
import styled from "styled-components";
import { LanguageToolClient } from "../common/language-tool-api/LanguageToolClient";
import { RuleMatch } from "../common/language-tool-api/types";
import { ResultsArea } from "../common/results-display/ResultsArea";

export const StandaloneApp: FC = () => {
  const [inputText, setInputText] = useState("");
  const [ltMatches, setLtMatches] = useState<RuleMatch[]>([]);
  const [isLoading, setLoading] = useState(false);

  return (
    <MainContainer>
      <StandaloneHeading>OpenMinDEd</StandaloneHeading>
      <div>
        <h3>Text eingeben:</h3>
        <InputArea onChange={(e) => setInputText(e.target.value)} />
      </div>
      <ButtonBar>
        <Button
          onClick={async () => {
            setLoading(true);
            await checkText(inputText, setLtMatches);
            setLoading(false);
          }}
        >
          Prüfen
        </Button>
      </ButtonBar>

      {isLoading ? <div>Loading...</div> : <ResultsArea ruleMatches={ltMatches} />}
    </MainContainer>
  );
};

const checkText = async (inputText: string, setLtMatches: Dispatch<SetStateAction<RuleMatch[]>>) => {
  const request = {
    text: inputText,
    language: "auto",
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
