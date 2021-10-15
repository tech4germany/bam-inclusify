import React, { FC } from "react";
import styled from "styled-components";
import { UserSettingsButton } from "../buttons/Buttons";
import { Colors } from "../Colors";
import { FeatureFlagsContext } from "../feature-flags/feature-flags";
import { isGrammarCheckOn, isSpellCheckOn } from "../user-settings/user-settings";
import { UserSettingsContext } from "../user-settings/UserSettingsStorage";

interface SummaryBarProps {
  diversityErrorCount: number;
  grammarErrorCount: number;
  spellingErrorCount: number;
  pressedState?: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
  addinMode?: boolean;
}

export const SummaryBar: FC<SummaryBarProps> = ({
  diversityErrorCount,
  grammarErrorCount,
  spellingErrorCount,
  pressedState,
  addinMode,
}) => (
  <UserSettingsContext.Consumer>
    {(userSettings) => (
      <FeatureFlagsContext.Consumer>
        {(featureFlags) => (
          <SummaryBarContainer addinMode={!!addinMode}>
            {isGrammarCheckOn(userSettings, featureFlags) && <GrammarSummary grammarErrorCount={grammarErrorCount} />}
            {isSpellCheckOn(userSettings, featureFlags) && <SpellingSummary spellingErrorCount={spellingErrorCount} />}
            <DiversityErrorSummary diversityErrorCount={diversityErrorCount} />
            {pressedState && <UserSettingsButton pressedState={pressedState} />}
          </SummaryBarContainer>
        )}
      </FeatureFlagsContext.Consumer>
    )}
  </UserSettingsContext.Consumer>
);

const SummaryBarContainer = styled.div<{ addinMode: boolean }>`
  display: flex;
  gap: ${(props) => (props.addinMode ? "5px" : "10px")};
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
  font-size: 14px;
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
    <SummaryText>Diversitätslücken</SummaryText>
  </DiversityErrorSummaryContainer>
);
