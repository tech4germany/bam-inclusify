import { ChangeEventHandler, FC, RefObject, useEffect } from "react";
import styled from "styled-components";
import { isFunction } from "../common/type-helpers";
import { CopyIcon } from "../icons";

export interface MainTextAreaProps {
  onChange: ChangeEventHandler<HTMLTextAreaElement>;
  onSubmit: () => void;
  value: string;
  textAreaRef: RefObject<HTMLTextAreaElement>;
}
export const MainTextArea: FC<MainTextAreaProps> = ({ onChange, onSubmit, value, textAreaRef }) => {
  useEffect(() => {
    textAreaRef.current!.value = value;
  });
  return (
    <MainTextAreaContainer>
      <TextArea
        ref={textAreaRef}
        spellCheck={false}
        autoFocus
        onChange={onChange}
        placeholder="Text einfügen..."
        onKeyDown={(e) => {
          if (!e.isDefaultPrevented() && (e.metaKey || e.ctrlKey) && e?.code === "Enter") {
            isFunction(onSubmit) && onSubmit();
          }
        }}
      />
      <BottomBarContainer>
        <InputLength>
          {value.length.toLocaleString("de-DE")} / {inputLengthLimit.toLocaleString("de-DE")}
        </InputLength>
        <BottomBarSpacer />
        <CopyTextButton title="Text kopieren" onClick={() => navigator.clipboard.writeText(value)}>
          <CopyTextButtonIcon />
        </CopyTextButton>
      </BottomBarContainer>
    </MainTextAreaContainer>
  );
};

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

  &::placeholder {
    font-style: italic;
    color: #888888;
  }
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
