import React, { FC } from "react";
import styled from "styled-components";
import { RuleMatch } from "../language-tool-api/types";

export const ResultsArea: FC<{ ruleMatches: RuleMatch[] }> = ({ ruleMatches }) => (
  <div>
    <h3>Ergebnisse:</h3>
    <LtMatchesList ltMatches={ruleMatches} />
  </div>
);

const LtMatchesList: FC<{ ltMatches: RuleMatch[] }> = ({ ltMatches }) => (
  <div>
    <div>{ltMatches.length} Vorschläge</div>
    {ltMatches.map((ltMatch, idx) => (
      <LtMatch key={idx} ltMatch={ltMatch} />
    ))}
  </div>
);

const LtMatch: FC<{ ltMatch: RuleMatch }> = ({ ltMatch }) => {
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

function splitTextMatch(text: string, offset: number, length: number): [string, string, string] {
  const preMatch = text.substring(0, offset);
  const match = text.substring(offset, offset + length);
  const postMatch = text.substring(offset + length);
  return [preMatch, match, postMatch];
}
