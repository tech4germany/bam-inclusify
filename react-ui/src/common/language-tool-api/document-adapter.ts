const LtAnnotationEntryTypeSymbol = Symbol("LtAnnotationEntryTypeSymbol");
type LtAnnotationTextEntry = {
  [LtAnnotationEntryTypeSymbol]: "text";
  text: string;
};
type LtAnnotationMarkupEntry = {
  [LtAnnotationEntryTypeSymbol]: "markup";
  markup: string;
  interpretAs?: string;
};
type LtAnnotationEntry = LtAnnotationTextEntry | LtAnnotationMarkupEntry;
function makeLtTextEntry(text: string): LtAnnotationTextEntry {
  return { [LtAnnotationEntryTypeSymbol]: "text", text };
}
function makeLtMarkupEntry(markup: string, interpretAs?: string): LtAnnotationMarkupEntry {
  return { [LtAnnotationEntryTypeSymbol]: "markup", markup, interpretAs };
}
type LtAnnotationsObject = { annotation: LtAnnotationEntry[] };

export function convertXmlStringToLtApiObject(xmlString: string): LtAnnotationsObject {
  const xmlDeclaration = extractXmlDocumentDeclaration(xmlString);
  const xmlDeclarationEntry = makeLtMarkupEntry(xmlDeclaration);
  const doc = new DOMParser().parseFromString(xmlString, "text/xml");
  const childNodeEntries = formatChildNodeList(doc.childNodes);
  return {
    annotation: [xmlDeclarationEntry, ...childNodeEntries],
  };
}

// Note: Current browsers properly include the XML Declaration when re-serializing an XMLDocument with XMLSerializer,
// but current jsdom doesn't (which we use for unit tests), so we're using this hack to just re-use the declaration
// from the input string.
// See also: https://github.com/jsdom/jsdom/issues/2615 and https://github.com/w3c/DOM-Parsing/issues/50
export function extractXmlDocumentDeclaration(xmlString: string): string {
  const declarationMatch = xmlString.match(/^\<\?xml.*\?\>/);
  if (declarationMatch === null) throw new Error("No XML document declaration found");
  return declarationMatch[0];
}

function formatChildNodeList(nodeList: NodeListOf<ChildNode>): LtAnnotationEntry[] {
  return [...nodeList].flatMap((n) => formatChildNode(n));
}

function formatChildNode(node: ChildNode): LtAnnotationEntry[] {
  switch (node.nodeType) {
    case Node.PROCESSING_INSTRUCTION_NODE: {
      const markup = new XMLSerializer().serializeToString(node);
      return [makeLtMarkupEntry(markup)];
    }
    case Node.TEXT_NODE: {
      return [makeLtTextEntry(node.textContent || "")];
    }
    case Node.ELEMENT_NODE: {
      const element = node as Element;
      const startTag = makeLtMarkupEntry(formatStartTag(element)); // markup
      const childEntries = formatChildNodeList(element.childNodes);
      const endTag = makeLtMarkupEntry(formatEndTag(element)); // markup
      return [startTag, ...childEntries, endTag];
    }

    default:
      throw new Error("Unsupported node type: " + node.nodeType);
  }
}

// adapted from https://stackoverflow.com/a/14517905
export function formatStartTag(elem: Element): string {
  let str = "";
  const attributeList = elem.attributes;

  const elementName = normalizedElementName(elem);
  str += "<" + elementName;

  const l = attributeList.length;
  for (let i = 0; i < l; i++) {
    const attribute = attributeList[i];
    const valueSide = attribute.nodeValue === null ? "" : `="${attribute.nodeValue.replace('"', '\\"')}"`;

    // Append the name + value of the attribute.
    str += ` ${attributeList[i].nodeName}${valueSide}`;
  }
  str += ">";

  return str;
}

function formatEndTag(elem: Element): string {
  const elementName = normalizedElementName(elem);
  return `</${elementName}>`;
}

function normalizedElementName(elem: Element): string {
  return elem.nodeName;
}
