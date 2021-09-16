import React, { Dispatch, FC, SetStateAction, useState } from "react";
import styled from "styled-components";
import { DefaultButton } from "@fluentui/react";
import { RuleMatch } from "../common/language-tool-api/types";
import { ResultsArea } from "../common/results-display/ResultsArea";
import { LanguageToolClient } from "../common/language-tool-api/LanguageToolClient";
import { getOfficeHostInfo, isRunningInOutlook, isRunningInWord } from "../common/office-api-helpers";
import { findTextNodesInXml } from "../common/language-tool-api/document-adapter";

export const TaskpaneApp: FC = () => {
  const [ltMatches, setLtMatches] = useState<RuleMatch[]>([]);
  const [isLoading, setLoading] = useState(false);

  return (
    <div>
      <TaskpaneHeading>OpenMinDEd</TaskpaneHeading>
      <DefaultButton
        className="ms-welcome__action"
        iconProps={{ iconName: "ChevronRight" }}
        onClick={async () => {
          setLoading(true);
          await clickHandler(setLtMatches);
          setLoading(false);
        }}
      >
        Prüfen
      </DefaultButton>
      <DefaultButton
        className="ms-welcome__action"
        onClick={async () => {
          setLoading(true);
          await debugClickHandler();
          setLoading(false);
        }}
      >
        Debug
      </DefaultButton>

      {isLoading ? <div>Loading...</div> : <ResultsArea ruleMatches={ltMatches} />}
    </div>
  );
};

const TaskpaneHeading = styled.h1`
  color: darkgreen;
`;

const clickHandler = async (setLtMatches: Dispatch<SetStateAction<RuleMatch[]>>) => {
  // let text: string = "";
  // if (isRunningInWord()) {
  //   await Word.run(async (context) => {
  //     const range = context.document.body.getRange(Word.RangeLocation.content);
  //     range.load();
  //     await context.sync();
  //     text = range.text;
  //   });
  // } else if (isRunningInOutlook()) {
  //   const mailboxItem = Office.context.mailbox.item;
  //   if (!mailboxItem) {
  //     throw new Error("No mailbox item selected?");
  //   }
  //   text = await new Promise((resolve, reject) => {
  //     mailboxItem.body.getAsync(Office.CoercionType.Text, (result) => resolve(result.value));
  //   });
  // } else {
  //   throw new Error("Unknown office host app");
  // }
  // const request = {
  //   text,
  //   language: "auto",
  // };
  let structuredText: string = "";
  if (isRunningInWord()) {
    await Word.run(async (context) => {
      const range = context.document.body.getRange(Word.RangeLocation.content);
      // range.load();
      const ooxml = range.getOoxml();
      await context.sync();
      structuredText = ooxml.value;
    });
  } else if (isRunningInOutlook()) {
    const mailboxItem = Office.context.mailbox.item;
    if (!mailboxItem) {
      throw new Error("No mailbox item selected?");
    }
    structuredText = await new Promise((resolve, reject) => {
      mailboxItem.body.getAsync(Office.CoercionType.Html, (result) => resolve(result.value));
    });
  } else {
    throw new Error("Unknown office host app");
  }

  const docResult = findTextNodesInXml(structuredText);
  const plaintext = docResult.startIndexMap.map((t) => t.textNode.textContent!).join("");

  const request = {
    text: plaintext,
    language: "auto",
  };
  const content = await new LanguageToolClient().check(request);
  setLtMatches(() => content.matches || []);
};

const debugClickHandler = async () => {
  // console.log(getOfficeHostInfo());
  // return;
  await Word.run(async (context) => {
    // const paragraphs = context.document.body.paragraphs;

    // const p1 = paragraphs.getFirst();
    // const tr = p1.getTextRanges([" "]);
    // tr.load("text");
    // await context.sync();
    // tr.items[1].insertText("Englische ", Word.InsertLocation.replace);
    // await context.sync();

    const paragraphs = context.document.body.paragraphs;
    // paragraphs.load();
    // await context.sync();

    const p1 = paragraphs.getFirst();
    const range = context.document.body.getRange(Word.RangeLocation.content);
    range.load();
    await context.sync();
    const oox = range.getOoxml();
    // const oox = p1.getOoxml();
    await context.sync();
    // console.log(oox.value);

    const parser = new DOMParser();
    const dom = parser.parseFromString(oox.value, "application/xml");
    debugger;
    console.log(dom);
    ///package/part[2]/xmlData/document/body/p[1]/r[1]/t
    // console.log(
    //   dom.evaluate("/package/part[2]/xmlData/document/body/p[1]/r[1]/t", dom, null, XPathResult.FIRST_ORDERED_NODE_TYPE)
    //     .singleNodeValue
    // );
  });
};
