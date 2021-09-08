import React, { Dispatch, FC, SetStateAction, useState } from "react";
import styled from "styled-components";
import { DefaultButton } from "@fluentui/react";
import { RuleMatch } from "../common/language-tool-api/types";
import { ResultsArea } from "../common/results-display/ResultsArea";
import { LanguageToolClient } from "../common/language-tool-api/LanguageToolClient";

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

      {isLoading ? <div>Loading...</div> : <ResultsArea ruleMatches={ltMatches} />}
    </div>
  );
};

const TaskpaneHeading = styled.h1`
  color: darkgreen;
`;

const clickHandler = async (setLtMatches: Dispatch<SetStateAction<RuleMatch[]>>) => {
  let text: string = "";
  await Word.run(async (context) => {
    const range = context.document.body.getRange(Word.RangeLocation.content);
    range.load();
    await context.sync();
    text = range.text;
  });
  const request = {
    text,
    language: "auto",
  };
  const content = await new LanguageToolClient().check(request);
  setLtMatches(() => content.matches || []);
};
