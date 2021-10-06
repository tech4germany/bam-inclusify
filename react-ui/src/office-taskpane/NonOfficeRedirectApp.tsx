import React from "react";
import styled from "styled-components";

export const NonOfficeRedirectApp = () => (
  <NonOfficeRedirectAppContainer>
    <h1>Fehler</h1>
    <p>Diese Seite ist für die Verwendung in Office Add-Ins gedacht.</p>
    <p>
      Unsere Seite zur Verwendung im Browser findest du <a href=".">hier</a>.
    </p>
  </NonOfficeRedirectAppContainer>
);

const NonOfficeRedirectAppContainer = styled.div`
  margin: 0 2rem;
`;
