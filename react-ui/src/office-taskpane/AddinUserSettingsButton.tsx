import { FC } from "react";
import styled from "styled-components";
import { Colors } from "../common/styles/Colors";
import { GearIcon } from "../common/icons";

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
      <GearIcon width={25} height={25} fill={Colors.darkYellow} />
    </UserSettingsIconContainer>
  </UserSettingsButtonContainer>
);

const UserSettingsButtonContainer = styled.button`
  border: none;
  border-radius: 8px;
  background: transparent linear-gradient(209deg, ${Colors.mediumYellow} 0%, ${Colors.darkYellow} 100%) 0% 0% no-repeat
    padding-box;
  box-sizing: border-box;
  min-width: 51px;
  padding: 0;

  display: flex;
  align-items: center;
  justify-content: center;

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
  width: 35px;
  height: 35px;
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
