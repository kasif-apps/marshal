/**
 * main module contains exports to the library.
 */

import { encode, encodeWithClasses } from "./marshal.ts";
import { decode, readFromIndex } from "./unmarshal.ts";

export { encode, encodeWithClasses, type EncodeOptions } from "./marshal.ts";
export { decode, readFromIndex } from "./unmarshal.ts";
export { index } from "./util.ts";

export type { Marshalled } from "./marshal.ts";

const Marshal = {
  encode,
  encodeWithClasses,
  decode,
  readFromIndex,
};

export default Marshal;
