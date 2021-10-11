import { RuleMatch } from "./language-tool-api/types";

export type RuleMatchCategory = "spelling" | "grammar" | "diversity" | "unknown";

export function mapRuleCategory(ruleMatch: RuleMatch): RuleMatchCategory {
  return mapRuleCategoryId(ruleMatch.rule?.category.id);
}

const diversityRuleCategories = ["GENERISCHES_MASKULINUM", "BEHINDERUNG"];
const spellingRuleCategories = [
  "TYPOS",
  "EMPFOHLENE_RECHTSCHREIBUNG",
  "PROPER_NOUNS",
  "CONFUSED_WORDS",
  "COMPOUNDING",
  "CORRESPONDENCE",
  "CASING",
];
const grammarRuleCategories = [
  "SEMANTICS",
  "REDUNDANCY",
  "COLLOQUIALISMS",
  "STYLE",
  "GRAMMAR",
  "IDIOMS",
  "PUNCTUATION",
  "TYPOGRAPHY",
  "HILFESTELLUNG_KOMMASETZUNG",
];

function mapRuleCategoryId(categoryId: string | undefined): RuleMatchCategory {
  if (categoryId === undefined) return "unknown";
  if (diversityRuleCategories.includes(categoryId)) return "diversity";
  if (spellingRuleCategories.includes(categoryId)) return "spelling";
  if (grammarRuleCategories.includes(categoryId)) return "grammar";
  return "unknown";
}
