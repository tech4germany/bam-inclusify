import { Dispatch, FC, SetStateAction, useState } from "react";
import styled from "styled-components";
import { RuleMatch } from "../common/language-tool-api/types";
import { ApplyReplacementFunction, ResultsArea } from "../common/results-display/ResultsArea";
import { LanguageToolClient } from "../common/language-tool-api/LanguageToolClient";
import { isRunningInOutlook, isRunningInWord } from "../common/office-api-helpers";
import { splitTextMatch } from "../common/splitTextMatch";
import { AddinCheckTextButton, UserSettingsButton } from "../common/buttons/Buttons";
import { SummaryBar } from "../common/summary-bar/SummaryBar";
import {
  UserSettingsContext,
  UserSettingsStorage,
  useUserSettingsState,
} from "../common/user-settings/UserSettingsStorage";
import { FeatureFlagsContext, FeatureFlagsStorage, useFeatureFlagsState } from "../common/feature-flags/feature-flags";
import { DebugPanel } from "../common/debug-panel/DebugPanel";
import { UserSettingsPanel } from "../common/user-settings/UserSettingsPanel";

export const TaskpaneApp: FC = () => {
  const [ltMatches, setLtMatches] = useState<RuleMatch[]>([]);
  const [applier, setApplier] = useState<ApplyReplacementFunction>();
  const [matchSelector, setMatchSelector] = useState<(ruleMatch: RuleMatch) => void>();
  const [isLoading, setLoading] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [featureFlags, setFeatureFlags] = useFeatureFlagsState();
  const [userSettings, setUserSettings] = useUserSettingsState();

  const checkClickHandler = async () => {
    setLoading(true);
    await checkText(setLtMatches, setApplier, setMatchSelector);
    setLoading(false);
  };

  return (
    <AddinContainer>
      <UserSettingsContext.Provider value={userSettings}>
        <FeatureFlagsContext.Provider value={featureFlags}>
          <AddinButtonGroup onCheckClicked={checkClickHandler} settingsOpenState={[isSettingsOpen, setSettingsOpen]} />
          <SummaryBarContainer>
            <SummaryBar addinMode diversityErrorCount={0} grammarErrorCount={0} spellingErrorCount={0} />
          </SummaryBarContainer>

          {isSettingsOpen ? (
            <UserSettingsPanel
              userSettingsState={[userSettings, setUserSettings]}
              onConfirmClicked={() => setSettingsOpen(false)}
            />
          ) : isLoading ? (
            <div>Text wird überprüft...</div>
          ) : (
            <AddinResultsAreaContainer>
              <ResultsArea ruleMatches={ltMatches || []} applyReplacement={applier} selectRuleMatch={matchSelector} />
            </AddinResultsAreaContainer>
          )}
        </FeatureFlagsContext.Provider>
      </UserSettingsContext.Provider>
      <DebugPanel
        featureFlagsState={[featureFlags, setFeatureFlags]}
        userSettingsState={[userSettings, setUserSettings]}
      />
    </AddinContainer>
  );
};

const AddinContainer = styled.div`
  margin: 0 15px;
`;

interface AddinButtonGroupProps {
  onCheckClicked: () => void;
  settingsOpenState: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
}
const AddinButtonGroup: FC<AddinButtonGroupProps> = ({ onCheckClicked, settingsOpenState }) => (
  <AddinButtonGroupContainer>
    <AddinButtonColumnContainer>
      <AddinCheckTextButton onClick={onCheckClicked} />
      <UserSettingsButton pressedState={settingsOpenState} />
    </AddinButtonColumnContainer>
  </AddinButtonGroupContainer>
);
const AddinButtonGroupContainer = styled.div`
  display: flex;
  gap: 5px;
  justify-content: flex-end;
  margin-bottom: 5px;
`;
const AddinButtonColumnContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const SummaryBarContainer = styled.div`
  margin-bottom: 15px;
`;

const AddinResultsAreaContainer = styled.div`
  margin: 0;
`;

type ParagraphWithRanges = { paragraph: Word.Paragraph; ranges: Word.Range[] };
type StartOffsetMapItem = { startOffset: number; paragraph: Word.Paragraph; range: Word.Range };

const checkText = async (
  setLtMatches: Dispatch<SetStateAction<RuleMatch[]>>,
  setApplier: Dispatch<SetStateAction<ApplyReplacementFunction | undefined>>,
  setMatchSelector: Dispatch<SetStateAction<((ruleMatch: RuleMatch) => void) | undefined>>
) => {
  if (isRunningInWord()) {
    await checkTextFromWord(setLtMatches, setApplier, setMatchSelector);
  } else if (isRunningInOutlook()) {
    await outlookClickHandler(setLtMatches, setApplier);
  } else {
    throw new Error("Unsupported host app");
  }
};

async function checkTextFromWord(
  setLtMatches: Dispatch<SetStateAction<RuleMatch[]>>,
  setApplier: Dispatch<SetStateAction<ApplyReplacementFunction | undefined>>,
  setMatchSelector: Dispatch<SetStateAction<((ruleMatch: RuleMatch) => void) | undefined>>
) {
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
  const matches = await new LanguageToolClient().check(
    plaintext,
    UserSettingsStorage.load(),
    FeatureFlagsStorage.load()
  );
  setLtMatches(matches);
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
    console.debug(
      `Replacement for RuleMatch(offset=${ruleMatch.offset}, length=${ruleMatch.length})\n` +
        `  starts in OffsetMapEntry(index=${startRangeIndex}, startOffset=${startRangeItem.startOffset}, length=${startRangeItem.range.text.length}, text='${startRangeItem.range.text}') at localOffset=${startOffsetInStartRange}\n` +
        `  & ends in OffsetMapEntry(index=${endRangeIndex}, startOffset=${endRangeItem.startOffset}, length=${endRangeItem.range.text.length}, text='${endRangeItem.range.text}') at localOffset=${endOffsetInEndRange}\n` +
        `  (multi-word match=${isMultiWordMatch})`
    );
    const affectedRangesPlaintext = startOffsetMap
      .slice(startRangeIndex, endRangeIndex + 1)
      .map((item) => item.range.text)
      .join("");
    startOffsetMap.slice(startRangeIndex + 1, endRangeIndex + 1).forEach((item) => item.range.delete());
    const [preMatch, , postMatch] = splitTextMatch(affectedRangesPlaintext, startOffsetInStartRange, ruleMatch.length);
    const newText = preMatch + replacementText + postMatch;
    startRangeItem.range.insertText(newText, Word.InsertLocation.replace);
    startRangeItem.range.context
      .sync()
      .then(() => console.debug(`replaced ${isMultiWordMatch ? "multi-word" : "single-word"} match`));
  };
  const newMatchSelector: (ruleMatch: RuleMatch) => void = (ruleMatch) => {
    const startOffset = ruleMatch.offset;
    const endOffset = ruleMatch.offset + ruleMatch.length;
    const { index: startRangeIndex, item: startRangeItem } = findItemContainingOffset(startOffsetMap, startOffset);
    const { index: endRangeIndex, item: endRangeItem } = findItemContainingOffset(startOffsetMap, endOffset);
    const startOffsetInStartRange = startOffset - startRangeItem.startOffset;
    const endOffsetInEndRange = endOffset - endRangeItem.startOffset;
    const isMultiWordMatch = startRangeIndex !== endRangeIndex;

    const completeRange = startOffsetMap
      .slice(startRangeIndex, endRangeIndex + 1)
      .map((i) => i.range)
      .reduce((a, b) => a.expandTo(b));

    completeRange.select("Select");
    completeRange.context.sync();
  };

  setApplier(() => newApplier);
  setMatchSelector(() => newMatchSelector);
}

async function outlookClickHandler(
  setLtMatches: Dispatch<SetStateAction<RuleMatch[]>>,
  setApplier: Dispatch<SetStateAction<ApplyReplacementFunction | undefined>>
) {
  const currentItem = Office.context.mailbox.item;
  if (!currentItem) throw new Error("No item selected");
  const { value: messageCoercionType } = await invokeAsPromise0(currentItem.body.getTypeAsync);
  if (messageCoercionType === Office.CoercionType.Html) {
    const { value: currentHtml } = await invokeAsPromise1(currentItem.body.getAsync, Office.CoercionType.Html);
    // console.log("currentHtml", currentHtml);
    const doc = new DOMParser().parseFromString(currentHtml, "text/html");
    console.log("doc", doc);
    const newHtml = new XMLSerializer().serializeToString(doc);
    await invokeAsPromise2<string, Office.AsyncContextOptions & Office.CoercionTypeOptions, void>(
      currentItem.body.setAsync,
      newHtml,
      { coercionType: Office.CoercionType.Html }
    );
  } else {
    throw new Error("Unhandled message coercion type " + messageCoercionType);
  }
}

function invokeAsPromise0<R>(
  cbBaseFunc: (callback?: (asyncResult: Office.AsyncResult<R>) => void) => void
): Promise<Office.AsyncResult<R>> {
  return new Promise((resolve, reject) => {
    cbBaseFunc((asyncResult) => {
      switch (asyncResult.status) {
        case Office.AsyncResultStatus.Succeeded: {
          resolve(asyncResult);
          break;
        }
        case Office.AsyncResultStatus.Failed: {
          reject(asyncResult);
          break;
        }
        default:
          reject(new Error("Unknown AsyncResultStatus value " + asyncResult.status));
      }
    });
  });
}

function invokeAsPromise1<T1, R>(
  cbBaseFunc: (arg1: T1, callback?: (asyncResult: Office.AsyncResult<R>) => void) => void,
  arg1: T1
): Promise<Office.AsyncResult<R>> {
  return invokeAsPromise0((cb) => cbBaseFunc(arg1, cb));
}

function invokeAsPromise2<T1, T2, R>(
  cbBaseFunc: (arg1: T1, arg2: T2, callback?: (asyncResult: Office.AsyncResult<R>) => void) => void,
  arg1: T1,
  arg2: T2
): Promise<Office.AsyncResult<R>> {
  return invokeAsPromise0((cb) => cbBaseFunc(arg1, arg2, cb));
}

function findItemContainingOffset(
  startIndexMap: StartOffsetMapItem[],
  offset: number
): { item: StartOffsetMapItem; index: number } {
  const index = startIndexMap.findIndex((i) => i.startOffset <= offset && i.startOffset + i.range.text.length > offset);
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
