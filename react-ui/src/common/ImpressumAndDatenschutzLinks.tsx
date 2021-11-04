import { FC } from "react";
import styled from "styled-components";

export const ImpressumAndDatenschutzLinks: FC<{ isAddin?: boolean }> = ({ isAddin }) => (
  <IDLinksRow>
    {process.env.REACT_APP_SHOW_IMPRESSUM_AND_DATENSCHUTZ !== "1" ? null : (
      <>
        <IDLink isAddin={!!isAddin} href="./impressum-datenschutz.html">
          Impressum &amp; Datenschutz
        </IDLink>
        <IDLinkDivider />
      </>
    )}
    <IDLink isAddin={!!isAddin} href="./lizenzen.html">
      Lizenzen
    </IDLink>
  </IDLinksRow>
);

const IDLinksRow = styled.div`
  margin: 0 0 10px;
  display: flex;
  gap: 8px;
  justify-content: center;
`;

const IDLinkContainer = styled.a`
  font-size: 10px;
  color: #aaa;
`;

const IDLink: FC<{ isAddin: boolean; href: string }> = ({ isAddin, href, children }) => (
  <IDLinkContainer href={`${href}${isAddin ? "?returnTo=taskpane.html" : ""}`}>{children}</IDLinkContainer>
);

const IDLinkDivider = styled.div`
  border-left: 1px solid #aaa;
`;
