import * as swc from "@swc/core";

export const transformJs = async (code: string) => {
  try {
    const result = await swc.transform(code, {
      jsc: {
        parser: {
          jsx: true,
          syntax: "ecmascript",
        },
        target: "es5",
      },
    });

    return result.code;
  } catch (err) {
    return code;
  }
};
