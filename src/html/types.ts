export type DomItem = {
	tag: string;
	content?: string;
  attributes: AttributeItem[];
};

export type AttributeItem = {
  name: string;
  value: string;
};
