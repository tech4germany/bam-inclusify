import React, { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import styled from "styled-components";
import { DefaultButton } from "@fluentui/react";
import { RuleMatch } from "../common/language-tool-api/types";
import { ApplyReplacementFunction, ResultsArea } from "../common/results-display/ResultsArea";
import { LanguageToolClient } from "../common/language-tool-api/LanguageToolClient";
import { getOfficeHostInfo, isRunningInOutlook, isRunningInWord } from "../common/office-api-helpers";
import { findTextNodesInXml, StartIndexTuple } from "../common/language-tool-api/document-adapter";
import { splitTextMatch } from "../common/splitTextMatch";

interface CheckResult {
  ruleMatches: RuleMatch[];
  doc: Document;
  startIndexMap: ReadonlyArray<StartIndexTuple>;
}

export const TaskpaneApp: FC = () => {
  const [ltMatches, setLtMatches] = useState<RuleMatch[]>([]);
  // const [checkResult, setCheckResult] = useState<CheckResult>();
  const [applier, setApplier] = useState<ApplyReplacementFunction>();
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
            await clickHandler(setLtMatches, setApplier);
            setLoading(false);
          }}
        >
          Prüfen
        </DefaultButton>
        <DefaultButton
          className="ms-welcome__action"
          iconProps={{ iconName: "ChevronRight" }}
          onClick={async () => {
            setLoading(true);
            await debugClickHandler(setRanges);
            setLoading(false);
          }}
        >
          Debug
        </DefaultButton>
      </div>

      {isLoading ? <div>Loading...</div> : <ResultsArea ruleMatches={ltMatches || []} applyReplacement={applier} />}
    </div>
  );
};

const TaskpaneHeading = styled.h1`
  color: darkgreen;
`;

const clickHandler = async (
  setLtMatches: Dispatch<SetStateAction<RuleMatch[]>>,
  setApplier: Dispatch<SetStateAction<ApplyReplacementFunction | undefined>>
) => {
  if (!isRunningInWord()) throw new Error("Only Word is supported for now");

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

  console.time("ltCheck");
  const request = {
    text: plaintext,
    language: "auto",
  };
  const content = await new LanguageToolClient().check(request);
  setLtMatches(content.matches || []);
  console.timeEnd("ltCheck");

  const allRanges = textRanges.flatMap((p) => p.items);
  let startIndex = 0;
  // const startIndexTuples
  let nextStartIndex = 0;
  const startIndexMap: { startIndex: number; range: Word.Range }[] = [];
  for (const range of allRanges) {
    const startIndex = nextStartIndex;
    startIndexMap.push({ startIndex, range });
    nextStartIndex += range.text.length;
  }
  console.log(startIndexMap);

  const newApplier: ApplyReplacementFunction = (ruleMatch, index, allMatches, replacementText) => {
    // console.log(`Clicked fix, rule match ${index}, replacement ${replacementText}`);
    const firstTupleIdx = startIndexMap.findIndex((i) => i.startIndex > ruleMatch.offset);
    // console.log("startIndexTuple Idx:", firstTupleIdx - 1);
    const { startIndex, range } = startIndexMap[firstTupleIdx - 1];
    // console.log("startTuple:", { startIndex, range });
    const offsetInRange = ruleMatch.offset - startIndex;
    // console.log("offsetInRange", offsetInRange, "mlen", ruleMatch.length, "rlen", range.text.length);
    const oldText = range.text;
    const [preMatch, , postMatch] = splitTextMatch(oldText, offsetInRange, ruleMatch.length);
    const newText = preMatch + replacementText + postMatch;
    range.insertText(newText, Word.InsertLocation.replace);
    range.context.sync().then(() => console.log("replaced"));
  };
  setApplier(() => newApplier);
};

const debugClickHandler = async (setParagraphs: (newParagraphs: Word.Range[]) => void) => {
  await Word.run(async (context) => {
    const ranges = context.document.body.getRange(Word.RangeLocation.whole).getTextRanges([" "], false).track();
    ranges.load();
    await context.sync();

    const newRanges = ranges.items;
    setParagraphs(newRanges);
    console.log(newRanges);
  });
};
