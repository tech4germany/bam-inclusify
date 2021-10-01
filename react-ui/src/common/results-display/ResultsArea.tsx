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
  const [, matchText] = splitTextMatch(ltMatch.context.text, ltMatch.context.offset, ltMatch.context.length);
  const category = mapRuleCategory(ltMatch.rule?.category.id);
  return (
    <MatchContainer>
      <MatchTopBar category={category} categoryName={ltMatch.rule?.category?.name || ""} />
      <MatchContentContainer>
        <MatchContextContainer>
          <MatchMatchText>{matchText}</MatchMatchText>
          <ReplacementArrow />
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
          {/* <span>{ltMatch.replacements.length > 0 && ltMatch.replacements[0].value}</span> */}
        </MatchContextContainer>
        <MatchRuleExplanation>{ltMatch.message}</MatchRuleExplanation>
        <MatchActionsBar>mehr anzeigen</MatchActionsBar>
      </MatchContentContainer>
    </MatchContainer>
  );
};

interface EntryTopBarProps {
  category: RuleMatchCategory;
  categoryName: string;
}
const MatchTopBar: FC<EntryTopBarProps> = ({ category, categoryName }) => (
  <MatchTopBarContainer>
    <MatchColorDot category={category} />
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

type RuleMatchCategory = "spelling" | "grammar" | "diversity" | "unknown";
function mapRuleCategory(categoryId: string | undefined): RuleMatchCategory {
  switch (categoryId) {
    case "DIVERSITY_SENSITIVE_LANGUAGE":
      return "diversity";
    case "TYPOS":
      return "spelling";
    case "REDUNDANCY":
    case "GRAMMAR":
    case "PUNCTUATION":
      return "grammar";
    default:
      return "unknown";
  }
}

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

interface MatchColorDotProps {
  category: RuleMatchCategory;
}
const MatchColorDot = styled.div<MatchColorDotProps>`
  background: ${(props) => matchCategoryColor(props.category)};
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

const ReplacementArrow = () => <ReplacementArrowContainer>{"->"}</ReplacementArrowContainer>;

const ReplacementArrowContainer = styled.span`
  white-space: nowrap;
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

const MatchContainer = styled.div`
  background: white;
  border-radius: 10px;
  box-shadow: 0px 6px 12px #00000029;
  margin-bottom: 0.8125rem;
  padding: 20px 10px;
`;

const MatchContextContainer = styled.div`
  margin: 14px 0;
  display: flex;
  gap: 0.5ch;
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
