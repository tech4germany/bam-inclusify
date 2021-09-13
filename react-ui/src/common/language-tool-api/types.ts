import { paths } from "./language-tool-api-generated";

type CheckEndpoint = paths["/check"]["post"];

export type CheckRequestParameters = CheckEndpoint["parameters"]["formData"];
export type CheckResponse = CheckEndpoint["responses"][200]["schema"];
export type RuleMatch = NonNullable<CheckResponse["matches"]>[number];
