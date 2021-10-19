import { FC } from "react";
import styled from "styled-components";
import { InclusifyBamLogo, InclusifyLogo } from "../common/icons";
import { Colors } from "../common/styles/Colors";
import { Fonts } from "../common/styles/Fonts";
import { UserSettingsAndFeatureFlagsContext } from "../common/UserSettingsAndFeatureFlagsContext";
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
    <UserSettingsAndFeatureFlagsContext.Consumer>
      {({ featureFlags }) => (
        <>
          <InclusifyLogoContainer>
            {featureFlags.useBamLogo ? <InclusifyBamLogo /> : <InclusifyLogo />}
          </InclusifyLogoContainer>
          <InclusifyLogoLinkText>Deine Assistentin für diversitätsensible Sprache</InclusifyLogoLinkText>
        </>
      )}
    </UserSettingsAndFeatureFlagsContext.Consumer>
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
  gap: 13px;
  padding: 15px 12px 10px;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  text-decoration: none;
  color: ${Colors.darkBlueText};

  &:hover {
  }
`;
const InclusifyLogoContainer = styled.div`
  width: 100%;
  display: flex;
  max-height: 30px;
  align-items: center;
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
