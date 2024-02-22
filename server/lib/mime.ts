import { Mime } from "mime/lite";
import standardTypes from "mime/types/standard.js";
import otherTypes from "mime/types/other.js";

const mime = new Mime(standardTypes, otherTypes);
mime.define({ "text/javascript": ["jsx", "tsx"] }, true);

export const getMimeType = (
  ext: string,
  defaultMime: string = "application/octet-stream"
) => mime.getType(ext) || defaultMime;
