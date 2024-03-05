/**
 * util module contains constants and functions that are used internally.
 */

import { encodeNumber } from "./numbers.ts";
import { Key } from "./unmarshal.ts";

export const constants = {
  string: 1,
  u8: 2,
  u8Clamped: 3,
  u16: 4,
  u32: 5,
  u64: 6,
  i8: 7,
  i16: 8,
  i32: 9,
  i64: 10,
  f32: 11,
  f64: 12,
  true: 13,
  false: 14,
  null: 15,
  undefined: 16,
  array: 17,
  record: 18,
  set: 19,
  map: 20,
  date: 21,
  u8array: 22,
  u16Array: 23,
  u32Array: 24,
  i8array: 25,
  i16Array: 26,
  i32Array: 27,
  symbol: 28,
  class: 29,
  regex: 30,
  ref: 31,
  index: 32,

  terminator: 0,

  encoded: {
    string: encodeNumber.u8(1),
    u8: encodeNumber.u8(2),
    u8Clamped: encodeNumber.u8(3),
    u16: encodeNumber.u8(4),
    u32: encodeNumber.u8(5),
    u64: encodeNumber.u8(6),
    i8: encodeNumber.u8(7),
    i16: encodeNumber.u8(8),
    i32: encodeNumber.u8(9),
    i64: encodeNumber.u8(10),
    f32: encodeNumber.u8(11),
    f64: encodeNumber.u8(12),
    true: encodeNumber.u8(13),
    false: encodeNumber.u8(14),
    null: encodeNumber.u8(15),
    undefined: encodeNumber.u8(16),
    array: encodeNumber.u8(17),
    record: encodeNumber.u8(18),
    set: encodeNumber.u8(19),
    map: encodeNumber.u8(20),
    date: encodeNumber.u8(21),
    u8Array: encodeNumber.u8(22),
    u16Array: encodeNumber.u8(23),
    u32Array: encodeNumber.u8(24),
    i8Array: encodeNumber.u8(25),
    i16Array: encodeNumber.u8(26),
    i32Array: encodeNumber.u8(27),
    symbol: encodeNumber.u8(28),
    class: encodeNumber.u8(29),
    regex: encodeNumber.u8(30),
    ref: encodeNumber.u8(31),
    index: encodeNumber.u8(32),

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

export const version = "0.2.0"