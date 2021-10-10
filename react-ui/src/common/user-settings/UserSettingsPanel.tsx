import React, { FC } from "react";
import styled from "styled-components";

export const UserSettingsPanel: FC = () => (
  <UserSettingsPanelContainer>
    <UserSettingsTitle>Einstellungen</UserSettingsTitle>
    <DefaultSettingsExplanation>
      Standardeinstellungen basieren auf dem BAM Leitfaden für diversitätsensible Sprache.
    </DefaultSettingsExplanation>
    <SettingsSectionTitle>Gendersprache</SettingsSectionTitle>
  </UserSettingsPanelContainer>
);

const UserSettingsPanelContainer = styled.div``;

const UserSettingsTitle = styled.h2``;

const DefaultSettingsExplanation = styled.div``;

const SettingsSectionTitle = styled.h3``;
