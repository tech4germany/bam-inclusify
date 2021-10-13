import { FeatureFlags } from "../feature-flags/feature-flags";
import { diversityRuleCategories, grammarRuleCategories, spellingRuleCategories } from "../rule-categories";
import { UserSettings } from "../user-settings/user-settings";
import { augmentClientUuid, CheckRequestParameters, CheckResponse, RuleMatch } from "./types";
import {
  mapUserSettingsToLanguage,
  mapUserSettingsToReplacementPostProcessing,
} from "./user-settings-language-mapping";

export class LanguageToolClient {
  private readonly baseUrl: string;

  constructor(host: string = "", baseUri: string = "/v2") {
    this.baseUrl = `${host}${baseUri}`;
  }

  async check(text: string, userSettings: UserSettings, featureFlags: FeatureFlags): Promise<RuleMatch[]> {
    const enabledRuleCategories = diversityRuleCategories.concat(grammarRuleCategories).concat(spellingRuleCategories);

    const response = await this.checkRaw({
      text,
      language: mapUserSettingsToLanguage(userSettings),
      enabledOnly: true,
      enabledCategories: enabledRuleCategories.join(","),
    });
    const postProcessReplacementValue = mapUserSettingsToReplacementPostProcessing(userSettings);
    const matches = (response.matches || []).map((m) => ({
      ...augmentClientUuid(m),
      replacements: m.replacements.map((r) => {
        const augmentedReplacement = augmentClientUuid(r);
        return { ...augmentedReplacement, value: postProcessReplacementValue(augmentedReplacement.value) };
      }),
    }));
    return matches;
  }

  async checkRaw(parameters: CheckRequestParameters): Promise<CheckResponse> {
    const body = Object.entries(parameters)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v as any)}`)
      .join("&");
    const r = await fetch(`${this.baseUrl}/check`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });
    const content = await r.json();
    return content;
  }
}
