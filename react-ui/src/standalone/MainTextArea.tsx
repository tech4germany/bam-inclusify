import { ChangeEventHandler, FC, RefObject, useEffect } from "react";
import styled from "styled-components";
import { isFunction } from "../common/type-helpers";
import { CopyIcon } from "../common/icons";
import { Fonts } from "../common/styles/Fonts";

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
        <InputLength>{value.length.toLocaleString("de-DE")} Zeichen</InputLength>
        <BottomBarSpacer />
        <CopyTextButton title="Text kopieren" onClick={() => navigator.clipboard.writeText(value)}>
          <CopyTextButtonIcon />
        </CopyTextButton>
      </BottomBarContainer>
    </MainTextAreaContainer>
  );
};

const MainTextAreaContainer = styled.div`
  box-shadow: 0px 9px 18px #00000029;
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const TextArea = styled.textarea`
  padding: 40px 32px 24px;
  font-family: ${Fonts.main.family};
  font-weight: ${Fonts.main.weights.normal};
  font-size: 15px;
  line-height: 25px;
  width: 100%;
  box-sizing: border-box;
  border-radius: 0;
  border: none;
  resize: none;
  /* height: 30em; */
  /* min-height: 20rem; */
  flex: 1;
  outline: none;

  &::placeholder {
    font-style: italic;
    color: #888888;
  }
`;

const BottomBarContainer = styled.div`
  flex: 0;
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
  color: #666666;

  &:hover {
    color: black;
  }
`;

const CopyTextButtonIcon = styled(CopyIcon)`
  margin: 12px;
  fill: currentColor;
`;
