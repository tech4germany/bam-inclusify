import React, { FC } from "react";
import styled from "styled-components";
import { RuleMatch } from "../language-tool-api/types";
import { splitTextMatch } from "../splitTextMatch";
import { isFunction } from "../type-helpers";

export type ApplyReplacementFunction = (
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
    <LtMatchesList ltMatches={ruleMatches} applyReplacement={applyReplacement} />
  </div>
);

const LtMatchesList: FC<{ ltMatches: RuleMatch[]; applyReplacement?: ApplyReplacementFunction }> = ({
  ltMatches,
  applyReplacement,
}) => (
  <div>
    {/* <div>{ltMatches.length} Vorschläge</div> */}
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
    <MatchContainer>
      <MatchTopBar categoryName={ltMatch.rule?.category.name || ""} />
      <MatchContentContainer>
        <MatchContextContainer>
          <MatchMatchText>{matchText}</MatchMatchText>
          {" -> "}
          <span>{ltMatch.replacements.length > 0 && ltMatch.replacements[0].value}</span>
        </MatchContextContainer>
        <MatchRuleExplanation>{ltMatch.message}</MatchRuleExplanation>
        <MatchActionsBar>mehr anzeigen</MatchActionsBar>
        <div style={{ display: "none" }}>
          Mögliche Alternativen:{" "}
          <ReplacementListContainer>
            {ltMatch.replacements.map((r, idx) => (
              <Replacement
                key={idx}
                onClick={isFunction(applyReplacement) ? () => applyReplacement(ltMatch, r.value || "") : undefined}
              >
                {r.value}
              </Replacement>
            ))}
          </ReplacementListContainer>
        </div>
      </MatchContentContainer>
    </MatchContainer>
  );
};

interface EntryTopBarProps {
  categoryName: string;
}
const MatchTopBar: FC<EntryTopBarProps> = ({ categoryName }) => (
  <MatchTopBarContainer>
    <MatchColorDot />
    <MatchCategoryContainer>{categoryName}</MatchCategoryContainer>
  </MatchTopBarContainer>
);

const MatchTopBarContainer = styled.div`
  font-size: 0.7rem;
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const MatchColorDot = styled.div`
  background: #8f4dbf;
  border-radius: 50%;
  height: 0.625rem;
  width: 0.625rem;
`;

const MatchCategoryContainer = styled.div`
  color: gray;
`;

const MatchContentContainer = styled.div`
  margin: 0 10px;
`;

const ReplacementListContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.2em;
  margin-top: 0.2em;
`;

const Replacement: FC<{ onClick: React.MouseEventHandler<HTMLButtonElement> | undefined }> = ({
  onClick,
  children,
}) => <ReplacementItem onClick={onClick}>{children}</ReplacementItem>;

const ReplacementItem = styled.button`
  display: inline;
  border: 0.5px solid gray;
  background: lightgray;
  padding: 0.1em 0.2em;
  cursor: ${(props) => (isFunction(props.onClick) ? "pointer" : "initial")};
`;

const MatchContainer = styled.div`
  background: white;
  border-radius: 10px;
  box-shadow: 0px 6px 12px #00000029;
  margin-bottom: 0.8125rem;
  padding: 20px 10px;
  max-width: 20rem;
`;

const MatchContextContainer = styled.div`
  margin: 14px 0;
`;

const MatchMatchText = styled.span`
  text-decoration: line-through;
`;

const MatchRuleExplanation = styled.div`
  margin: 14px 0;
  font-size: 0.7rem;
`;

const MatchActionsBar = styled.div`
  font-size: 0.5625rem;
`;
