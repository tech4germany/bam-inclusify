import React from "react";
import ReactDOM from "react-dom";
import { makeGlobalStyle } from "../common/styles/global-styles";
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

    // Object.values(Office.EventType).forEach((k) => {
    //   try {
    //     Office.context.document.addHandlerAsync(k as any, (...args: any[]) => console.log(...args));
    //     console.warn("success:" + k);
    //   } catch (e) {
    //     console.error("Failed to add handler for " + k);
    //   }
    // });
    ReactDOM.render(
      <React.StrictMode>
        <GlobalStyle />
        <TaskpaneApp />
      </React.StrictMode>,
      rootElement
    );
  }
});
