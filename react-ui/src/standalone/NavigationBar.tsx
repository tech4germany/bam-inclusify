import styled from "styled-components";
import { InclusifyBamLogo, InclusifyLogo } from "../common/icons";
import { Fonts } from "../common/styles/Fonts";
import { UserSettingsAndFeatureFlagsContext } from "../common/UserSettingsAndFeatureFlagsContext";
import { CenteredContainer } from "./CenteredContainer";

export const NavigationBar = () => (
  <NavBarContainer>
    <CenteredContainer>
      <NavBarItemsContainer>
        <NavBarAppIconRow>
          <NavBarAppIcon />
          <NavBarAppIconSmallText>Deine Assistentin für diversitätsensible Sprache</NavBarAppIconSmallText>
        </NavBarAppIconRow>
        <NavBarSpacer />
        <NavBarLinkItem>Das Projekt</NavBarLinkItem>
        <NavBarLinkItem>BAM Leitfaden</NavBarLinkItem>
        <NavBarLinkItem>FAQ</NavBarLinkItem>
      </NavBarItemsContainer>
    </CenteredContainer>
  </NavBarContainer>
);

const NavBarContainer = styled.div`
  background: white;
`;

const NavBarItemsContainer = styled.div`
  display: flex;
  align-items: flex-end;
`;
const NavBarSpacer = styled.div`
  flex-grow: 1;
`;

const NavBarAppIconRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 9px;
`;

const NavBarAppIconSmallText = styled.div`
  font-family: ${Fonts.bam.family};
  font-weight: ${Fonts.bam.weights.bold};
  font-size: 15px;
  line-height: 18px;
  letter-spacing: 0px;
  font-style: italic;
  margin-left: 3em;
`;

const NavBarAppIcon = () => (
  <UserSettingsAndFeatureFlagsContext.Consumer>
    {({ featureFlags }) => (
      <NavBarAppIconContainer>
        {featureFlags.useBamLogo ? <InclusifyBamLogo /> : <InclusifyLogo />}
      </NavBarAppIconContainer>
    )}
  </UserSettingsAndFeatureFlagsContext.Consumer>
);

const navBarHeight = "100px";
const NavBarAppIconContainer = styled.div``;
const NavBarLinkItem = styled.a`
  font-size: 20px;
  height: ${navBarHeight};
  line-height: ${navBarHeight};
  padding: 0 30px;
  color: gray;
`;
