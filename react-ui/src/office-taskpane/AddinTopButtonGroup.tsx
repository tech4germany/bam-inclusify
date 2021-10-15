import { FC } from "react";
import styled from "styled-components";
import { UserSettingsButton } from "../common/buttons/Buttons";
import { Colors } from "../common/Colors";
import { FontFamilies } from "../common/Fonts";
import { AddinCheckTextButton } from "./AddinCheckTextButton";

interface AddinButtonGroupProps {
  onCheckClicked: () => void;
  settingsOpenState: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
}
export const AddinTopButtonGroup: FC<AddinButtonGroupProps> = ({ onCheckClicked, settingsOpenState }) => (
  <AddinButtonGroupContainer>
    <InclusifyLogoLinkTile />
    <UserSettingsButton pressedState={settingsOpenState} />
    <AddinCheckTextButton onClick={onCheckClicked} />
  </AddinButtonGroupContainer>
);
const AddinButtonGroupContainer = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-bottom: 8px;
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
  font-family: ${FontFamilies.bam};
  font-size: 8px;
  line-height: 9px;
  font-style: italic;
  font-weight: 400;
  max-width: 100px;
  text-align: center;
`;
