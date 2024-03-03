/**
 * util module contains constants and functions that are used internally.
 */

import { encodeNumber } from "./numbers.ts";
import { Key } from "./unmarshal.ts";

export const constants = {
  string: 1,
  u8: 2,
  u16: 3,
  u32: 4,
  u64: 5,
  i8: 6,
  i16: 7,
  i32: 8,
  i64: 9,
  f32: 10,
  f64: 11,
  true: 12,
  false: 13,
  null: 14,
  undefined: 15,
  array: 16,
  record: 17,
  set: 18,
  map: 19,
  date: 20,
  u8array: 21,
  u16Array: 22,
  u32Array: 23,
  i8array: 24,
  i16Array: 25,
  i32Array: 26,
  symbol: 27,
  class: 28,
  ref: 29,
  index: 30,

  terminator: 0,

  encoded: {
    string: encodeNumber.u8(1),
    u8: encodeNumber.u8(2),
    u16: encodeNumber.u8(3),
    u32: encodeNumber.u8(4),
    u64: encodeNumber.u8(5),
    i8: encodeNumber.u8(6),
    i16: encodeNumber.u8(7),
    i32: encodeNumber.u8(8),
    i64: encodeNumber.u8(9),
    f32: encodeNumber.u8(10),
    f64: encodeNumber.u8(11),
    true: encodeNumber.u8(12),
    false: encodeNumber.u8(13),
    null: encodeNumber.u8(14),
    undefined: encodeNumber.u8(15),
    array: encodeNumber.u8(16),
    record: encodeNumber.u8(17),
    set: encodeNumber.u8(18),
    map: encodeNumber.u8(19),
    date: encodeNumber.u8(20),
    u8array: encodeNumber.u8(21),
    u16Array: encodeNumber.u8(22),
    u32Array: encodeNumber.u8(23),
    i8array: encodeNumber.u8(24),
    i16Array: encodeNumber.u8(25),
    i32Array: encodeNumber.u8(26),
    symbol: encodeNumber.u8(27),
    class: encodeNumber.u8(28),
    ref: encodeNumber.u8(29),
    index: encodeNumber.u8(30),

    terminator: encodeNumber.u8(0),
  },
} as const;

export function getEntries<T extends Record<string, unknown> | object>(
  object: T
): [[Key, unknown][], boolean] {
  const result: [Key, unknown][] = [];
  let onlyStringKeys = true;

  const enumarables: Array<string | symbol> =
    Object.getOwnPropertyNames(object);
  const symbols = Object.getOwnPropertySymbols(object);
  const length = Math.max(enumarables.length, symbols.length);

  for (let i = 0; i < length; i++) {
    if (typeof enumarables[i] !== "string") {
      onlyStringKeys = false;
    }
    const enumarable = enumarables[i];

    if (enumarable) {
      result.push([enumarable, object[enumarable as keyof T]]);
    }

    if (symbols.length < i) {
      continue;
    }

    const symbol = symbols[i];
    if (symbol) {
      onlyStringKeys = false;
      result.push([symbol, object[symbol as keyof T]]);
    }
  }

  return [result, onlyStringKeys];
}
export type BinConfig = {
  /** Encoding version */
  v: string;
  /** Numeric encoding is big endian */
  be: boolean;
  /** Encoded objects has symbol keys */
  hs: boolean;
  /** Encoded objects has number keys */
  hn: boolean;
  /** Encoding uses dynamic numbers instead of all JS float64 */
  dn: boolean;
  /** All strings are only ASCII */
  aa: boolean;
  /** Encoding has other object references */
  re: boolean;
};

// there is a 50 byte buffer for some metadata
export const startOffset = 100;

/** Unique symbol for creating indexed objects.
 * Provide this symbol as a string property to an object to want indexed.
 * @example
 * ```ts
 * const obj = {
 *  [index]: "index",
 *  data: "Hello, World!"
 * }
 * ```
 */
export const index = Symbol("Marshal.index");
