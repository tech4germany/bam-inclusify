import styled from "styled-components";

export const ImpressumAndDatenschutzLinks = () =>
  process.env.REACT_APP_SHOW_IMPRESSUM_AND_DATENSCHUTZ !== "1" ? null : (
    <IDLinksRow>
      <IDLink href="./impressum.html">Impressum</IDLink>
      <IDLinkDivider />
      <IDLink href="./datenschutz.html">Datenschutz</IDLink>
    </IDLinksRow>
  );

const IDLinksRow = styled.div`
  margin: 0 0 10px;
  display: flex;
  gap: 8px;
  justify-content: center;
`;

const IDLink = styled.a`
  font-size: 10px;
  color: #aaa;
`;

const IDLinkDivider = styled.div`
  border-left: 1px solid #aaa;
`;
