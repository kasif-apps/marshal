/**
 * ummarshal module contains functions for decoding values into binary buffers.
 */

import { Marshalled } from "./marshal.ts";
import { decodeNumber } from "./numbers.ts";
import { BinConfig, constants, startOffset } from "./util.ts";

// objects map is to keep track of references in the binary
const objects = new Map<number, unknown>();
// there is a 50 byte offset for metadata
let offset = startOffset;
let config: BinConfig = {} as BinConfig;
let constructors: Array<new (...args: unknown[]) => any> = [];
let input: Uint8Array | undefined;

const textDecoder = new TextDecoder();

function peek(n: number, off = 0): Uint8Array {
  return input!.slice(offset + off, offset + off + n);
}

function decodeSize(off = 0): number {
  return (
    input![0 + offset + off] |
    (input![1 + offset + off] << 8) |
    (input![2 + offset + off] << 16) |
    (input![3 + offset + off] << 24)
  );
}

/**
 * Unmarshals a string from the binary
 */
function unmarshalString(): string {
  const length = decodeSize();
  offset += 4;

  if (length === 0) {
    return "";
  }

  const result = textDecoder.decode(input!.subarray(offset, offset + length));
  offset += length;

  return result;
}

/**
 * Unmarshals a symbol from the binary
 */
function unmarshalSymbol(): symbol {
  const length = decodeSize();
  offset += 4;

  if (length === 0) {
    return Symbol("");
  }

  const result = textDecoder.decode(input!.subarray(offset, offset + length));
  offset += length;

  return Symbol(result);
}

export type Key = string | symbol | number;

/**
 * Unmarshals a record, map or class instance key from the binary
 */
function unmarshalKey(): Key {
  if (!config.hs && !config.hn) {
    offset++;
    return unmarshalString();
  }

  const type = input![offset];
  offset++;

  switch (type) {
    case constants.string:
      return unmarshalString();
    case constants.symbol:
      return unmarshalSymbol();
    case constants.i8:
    case constants.i16:
    case constants.i32:
    case constants.u8:
    case constants.u16:
    case constants.u32:
      return unmarshalInteger();
    case constants.f64:
      return unmarshalNumber();
    default:
      throw new Error(
        `Parse error: unknown key type ${type} at position ${offset}`
      );
  }
}

/**
 * Unmarshals an integer from the binary
 */
function unmarshalInteger(): number {
  const type = input![offset - 1];
  let result = 0;

  switch (type) {
    case constants.i8:
      result = (input![offset] << 24) >> 24;
      offset += 1;
      return result;
    case constants.u8:
      result = input![offset];
      offset += 1;
      return result;
    case constants.i16:
      result = decodeNumber.i16(peek(2)) as number;
      offset += 2;
      return result;
    case constants.u16:
      result = decodeNumber.u16(peek(2)) as number;
      offset += 2;
      return result;
    case constants.i32:
      result = decodeNumber.i32(peek(4)) as number;
      offset += 4;
      return result;
    case constants.u32:
      result = decodeSize();
      offset += 4;
      return result;
    default:
      return result;
  }
}

/**
 * Unmarshals a regular js number from the binary
 */
function unmarshalNumber(): number {
  const content = decodeNumber.f64(peek(8)) as number;
  offset += 8;

  return content;
}

/**
 * Unmarshals a bigint from the binary
 */
function unmarshalBigint(): bigint {
  const content = decodeNumber.i64(peek(8)) as bigint;
  offset += 8;

  return content;
}

/**
 * Unmarshals a date from the binary
 */
function unmarshalDate(): Date {
  const content = decodeNumber.u64(peek(8)) as bigint;
  offset += 8;

  return new Date(Number(content));
}

/**
 * Unmarshals an array from the binary
 */
function unmarshalArray<T>(): T[] {
  const length = decodeSize();
  offset += 4;

  if (length === 0) {
    return [];
  }

  const content: T[] = new Array(length);

  for (let i = 0; i < length; i++) {
    content[i] = unmarshalDatum();
  }

  return content;
}

/**
 * Unmarshals a set from the binary
 */
function unmarshalSet<T>(): Set<T> {
  const length = decodeSize();
  offset += 4;

  if (length === 0) {
    return new Set();
  }

  const content: Set<T> = new Set();

  for (let i = 0; i < length; i++) {
    content.add(unmarshalDatum());
  }

  return content;
}

/**
 * Unmarshals a record from the binary
 */
function unmarshalRecord(): Record<string, unknown> {
  // record the start offset for circular reference checking.
  const recordOffset = offset - 1;
  // if any key is a circular reference, this will be set to the key's name
  const circular: Key[] = [];

  const length = decodeSize();
  offset += 4;

  if (length === 0) {
    return {};
  }

  const content: Record<string, unknown> = {};

  for (let i = 0; i < length; i++) {
    const key = unmarshalKey();

    // Circular references or any reference may not be common, the encoded binary has a special flag if any exists.
    if (config.re) {
      const datumType = input![offset];

      if (datumType === constants.ref) {
        offset++;
        const refOffset = decodeSize();
        offset += 4;

        if (recordOffset === refOffset) {
          circular.push(key);
        } else {
          content[key as string] = objects.get(refOffset);
        }

        continue;
      } else {
        content[key as string] = unmarshalDatum();
      }
    } else {
      content[key as string] = unmarshalDatum();
    }
  }

  // if there is a circular reference, set the key's value to the object itself
  for (let i = 0; i < circular.length; i++) {
    content[circular[i] as string] = content;
  }

  objects.set(recordOffset, content);

  return content;
}

/**
 * Unmarshals a map from the binary
 */
function unmarshalMap(): Map<string, unknown> {
  const mapOffset = offset - 1;
  const circular: Key[] = [];

  const length = decodeSize();
  offset += 4;

  if (length === 0) {
    return new Map();
  }

  const content: Map<string, unknown> = new Map();

  for (let i = 0; i < length; i++) {
    const key = unmarshalKey();

    if (config.re) {
      const datumType = input![offset];

      if (datumType === constants.ref) {
        offset++;
        const refOffset = decodeSize();
        offset += 4;

        if (mapOffset === refOffset) {
          circular.push(key);
        } else {
          content.set(key as string, objects.get(refOffset));
        }

        offset += 4;
        continue;
      } else {
        content.set(key as string, unmarshalDatum());
      }
    } else {
      content.set(key as string, unmarshalDatum());
    }
  }

  for (let i = 0; i < circular.length; i++) {
    content.set(circular[i] as string, content);
  }

  objects.set(mapOffset, content);

  return content;
}

/**
 * Unmarshals a class instance from the binary
 */
function unmarshalClass(): Record<string, unknown> {
  const classOffset = offset - 1;
  const circular: Key[] = [];

  const pointer = decodeSize();
  offset += 4;

  const length = decodeSize();
  offset += 4;

  const content: Record<string, unknown> = {};

  for (let i = 0; i < length; i++) {
    const key = unmarshalKey();

    if (config.re) {
      const datumType = input![offset];

      if (datumType === constants.ref) {
        offset++;
        const refOffset = decodeSize();
        offset += 4;

        if (classOffset === refOffset) {
          circular.push(key);
        } else {
          content[key as string] = objects.get(refOffset);
        }

        offset += 4;
      } else {
        content[key as string] = unmarshalDatum();
      }
    } else {
      content[key as string] = unmarshalDatum();
    }
  }

  if (constructors[pointer] === undefined) {
    for (let i = 0; i < circular.length; i++) {
      content[circular[i] as string] = content;
    }

    objects.set(classOffset, content);

    return content;
  }

  const instance = Object.create(constructors[pointer].prototype);
  Object.assign(instance, content);

  for (let i = 0; i < circular.length; i++) {
    instance[circular[i] as string] = instance;
  }

  objects.set(classOffset, instance);

  return instance;
}

/**
 * Unmarshals a reference from the binary. Fetches the referenced object and returns it.
 */
function unmarshalRef(): unknown {
  const ref_offset = decodeSize();
  offset += 4;

  return objects.get(ref_offset);
}

/**
 * Unmarshals an arbitrary datum from the binary
 */
function unmarshalDatum<T>(): T {
  const type = input![offset];
  offset++;

  switch (type) {
    case constants.string:
      return unmarshalString() as T;
    case constants.i8:
    case constants.i16:
    case constants.i32:
    case constants.u8:
    case constants.u16:
    case constants.u32:
      return unmarshalInteger() as T;
    case constants.f64:
      return unmarshalNumber() as T;
    case constants.i64:
      return unmarshalBigint() as T;
    case constants.true:
    case constants.false:
      return (input![offset - 1] === constants.true) as T;
    case constants.null:
      return null as T;
    case constants.undefined:
      return undefined as T;
    case constants.array:
      return unmarshalArray() as T;
    case constants.record:
      return unmarshalRecord() as T;
    case constants.set:
      return unmarshalSet() as T;
    case constants.map:
      return unmarshalMap() as T;
    case constants.date:
      return unmarshalDate() as T;
    case constants.symbol:
      return unmarshalSymbol() as T;
    case constants.class:
      return unmarshalClass() as T;
    case constants.ref:
      return unmarshalRef() as T;
  }

  throw new Error(`Parse error: unknown type ${type} at position ${offset}`);
}

/**
 * Unmarshals the configuration from the binary
 */
function unmarshalConfig(): BinConfig {
  // first 4 bytes has the 32 bit indecies pointer
  offset = 5; // we know it is a string, just parse it.
  const result = unmarshalRecord() as BinConfig;
  return result;
}

/**
 * Decodes a binary value returned from `encode` or `encodeWithClasses` functions.
 * It can also infer the encoded value's type. If the encoded value contains class instances,
 * the `constructors` parameter must be provided, otherwise only the instance's
 * properties will be returned as a plain JavaScript object.
 * @example
 * ```ts
 * import { index, readFromIndex, encode } from "@kasif-apps/marshal"
 *
 * const encoded = encode({ a: 1, b: 2 });
 * const decoded = decode(encoded);
 * console.log(decoded); // { a: 1, b: 2 }
 *
 * const [encodedWithClasses, constructors] = encodeWithClasses(new User());
 * const decodedWithClasses = decode(encodedWithClasses, constructors);
 * console.log(decodedWithClasses); // User { name: "John", age: 30 }
 * ```
 */
export function decode<T>(
  value: Marshalled<T> | Uint8Array,
  classes: Array<new (...args: unknown[]) => any> = []
): T {
  objects.clear();
  input = value as Uint8Array;
  config = unmarshalConfig();
  offset = startOffset;
  constructors = classes;
  const unmarshalled = unmarshalDatum<T>();
  input = undefined;
  config = {} as BinConfig;
  return unmarshalled;
}

/**
 * Reads a value from a binary value returned from `encode` or `encodeWithClasses` functions by its index name. You can provide a property with special index key and a string type and retrieve it back faster. If the encoded value contains class instances, the `constructors` parameter must be provided, otherwise only the instance's properties will be returned as a plain JavaScript object.
 * @example
 * ```ts
 * import { index, readFromIndex, encode } from "@kasif-apps/marshal"
 *
 * const encoded = encode({ a: 1, b: 2, [index]: "index" });
 * const decoded = readFromIndex(encoded, "index");
 * console.log(decoded); // { a: 1, b: 2 }
 * ```
 */
export function readFromIndex<T>(
  value: Marshalled<any>,
  name: string,
  classes: Array<new (...args: unknown[]) => any> = []
): T {
  objects.clear();
  input = value as Uint8Array;
  config = unmarshalConfig();
  constructors = classes;
  // go back to start and decode the 32 bit integer, it has the indecies map offset
  offset = 0;
  // move forward to the indecies map offset, skip type annotation
  offset = decodeSize();
  offset++;
  const indecies = unmarshalMap() as Map<string, number>;
  const index = indecies.get(name)!;

  if (index === undefined) {
    throw new Error(`Index ${name} not found`);
  }
  offset = index;
  const unmarshalled = unmarshalDatum<T>();
  input = undefined;
  config = {} as BinConfig;

  return unmarshalled;
}
