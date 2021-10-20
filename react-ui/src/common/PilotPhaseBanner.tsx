import styled from "styled-components";
import { InfoIcon } from "./icons";
import { Colors } from "./styles/Colors";
import { Fonts } from "./styles/Fonts";

export const PilotPhaseBanner = () => (
  <PilotPhaseBannerContainer>
    <InfoIcon width={15} height={15} fill={Colors.darkBlueText} />
    <PilotPhaseBannerText>INCLUSIFY befindet sich noch in der Testphase.</PilotPhaseBannerText>
  </PilotPhaseBannerContainer>
);

const PilotPhaseBannerContainer = styled.div`
  display: flex;
  gap: 5px;
`;
const PilotPhaseBannerText = styled.div`
  font-family: ${Fonts.bam.family};
  font-weight: ${Fonts.bam.weights.normal};
  font-size: 13px;
  font-style: italic;
  line-height: 15px;
  letter-spacing: 0.07px;
  color: ${Colors.darkBlueText};
`;
