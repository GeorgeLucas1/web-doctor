import { Parser } from "htmlparser2";
import type { AttributeItem, DomItem } from "./types";

async function parseHtmlToDom(path: string): Promise<DomItem[]> {
	const code = await Bun.file(path).text();
	const tagItems: DomItem[] = [];
	const stack: DomItem[] = [];

  const parser = new Parser({
		onopentag(tag, attributes) {
			const formattedAttributes: AttributeItem[] = Object
				.entries(attributes)
				.map(([name, value]) => ({ name, value }));

			const newItem: DomItem = {
				tag,
				attributes: formattedAttributes,
				content: ''
			};

			tagItems.push(newItem);
			stack.push(newItem);
		},
		ontext(text) {
			const cleanText = text.trim();
			if (cleanText && stack.length > 0) {
				const lastItem = stack[stack.length - 1];
				if (
					lastItem &&
					lastItem.tag !== 'script' &&
					lastItem.tag !== 'style'
				) {
					lastItem.content = (lastItem.content || '') + cleanText + ' ';
				}
			}
		},
		onclosetag(name) {
			for (let i = stack.length - 1; i >= 0; i--) {
				if (stack[i]?.tag === name) {
					stack.length = i;
					break;
				}
			}
		},
    onerror(e) {
			console.error(`❌ Error parsing HTML in file ${path}:`, e);
		},
  });

  parser.write(code);
  parser.end();

  return tagItems;
}

export default parseHtmlToDom;
