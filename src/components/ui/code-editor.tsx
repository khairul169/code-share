/* eslint-disable react/display-name */
import ReactCodeMirror, { EditorView } from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { forwardRef, useEffect, useMemo, useState } from "react";
import { tokyoNight } from "@uiw/codemirror-theme-tokyo-night";
import { useDebounceCallback } from "usehooks-ts";

type Props = {
  lang?: string;
  value: string;
  onChange: (val: string) => void;
};

const CodeEditor = forwardRef(({ lang, value, onChange }: Props, ref: any) => {
  const [data, setData] = useState(value);
  const debounceValue = useDebounceCallback(onChange, 100);

  const extensions = useMemo(() => {
    const e: any[] = [];

    switch (lang) {
      case "html":
        e.push(html({ selfClosingTags: true }));
      case "css":
        e.push(css());
      case "jsx":
      case "js":
      case "ts":
      case "tsx":
        e.push(
          javascript({
            jsx: ["jsx", "tsx"].includes(lang),
            typescript: ["tsx", "ts"].includes(lang),
          })
        );
    }

    return e;
  }, [lang]);

  useEffect(() => {
    setData(value);
  }, [value]);

  return (
    <ReactCodeMirror
      ref={ref}
      extensions={[EditorView.lineWrapping, ...extensions]}
      value={data}
      onChange={(val) => {
        setData(val);
        debounceValue(val);
      }}
      height="100%"
      theme={tokyoNight}
    />
  );
});

export default CodeEditor;
