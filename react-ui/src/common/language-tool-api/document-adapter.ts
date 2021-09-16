type StartIndexTuple = { startIndex: number; textNode: Text };

interface XmlDocumentResult {
  readonly doc: Document;
  readonly startIndexMap: ReadonlyArray<StartIndexTuple>;
}

export function findTextNodesInXml(xmlString: string): XmlDocumentResult {
  const doc = new DOMParser().parseFromString(xmlString, "text/xml");
  const textNodes = findTextNodesFromChildNodeList(doc.childNodes);

  let nextStartIndex = 0;
  const startIndexMap: StartIndexTuple[] = [];
  for (const textNode of textNodes) {
    const startIndex = nextStartIndex;
    startIndexMap.push({ startIndex, textNode });
    nextStartIndex += textNode.textContent!.length;
  }

  return Object.freeze({
    doc,
    startIndexMap: Object.freeze(startIndexMap),
  });
}

function findTextNodesFromChildNodeList(nodeList: NodeListOf<ChildNode>): Text[] {
  return [...nodeList].flatMap((n) => findTextNodesFromNode(n));
}

function findTextNodesFromNode(node: ChildNode): Text[] {
  if (node.nodeType === Node.TEXT_NODE) {
    return [node as Text];
  }
  return findTextNodesFromChildNodeList(node.childNodes);
}
