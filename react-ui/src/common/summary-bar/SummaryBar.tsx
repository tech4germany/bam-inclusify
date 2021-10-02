import React, { FC } from "react";
import styled from "styled-components";
import { BaseButton } from "../buttons/Buttons";

interface SummaryBarProps {
  diversityErrorCount: number;
  grammarErrorCount: number;
  spellingErrorCount: number;
}

export const SummaryBar: FC<SummaryBarProps> = ({ diversityErrorCount, grammarErrorCount, spellingErrorCount }) => (
  <SummaryBarContainer>
    <SummaryBarSpacer />
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
`;
const SummaryBarSpacer = styled.div`
  flex-grow: 1;
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

const darkCyan = "#00556E";
const mediumCyan = "#0189BB";
const brightCyan = "#00AFF0";

const GrammarSummaryContainer = styled(BaseSummaryContainer)`
  background: transparent linear-gradient(68deg, ${brightCyan} 0%, ${mediumCyan} 100%) 0% 0% no-repeat padding-box;
`;

const GrammarSummaryCountCircle = styled(SummaryCountCircle)`
  color: ${mediumCyan};
`;

const GrammarSummary: FC<{ grammarErrorCount: number }> = ({ grammarErrorCount: grammarMatchCount }) => (
  <GrammarSummaryContainer>
    <GrammarSummaryCountCircle>{grammarMatchCount}</GrammarSummaryCountCircle>
    <SummaryText>Grammatik</SummaryText>
  </GrammarSummaryContainer>
);

const darkRed = "#8C1318";
const mediumRed = "#B40F1F";
const brightRed = "#D2001F";

const SpellingSummaryContainer = styled(BaseSummaryContainer)`
  background: transparent linear-gradient(68deg, ${mediumRed} 0%, ${darkRed} 100%) 0% 0% no-repeat padding-box;
`;

const SpellingSummaryCountCircle = styled(SummaryCountCircle)`
  color: ${mediumRed};
`;

const SpellingSummary: FC<{ spellingErrorCount: number }> = ({ spellingErrorCount: spellingMatchCount }) => (
  <SpellingSummaryContainer>
    <SpellingSummaryCountCircle>{spellingMatchCount}</SpellingSummaryCountCircle>
    <SummaryText>Rechtschreibung</SummaryText>
  </SpellingSummaryContainer>
);

const darkPurple = "#6C3A90";
const mediumPurple = "#8F4DBF";
const brightPurple = "#AB5DE3";

const DiversityErrorSummaryContainer = styled(BaseSummaryContainer)`
  background: transparent linear-gradient(68deg, ${mediumPurple} 0%, ${darkPurple} 100%) 0% 0% no-repeat padding-box;
`;

const DiversityErrorSummaryCountCircle = styled(SummaryCountCircle)`
  color: ${mediumPurple};
`;

const DiversityErrorSummary: FC<{ diversityErrorCount: number }> = ({ diversityErrorCount }) => (
  <DiversityErrorSummaryContainer>
    <DiversityErrorSummaryCountCircle>{diversityErrorCount}</DiversityErrorSummaryCountCircle>
    <SummaryText>Diversitätslücken</SummaryText>
  </DiversityErrorSummaryContainer>
);

const darkYellow = "#CD7D00";
const mediumYellow = "#E69B00";

const UserSettingsButtonContainer = styled(BaseButton)`
  background: transparent linear-gradient(68deg, ${mediumYellow} 0%, ${darkYellow} 100%) 0% 0% no-repeat padding-box;
  &:hover {
    background: ${mediumYellow};
  }
`;

const UserSettingsButton = () => <UserSettingsButtonContainer>ES</UserSettingsButtonContainer>;
