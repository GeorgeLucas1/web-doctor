import postcss from "postcss";
import type { AstItem, PropertiesItem } from "./types";

async function parseCssToAst(path: string): Promise<AstItem[]> {
	const code = await Bun.file(path).text();
	const ast = postcss.parse(code);

	const astCssItems: AstItem[] = [];

	ast.walkRules(rule => {
		const properties: PropertiesItem[] = [];

		let selector = rule.selector;

		rule.walkDecls(decl => {
			let property = decl.prop;
			let value = decl.value;
			let isImportant = decl.important === true;

			properties.push({ property, value, isImportant });
		});

		astCssItems.push({ selector, properties });
	});

	return astCssItems;
}

export default parseCssToAst;
