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

type ParagraphWithRanges = { paragraph: Word.Paragraph; ranges: Word.Range[] };
type StartIndexMapItem = { startIndex: number; paragraph: Word.Paragraph; range: Word.Range };

const clickHandler = async (
  setLtMatches: Dispatch<SetStateAction<RuleMatch[]>>,
  setApplier: Dispatch<SetStateAction<ApplyReplacementFunction | undefined>>
) => {
  if (!isRunningInWord()) throw new Error("Only Word is supported for now");

  console.time("getTextRanges");
  const paragraphsWithRanges: ParagraphWithRanges[] = await Word.run(async (context) => {
    const paragraphs = context.document.body.paragraphs.track().load();
    await context.sync();
    const ranges = paragraphs.items.map((paragraph) => ({
      paragraph,
      rangeCollection: paragraph.getRange(Word.RangeLocation.whole).getTextRanges([" "], false).track().load(),
    }));
    await context.sync();

    return ranges.map(({ paragraph, rangeCollection }) => ({ paragraph, ranges: rangeCollection.items }));
  });

  const { plaintext, startIndexMap } = extractPlaintextAndIndexMap(paragraphsWithRanges);

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

function extractPlaintextAndIndexMap(paragraphsWithRanges: ParagraphWithRanges[]): {
  plaintext: string;
  startIndexMap: StartIndexMapItem[];
} {
  let nextStartIndex = 0;
  let plaintext = "";
  const startIndexMap: StartIndexMapItem[] = [];
  const paragraphSeparator = "\n\n";
  for (const { paragraph, ranges } of paragraphsWithRanges) {
    for (const range of ranges) {
      const startIndex = nextStartIndex;
      startIndexMap.push({ startIndex, paragraph, range });
      const rangeText = range.text;
      plaintext += rangeText;
      nextStartIndex += rangeText.length;
    }
    plaintext += paragraphSeparator;
    nextStartIndex += paragraphSeparator.length;
  }

  return { plaintext, startIndexMap };
}

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
