import { newUuidv4 } from "../uuid";
import { paths } from "./language-tool-api-generated";

export interface HasClientUuid {
  readonly clientUuid: string;
}

type CheckEndpoint = paths["/check"]["post"];

export type CheckRequestParameters = CheckEndpoint["parameters"]["formData"];
export type CheckResponse = CheckEndpoint["responses"][200]["schema"];

type LtRuleMatch = NonNullable<CheckResponse["matches"]>[number];
type LtRuleMatchReplacement = NonNullable<CheckResponse["matches"]>[number]["replacements"][number];
type RuleMatchReplacement = LtRuleMatchReplacement & HasClientUuid;
export interface RuleMatch extends LtRuleMatch, HasClientUuid {
  replacements: RuleMatchReplacement[];
}

export function augmentClientUuid<T>(t: T): T & HasClientUuid {
  return { ...t, clientUuid: newUuidv4() };
}
