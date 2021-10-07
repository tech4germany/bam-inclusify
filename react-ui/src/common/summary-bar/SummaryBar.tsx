import React, { FC } from "react";
import styled from "styled-components";
import { GearIcon } from "../../icons";
import { Colors } from "../Colors";

interface SummaryBarProps {
  diversityErrorCount: number;
  grammarErrorCount: number;
  spellingErrorCount: number;
}

export const SummaryBar: FC<SummaryBarProps> = ({ diversityErrorCount, grammarErrorCount, spellingErrorCount }) => (
  <SummaryBarContainer>
    <GrammarSummary grammarErrorCount={grammarErrorCount} />
    <SpellingSummary spellingErrorCount={spellingErrorCount} />
    <DiversityErrorSummary diversityErrorCount={diversityErrorCount} />
    <UserSettingsButton />
  </SummaryBarContainer>
);

const SummaryBarContainer = styled.div`
  margin: 24px 0;
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
  font-size: 14px;
`;

const SummaryText = styled.div`
  color: white;
  font-size: 12px;
`;

const BaseSummaryContainer = styled.div`
  font-size: 14px;
  border: none;
  border-radius: 8px;
  color: white;
  box-shadow: 0px 3px 6px #00000029;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 3px 12px 3px 7px;
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

const UserSettingsButtonContainer = styled.button`
  font-size: 14px;
  border: none;
  border-radius: 8px;
  color: white;
  background: transparent linear-gradient(68deg, ${Colors.mediumYellow} 0%, ${Colors.darkYellow} 100%) 0% 0% no-repeat
    padding-box;
  padding: 4px 8px;

  &:hover {
    background: ${Colors.brightYellow};
  }
  &:active {
    background: ${Colors.darkYellow};
  }
`;

const UserSettingsIconContainer = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: white;

  display: flex;
  align-items: center;
  justify-content: center;
`;

const UserSettingsButton = () => (
  <UserSettingsButtonContainer>
    <UserSettingsIconContainer>
      <GearIcon />
    </UserSettingsIconContainer>
  </UserSettingsButtonContainer>
);
