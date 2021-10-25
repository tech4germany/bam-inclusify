import React, { FC, useState } from "react";
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
import { SetState, UseState } from "../UseState";
import { ExpandCollapse } from "./ExpandCollapse";

export type ApplyReplacementFunction = (ruleMatch: RuleMatch, replacementText: string) => Promise<void>;

interface ResultsAreaProps {
  isLoading: boolean;
  isError: boolean;
  isSettingsOpen: boolean;
  userSettingsPanelProps: UserSettingsPanelProps;

  ruleMatches: RuleMatch[] | null;
  matchesDisabled: boolean;
  applyReplacement?: ApplyReplacementFunction;
  selectRuleMatch?: (ruleMatch: RuleMatch) => void;
}
export const ResultsArea: FC<ResultsAreaProps> = ({
  isError,
  isLoading,
  isSettingsOpen,
  ruleMatches,
  matchesDisabled,
  userSettingsPanelProps,
  applyReplacement,
  selectRuleMatch,
}) => {
  return (
    <ResultsAreaContainer>
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
        <ResultList
          ruleMatches={ruleMatches}
          matchesDisabled={matchesDisabled}
          applyReplacement={applyReplacement}
          selectRuleMatch={selectRuleMatch}
        />
      )}
    </ResultsAreaContainer>
  );
};

export const leftMarginPx = 8;
export const additionalRightMarginPx = 5;

const topOverMarginForShadow = "5px";
const ResultsAreaContainer = styled.div`
  overflow-y: auto;
  padding: 0 ${additionalRightMarginPx}px 15px ${leftMarginPx}px;
  height: calc(100% + ${topOverMarginForShadow});
  box-sizing: border-box;
  scrollbar-gutter: stable;
  padding-top: ${topOverMarginForShadow};
  margin-top: -${topOverMarginForShadow};
`;

interface ResultListProps {
  ruleMatches: RuleMatch[];
  matchesDisabled: boolean;
  applyReplacement?: ApplyReplacementFunction;
  selectRuleMatch?: (ruleMatch: RuleMatch) => void;
}

export const ResultList: FC<ResultListProps> = ({
  ruleMatches,
  matchesDisabled,
  applyReplacement,
  selectRuleMatch,
}) => (
  <UserSettingsAndFeatureFlagsContext.Consumer>
    {({ featureFlags, userSettings }) => {
      const matchesToShow = postProcessRuleMatches(ruleMatches, featureFlags, userSettings);
      return (
        <RuleMatchListContainer className={matchesDisabled ? "disabled" : ""}>
          {matchesToShow.map((ruleMatch) => (
            <RuleMatchEntry
              key={ruleMatch.clientUuid}
              ruleMatch={ruleMatch}
              isDisabled={matchesDisabled}
              applyReplacement={applyReplacement}
              selectRuleMatch={selectRuleMatch}
            />
          ))}
        </RuleMatchListContainer>
      );
    }}
  </UserSettingsAndFeatureFlagsContext.Consumer>
);

const RuleMatchListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 25px;
  opacity: 1;
  transition: opacity 0.5s ease;

  &.disabled {
    opacity: 0.5;
  }
`;

interface RuleMatchProps {
  ruleMatch: RuleMatch;
  isDisabled: boolean;
  applyReplacement?: ApplyReplacementFunction;
  selectRuleMatch: ((ruleMatch: RuleMatch) => void) | undefined;
}

const RuleMatchEntry: FC<RuleMatchProps> = ({ ruleMatch, isDisabled, applyReplacement, selectRuleMatch }) => {
  const [isExpanded, setExpanded] = useState(false);

  const [, matchText] = splitTextMatch(ruleMatch.context.text, ruleMatch.context.offset, ruleMatch.context.length);
  const category = mapRuleCategory(ruleMatch);

  const setExpandedWithReselect: SetState<boolean> = !isFunction(selectRuleMatch)
    ? setExpanded
    : (x) => {
        setExpanded(x);
        selectRuleMatch(ruleMatch);
      };

  return (
    <MatchContainer
      category={category}
      onMouseEnter={() => isFunction(selectRuleMatch) && !isDisabled && selectRuleMatch(ruleMatch)}
    >
      <MatchTopBar categoryName={ruleMatch.rule?.category?.name || ""} />
      <MatchContentContainer>
        <MatchContextContainer>
          <MatchMatchText
            disabled={isDisabled}
            onClick={() => isFunction(selectRuleMatch) && selectRuleMatch(ruleMatch)}
          >
            {matchText}
          </MatchMatchText>
          {ruleMatch.replacements.map((r) => (
            <Replacement
              key={r.clientUuid}
              disabled={isDisabled}
              onClick={isFunction(applyReplacement) ? () => applyReplacement(ruleMatch, r.value || "") : undefined}
            >
              {r.value}
            </Replacement>
          ))}
        </MatchContextContainer>
        <MatchRuleExplanation>{ruleMatch.shortMessage}</MatchRuleExplanation>
        <ExpandCollapse isExpanded={isExpanded}>
          <MatchRuleExplanation>{ruleMatch.message}</MatchRuleExplanation>
        </ExpandCollapse>
        <MatchActionsBar>
          <MatchExpandCollapseToggle disabled={isDisabled} expandedState={[isExpanded, setExpandedWithReselect]} />
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

const Replacement: FC<{ disabled: boolean; onClick: React.MouseEventHandler<HTMLButtonElement> | undefined }> = ({
  onClick,
  disabled,
  children,
}) => (
  <ReplacementItem disabled={disabled} onClick={onClick}>
    {children}
  </ReplacementItem>
);

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
  cursor: initial;

  &:not(:disabled) {
    cursor: ${(props) => (isFunction(props.onClick) ? "pointer" : "initial")};

    &:hover {
      background: ${Colors.brightGreen};
    }
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
  cursor: initial;
  margin: 0;
  margin-right: 5px;
  padding: 2px 1px;
  font-family: ${Fonts.main.family};
  font-weight: ${Fonts.main.weights.normal};
  font-style: 15px;
  letter-spacing: 0.07px;
  color: black;

  &:not(:disabled) {
    cursor: ${(props) => (isFunction(props.onClick) ? "pointer" : "initial")};
  }
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
  cursor: initial;
  display: flex;
  align-items: center;
  gap: 5px;
  background: #fafafa 0% 0% no-repeat padding-box;
  border-radius: 5px;
  min-height: 20px;

  &:not(:disabled) {
    cursor: pointer;
    &:hover {
      background-color: #efefef;
    }
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

const MatchExpandCollapseToggle: FC<{ expandedState: UseState<boolean>; disabled: boolean }> = ({
  expandedState: [isExpanded, setExpanded],
  disabled,
}) => (
  <MatchExpandCollapseToggleContainer disabled={disabled} onClick={() => setExpanded(!isExpanded)}>
    <MatchExpandCollapseIcon className={isExpanded ? "isExpanded" : ""} />
    <MatchExpandCollapseText>{isExpanded ? "weniger" : "mehr"} anzeigen</MatchExpandCollapseText>
  </MatchExpandCollapseToggleContainer>
);

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
