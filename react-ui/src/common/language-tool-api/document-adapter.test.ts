import { convertXmlStringToLtApiObject, extractXmlDocumentDeclaration, formatStartTag } from "./document-adapter";

describe("tag formatting", () => {
  describe("formatStartTag", () => {
    it("formats simple tag without attributes correctly", () => {
      const doc = new Document();
      const elem = doc.createElement("div");
      const startTag = formatStartTag(elem);
      expect(startTag).toBe("<div>");
    });

    it("formats ns'd tag with attributes correctly", () => {
      const doc = new DOMParser().parseFromString(
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
          <pkg:package xmlns:pkg="http://schemas.microsoft.com/office/2006/xmlPackage">
          </pkg:package>`,
        "text/xml"
      );
      const elem = doc.documentElement;
      const startTag = formatStartTag(elem);
      expect(startTag).toBe(`<pkg:package xmlns:pkg="http://schemas.microsoft.com/office/2006/xmlPackage">`);
    });
  });

  describe("extractXmlDocumentDeclaration", () => {
    it("extracts the XML declaration correctly", () => {
      const xmlString = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><pkg:package xmlns:pkg="http://schemas.microsoft.com/office/2006/xmlPackage"></pkg:package>`;
      const declaration = extractXmlDocumentDeclaration(xmlString);
      expect(declaration).toBe(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>`);
    });
  });

  describe("convertXmlStringToLtApiObject", () => {
    it("extracts the XML declaration correctly", () => {
      const xmlString =
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<?mso-application progid="Word.Document"?>' +
        '<pkg:package xmlns:pkg="http://schemas.microsoft.com/office/2006/xmlPackage">' +
        '<w:document xmlns:w10="urn:schemas-microsoft-com:office:word" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
        "<w:part><w:t>First text node</w:t></w:part>" +
        "<w:t>Second text node</w:t>" +
        "</w:document>" +
        "</pkg:package>";
      const annotations = convertXmlStringToLtApiObject(xmlString);
      const expectedAnnotations = {
        annotation: [
          {
            markup: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><?mso-application progid="Word.Document"?>',
          },
          { markup: '<?mso-application progid="Word.Document"?>' },
          { markup: '<pkg:package xmlns:pkg="http://schemas.microsoft.com/office/2006/xmlPackage">' },
          {
            markup:
              '<w:document xmlns:w10="urn:schemas-microsoft-com:office:word" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">',
          },
          { markup: "<w:part>" },
          { markup: "<w:t>" },
          { text: "First text node" },
          { markup: "</w:t>" },
          { markup: "</w:part>" },
          { markup: "<w:t>" },
          { text: "Second text node" },
          { markup: "</w:t>" },
          { markup: "</w:document>" },
          { markup: "</pkg:package>" },
        ],
      };
      expect(JSON.stringify(annotations)).toBe(JSON.stringify(expectedAnnotations));
    });
  });
});
