import { ucfirst } from "~/lib/utils";

export const visibilityList = ["public", "private", "unlisted"].map(
  (value) => ({
    value,
    label: ucfirst(value),
  })
);

export const cssPreprocessorList = [
  {
    label: "None",
    value: "",
  },
  {
    label: "PostCSS",
    value: "postcss",
  },
];

export const jsTranspilerList = [
  {
    label: "None",
    value: "",
  },
  {
    label: "SWC",
    value: "swc",
  },
];
