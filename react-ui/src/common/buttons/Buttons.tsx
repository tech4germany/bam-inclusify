import React, { FC } from "react";
import styled from "styled-components";
import { CheckIcon, GearIcon } from "../../icons";
import { Colors } from "../Colors";

const CheckTextButtonContainer = styled.button<{ topCornersFlush?: boolean }>`
  background: transparent linear-gradient(68deg, ${Colors.mediumGreen} 0%, ${Colors.brightGreen} 100%) 0% 0% no-repeat
    padding-box;
  border: none;
  border-radius: ${(props) => (!!props.topCornersFlush ? "0px 0px 8px 8px" : "8px 8px")};
  color: white;
  font-size: 20px;
  padding: 8px 10px;
  z-index: 1000;

  display: flex;
  align-items: center;
  gap: 10px;
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

const CheckTextButtonIconContainer = styled.div`
  background: white;
  height: 28px;
  width: 28px;
  border-radius: 50%;

  display: flex;
  align-items: center;
  justify-content: center;
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
const CheckTextButtonTextContainer = styled.div`
  margin-right: 6px;
`;
const AddinCheckTextButtonTextContainer = styled.div``;

interface CheckTextButtonProps {
  onClick: React.MouseEventHandler<HTMLButtonElement> | undefined;
  topCornersFlush?: boolean;
  disabled?: boolean;
}
export const CheckTextButton: FC<CheckTextButtonProps> = ({ onClick, topCornersFlush, disabled }) => (
  <CheckTextButtonContainer
    topCornersFlush={topCornersFlush}
    onClick={onClick}
    disabled={disabled}
    title="Text überprüfen"
  >
    <CheckTextButtonIconContainer>
      <CheckIcon />
    </CheckTextButtonIconContainer>
    <CheckTextButtonTextContainer>PRÜFEN</CheckTextButtonTextContainer>
  </CheckTextButtonContainer>
);

export const AddinCheckTextButton: FC<CheckTextButtonProps> = ({ onClick, topCornersFlush, disabled }) => (
  <AddinCheckTextButtonContainer onClick={onClick} disabled={disabled} title="Text überprüfen">
    <AddinTextButtonIconContainer>
      <CheckIcon viewBox="0 0 16 16" width={12} height={12} />
    </AddinTextButtonIconContainer>
    <AddinCheckTextButtonTextContainer>PRÜFEN</AddinCheckTextButtonTextContainer>
  </AddinCheckTextButtonContainer>
);

const UserSettingsButtonContainer = styled.button`
  font-size: 14px;
  border: none;
  border-radius: 8px;
  color: white;
  background: transparent linear-gradient(68deg, ${Colors.mediumYellow} 0%, ${Colors.darkYellow} 100%) 0% 0% no-repeat
    padding-box;
  padding: 4px 8px;

  &:hover {
    background: ${Colors.brightYellow};
  }
  &:active {
    background: ${Colors.darkYellow};
  }

  &.isPressed {
    background: ${Colors.darkYellow};
    &:hover {
      background: ${Colors.mediumYellow};
    }
    &:active {
      background: ${Colors.darkYellow};
    }
  }
`;

const UserSettingsIconContainer = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: white;

  display: flex;
  align-items: center;
  justify-content: center;
`;

interface UserSettingsButtonProps {
  pressedState: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
  disabled?: boolean;
}
export const UserSettingsButton: FC<UserSettingsButtonProps> = ({
  pressedState: [isPressed, setPressed],
  disabled,
}) => (
  <UserSettingsButtonContainer
    className={isPressed ? "isPressed" : ""}
    onClick={() => setPressed(!isPressed)}
    disabled={disabled}
    title={"Einstellungen " + (isPressed ? "schließen" : "anzeigen")}
  >
    <UserSettingsIconContainer>
      <GearIcon />
    </UserSettingsIconContainer>
  </UserSettingsButtonContainer>
);
