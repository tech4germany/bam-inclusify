import { off } from "process";
import React, { Dispatch, FC, SetStateAction, useState } from "react";
import styled from "styled-components";

export const StandaloneApp: FC = () => {
  const [inputText, setInputText] = useState("");
  const [displayText, setDisplayText] = useState("");
  const [ltMatches, setLtMatches] = useState<any[]>([]);
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
      <div>
        <h3>Ergebnisse:</h3>
        {isLoading ? <div>Loading...</div> : <LtMatchesList ltMatches={ltMatches} />}
      </div>
    </MainContainer>
  );
};

const LtMatchesList: FC<{ ltMatches: any[] }> = ({ ltMatches }) => (
  <div>
    <div>{ltMatches.length} Vorschläge</div>
    {ltMatches.map((ltMatch, idx) => (
      <LtMatch key={idx} ltMatch={ltMatch} />
    ))}
  </div>
);

const LtMatch: FC<{ ltMatch: any }> = ({ ltMatch }) => {
  const [preMatch, matchText, postMatch] = splitTextMatch(
    ltMatch.context.text,
    ltMatch.context.offset,
    ltMatch.context.length
  );
  return (
    <LtMatchContainer>
      <div>
        <MatchContext>{preMatch}</MatchContext>
        <MatchMatch>{matchText}</MatchMatch>
        <MatchContext>{postMatch}</MatchContext>
      </div>
      <div>{ltMatch.message}</div>
      <div>Mögliche Alternativen: {ltMatch.replacements.map((r: any) => r.value).join(", ")}</div>
    </LtMatchContainer>
  );
};

const LtMatchContainer = styled.div`
  margin: 0.5em 1em;
  border: 1px solid darkblue;
  border-radius: 2px;
  padding: 0.5em 1em;
`;

const MatchContext = styled.span`
  font-weight: bold;
`;
const MatchMatch = styled(MatchContext)`
  color: darkred;
`;

const checkText = async (inputText: string, setLtMatches: Dispatch<SetStateAction<any[]>>) => {
  const body = Object.entries({
    text: inputText,
    language: "auto",
  })
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
  console.log(body);
  const r = await fetch("/v2/check", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const content = await r.json();
  console.log(content);
  setLtMatches(content && content.matches && Array.isArray(content.matches) ? content.matches : []);
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

function splitTextMatch(text: string, offset: number, length: number): [string, string, string] {
  const preMatch = text.substring(0, offset);
  const match = text.substring(offset, offset + length);
  const postMatch = text.substring(offset + length);
  return [preMatch, match, postMatch];
}
