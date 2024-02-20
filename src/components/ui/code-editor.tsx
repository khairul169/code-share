/* eslint-disable react/display-name */
import ReactCodeMirror, {
  EditorView,
  ReactCodeMirrorRef,
  keymap,
} from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { json } from "@codemirror/lang-json";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { tokyoNight } from "@uiw/codemirror-theme-tokyo-night";
import { vscodeKeymap } from "@replit/codemirror-vscode-keymap";
import prettier from "prettier/standalone";
import prettierHtmlPlugin from "prettier/plugins/html";
import prettierCssPlugin from "prettier/plugins/postcss";
import prettierBabelPlugin from "prettier/plugins/babel";
import * as prettierPluginEstree from "prettier/plugins/estree";
import { abbreviationTracker } from "@emmetio/codemirror6-plugin";
import { useDebounce } from "@/hooks/useDebounce";
import useCommandKey from "@/hooks/useCommandKey";

type Props = {
  lang?: string;
  value: string;
  wordWrap?: boolean;
  onChange: (val: string) => void;
  formatOnSave?: boolean;
};

const CodeEditor = (props: Props) => {
  const codeMirror = useRef<ReactCodeMirrorRef>(null);
  const { lang, value, formatOnSave, wordWrap, onChange } = props;
  const [data, setData] = useState(value);
  const [debounceChange, resetDebounceChange] = useDebounce(onChange, 3000);
  const langMetadata = useMemo(() => getLangMetadata(lang || "plain"), [lang]);

  const onSave = useCallback(async () => {
    try {
      const cm = codeMirror.current?.view;
      const content = cm ? cm.state.doc.toString() : data;
      const formatter = langMetadata.formatter;

      if (formatOnSave && cm && formatter != null) {
        const [parser, ...plugins] = formatter;
        const cursor = cm.state.selection.main.head || 0;
        const { formatted, cursorOffset } = await prettier.formatWithCursor(
          content,
          {
            parser,
            plugins,
            cursorOffset: cursor,
          }
        );

        setData(formatted);
        onChange(formatted);

        if (cm) {
          cm.dispatch({
            changes: { from: 0, to: cm?.state.doc.length, insert: formatted },
          });
          cm.dispatch({
            selection: { anchor: cursorOffset },
          });
        }
      } else {
        onChange(content);
      }
    } catch (err) {
      console.log("prettier error", err);
    }

    setTimeout(() => resetDebounceChange(), 100);
  }, [
    data,
    langMetadata.formatter,
    formatOnSave,
    onChange,
    resetDebounceChange,
  ]);

  useCommandKey("s", onSave);

  useEffect(() => {
    setData(value);
  }, [value]);

  const extensions = [...langMetadata.extensions, keymap.of(vscodeKeymap)];
  if (wordWrap) {
    extensions.push(EditorView.lineWrapping);
  }

  return (
    <ReactCodeMirror
      ref={codeMirror}
      extensions={extensions}
      indentWithTab={false}
      basicSetup={{ defaultKeymap: false }}
      value={data}
      onChange={(val) => {
        setData(val);
        debounceChange(val);
      }}
      height="100%"
      theme={tokyoNight}
    />
  );
};

function getLangMetadata(lang: string) {
  let extensions: any[] = [];
  let formatter: any = null;

  switch (lang) {
    case "html":
      extensions = [html({ selfClosingTags: true }), abbreviationTracker()];
      formatter = ["html", prettierHtmlPlugin];
      break;
    case "css":
      extensions = [css()];
      formatter = ["css", prettierCssPlugin];
      break;
    case "json":
      extensions = [json()];
      formatter = ["json", prettierBabelPlugin, prettierPluginEstree];
      break;
    case "jsx":
    case "js":
    case "ts":
    case "tsx":
      extensions = [
        javascript({
          jsx: ["jsx", "tsx"].includes(lang),
          typescript: ["tsx", "ts"].includes(lang),
        }),
      ];
      formatter = ["babel", prettierBabelPlugin, prettierPluginEstree];
      break;
  }

  return { extensions, formatter };
}

export default CodeEditor;
