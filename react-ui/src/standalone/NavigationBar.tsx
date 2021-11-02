import styled from "styled-components";
import { InclusifyBamLogo, InclusifyLogo } from "../common/icons";
import { Fonts } from "../common/styles/Fonts";
import { UserSettingsAndFeatureFlagsContext } from "../common/UserSettingsAndFeatureFlagsContext";
import { CenteredContainer } from "./CenteredContainer";
import navLinksJson from "../navigation-links.json";
import { newUuidv4 } from "../common/uuid";
import { isValidUrl } from "../common/isValidUrl";
import { rightMargin } from "../office-taskpane/taskpane-style-constants";

const navLinks = extractNavLinks();

export const NavigationBar = () => (
  <NavBarContainer>
    <CenteredContainer>
      <NavBarItemsContainer>
        <NavBarAppIconRow>
          <NavBarAppIcon />
          <NavBarAppIconSmallText>einfach diversitätssensibel.</NavBarAppIconSmallText>
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

const NavBarContainer = styled.div`
  background: white;
`;

const NavBarItemsContainer = styled.div`
  display: flex;
  align-items: flex-end;
  margin-right: ${rightMargin};

  height: 100px;
  font-size: 20px;

  @media (max-width: 650px) {
    height: 50px;
    font-size: 14px;
  }
`;
const NavBarSpacer = styled.div`
  flex-grow: 1;
`;

const NavBarAppIconRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 9px;

  @media (max-width: 650px) {
    gap: 4px;
    padding-bottom: 4px;
  }
`;

const NavBarAppIconSmallText = styled.div`
  font-family: ${Fonts.bam.family};
  font-weight: ${Fonts.bam.weights.bold};
  font-size: 75%;
  line-height: 1.2;
  letter-spacing: 0px;
  font-style: italic;
`;

const NavBarAppIcon = () => (
  <UserSettingsAndFeatureFlagsContext.Consumer>
    {({ featureFlags }) => (
      <NavBarAppIconContainer>
        {featureFlags.useBamLogo ? <InclusifyBamLogo width="" height="" /> : <InclusifyLogo width="" height="" />}
      </NavBarAppIconContainer>
    )}
  </UserSettingsAndFeatureFlagsContext.Consumer>
);

const NavBarAppIconContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;

  min-height: 44px;

  @media (max-width: 650px) {
    min-height: 22px;
    max-height: 22px;
  }
  > svg {
    height: 100%;
    width: auto;
  }
`;
const NavBarLinkItem = styled.a`
  padding: 0 30px;
  text-decoration: none;
  color: #1b9cd8;
  background: white;

  height: 100%;
  min-width: 100px;
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
  font-size: 100%;
  line-height: 1.4;
  letter-spacing: 0px;
`;
const NavBarLinkSubtitle = styled.div`
  font-family: ${Fonts.bam.family};
  font-weight: ${Fonts.bam.weights.normal};
  font-size: 75%;
  line-height: 1.2;
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
