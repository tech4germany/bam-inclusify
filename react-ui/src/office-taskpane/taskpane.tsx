import React from "react";
import ReactDOM from "react-dom";
import { makeGlobalStyle } from "../common/global-styles";
import { TaskpaneApp } from "./TaskpaneApp";
import { setOfficeHostInfo } from "../common/office-api-helpers";
import { NonOfficeRedirectApp } from "./NonOfficeRedirectApp";

const GlobalStyle = makeGlobalStyle(true);

/* Initialize office and start rendering application */
Office.onReady().then((info) => {
  const rootElement = document.getElementById("root");
  if (!info || (!info?.host && !info?.platform)) {
    ReactDOM.render(
      <React.StrictMode>
        <GlobalStyle />
        <NonOfficeRedirectApp />
      </React.StrictMode>,
      rootElement
    );
  } else {
    setOfficeHostInfo(info);

    ReactDOM.render(
      <React.StrictMode>
        <GlobalStyle />
        <TaskpaneApp />
      </React.StrictMode>,
      rootElement
    );
  }
});
