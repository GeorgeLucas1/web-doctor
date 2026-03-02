import getChildren from "./getChildren";

function calcJsPoints(astNode: any) {
	let points = 10;

	function walk(node: any) {
		if (!node) return;

		switch (node.type) {
		case 'AssignmentExpression':
			const hasInnerHtml = node.left?.property?.name === 'innerHTML';
			if (hasInnerHtml) points--;
			break;
		case 'VariableDeclaration':
			const hasVar = node.kind === 'var';
			if (hasVar) points--;
			break;
		case 'CallExpression':
			const funcName = node.callee?.name;
			if (funcName === 'alert' || funcName === 'eval') points--;
			break;
		case 'BinaryExpression':
			const hasDoubleEqualExpression = node.operator === '==' || node.operator === '!=';
			if (hasDoubleEqualExpression) points--;
			break;
		case 'WithStatement':
			points--;
			break;
		case 'BlockStatement':
			const hasNoCodeInBlock = node.body.length === 0
			if (hasNoCodeInBlock) points--;
			break;
		}

		const children = getChildren(node);
		for (let child of children) walk(child);
	}

	walk(astNode);

	return Math.max(0, points);
}

export default calcJsPoints;
