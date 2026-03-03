import type { DomItem } from "./types";

const BAD_TAGS = new Set([
	'center',
	'font',
	'marquee',
	'b',
	'blink',
	'i',
	'br',
	'strike',
	'frame'
]);

const GENERIC_LINK_TEXTS = new Set([
	'clique aqui',
	'saiba mais',
	'veja mais',
	'click here',
	'read more'
]);

function calcHtmlPoints(dom: DomItem[]) {
  let points = 10;

  for (let currentTag of dom) {
    if (BAD_TAGS.has(currentTag.tag)) points--;

		const hasInlineJs = currentTag.attributes.some(
			attr => attr.name.startsWith('on')
		);
		if (hasInlineJs) points--;

		const hasInlineStyle = currentTag.attributes.some(
			attr => attr.name === 'style'
		);
		if (hasInlineStyle) points--;

		const tabIndexAttr = currentTag.attributes.find(
			attr => attr.name === 'tabindex'
		);
		if (tabIndexAttr && Number(tabIndexAttr.value) > 0) points--;

		switch (currentTag.tag) {
			case 'html': {
				const hasLangAttr = currentTag.attributes.some(
					attr => attr.name === 'lang' && attr.value.trim() !== ''
				);
				if (!hasLangAttr) points--;

				break;
			}
			case 'img': {
				const hasValidAlt = currentTag.attributes.some(
					attr => attr.name === 'alt' && attr.value.trim() !== ''
				);
				if (!hasValidAlt) points--;

        break;
			}
			case 'label': {
				const hasValidFor = currentTag.attributes.some(
					attr => attr.name === 'for' && attr.value.trim() !== ''
				);
				if (!hasValidFor) points--;

        break;
			}
			case 'input': {
				const hasIdOrName = currentTag.attributes.some(
					attr =>
						(attr.name === 'id' || attr.name === 'name') &&
						attr.value.trim() !== ''
				);
				if (!hasIdOrName) points--;

        break;
			}
			case 'button': {
				const hasValidType = currentTag.attributes.some(
					attr => attr.name === 'type' && attr.value.trim() !== ''
				);
        if (!hasValidType) points--;

				const hasTextContent =
					currentTag.content && currentTag.content.trim() !== '';
				const hasAriaLabel = currentTag.attributes.some(
					attr => attr.name === 'aria-label' && attr.value.trim() !== ''
				);
				if (!hasTextContent && !hasAriaLabel) points--;

        break;
			}
			case 'a': {
				let hasHref = false;
				let isTargetBlank = false;
				let hasSecureRel = false;
				let hasAriaLabel = false;

				for (const attr of currentTag.attributes) {
					if (attr.name === 'href' && attr.value.trim() !== '') hasHref = true;

					if (
						attr.name === 'target' && attr.value === '_blank'
					) isTargetBlank = true;

					if (
						attr.name === 'rel' &&
						(
							attr.value.includes('noopener') ||
							attr.value.includes('noreferrer')
						)
					) hasSecureRel = true;

					if (
						attr.name === 'aria-label' && attr.value.trim() !== ''
					) hasAriaLabel = true;
				}

				if (!hasHref) points--;
				if (isTargetBlank && !hasSecureRel) points--;

				const linkText = (currentTag.content || '').toLowerCase().trim();
				const isGenericText = GENERIC_LINK_TEXTS.has(linkText);
				const isEmpty = linkText === '';

				if ((isGenericText || isEmpty) && !hasAriaLabel) points--;

        break;
			}
		}

		if (points <= 0) return 0;
  }

  return Math.max(0, points);
}

export default calcHtmlPoints;
