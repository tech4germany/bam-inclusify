import { FC } from "react";
import styled from "styled-components";
import { Colors } from "../common/styles/Colors";
import { GearIcon } from "../icons";

export const AddinUserSettingsButton: FC<UserSettingsButtonProps> = ({
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
  margin: 0 auto;
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
