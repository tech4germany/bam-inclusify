import { ChangeEventHandler, FC } from "react";
import styled from "styled-components";

export interface MainTextAreaProps {
  onChange: ChangeEventHandler<HTMLTextAreaElement>;
  value: string;
}
export const MainTextArea: FC<MainTextAreaProps> = ({ onChange, value }) => (
  <div>
    <MainTextAreaTA spellCheck={false} autoFocus onChange={onChange} value={value} />
  </div>
);

const MainTextAreaTA = styled.textarea`
  padding: 2.5rem 2rem;
  font-size: 15px;
  font-weight: 300;
  line-height: 25px;
  width: 100%;
  box-sizing: border-box;
  border-radius: 0;
  border: none;
  resize: none;
  box-shadow: 0px 9px 18px #00000029;
  height: 30em;
`;
