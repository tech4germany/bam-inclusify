import React, { FC, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { CancelIcon, DownChevronIcon } from "../icons";
import { Colors } from "../styles/Colors";
import { FeatureFlags } from "../feature-flags/feature-flags";
import { RuleMatch } from "../language-tool-api/types";
import { mapUserSettingsToReplacementPostProcessing } from "../language-tool-api/user-settings-language-mapping";
import {
  diversityRuleCategories,
  grammarRuleCategories,
  mapRuleCategory,
  RuleMatchCategory,
  spellingRuleCategories,
} from "../rule-categories";
import { splitTextMatch } from "../splitTextMatch";
import { isFunction } from "../type-helpers";
import { isGrammarCheckOn, isSpellCheckOn, UserSettings } from "../user-settings/user-settings";
import { Fonts } from "../styles/Fonts";
import { UserSettingsPanel, UserSettingsPanelProps } from "../user-settings/UserSettingsPanel";
import { CompletionMessage } from "../message-panels/CompletionMessage";
import { ErrorMessage } from "../message-panels/ErrorMessage";
import { LoadingMessage } from "../message-panels/LoadingMessage";
import { WelcomeMessage } from "../message-panels/WelcomeMessage";
import { UserSettingsAndFeatureFlagsContext } from "../UserSettingsAndFeatureFlagsContext";
import { UseState } from "../UseState";

export type ApplyReplacementFunction = (ruleMatch: RuleMatch, replacementText: string) => Promise<void>;

interface ResultsAreaProps {
  isLoading: boolean;
  isError: boolean;
  isSettingsOpen: boolean;
  userSettingsPanelProps: UserSettingsPanelProps;

  ruleMatches: RuleMatch[] | null;
  applyReplacement?: ApplyReplacementFunction;
  selectRuleMatch?: (ruleMatch: RuleMatch) => void;
}
export const ResultsArea: FC<ResultsAreaProps> = ({
  isError,
  isLoading,
  isSettingsOpen,
  ruleMatches,
  userSettingsPanelProps,
  applyReplacement,
  selectRuleMatch,
}) => {
  return (
    <>
      {isSettingsOpen ? (
        <UserSettingsPanel {...userSettingsPanelProps} />
      ) : isError ? (
        <ErrorMessage />
      ) : isLoading ? (
        <LoadingMessage />
      ) : ruleMatches === null ? (
        <WelcomeMessage />
      ) : ruleMatches.length === 0 ? (
        <CompletionMessage />
      ) : (
        <ResultList ruleMatches={ruleMatches} applyReplacement={applyReplacement} selectRuleMatch={selectRuleMatch} />
      )}
    </>
  );
};

interface ResultListProps {
  ruleMatches: RuleMatch[];
  applyReplacement?: ApplyReplacementFunction;
  selectRuleMatch?: (ruleMatch: RuleMatch) => void;
}

export const ResultList: FC<ResultListProps> = ({ ruleMatches, applyReplacement, selectRuleMatch }) => (
  <div>
    <UserSettingsAndFeatureFlagsContext.Consumer>
      {({ featureFlags, userSettings }) => {
        const matchesToShow = postProcessRuleMatches(ruleMatches, featureFlags, userSettings);
        return (
          <LtMatchesListContainer>
            {matchesToShow.map((ltMatch) => (
              <LtMatch
                key={ltMatch.clientUuid}
                ltMatch={ltMatch}
                applyReplacement={applyReplacement}
                selectRuleMatch={selectRuleMatch}
              />
            ))}
          </LtMatchesListContainer>
        );
      }}
    </UserSettingsAndFeatureFlagsContext.Consumer>
  </div>
);

const LtMatchesListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 25px;
`;

interface LtMatchProps {
  ltMatch: RuleMatch;
  applyReplacement?: ApplyReplacementFunction;
  selectRuleMatch: ((ruleMatch: RuleMatch) => void) | undefined;
}

const LtMatch: FC<LtMatchProps> = ({ ltMatch, applyReplacement, selectRuleMatch }) => {
  const [isExpanded, setExpanded] = useState(false);

  const [, matchText] = splitTextMatch(ltMatch.context.text, ltMatch.context.offset, ltMatch.context.length);
  const category = mapRuleCategory(ltMatch);

  return (
    <MatchContainer category={category} onMouseEnter={() => isFunction(selectRuleMatch) && selectRuleMatch(ltMatch)}>
      <MatchTopBar categoryName={ltMatch.rule?.category?.name || ""} />
      <MatchContentContainer>
        <MatchContextContainer>
          <MatchMatchText onClick={() => isFunction(selectRuleMatch) && selectRuleMatch(ltMatch)}>
            {matchText}
          </MatchMatchText>
          {ltMatch.replacements.map((r) => (
            <Replacement
              key={r.clientUuid}
              onClick={isFunction(applyReplacement) ? () => applyReplacement(ltMatch, r.value || "") : undefined}
            >
              {r.value}
            </Replacement>
          ))}
        </MatchContextContainer>
        <MatchRuleExplanation>{ltMatch.shortMessage}</MatchRuleExplanation>
        <ExpandCollapse isExpanded={isExpanded}>
          <MatchRuleExplanation>{ltMatch.message}</MatchRuleExplanation>
        </ExpandCollapse>
        <MatchActionsBar>
          <MatchExpandCollapseToggle expandedState={[isExpanded, setExpanded]} />
          <MatchActionsBarSpacer />
          <IgnoreMatchButton />
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
  font-size: 12px;
  letter-spacing: 0.06px;
  font-family: ${Fonts.bam.family};
  font-weight: ${Fonts.bam.weights.normal};
  display: flex;
  gap: 1rem;
  align-items: center;
`;

export function postProcessRuleMatches(
  ruleMatches: RuleMatch[],
  featureFlags: FeatureFlags,
  userSettings: UserSettings
): RuleMatch[] {
  return ruleMatches
    .filter((m) => {
      const ruleCategoryId = m.rule?.category?.id || "";
      return (
        diversityRuleCategories.includes(ruleCategoryId) ||
        (isGrammarCheckOn(userSettings, featureFlags) && grammarRuleCategories.includes(ruleCategoryId)) ||
        (isSpellCheckOn(userSettings, featureFlags) && spellingRuleCategories.includes(ruleCategoryId))
      );
    })
    .map((m) => ({
      ...m,
      replacements: m.replacements
        ?.map((r) => ({ ...r, value: mapUserSettingsToReplacementPostProcessing(userSettings)(r.value) }))
        .filter((r) => !!r.value)
        .slice(0, featureFlags.maxReplacementsPerRuleMatch),
    }));
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

const MatchCategoryContainer = styled.div`
  color: gray;
`;

const MatchContentContainer = styled.div`
  margin: 0;
`;

const Replacement: FC<{ onClick: React.MouseEventHandler<HTMLButtonElement> | undefined }> = ({
  onClick,
  children,
}) => <ReplacementItem onClick={onClick}>{children}</ReplacementItem>;

const ReplacementItem = styled.button`
  border: none;
  border-radius: 4px;
  background: ${Colors.mediumGreen};
  padding: 4px 6px;
  color: white;
  font-family: ${Fonts.main.family};
  font-weight: ${Fonts.main.weights.normal};
  font-size: 13px;
  line-height: 14px;
  letter-spacing: 0.07px;
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
  padding: 11px 13px 15px;
  border-left: 16px solid ${(props) => matchCategoryColor(props.category)};
`;

const MatchContextContainer = styled.div`
  margin: 14px 0;
  display: flex;
  column-gap: 5px;
  row-gap: 5px;
  align-items: flex-start;
  flex-wrap: wrap;
`;

const MatchMatchText = styled.button`
  text-decoration: line-through;
  background: none;
  border: none;
  cursor: pointer;
  margin: 0;
  margin-right: 5px;
  padding: 2px 1px;
  font-family: ${Fonts.main.family};
  font-weight: ${Fonts.main.weights.normal};
  font-style: 15px;
  letter-spacing: 0.07px;
`;

const MatchRuleExplanation = styled.div`
  margin: 15px 0 0;
  font-size: 11px;
  line-height: 18px;
  letter-spacing: 0.06px;
  font-family: ${Fonts.main.family};
  font-weight: ${Fonts.main.weights.thin};
`;

const MatchActionsBar = styled.div`
  display: flex;
  margin-top: 20px;
`;

const MatchActionsBarSpacer = styled.div`
  flex-grow: 1;
`;

const MatchExpandCollapseToggleContainer = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  background: #fafafa 0% 0% no-repeat padding-box;
  border-radius: 5px;
  min-height: 20px;

  &:hover {
    background-color: #efefef;
  }
`;

const MatchExpandCollapseIcon = styled(DownChevronIcon)`
  fill: #565757;
  &.isExpanded {
    transform: rotate(180deg);
  }
`;
const MatchExpandCollapseText = styled.div`
  color: #333333;
  font-size: 9px;
  letter-spacing: 0.04px;
  font-family: ${Fonts.main.family};
  font-weight: ${Fonts.main.weights.thin};
`;

const MatchExpandCollapseToggle: FC<{ expandedState: UseState<boolean> }> = ({
  expandedState: [isExpanded, setExpanded],
}) => (
  <MatchExpandCollapseToggleContainer onClick={() => setExpanded(!isExpanded)}>
    <MatchExpandCollapseIcon className={isExpanded ? "isExpanded" : ""} />
    <MatchExpandCollapseText>{isExpanded ? "weniger" : "mehr"} anzeigen</MatchExpandCollapseText>
  </MatchExpandCollapseToggleContainer>
);

const ExpandCollapse: FC<{ isExpanded: boolean }> = ({ isExpanded, children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const measurerRef = useRef<HTMLDivElement>(null);
  const heightRef = useRef(0);
  useEffect(() => {
    heightRef.current = measurerRef.current?.scrollHeight || 0;
  });

  return (
    <ExpandCollapseContainer ref={containerRef} style={{ height: isExpanded ? heightRef.current + "px" : "0" }}>
      <ExpandCollapseMeasurer ref={measurerRef}>{children}</ExpandCollapseMeasurer>
    </ExpandCollapseContainer>
  );
};
const ExpandCollapseContainer = styled.div`
  overflow-y: hidden;
  transition: height 0.4s ease;
`;
const ExpandCollapseMeasurer = styled.div`
  display: flex;
`;

const IgnoreMatchButton = () => (
  <UserSettingsAndFeatureFlagsContext.Consumer>
    {({ featureFlags }) =>
      featureFlags.showIgnoreButton && (
        <IgnoreMatchButtonContainer>
          <CancelIcon height={20} width={20} fill={"currentColor"} />
        </IgnoreMatchButtonContainer>
      )
    }
  </UserSettingsAndFeatureFlagsContext.Consumer>
);
const IgnoreMatchButtonContainer = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  margin: 0;
  padding: 0;
  color: #565757;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #777777;
  }
`;
