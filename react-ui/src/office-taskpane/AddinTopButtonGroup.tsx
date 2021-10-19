import { FC } from "react";
import styled from "styled-components";
import { Colors } from "../common/styles/Colors";
import { Fonts } from "../common/styles/Fonts";
import { UseState } from "../common/UseState";
import { AddinCheckTextButton } from "./AddinCheckTextButton";
import { AddinUserSettingsButton } from "./AddinUserSettingsButton";

interface AddinButtonGroupProps {
  onCheckClicked: () => void;
  settingsOpenState: UseState<boolean>;
}
export const AddinTopButtonGroup: FC<AddinButtonGroupProps> = ({ onCheckClicked, settingsOpenState }) => (
  <AddinButtonGroupContainer>
    <InclusifyLogoLinkTile />
    <AddinUserSettingsButton pressedState={settingsOpenState} />
    <AddinCheckTextButton onClick={onCheckClicked} />
  </AddinButtonGroupContainer>
);
const AddinButtonGroupContainer = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;

const InclusifyLogoLinkTile = () => (
  <InclusifyLogoLinkTileContainer href="#">
    <InclusifyLogoContainer />
    <InclusifyLogoLinkText>Deine Assistentin für diversitätsensible Sprache</InclusifyLogoLinkText>
  </InclusifyLogoLinkTileContainer>
);
const InclusifyLogoLinkTileContainer = styled.a`
  background: #ffffff 0% 0% no-repeat padding-box;
  box-shadow: 0px 3px 6px #00000029;
  border-radius: 8px;
  min-width: 145px;
  min-height: 95px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 20px 15px;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  text-decoration: none;
  color: ${Colors.darkBlueText};

  &:hover {
  }
`;
const InclusifyLogoContainer = styled.div`
  border: 1px solid gray;
  width: 14px;
  height: 26px;
  box-sizing: border-box;
`;
const InclusifyLogoLinkText = styled.div`
  font-family: ${Fonts.bam.family};
  font-size: 8px;
  line-height: 9px;
  font-style: italic;
  font-weight: ${Fonts.bam.weights.bold};
  max-width: 100px;
  text-align: center;
`;
