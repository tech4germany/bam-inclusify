import { ChangeEventHandler, FC } from "react";
import styled from "styled-components";
import { CopyIcon } from "../icons";

export interface MainTextAreaProps {
  onChange: ChangeEventHandler<HTMLTextAreaElement>;
  value: string;
}
export const MainTextArea: FC<MainTextAreaProps> = ({ onChange, value }) => (
  <MainTextAreaContainer>
    <TextArea spellCheck={false} autoFocus onChange={onChange} value={value} />
    <BottomBarContainer>
      <InputLength>
        {value.length} / {inputLengthLimit}
      </InputLength>
      <BottomBarSpacer />
      <CopyTextButton title="Text kopieren">
        <CopyTextButtonIcon />
      </CopyTextButton>
    </BottomBarContainer>
  </MainTextAreaContainer>
);

const inputLengthLimit = 10000;

const MainTextAreaContainer = styled.div`
  box-shadow: 0px 9px 18px #00000029;
  display: flex;
  flex-direction: column;
`;

const TextArea = styled.textarea`
  padding: 40px 32px 24px;
  font-size: 15px;
  font-weight: 300;
  line-height: 25px;
  width: 100%;
  box-sizing: border-box;
  border-radius: 0;
  border: none;
  resize: none;
  height: 30em;
`;

const BottomBarContainer = styled.div`
  background: #fffcfc;
  display: flex;
  align-items: center;
`;

const InputLength = styled.div`
  font-size: 12px;
  user-select: none;
  margin-left: 12px;
`;

const BottomBarSpacer = styled.div`
  flex-grow: 1;
`;

const CopyTextButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
`;

const CopyTextButtonIcon = styled(CopyIcon)`
  margin: 12px;
`;
