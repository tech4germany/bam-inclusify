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
type StartOffsetMapItem = { startOffset: number; paragraph: Word.Paragraph; range: Word.Range };

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

  const { plaintext, startOffsetMap } = extractPlaintextAndIndexMap(paragraphsWithRanges);

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

  console.log(startOffsetMap);

  const newApplier: ApplyReplacementFunction = (ruleMatch, index, allMatches, replacementText) => {
    const startOffset = ruleMatch.offset;
    const endOffset = ruleMatch.offset + ruleMatch.length;
    const { index: startRangeIndex, item: startRangeItem } = findItemContainingOffset(startOffsetMap, startOffset);
    const { index: endRangeIndex, item: endRangeItem } = findItemContainingOffset(startOffsetMap, endOffset);
    const startOffsetInStartRange = startOffset - startRangeItem.startOffset;
    const endOffsetInEndRange = endOffset - endRangeItem.startOffset;
    const isMultiWordMatch = startRangeIndex !== endRangeIndex;
    console.log(
      `Replacement for RuleMatch(offset=${ruleMatch.offset}, length=${ruleMatch.length})\n` +
        `  starts in OffsetMapEntry(index=${startRangeIndex}, startOffset=${startRangeItem.startOffset}, length=${startRangeItem.range.text.length}, text='${startRangeItem.range.text}') at localOffset=${startOffsetInStartRange}\n` +
        `  & ends in OffsetMapEntry(index=${endRangeIndex}, startOffset=${endRangeItem.startOffset}, length=${endRangeItem.range.text.length}, text='${endRangeItem.range.text}') at localOffset=${endOffsetInEndRange}\n` +
        `  (multi-word match=${isMultiWordMatch})`
    );
    console.log(
      "affected range:",
      startOffsetMap.slice(startRangeIndex, endRangeIndex + 1),
      startOffsetMap.slice(startRangeIndex, endRangeIndex + 1).map((item) => item.range.text)
    );
    const affectedRangesPlaintext = startOffsetMap
      .slice(startRangeIndex, endRangeIndex + 1)
      .map((item) => item.range.text)
      .join("");
    console.log("affectedRangesPlaintext", affectedRangesPlaintext);
    console.log("ranges to delete: ", startOffsetMap.slice(startRangeIndex + 1, endRangeIndex + 1));
    startOffsetMap.slice(startRangeIndex + 1, endRangeIndex + 1).forEach((item) => item.range.delete());
    const [preMatch, , postMatch] = splitTextMatch(affectedRangesPlaintext, startOffsetInStartRange, ruleMatch.length);
    const newText = preMatch + replacementText + postMatch;
    console.log("newText", newText);
    startRangeItem.range.insertText(newText, Word.InsertLocation.replace);
    startRangeItem.range.context
      .sync()
      .then(() => console.log(`replaced ${isMultiWordMatch ? "multi-word" : "single-word"} match`));
  };
  setApplier(() => newApplier);
};

function findItemContainingOffset(
  startIndexMap: StartOffsetMapItem[],
  offset: number
): { item: StartOffsetMapItem; index: number } {
  const index = startIndexMap.findIndex((i) => i.startOffset > offset) - 1;
  const item = startIndexMap[index];
  return { item: item, index };
}

function extractPlaintextAndIndexMap(paragraphsWithRanges: ParagraphWithRanges[]): {
  plaintext: string;
  startOffsetMap: StartOffsetMapItem[];
} {
  let nextStartIndex = 0;
  let plaintext = "";
  const startOffsetMap: StartOffsetMapItem[] = [];
  const paragraphSeparator = "\n\n";
  for (const { paragraph, ranges } of paragraphsWithRanges) {
    for (const range of ranges) {
      const startIndex = nextStartIndex;
      startOffsetMap.push({ startOffset: startIndex, paragraph, range });
      const rangeText = range.text;
      plaintext += rangeText;
      nextStartIndex += rangeText.length;
    }
    plaintext += paragraphSeparator;
    nextStartIndex += paragraphSeparator.length;
  }

  return { plaintext, startOffsetMap };
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
