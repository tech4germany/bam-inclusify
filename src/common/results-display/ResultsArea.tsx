import React, { FC } from "react";
import styled from "styled-components";
import { RuleMatch } from "../language-tool-api/types";
import { splitTextMatch } from "../splitTextMatch";

type ApplyReplacementFunction = (
  ruleMatch: RuleMatch,
  index: number,
  allMatches: RuleMatch[],
  replacementText: string
) => void;

export const ResultsArea: FC<{ ruleMatches: RuleMatch[]; applyReplacement?: ApplyReplacementFunction }> = ({
  ruleMatches,
  applyReplacement,
}) => (
  <div>
    <h3>Ergebnisse:</h3>
    <LtMatchesList ltMatches={ruleMatches} applyReplacement={applyReplacement} />
  </div>
);

const LtMatchesList: FC<{ ltMatches: RuleMatch[]; applyReplacement?: ApplyReplacementFunction }> = ({
  ltMatches,
  applyReplacement,
}) => (
  <div>
    <div>{ltMatches.length} Vorschläge</div>
    {ltMatches.map((ltMatch, idx) => (
      <LtMatch
        key={idx}
        ltMatch={ltMatch}
        applyReplacement={!!applyReplacement ? (m, r) => applyReplacement(m, idx, ltMatches, r) : undefined}
      />
    ))}
  </div>
);

const LtMatch: FC<{
  ltMatch: RuleMatch;
  applyReplacement?: (ruleMatch: RuleMatch, replacementText: string) => void;
}> = ({ ltMatch, applyReplacement }) => {
  const [preMatch, matchText, postMatch] = splitTextMatch(
    ltMatch.context.text,
    ltMatch.context.offset,
    ltMatch.context.length
  );
  return (
    <LtMatchContainer>
      <MatchContext>
        <MatchContextText>{preMatch}</MatchContextText>
        <MatchMatchText>{matchText}</MatchMatchText>
        <MatchContextText>{postMatch}</MatchContextText>
      </MatchContext>
      <RuleMessage>{ltMatch.message}</RuleMessage>
      <div>
        Mögliche Alternativen:{" "}
        <ReplacementListContainer>
          {ltMatch.replacements.map((r, idx) => (
            <Replacement
              key={idx}
              onClick={() => {
                if (typeof applyReplacement === "function") applyReplacement(ltMatch, r.value || "");
              }}
            >
              {r.value}
            </Replacement>
          ))}
        </ReplacementListContainer>
      </div>
    </LtMatchContainer>
  );
};

const ReplacementListContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.2em;
  margin-top: 0.2em;
`;

const Replacement: FC<{ onClick: React.MouseEventHandler<HTMLButtonElement> }> = ({ onClick, children }) => (
  <ReplacementItem onClick={onClick}>{children}</ReplacementItem>
);

const ReplacementItem = styled.button`
  display: inline;
  border: 0.5px solid gray;
  background: lightgray;
  padding: 0.1em 0.2em;
  cursor: pointer;
`;

const LtMatchContainer = styled.div`
  margin: 0.5em 1em;
  border: 1px solid darkblue;
  border-radius: 2px;
  padding: 0.5em 1em;
`;

const MatchContext = styled.div`
  margin: 0 0 0.3em;
`;

const MatchContextText = styled.span`
  font-weight: bold;
`;
const MatchMatchText = styled(MatchContextText)`
  color: darkred;
`;

const RuleMessage = styled.div`
  margin: 0.3em 0;
`;
