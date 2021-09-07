import React, { FC } from "react";
import styled from "styled-components";
import { DefaultButton } from "@fluentui/react";

export const TaskpaneApp: FC = () => (
  <div>
    <TaskpaneHeading>Taskpane Page</TaskpaneHeading>
    <p>This page is the TASKPANE entrypoint2</p>
    <DefaultButton className="ms-welcome__action" iconProps={{ iconName: "ChevronRight" }} onClick={clickHandler}>
      Run
    </DefaultButton>
  </div>
);

const TaskpaneHeading = styled.h1`
  color: darkgreen;
`;

const clickHandler = async () => {
  return Word.run(async (context) => {
    /**
     * Insert your Word code here
     */

    // insert a paragraph at the end of the document.
    const paragraph = context.document.body.insertParagraph("Hello World", Word.InsertLocation.end);

    // change the paragraph color to blue.
    paragraph.font.color = "blue";

    await context.sync();
  });
};
