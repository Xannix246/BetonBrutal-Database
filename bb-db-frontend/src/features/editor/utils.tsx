/* eslint-disable @typescript-eslint/no-explicit-any */
export function formatText(type: string, view: any) {
  if (!view) return;
  const { from, to } = view.state.selection.main;
  const text = view.state.sliceDoc(from, to);
  let formatted = text;

  switch (type) {
    // case "bold":
    //   formatted = `**${text || "bold"}**`;
    //   break;
    case "italic": {
      const regex = /^\*(.+)\*$/s;
      formatted = regex.test(text) ? text.replace(regex, "$1") : `*${text || "italic"}*`;
      break;
    }
    case "bold": {
      const regex = /^\*\*(.+)\*\*$/s;
      formatted = regex.test(text) ? text.replace(regex, "$1") : `**${text || "bold"}**`;
      break;
    }
    case "link": {
      const regex = /^\[(.+?)\]\((.+?)\)$/s;
      formatted = regex.test(text) ? text.replace(regex, "$1") : `[${text || "link"}](url)`;
      break;
    }
    case "code": {
      const regex = /^`(.+)`$/s;
      formatted = regex.test(text) ? text.replace(regex, "$1") : `\`${text || "code"}\``;
      break;
    }
    case "quote": {
      const regex = /^> (.+)$/s;
      formatted = regex.test(text) ? text.replace(regex, "$1") : `> ${text || "quote"}`;
      break;
    }
    case "ul": {
      const regex = /^- (.+)$/s;
      formatted = regex.test(text) ? text.replace(regex, "$1") : `- ${text || "item"}`;
      break;
    }
  }

  view.dispatch({
    changes: { from, to, insert: formatted },
  });
  view.focus();
}
