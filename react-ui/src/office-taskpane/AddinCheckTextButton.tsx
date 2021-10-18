import { FC } from "react";
import styled from "styled-components";
import { Colors } from "../common/styles/Colors";
import { CheckIcon } from "../common/icons";

interface CheckTextButtonProps {
  onClick: React.MouseEventHandler<HTMLButtonElement> | undefined;
  topCornersFlush?: boolean;
  disabled?: boolean;
}
export const AddinCheckTextButton: FC<CheckTextButtonProps> = ({ onClick, topCornersFlush, disabled }) => (
  <AddinCheckTextButtonContainer onClick={onClick} disabled={disabled} title="Text überprüfen">
    <AddinTextButtonIconContainer>
      <CheckIcon viewBox="0 0 16 16" width={12} height={12} />
    </AddinTextButtonIconContainer>
    <AddinCheckTextButtonTextContainer>PRÜFEN</AddinCheckTextButtonTextContainer>
  </AddinCheckTextButtonContainer>
);

const AddinCheckTextButtonContainer = styled.button`
  background: transparent linear-gradient(68deg, ${Colors.mediumGreen} 0%, ${Colors.brightGreen} 100%) 0% 0% no-repeat
    padding-box;
  border-radius: 8px;
  border: none;
  color: white;
  font-size: 15px;
  padding: 5px 17px;
  z-index: 1000;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  opacity: 1;

  &[disabled] {
    opacity: 0.7;
  }

  &:not([disabled]) {
    cursor: pointer;
    &:hover {
      background: ${Colors.brightGreen};
    }
    &:active {
      background: ${Colors.darkGreen};
    }
  }
`;
const AddinTextButtonIconContainer = styled.div`
  background: white;
  height: 21px;
  width: 21px;
  border-radius: 50%;

  display: flex;
  align-items: center;
  justify-content: center;
`;
const AddinCheckTextButtonTextContainer = styled.div``;
