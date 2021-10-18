import React from "react";
import styled from "styled-components";
import { CenteredContainer } from "./CenteredContainer";

export const NavigationBar = () => (
  <NavBarContainer>
    <CenteredContainer>
      <NavBarItemsContainer>
        <NavBarAppIconContainer>INCLUSIFY</NavBarAppIconContainer>
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
`;
const NavBarSpacer = styled.div`
  flex-grow: 1;
`;

const navBarHeight = "85px";
const NavBarAppIconContainer = styled.div`
  font-size: 30px;
  font-weight: bold;
  height: ${navBarHeight};
  line-height: ${navBarHeight};
`;
const NavBarLinkItem = styled.a`
  font-size: 20px;
  height: ${navBarHeight};
  line-height: ${navBarHeight};
  padding: 0 30px;
  color: gray;
`;
