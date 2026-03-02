import * as acorn from "acorn";

async function parseJsToAst(path: string) {
	const code = await Bun.file(path).text();
	return acorn.parse(code, { ecmaVersion: "latest" });
}

export default parseJsToAst;
