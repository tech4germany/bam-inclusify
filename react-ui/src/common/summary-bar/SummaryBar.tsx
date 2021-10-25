import { FC } from "react";
import styled from "styled-components";
import { Colors } from "../styles/Colors";
import { mapRuleCategory } from "../rule-categories";
import { isGrammarCheckOn, isSpellCheckOn } from "../user-settings/user-settings";
import { RuleMatch } from "../language-tool-api/types";
import { UserSettingsAndFeatureFlagsContext } from "../UserSettingsAndFeatureFlagsContext";
import { Fonts } from "../styles/Fonts";

interface SummaryBarProps {
  diversityErrorCount: number;
  grammarErrorCount: number;
  spellingErrorCount: number;
  showSummaryBoxes: boolean;
}

export const SummaryBar: FC<SummaryBarProps> = ({
  diversityErrorCount,
  grammarErrorCount,
  spellingErrorCount,
  showSummaryBoxes,
  children,
}) => (
  <UserSettingsAndFeatureFlagsContext.Consumer>
    {({ featureFlags, userSettings }) => (
      <SummaryBarContainer>
        {showSummaryBoxes && (
          <>
            {isGrammarCheckOn(userSettings, featureFlags) && <GrammarSummary grammarErrorCount={grammarErrorCount} />}
            {isSpellCheckOn(userSettings, featureFlags) && <SpellingSummary spellingErrorCount={spellingErrorCount} />}
            <DiversityErrorSummary diversityErrorCount={diversityErrorCount} />
          </>
        )}
        {children}
      </SummaryBarContainer>
    )}
  </UserSettingsAndFeatureFlagsContext.Consumer>
);

export function computeErrorCounts(ruleMatches: RuleMatch[]): {
  diversityErrorCount: number;
  grammarErrorCount: number;
  spellingErrorCount: number;
} {
  const diversityErrorCount = ruleMatches.filter((m) => mapRuleCategory(m) === "diversity").length;
  const grammarErrorCount = ruleMatches.filter((m) => mapRuleCategory(m) === "grammar").length;
  const spellingErrorCount = ruleMatches.filter((m) => mapRuleCategory(m) === "spelling").length;
  return { diversityErrorCount, grammarErrorCount, spellingErrorCount };
}

const SummaryBarContainer = styled.div`
  display: flex;
  gap: 10px;
  user-select: none;
  flex-wrap: wrap;
  justify-content: flex-end;
`;

const SummaryCountCircle = styled.div`
  background: white;
  height: 28px;
  width: 28px;
  border-radius: 50%;
  color: black;
  line-height: 28px;
  text-align: center;
  font-size: 15px;
  font-family: ${Fonts.bam.family};
  font-weight: ${Fonts.bam.weights.bold};
`;

const SummaryText = styled.div`
  color: white;
  font-size: 12px;
  text-align: center;
  flex-grow: 1;
`;

const BaseSummaryContainer = styled.div`
  font-size: 14px;
  border: none;
  border-radius: 8px;
  color: white;
  box-shadow: 0px 3px 6px #00000029;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 3px 7px;
  min-width: 135px;
`;

const GrammarSummaryContainer = styled(BaseSummaryContainer)`
  background: transparent linear-gradient(68deg, ${Colors.brightCyan} 0%, ${Colors.mediumCyan} 100%) 0% 0% no-repeat
    padding-box;
`;

const GrammarSummaryCountCircle = styled(SummaryCountCircle)`
  color: ${Colors.mediumCyan};
`;

const GrammarSummary: FC<{ grammarErrorCount: number }> = ({ grammarErrorCount: grammarMatchCount }) => (
  <GrammarSummaryContainer>
    <GrammarSummaryCountCircle>{grammarMatchCount}</GrammarSummaryCountCircle>
    <SummaryText>Grammatik</SummaryText>
  </GrammarSummaryContainer>
);

const SpellingSummaryContainer = styled(BaseSummaryContainer)`
  background: transparent linear-gradient(68deg, ${Colors.mediumRed} 0%, ${Colors.darkRed} 100%) 0% 0% no-repeat
    padding-box;
`;

const SpellingSummaryCountCircle = styled(SummaryCountCircle)`
  color: ${Colors.mediumRed};
`;

const SpellingSummary: FC<{ spellingErrorCount: number }> = ({ spellingErrorCount: spellingMatchCount }) => (
  <SpellingSummaryContainer>
    <SpellingSummaryCountCircle>{spellingMatchCount}</SpellingSummaryCountCircle>
    <SummaryText>Rechtschreibung</SummaryText>
  </SpellingSummaryContainer>
);

const DiversityErrorSummaryContainer = styled(BaseSummaryContainer)`
  background: transparent linear-gradient(68deg, ${Colors.mediumPurple} 0%, ${Colors.darkPurple} 100%) 0% 0% no-repeat
    padding-box;
`;

const DiversityErrorSummaryCountCircle = styled(SummaryCountCircle)`
  color: ${Colors.mediumPurple};
`;

const DiversityErrorSummary: FC<{ diversityErrorCount: number }> = ({ diversityErrorCount }) => (
  <DiversityErrorSummaryContainer>
    <DiversityErrorSummaryCountCircle>{diversityErrorCount}</DiversityErrorSummaryCountCircle>
    <SummaryText>Diversitätshinweise</SummaryText>
  </DiversityErrorSummaryContainer>
);
