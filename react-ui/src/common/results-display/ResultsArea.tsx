import React, { FC, useState } from "react";
import styled from "styled-components";
import { DownChevronIcon } from "../../icons";
import { Colors } from "../Colors";
import { FeatureFlagsContext } from "../feature-flags/feature-flags";
import { RuleMatch } from "../language-tool-api/types";
import {
  diversityRuleCategories,
  grammarRuleCategories,
  mapRuleCategory,
  RuleMatchCategory,
  spellingRuleCategories,
} from "../rule-categories";
import { splitTextMatch } from "../splitTextMatch";
import { isFunction } from "../type-helpers";
import { isGrammarCheckOn, isSpellCheckOn } from "../user-settings/user-settings";
import { UserSettingsContext } from "../user-settings/UserSettingsStorage";

export type ApplyReplacementFunction = (
  ruleMatch: RuleMatch,
  index: number,
  allMatches: RuleMatch[],
  replacementText: string
) => void;

interface ResultsAreaProps {
  ruleMatches: RuleMatch[];
  applyReplacement?: ApplyReplacementFunction;
  selectRuleMatch?: (ruleMatch: RuleMatch) => void;
}

export const ResultsArea: FC<ResultsAreaProps> = ({ ruleMatches, applyReplacement, selectRuleMatch }) => (
  <div>
    <UserSettingsContext.Consumer>
      {(userSettings) => (
        <FeatureFlagsContext.Consumer>
          {(featureFlags) => {
            const matchesToShow = ruleMatches.filter((m) => {
              const ruleCategoryId = m.rule?.category?.id || "";
              return (
                diversityRuleCategories.includes(ruleCategoryId) ||
                (isGrammarCheckOn(userSettings, featureFlags) && grammarRuleCategories.includes(ruleCategoryId)) ||
                (isSpellCheckOn(userSettings, featureFlags) && spellingRuleCategories.includes(ruleCategoryId))
              );
            });
            return (
              <LtMatchesListContainer>
                {matchesToShow.map((ltMatch, idx) => (
                  <LtMatch
                    key={ltMatch.clientUuid}
                    ltMatch={ltMatch}
                    applyReplacement={
                      !!applyReplacement ? (m, r) => applyReplacement(m, idx, ruleMatches, r) : undefined
                    }
                    selectRuleMatch={selectRuleMatch}
                  />
                ))}
              </LtMatchesListContainer>
            );
          }}
        </FeatureFlagsContext.Consumer>
      )}
    </UserSettingsContext.Consumer>
  </div>
);

const LtMatchesListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 25px;
`;

interface LtMatchProps {
  ltMatch: RuleMatch;
  applyReplacement?: (ruleMatch: RuleMatch, replacementText: string) => void;
  selectRuleMatch: ((ruleMatch: RuleMatch) => void) | undefined;
}

const LtMatch: FC<LtMatchProps> = ({ ltMatch, applyReplacement, selectRuleMatch }) => {
  const [isExpanded, setExpanded] = useState(false);

  const [, matchText] = splitTextMatch(ltMatch.context.text, ltMatch.context.offset, ltMatch.context.length);
  const category = mapRuleCategory(ltMatch);

  return (
    <MatchContainer category={category}>
      <MatchTopBar categoryName={ltMatch.rule?.category?.name || ""} />
      <MatchContentContainer>
        <MatchContextContainer>
          <MatchMatchText onClick={() => isFunction(selectRuleMatch) && selectRuleMatch(ltMatch)}>
            {matchText}
          </MatchMatchText>
          <FeatureFlagsContext.Consumer>
            {(featureFlags) => (
              <ReplacementListContainer>
                {ltMatch.replacements.slice(0, featureFlags.maxReplacementsPerRuleMatch).map((r) => (
                  <div key={r.clientUuid}>
                    <Replacement
                      onClick={
                        isFunction(applyReplacement) ? () => applyReplacement(ltMatch, r.value || "") : undefined
                      }
                    >
                      {r.value}
                    </Replacement>
                  </div>
                ))}
              </ReplacementListContainer>
            )}
          </FeatureFlagsContext.Consumer>
        </MatchContextContainer>
        <MatchRuleExplanation>{ltMatch.shortMessage}</MatchRuleExplanation>
        <MatchRuleExplanation hidden={!isExpanded}>{ltMatch.message}</MatchRuleExplanation>
        <MatchActionsBar>
          <MatchExpandCollapseToggle expandedState={[isExpanded, setExpanded]} />
        </MatchActionsBar>
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
  background: ${Colors.mediumGreen};
  padding: 3px 7px;
  color: white;
  font-weight: 300;
  cursor: ${(props) => (isFunction(props.onClick) ? "pointer" : "initial")};

  &:hover {
    background: ${Colors.brightGreen};
  }
`;

interface MatchContainerProps {
  category: RuleMatchCategory;
}
const MatchContainer = styled.div<MatchContainerProps>`
  background: white;
  border-radius: 10px;
  box-shadow: 0px 6px 12px #00000029;
  padding: 20px 13px;
  border-left: 16px solid ${(props) => matchCategoryColor(props.category)};
`;

const MatchContextContainer = styled.div`
  margin: 14px 0;
  display: flex;
  gap: 15px;
  font-size: 15px;
  align-items: flex-start;
`;

const MatchMatchText = styled.button`
  text-decoration: line-through;
  background: none;
  border: none;
  cursor: pointer;
  margin: 0;
  padding: 3px 7px;
`;

const MatchRuleExplanation = styled.div`
  margin: 14px 0;
  font-size: 0.7rem;
  font-weight: 100;
`;

const MatchActionsBar = styled.div`
  font-size: 0.5625rem;
`;

const MatchExpandCollapseToggleContainer = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const MatchExpandCollapseIcon = styled(DownChevronIcon)`
  &.isExpanded {
    transform: rotate(180deg);
  }
`;
const MatchExpandCollapseText = styled.div``;

const MatchExpandCollapseToggle: FC<{ expandedState: [boolean, React.Dispatch<React.SetStateAction<boolean>>] }> = ({
  expandedState: [isExpanded, setExpanded],
}) => (
  <MatchExpandCollapseToggleContainer onClick={() => setExpanded(!isExpanded)}>
    <MatchExpandCollapseIcon className={isExpanded ? "isExpanded" : ""} />
    <MatchExpandCollapseText>{isExpanded ? "weniger" : "mehr"} anzeigen</MatchExpandCollapseText>
  </MatchExpandCollapseToggleContainer>
);
