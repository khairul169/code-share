import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CodeiumEditor } from "@codeium/react-code-editor/dist/esm";
import prettier from "prettier/standalone";
import prettierHtmlPlugin from "prettier/plugins/html";
import prettierCssPlugin from "prettier/plugins/postcss";
import prettierBabelPlugin from "prettier/plugins/babel";
import * as prettierPluginEstree from "prettier/plugins/estree";
import { useDebounce } from "~/hooks/useDebounce";
import useCommandKey from "~/hooks/useCommandKey";
import { getFileExt } from "~/lib/utils";

type Props = {
  filename?: string;
  path?: string;
  value: string;
  wordWrap?: boolean;
  onChange: (val: string) => void;
  formatOnSave?: boolean;
};

const CodeEditor = (props: Props) => {
  const { filename, path, value, formatOnSave, wordWrap, onChange } = props;
  const editorRef = useRef<any>(null);
  const [data, setData] = useState(value);
  const [debounceChange, resetDebounceChange] = useDebounce(onChange, 3000);
  const language = useMemo(() => getLanguage(filename), [filename]);

  const onSave = useCallback(async () => {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }

    const model = editor.getModel();
    const content = model.getValue();

    const formatter = language.formatter;
    if (!formatOnSave || !formatter) {
      return onChange(content);
    }

    try {
      const [parser, ...plugins] = formatter;

      const cursor = model.getOffsetAt(editor.getPosition());
      const { formatted, cursorOffset } = await prettier.formatWithCursor(
        content,
        {
          parser,
          plugins,
          cursorOffset: cursor || 0,
          printWidth: 64,
        }
      );

      model.setValue(formatted);
      const newCursor = model.getPositionAt(cursorOffset);
      editor.setPosition(newCursor);
      console.log("huhu set cursor");

      onChange(formatted);
    } catch (err) {
      console.log("prettier error", err);
      onChange(content);
    }

    setTimeout(() => resetDebounceChange(), 100);
  }, [language.formatter, formatOnSave, onChange, resetDebounceChange]);

  useEffect(() => {
    setData(value);
  }, [value]);

  useCommandKey("s", onSave);

  return (
    <div className="w-full h-full code-editor">
      <CodeiumEditor
        language={language.name}
        theme="vs-dark"
        path={path || filename}
        value={data}
        height="100%"
        onMount={(editor: any, _monaco: any) => {
          editorRef.current = editor;
        }}
        onChange={(e: string) => debounceChange(e)}
      />
    </div>
  );
};

// generate this as enum of languages
enum Languages {
  Abap = "abap",
  Apex = "apex",
  Azcli = "azcli",
  Bat = "bat",
  C = "c",
  Clojure = "clojure",
  Coffeescript = "coffeescript",
  Cpp = "cpp",
  Csharp = "csharp",
  Csp = "csp",
  Css = "css",
  Dockerfile = "dockerfile",
  Fsharp = "fsharp",
  Go = "go",
  Graphql = "graphql",
  Handlebars = "handlebars",
  Html = "html",
  Ini = "ini",
  Java = "java",
  Javascript = "javascript",
  Json = "json",
  Less = "less",
  Lua = "lua",
  Markdown = "markdown",
  M3 = "m3",
  Msdax = "msdax",
  Mysql = "mysql",
  Objective = "objective",
  Pgsql = "pgsql",
  Php = "php",
  Postiats = "postiats",
  Powershell = "powershell",
  Pug = "pug",
  Python = "python",
  R = "r",
  Razor = "razor",
  Redis = "redis",
  Redshift = "redshift",
  Ruby = "ruby",
  Sb = "sb",
  Scss = "scss",
  Shell = "shell",
  Solidity = "solidity",
  Sql = "sql",
  Swift = "swift",
  Typescript = "typescript",
  Vb = "vb",
  Xml = "xml",
  Yaml = "yaml",
  Common = "common",
}

function getLanguage(filename?: string | null) {
  const ext = getFileExt(filename || "");
  let name: Languages = Languages.Common;
  let formatter: any = null;

  switch (ext) {
    case "html":
      name = Languages.Html;
      formatter = ["html", prettierHtmlPlugin];
      break;
    case "css":
      name = Languages.Css;
      formatter = ["css", prettierCssPlugin];
      break;
    case "json":
      name = Languages.Json;
      formatter = ["json", prettierBabelPlugin, prettierPluginEstree];
      break;
    case "jsx":
    case "js":
    case "ts":
    case "tsx":
      const isTypescript = ["tsx", "ts"].includes(ext);
      name = isTypescript ? Languages.Typescript : Languages.Javascript;
      formatter = [
        isTypescript ? "babel-ts" : "babel",
        prettierBabelPlugin,
        prettierPluginEstree,
      ];
      break;
  }

  return { name, formatter };
}

export default CodeEditor;
