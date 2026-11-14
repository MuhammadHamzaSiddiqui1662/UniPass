import { Extension, type CommandProps } from "@tiptap/core";

const INDENT_STEP = 24;
const MAX_INDENT = 240;
const INDENT_TYPES = ["paragraph", "heading", "blockquote"];

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    indent: {
      indent: () => ReturnType;
      outdent: () => ReturnType;
      resetIndent: () => ReturnType;
    };
  }
}

const parseIndent = (element: HTMLElement): number => {
  const raw = element.style.marginInlineStart || element.style.marginLeft || "";
  const value = Number.parseInt(raw, 10);
  return Number.isFinite(value) && value > 0 ? value : 0;
};

const changeIndent = (delta: number) => {
  return ({ tr, state, dispatch }: CommandProps) => {
    const { from, to } = state.selection;
    let changed = false;

    state.doc.nodesBetween(from, to, (node, pos) => {
      if (!INDENT_TYPES.includes(node.type.name)) return;
      const current = Number(node.attrs.indent) || 0;
      const next = Math.min(MAX_INDENT, Math.max(0, current + delta));
      if (next === current) return;
      tr.setNodeMarkup(pos, undefined, { ...node.attrs, indent: next });
      changed = true;
    });

    if (!changed) return false;
    if (dispatch) dispatch(tr);
    return true;
  };
};

export const Indent = Extension.create({
  name: "indent",

  addGlobalAttributes() {
    return [
      {
        types: INDENT_TYPES,
        attributes: {
          indent: {
            default: 0,
            parseHTML: (element) => parseIndent(element),
            renderHTML: (attributes) => {
              const indent = Number(attributes.indent) || 0;
              if (indent <= 0) return {};
              return { style: `margin-inline-start: ${indent}px` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      indent: () => changeIndent(INDENT_STEP),
      outdent: () => changeIndent(-INDENT_STEP),
      resetIndent: () => changeIndent(-MAX_INDENT),
    };
  },
});
