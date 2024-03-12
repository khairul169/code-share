import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CodeiumEditor } from "@codeium/react-code-editor/dist/esm";

import prettier from "prettier/standalone";
import prettierHtmlPlugin from "prettier/plugins/html";
import prettierCssPlugin from "prettier/plugins/postcss";
import prettierBabelPlugin from "prettier/plugins/babel";
import * as prettierPluginEstree from "prettier/plugins/estree";

import { useDebounce } from "~/hooks/useDebounce";
import useCommandKey from "~/hooks/useCommandKey";
import { getFileExt, toast } from "~/lib/utils";

type InitFileData = {
  path: string;
  value: string;
};

type Props = {
  filename?: string;
  path?: string;
  value: string;
  wordWrap?: boolean;
  onChange: (val: string) => void;
  formatOnSave?: boolean;
  isReadOnly?: boolean;
  initialFiles?: InitFileData[];
};

const CodeEditor = (props: Props) => {
  const {
    filename,
    path,
    value,
    formatOnSave,
    isReadOnly,
    onChange,
    initialFiles,
  } = props;
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const [isMounted, setMounted] = useState(false);
  const [debounceChange, resetDebounceChange] = useDebounce(onChange, 3000);
  const language = useMemo(() => getLanguage(filename), [filename]);

  const onMount = useCallback((editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.Latest,
      allowNonTsExtensions: false,
      allowImportingTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      esModuleInterop: true,
      jsx: monaco.languages.typescript.JsxEmit.React,
      reactNamespace: "React",
      allowJs: true,
      typeRoots: ["node_modules/@types"],
    });
    monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });

    setMounted(true);
    loadExternalLibs(monaco);
  }, []);

  useEffect(() => {
    const monaco = monacoRef.current;
    if (!isMounted || !monaco || !initialFiles?.length) {
      return;
    }

    initialFiles.forEach((i) => {
      const uri = monaco.Uri.parse(i.path);
      const existingModel = monaco.editor.getModel(uri);

      if (!existingModel) {
        const lang = getLanguage(i.path);
        monaco.editor.createModel(i.value, lang?.name || "", uri);
      }
    });
  }, [initialFiles, isMounted]);

  const onSave = useCallback(async () => {
    if (isReadOnly) {
      return;
    }

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

      // model.setValue(formatted);
      editor.executeEdits("", [
        {
          range: editor.getModel()!.getFullModelRange(),
          text: formatted,
          forceMoveMarkers: true,
        },
      ]);

      const newCursor = model.getPositionAt(cursorOffset);
      editor.setPosition(newCursor);

      onChange(formatted);
    } catch (err) {
      console.error(err);
      toast.error((err as any)?.message || "Cannot format code!");
      onChange(content);
    }

    setTimeout(() => resetDebounceChange(), 100);
  }, [
    language.formatter,
    formatOnSave,
    onChange,
    resetDebounceChange,
    isReadOnly,
  ]);

  // useEffect(() => {
  //   const editor = editorRef.current;
  //   const model = editor?.getModel();

  //   if (editor && model?.uri.path.substring(1) === path) {
  //     editor.executeEdits("", [
  //       {
  //         range: editor.getModel()!.getFullModelRange(),
  //         text: value,
  //         forceMoveMarkers: true,
  //       },
  //     ]);
  //   }
  // }, [value]);

  useCommandKey("s", onSave);

  return (
    <div className="w-full h-full code-editor">
      <CodeiumEditor
        defaultLanguage={language.name}
        theme="vs-dark"
        path={path}
        defaultValue={value}
        height="100%"
        onMount={onMount}
        options={{ readOnly: isReadOnly }}
        onChange={(e: string) => {
          if (!isReadOnly) {
            debounceChange(e);
          }
        }}
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

const loadExternalLibs = async (monaco: any) => {
  const libs = [
    {
      name: "react",
      url: "https://unpkg.com/@types/react@18.2.65/index.d.ts",
      uri: "file:///node_modules/@types/react/index.d.ts",
    },
  ];

  libs.forEach(async (lib) => {
    try {
      const res = await fetch(lib.url);
      const data = await res.text();
      monaco.languages.typescript.typescriptDefaults.addExtraLib(data, lib.uri);
    } catch (err) {
      console.error(`Cannot load ${lib.name} lib!`, err);
    }
  });
};

export default CodeEditor;
