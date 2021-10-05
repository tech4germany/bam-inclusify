import { RuleMatch } from "./language-tool-api/types";

export type RuleMatchCategory = "spelling" | "grammar" | "diversity" | "unknown";

export function mapRuleCategory(ruleMatch: RuleMatch): RuleMatchCategory {
  return mapRuleCategoryId(ruleMatch.rule?.category.id);
}

function mapRuleCategoryId(categoryId: string | undefined): RuleMatchCategory {
  switch (categoryId) {
    case "GENERISCHES_MASKULINUM":
      return "diversity";
    case "TYPOS":
      return "spelling";
    case "REDUNDANCY":
    case "GRAMMAR":
    case "PUNCTUATION":
      return "grammar";
    default:
      return "unknown";
  }
}
