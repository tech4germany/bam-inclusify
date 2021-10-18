import styled from "styled-components";
import { Fonts } from "./styles/Fonts";

export const WelcomeMessage = () => (
  <WelcomeMessageContainer>
    <WelcomeMessageIntro>
      Herzlich Willkommen bei INCLUSIFY, deiner Assistentin für diversitätssensible Sprache bei der BAM.
    </WelcomeMessageIntro>
    <WelcomeMessageBody>
      Prüfe Deine Texte auf Diversitätslücken. INCLUSIFY ist aktuell basierend auf den Präferenzen des BAM Leitfadens
      für geschlechtersensible Sprache eingestellt. Wenn Du eine anderes Gendersprache bevorzugst, kannst Du das in den
      Einstellungen anpassen.
    </WelcomeMessageBody>
  </WelcomeMessageContainer>
);

const WelcomeMessageContainer = styled.div`
  font-family: ${Fonts.bam.family};
  font-size: 20px;
  font-style: italic;
`;

const WelcomeMessageIntro = styled.p`
  font-weight: ${Fonts.bam.weights.bold};
  margin: 0;
`;
const WelcomeMessageBody = styled.p`
  margin: 1em 0 0;
  font-weight: ${Fonts.bam.weights.normal};
`;
