import React from "react";
import styled from "styled-components";
import { FeatureFlagsContext } from "../common/feature-flags/feature-flags";
import { InclusifyBamLogo, InclusifyLogo } from "../common/icons";
import { CenteredContainer } from "./CenteredContainer";

export const NavigationBar = () => (
  <NavBarContainer>
    <CenteredContainer>
      <NavBarItemsContainer>
        <NavBarAppIcon />
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
  align-items: center;
`;
const NavBarSpacer = styled.div`
  flex-grow: 1;
`;

const NavBarAppIcon = () => (
  <FeatureFlagsContext.Consumer>
    {(featureFlags) => (
      <NavBarAppIconContainer>
        {featureFlags.useBamLogo ? <InclusifyBamLogo /> : <InclusifyLogo />}
      </NavBarAppIconContainer>
    )}
  </FeatureFlagsContext.Consumer>
);

const navBarHeight = "85px";
const NavBarAppIconContainer = styled.div``;
const NavBarLinkItem = styled.a`
  font-size: 20px;
  height: ${navBarHeight};
  line-height: ${navBarHeight};
  padding: 0 30px;
  color: gray;
`;
