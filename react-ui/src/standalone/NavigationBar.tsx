import styled from "styled-components";
import { InclusifyBamLogo, InclusifyLogo } from "../common/icons";
import { Fonts } from "../common/styles/Fonts";
import { CenteredContainer } from "./CenteredContainer";
import navLinksJson from "../navigation-links.json";
import { newUuidv4 } from "../common/uuid";
import { isValidUrl } from "../common/isValidUrl";
import { rightMargin } from "../office-taskpane/taskpane-style-constants";
import { isBamBuild } from "../common/feature-flags/feature-flags";

const navLinks = extractNavLinks();

export const NavigationBar = () => (
  <NavBarContainer>
    <CenteredContainer>
      <NavBarItemsContainer>
        <NavBarAppIconRow>
          <NavBarAppIcon />
          <NavBarAppIconSmallText>Deine Assistentin für diversitätssensible Sprache</NavBarAppIconSmallText>
        </NavBarAppIconRow>
        <NavBarSpacer />
        {navLinks.map((l) => (
          <NavBarLinkItem key={l.id} href={l.url} target={"_blank"}>
            <NavBarLinkText>{l.title}</NavBarLinkText>
            {l.subtitle && <NavBarLinkSubtitle>{l.subtitle}</NavBarLinkSubtitle>}
          </NavBarLinkItem>
        ))}
      </NavBarItemsContainer>
    </CenteredContainer>
  </NavBarContainer>
);

const navBarHeight = "100px";
const NavBarContainer = styled.div`
  background: white;
`;

const NavBarItemsContainer = styled.div`
  display: flex;
  align-items: flex-end;
  height: ${navBarHeight};
  margin-right: ${rightMargin};
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
  <NavBarAppIconContainer>{isBamBuild ? <InclusifyBamLogo /> : <InclusifyLogo />}</NavBarAppIconContainer>
);

const NavBarAppIconContainer = styled.div`
  min-height: 44px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;
const NavBarLinkItem = styled.a`
  /* height: ${navBarHeight}; */
  padding: 0 30px;
  text-decoration: none;
  color: #1b9cd8;
  background: white;

  height: 100%;
  min-width: 150px;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #1b9cd8;
    background: #e3f6ff;
  }
`;
const NavBarLinkText = styled.div`
  font-family: ${Fonts.bam.family};
  font-weight: ${Fonts.bam.weights.normal};
  font-size: 20px;
  line-height: 24px;
  letter-spacing: 0px;
`;
const NavBarLinkSubtitle = styled.div`
  font-family: ${Fonts.bam.family};
  font-weight: ${Fonts.bam.weights.normal};
  font-size: 15px;
  line-height: 18px;
  letter-spacing: 0px;
`;

function extractNavLinks() {
  const linkListValue = (navLinksJson as any)?.standaloneNavigationLinks;
  if (!linkListValue || !Array.isArray(linkListValue)) {
    console.error("No standalone nav links found");
    return [];
  }
  const cleanList = linkListValue
    .filter((l, idx) => {
      if (typeof l === "object" && typeof l["title"] === "string" && typeof l["url"] === "string") {
        if (!isValidUrl(l["url"])) {
          console.log(`Invalid URL in standalone nav link ${idx}`, l["url"]);
          return false;
        }
        return true;
      }
      console.warn(
        `Standalone nav link ${idx} doesn't match expected format (object with string properties 'title' and 'url', and optional string property 'subtitle')`
      );
      return false;
    })
    .map((l) => ({
      title: l["title"] as string,
      url: l["url"] as string,
      subtitle: typeof l["subtitle"] === "string" ? l["subtitle"] : undefined,
      id: newUuidv4(),
    }));
  return cleanList;
}
