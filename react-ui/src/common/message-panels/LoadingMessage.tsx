import { FC } from "react";
import styled from "styled-components";
import { ListCheckIcon } from "../icons";
import { Colors } from "../styles/Colors";
import { Fonts } from "../styles/Fonts";

export const LoadingMessage: FC = () => (
  <LoadingMessageContainer>
    <ListCheckIcon fill={Colors.mediumYellow} />
    <LoadingLabel>Text wird überprüft...</LoadingLabel>
  </LoadingMessageContainer>
);

const LoadingMessageContainer = styled.div`
  background: ${Colors.backgroundGray};
  box-shadow: 0px 6px 12px ${Colors.dropShadow};
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 22px;
  box-sizing: border-box;
  max-width: 330px;
  padding: 48px 10px;
`;

const LoadingLabel = styled.div`
  font-family: ${Fonts.bam.family};
  font-weight: ${Fonts.bam.weights.bold};
  font-size: 25px;
  line-height: 30px;
  letter-spacing: 0.25px;
  color: ${Colors.mediumYellow};
`;
