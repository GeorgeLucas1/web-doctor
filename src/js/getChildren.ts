import * as acorn from "acorn";

function getChildren(
	node: acorn.Statement | acorn.ModuleDeclaration
): any[] {
	const children = [];

	for (let propertyValue of Object.values(node)) {
		if (!propertyValue) continue;

		if (Array.isArray(propertyValue)) {
			for (let item of propertyValue) {
				if (typeof item === 'object' && typeof item.type === 'string') {
					children.push(item);
				}
			}
		} else if (typeof propertyValue === 'object') {
			if (typeof propertyValue.type === 'string') {
				children.push(propertyValue);
			}
		}
	}

	return children;
}

export default getChildren;
