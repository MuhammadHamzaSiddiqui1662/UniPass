import { mergeAttributes, type Extensions } from "@tiptap/core";
import type { DOMOutputSpec } from "@tiptap/pm/model";
import { Highlight } from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Table, TableKit } from "@tiptap/extension-table";
import Link from "@tiptap/extension-link";
import { TextAlign } from "@tiptap/extension-text-align";
import { TextStyleKit } from "@tiptap/extension-text-style";
import { StarterKit } from "@tiptap/starter-kit";
import { Indent } from "./indent";

const SizedImage = Image.extend({
  parseHTML() {
    return [
      {
        tag: "figure[data-align]",
        priority: 60,
        getAttrs: (element) => {
          if (!(element instanceof HTMLElement)) return false;
          const img = element.querySelector("img");
          if (!img) return false;
          return {
            src: img.getAttribute("src"),
            alt: img.getAttribute("alt"),
            title: img.getAttribute("title"),
            width: img.getAttribute("width"),
            height: img.getAttribute("height"),
            align: element.getAttribute("data-align") || "left",
            caption: element.querySelector("figcaption")?.textContent || null,
            href: element.querySelector("a")?.getAttribute("href") || null,
          };
        },
      },
      ...(this.parent?.() ?? []),
    ];
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: "left",
        parseHTML: (element) => element.closest("figure")?.getAttribute("data-align") || "left",
        renderHTML: () => ({}),
      },
      caption: {
        default: null,
        parseHTML: (element) => element.closest("figure")?.querySelector("figcaption")?.textContent || null,
        renderHTML: () => ({}),
      },
      href: {
        default: null,
        parseHTML: (element) =>
          element.closest("a")?.getAttribute("href") || element.querySelector("a")?.getAttribute("href") || null,
        renderHTML: () => ({}),
      },
    };
  },

  renderHTML({ HTMLAttributes, node }): DOMOutputSpec {
    const img: DOMOutputSpec = ["img", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
    const href = typeof node.attrs.href === "string" && node.attrs.href ? node.attrs.href : null;
    const linked: DOMOutputSpec = href ? ["a", { href, target: "_blank", rel: "noopener noreferrer" }, img] : img;
    const caption = typeof node.attrs.caption === "string" && node.attrs.caption ? node.attrs.caption : null;
    const align = node.attrs.align === "center" || node.attrs.align === "right" ? node.attrs.align : "left";

    if (!caption && align === "left") return linked;

    const margin =
      align === "center" ? "margin-inline: auto;" : align === "right" ? "margin-inline-start: auto;" : "";
    const figure: unknown[] = [
      "figure",
      {
        "data-align": align,
        style: `display: table; max-width: 100%; ${margin}`,
      },
      linked,
    ];

    if (caption) {
      figure.push([
        "figcaption",
        {
          style: "display: table-caption; caption-side: bottom; font-size: 12px; margin-top: 4px;",
        },
        caption,
      ]);
    }

    return figure as unknown as DOMOutputSpec;
  },

  addNodeView() {
    const createView = this.parent?.();
    if (!createView) return null;

    return (props) => {
      const inner = createView(props);
      const container = inner.dom;
      if (!(container instanceof HTMLElement)) return inner;

      const figure = document.createElement("figure");
      figure.className = "guide-rte-figure";
      figure.appendChild(container);

      const captionEl = document.createElement("figcaption");
      captionEl.className = "guide-rte-caption";
      figure.appendChild(captionEl);

      const sync = (node: typeof props.node) => {
        const align = node.attrs.align === "center" || node.attrs.align === "right" ? node.attrs.align : "left";
        figure.dataset.align = align;
        container.style.width = "100%";
        container.style.justifyContent = align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start";
        const caption = typeof node.attrs.caption === "string" ? node.attrs.caption : "";
        captionEl.textContent = caption;
        captionEl.hidden = caption.length === 0;
      };

      sync(props.node);

      return {
        dom: figure,
        update: (node, decorations, innerDecorations) => {
          const ok = inner.update?.(node, decorations, innerDecorations);
          if (ok === false) return false;
          sync(node);
          return true;
        },
        destroy: () => {
          inner.destroy?.();
        },
      };
    };
  },
}).configure({
  allowBase64: false,
  resize: {
    enabled: true,
    directions: ["top", "bottom", "left", "right", "top-left", "top-right", "bottom-left", "bottom-right"],
    minWidth: 40,
    minHeight: 40,
    alwaysPreserveAspectRatio: true,
  },
});

type SpecAttrs = Record<string, string | undefined>;
type SpecNode = [string, SpecAttrs?, ...unknown[]];

const isSpecNode = (value: unknown): value is SpecNode => Array.isArray(value) && typeof value[0] === "string";

const forceFullWidth = (style: string | undefined): string => {
  const kept = (style ?? "")
    .replace(/(?:^|;)\s*(?:min-)?width\s*:[^;]*/gi, "")
    .replace(/^\s*;\s*|\s*;\s*$/g, "")
    .trim();
  return kept ? `${kept}; width: 100%` : "width: 100%";
};

const FullWidthTable = Table.extend({
  renderHTML(props) {
    const rendered = this.parent?.(props);
    if (!isSpecNode(rendered)) {
      return ["table", { class: "guide-rte-table", style: "width: 100%" }, ["tbody", 0]];
    }

    const table = rendered[0] === "div" && isSpecNode(rendered[2]) ? rendered[2] : rendered;
    if (table[1]) {
      table[1].style = forceFullWidth(table[1].style);
      table[1].class = table[1].class || "guide-rte-table";
    }

    const colgroup = table[2];
    if (isSpecNode(colgroup) && colgroup[0] === "colgroup") {
      const cols = colgroup.slice(2).filter(isSpecNode);
      const widths = cols.map((col) => {
        const match = String(col[1]?.style ?? "").match(/([\d.]+)px/);
        return match ? Number(match[1]) : 0;
      });
      const total = widths.reduce((sum, width) => sum + width, 0);
      if (total > 0) {
        cols.forEach((col, index) => {
          if (!col[1]) return;
          const share = ((widths[index] / total) * 100).toFixed(2);
          col[1].style = `width: ${share}%`;
        });
      }
    }

    return rendered;
  },
});

const RichLink = Link.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      download: {
        default: null,
        parseHTML: (element) => (element.hasAttribute("download") ? (element.getAttribute("download") ?? "") : null),
        renderHTML: (attributes) => {
          if (attributes.download == null) return {};
          return { download: attributes.download };
        },
      },
    };
  },
});

export const buildEditorExtensions = (getPlaceholder: () => string): Extensions => [
  StarterKit.configure({
    heading: { levels: [1, 2, 3, 4, 5, 6] },
    link: false,
  }),
  RichLink.configure({
    openOnClick: false,
    autolink: true,
    linkOnPaste: true,
    HTMLAttributes: {
      rel: "noopener noreferrer",
    },
    isAllowedUri: (url, ctx) => {
      if (url.startsWith("#") || url.startsWith("/") || url.startsWith("./") || url.startsWith("../")) return true;
      if (/^(mailto:|tel:)/i.test(url)) return true;
      return ctx.defaultValidate(url);
    },
  }),
  TextStyleKit.configure({
    backgroundColor: false,
    fontFamily: false,
    lineHeight: false,
  }),
  Highlight.configure({ multicolor: true }),
  TextAlign.configure({
    types: ["heading", "paragraph", "blockquote"],
  }),
  SizedImage,
  TableKit.configure({
    table: false,
  }),
  FullWidthTable.configure({
    resizable: true,
    HTMLAttributes: {
      class: "guide-rte-table",
    },
  }),
  Placeholder.configure({
    placeholder: getPlaceholder,
  }),
  Indent,
];
