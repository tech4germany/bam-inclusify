import { FC } from "react";
import styled from "styled-components";
import { ExclamationCircleIcon } from "../icons";
import { Colors } from "../styles/Colors";
import { Fonts } from "../styles/Fonts";

export const ErrorMessage: FC = () => (
  <ErrorMessageContainer>
    <ExclamationCircleIcon fill={"#B30F1F"} />
    <div>
      <ErrorLabelLarge>Fehler aufgetreten</ErrorLabelLarge>
      <ErrorLabelSmall>Versuche es später erneut</ErrorLabelSmall>
    </div>
  </ErrorMessageContainer>
);

const ErrorMessageContainer = styled.div`
  background: #e8e8e8;
  box-shadow: 0px 6px 12px ${Colors.dropShadow};
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  box-sizing: border-box;
  max-width: 330px;
  padding: 48px 10px;
`;

const ErrorLabelLarge = styled.div`
  font-family: ${Fonts.bam.family};
  font-weight: ${Fonts.bam.weights.bold};
  font-size: 25px;
  line-height: 30px;
  letter-spacing: 0.25px;
  color: #b30f1f;
  text-align: center;
`;

const ErrorLabelSmall = styled.div`
  font-family: ${Fonts.bam.family};
  font-weight: ${Fonts.bam.weights.normal};
  font-size: 15px;
  line-height: 18px;
  letter-spacing: 0.15px;
  color: #b30f1f;
  text-align: center;
  margin-top: 9px;
`;
