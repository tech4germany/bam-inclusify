import React, { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import styled from "styled-components";
import { DefaultButton } from "@fluentui/react";
import { RuleMatch } from "../common/language-tool-api/types";
import { ResultsArea } from "../common/results-display/ResultsArea";
import { LanguageToolClient } from "../common/language-tool-api/LanguageToolClient";
import { getOfficeHostInfo, isRunningInOutlook, isRunningInWord } from "../common/office-api-helpers";
import { findTextNodesInXml, StartIndexTuple } from "../common/language-tool-api/document-adapter";

interface CheckResult {
  ruleMatches: RuleMatch[];
  doc: Document;
  startIndexMap: ReadonlyArray<StartIndexTuple>;
}

export const TaskpaneApp: FC = () => {
  // const [ltMatches, setLtMatches] = useState<RuleMatch[]>([]);
  const [checkResult, setCheckResult] = useState<CheckResult>();
  const [isLoading, setLoading] = useState(false);
  const [ranges, setRanges] = useState<Word.Range[]>([]);

  // useEffect(() => {
  //   const doc = Office.context.document;
  //   doc.addHandlerAsync(Office.EventType.DocumentSelectionChanged, () => {
  //     doc.getSelectedDataAsync(Office.CoercionType.Text, (r) => {
  //       console.log("Selection changed", r.value);
  //     });
  //   });
  // });

  return (
    <div>
      <TaskpaneHeading>OpenMinDEd</TaskpaneHeading>
      <div>
        <DefaultButton
          className="ms-welcome__action"
          iconProps={{ iconName: "ChevronRight" }}
          onClick={async () => {
            setLoading(true);
            await clickHandler(setCheckResult);
            setLoading(false);
          }}
        >
          Prüfen
        </DefaultButton>
        <DefaultButton
          className="ms-welcome__action"
          onClick={async () => {
            setLoading(true);
            await debugClickHandler(setRanges);
            setLoading(false);
          }}
        >
          Debug
        </DefaultButton>
        <DefaultButton
          className="ms-welcome__action"
          onClick={async () => {
            await Word.run(async (context) => {
              const r = ranges[0];
              r.insertText("Replaced", Word.InsertLocation.replace);
              await r.context.sync();
            });
          }}
        >
          Debug2
        </DefaultButton>
        {!!checkResult && (
          <DefaultButton
            className="ms-welcome__action"
            onClick={async () => {
              await reapplyClickHandler(checkResult);
            }}
          >
            Reapply
          </DefaultButton>
        )}
      </div>

      {isLoading ? <div>Loading...</div> : <ResultsArea ruleMatches={checkResult?.ruleMatches || []} />}
    </div>
  );
};

const TaskpaneHeading = styled.h1`
  color: darkgreen;
`;

const clickHandler = async (setLtMatches: (newCheckResult: CheckResult) => void) => {
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
  if (!isRunningInWord()) throw new Error("Unknown office host app");

  console.time("getTextRanges");
  const textRanges = await Word.run(async (context) => {
    const paragraphs = context.document.body.paragraphs.track().load();
    await context.sync();
    const ranges = paragraphs.items.map((p) =>
      p.getRange(Word.RangeLocation.whole).getTextRanges([" "], false).track().load()
    );
    // ranges.load();
    await context.sync();
    const textRangeCount = ranges.reduce((acc, curr) => acc + curr.items.length, 0);
    console.log(`Got ${ranges.length} paragraphs with overall ${textRangeCount} text ranges`);

    return ranges;
  });

  const plaintext = textRanges.map((p) => p.items.map((r) => r.text).join("")).join("\n");
  console.log(`Have plaintext: `, plaintext);
  console.timeEnd("getTextRanges");
  // const { doc, startIndexMap } = findTextNodesInXml(structuredText);
  // const plaintext = startIndexMap.map((t) => t.textNode.textContent!).join("");

  // const request = {
  //   text: plaintext,
  //   language: "auto",
  // };
  // const content = await new LanguageToolClient().check(request);
  // setLtMatches({ doc, startIndexMap, ruleMatches: content.matches || [] });
};

const debugClickHandler = async (setParagraphs: (newParagraphs: Word.Range[]) => void) => {
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

    const ranges = context.document.body.getRange(Word.RangeLocation.whole).getTextRanges([" "], false).track();
    ranges.load();
    await context.sync();

    const newRanges = ranges.items;
    setParagraphs(newRanges);
    console.log(newRanges);

    // const p1 = paragraphs.getFirst();
    // const range = context.document.body.getRange(Word.RangeLocation.content);
    // range.load();
    // await context.sync();
    // const oox = range.getOoxml();
    // // const oox = p1.getOoxml();
    // await context.sync();
    // console.log(oox.value);

    // const parser = new DOMParser();
    // const dom = parser.parseFromString(oox.value, "application/xml");
    // debugger;
    // console.log(dom);
    ///package/part[2]/xmlData/document/body/p[1]/r[1]/t
    // console.log(
    //   dom.evaluate("/package/part[2]/xmlData/document/body/p[1]/r[1]/t", dom, null, XPathResult.FIRST_ORDERED_NODE_TYPE)
    //     .singleNodeValue
    // );
  });
};
const reapplyClickHandler = async (checkResult: CheckResult) => {
  await Word.run(async (context) => {
    const newOoxml = new XMLSerializer().serializeToString(checkResult.doc);
    const paragraphs = context.document.body.paragraphs;
    paragraphs.load();
    paragraphs.getFirst().insertOoxml(newOoxml, Word.InsertLocation.replace);
    await context.sync();
  });
};
