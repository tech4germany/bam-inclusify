import React, { FC } from "react";
import styled from "styled-components";
import { RuleMatch } from "../language-tool-api/types";
import { mapRuleCategory, RuleMatchCategory } from "../rule-categories";
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
  const [, matchText] = splitTextMatch(ltMatch.context.text, ltMatch.context.offset, ltMatch.context.length);
  const category = mapRuleCategory(ltMatch);
  return (
    <MatchContainer category={category}>
      <MatchTopBar categoryName={ltMatch.rule?.category?.name || ""} />
      <MatchContentContainer>
        <MatchContextContainer>
          <MatchMatchText>{matchText}</MatchMatchText>
          <ReplacementListContainer>
            {ltMatch.replacements.map((r, idx) => (
              <div>
                <Replacement
                  key={idx}
                  onClick={isFunction(applyReplacement) ? () => applyReplacement(ltMatch, r.value || "") : undefined}
                >
                  {r.value}
                </Replacement>
              </div>
            ))}
          </ReplacementListContainer>
        </MatchContextContainer>
        <MatchRuleExplanation>{ltMatch.message}</MatchRuleExplanation>
        <MatchActionsBar>mehr anzeigen</MatchActionsBar>
      </MatchContentContainer>
    </MatchContainer>
  );
};

interface EntryTopBarProps {
  categoryName: string;
}
const MatchTopBar: FC<EntryTopBarProps> = ({ categoryName }) => (
  <MatchTopBarContainer>
    <MatchCategoryContainer>{categoryName}</MatchCategoryContainer>
  </MatchTopBarContainer>
);

const MatchTopBarContainer = styled.div`
  font-size: 0.7rem;
  font-weight: 100;
  display: flex;
  gap: 1rem;
  align-items: center;
`;

function matchCategoryColor(category: RuleMatchCategory): string {
  switch (category) {
    case "spelling":
      return "#C7112D";
    case "grammar":
      return "#0189BB";
    case "diversity":
      return "#8f4dbf";
    default:
      return "gray";
  }
}

const MatchCategoryContainer = styled.div`
  color: gray;
`;

const MatchContentContainer = styled.div`
  margin: 0;
`;

const ReplacementListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const Replacement: FC<{ onClick: React.MouseEventHandler<HTMLButtonElement> | undefined }> = ({
  onClick,
  children,
}) => <ReplacementItem onClick={onClick}>{children}</ReplacementItem>;

const ReplacementItem = styled.button`
  border: none;
  border-radius: 4px;
  background: #5a8d31;
  padding: 3px 7px;
  color: white;
  font-weight: 300;
  cursor: ${(props) => (isFunction(props.onClick) ? "pointer" : "initial")};
`;

interface MatchContainerProps {
  category: RuleMatchCategory;
}
const MatchContainer = styled.div<MatchContainerProps>`
  background: white;
  border-radius: 10px;
  box-shadow: 0px 6px 12px #00000029;
  margin-bottom: 0.8125rem;
  padding: 20px 13px;
  border-left: 16px solid ${(props) => matchCategoryColor(props.category)};
`;

const MatchContextContainer = styled.div`
  margin: 14px 0;
  display: flex;
  gap: 15px;
  font-size: 15px;
`;

const MatchMatchText = styled.span`
  text-decoration: line-through;
`;

const MatchRuleExplanation = styled.div`
  margin: 14px 0;
  font-size: 0.7rem;
  font-weight: 100;
`;

const MatchActionsBar = styled.div`
  font-size: 0.5625rem;
`;
