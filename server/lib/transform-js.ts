import * as swc from "@swc/core";

export const transformJs = async (code: string, type: "js" | "ts" = "js") => {
  try {
    const result = await swc.transform(code, {
      jsc: {
        parser: {
          syntax: type === "js" ? "ecmascript" : "typescript",
          jsx: true,
          tsx: true,
        },
        target: "es5",
      },
    });

    return result.code;
  } catch (err) {
    // console.log(err);
    return code;
  }
};
