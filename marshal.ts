/**
 * marshal module contains functions for encoding values into binary buffers.
 */

import { encodeNumber } from "./numbers.ts";
import {
  BinConfig,
  constants,
  getEntries,
  index,
  startOffset,
} from "./util.ts";

// @ts-ignore ignore ambient context initialization
declare const data_type: unique symbol;

/** Creates a type over a Uint8Array and annotates the encoded type for helping the decoder. */
export type Marshalled<T> = Uint8Array & { readonly [data_type]: T };

const prebuilt = {
  null: constants.encoded.null,
  undefined: constants.encoded.undefined,
  true: constants.encoded.true,
  false: constants.encoded.false,
  object: new Uint8Array([...constants.encoded.record, ...encodeNumber.u32(0)]),
  map: new Uint8Array([...constants.encoded.map, ...encodeNumber.u32(0)]),
  array: new Uint8Array([...constants.encoded.array, ...encodeNumber.u32(0)]),
  set: new Uint8Array([...constants.encoded.set, ...encodeNumber.u32(0)]),
  string: new Uint8Array([...constants.encoded.string, ...encodeNumber.u32(0)]),
} as const;

const textEncoder = new TextEncoder();

// A config data is prepended to the binary for diagnostic and future compatibility purposes
const config: BinConfig = {
  version: "0.0.1",
  bigEndian: false,
  symbolExists: false,
  refExists: false,
};

const indecies = new Map<string, number>();
const memo = new Map<string, Uint8Array>();
// oversized result buffer
let buffer = new Uint8Array(2 ** 24);
let constructors: Array<new (...args: unknown[]) => any> = [];
// This is a map of objects to their offsets in the buffer, helps with circular and other references
let objects = new WeakMap<object, number>();
let offset = startOffset;

function write(data: Uint8Array): number {
  buffer.set(data, offset);
  offset += data.length;
  return data.length;
}

/**
 * Marshals a string into the buffer, returns the number of bytes written.
 * The shape of this data is encoded as follows:
 * 8 bit integer to indicate the type of the data
 * 32 bit integer to indicate the length of the string
 * The string content
 */
function marshalString(value: string): number {
  if (value.length === 0) {
    return write(prebuilt.string);
  }

  const cached = memo.get(value);

  if (cached) {
    return write(cached);
  }

  let n = write(constants.encoded.string);
  const r = textEncoder.encodeInto(value, buffer.subarray(offset + 4));
  const length = encodeNumber.u32(r.written);
  n += write(length);
  offset += r.written;
  n += r.written;

  memo.set(value, buffer.slice(offset - n, offset));

  return n;
}

/**
 * Marshals a number into the buffer, returns the number of bytes written.
 * The shape of this data is encoded as follows:
 * 8 bit integer to indicate the type of the data
 * 8, 16, 32 or 64 bit integer to indicate the value
 */
function marshalNumber(value: number): number {
  if (Number.isInteger(value)) {
    if (value >= 0) {
      if (value <= 255) {
        return write(constants.encoded.u8) + write(encodeNumber.u8(value));
      }
      if (value <= 65535) {
        return write(constants.encoded.u16) + write(encodeNumber.u16(value));
      }
      if (value <= 4294967295) {
        return write(constants.encoded.u32) + write(encodeNumber.u32(value));
      }
      return (
        write(constants.encoded.u64) + write(encodeNumber.u64(BigInt(value)))
      );
    } else {
      if (value >= -128) {
        return write(constants.encoded.i8) + write(encodeNumber.i8(value));
      }
      if (value >= -32768) {
        return write(constants.encoded.i16) + write(encodeNumber.i16(value));
      }
      if (value >= -2147483648) {
        return write(constants.encoded.i32) + write(encodeNumber.i32(value));
      }
      return (
        write(constants.encoded.i64) + write(encodeNumber.i64(BigInt(value)))
      );
    }
  }

  return write(constants.encoded.f64) + write(encodeNumber.f64(value));
}

/**
 * Marshals a bigint into the buffer, returns the number of bytes written.
 * The shape of this data is encoded as follows:
 * 8 bit integer to indicate the type of the data
 * 64 bit integer to indicate the value
 */
function marshalBigint(value: bigint): number {
  return write(constants.encoded.i64) + write(encodeNumber.i64(value));
}

/**
 * Marshals a boolean into the buffer, returns the number of bytes written.
 * The shape of this data is encoded as follows:
 * 8 bit integer to indicate the literal value
 */
function marshalBoolean(value: boolean): number {
  if (value) {
    return write(prebuilt.true);
  }

  return write(prebuilt.false);
}

/**
 * Marshals a date into the buffer, returns the number of bytes written.
 * The shape of this data is encoded as follows:
 * 8 bit integer to indicate the type of the data
 * 64 bit integer to indicate the value
 */
function marshalDate(value: Date): number {
  const content = encodeNumber.u64(BigInt(value.getTime()));

  let n = write(constants.encoded.date);
  n += write(content);

  return n;
}

/**
 * Marshals a symbol into the buffer, returns the number of bytes written.
 * The shape of this data is encoded as follows:
 * 8 bit integer to indicate the type of the data
 * 32 bit integer to indicate the length of the symbol
 * The symbol content
 */
function marshalSymbol(value: symbol): number {
  let n = write(constants.encoded.symbol);
  const r = textEncoder.encodeInto(
    value.description ?? "",
    buffer.subarray(offset + 4),
  );
  const length = encodeNumber.u32(r.written);
  n += write(length);
  offset += r.written;
  n += r.written;

  return n;
}

/**
 * Marshals a reference into the buffer, returns the number of bytes written.
 * The shape of this data is encoded as follows:
 * 8 bit integer to indicate the type of the data
 * 32 bit integer to indicate the offset of the reference
 */
function marshalRef(offset: number): number {
  config.refExists = true;
  return write(constants.encoded.ref) + write(encodeNumber.u32(offset));
}

/**
 * Marshals an array into the buffer, returns the number of bytes written.
 * The shape of this data is encoded as follows:
 * 8 bit integer to indicate the type of the data
 * 32 bit integer to indicate the length of the array
 * The content of the array
 */
function marshalArray<T>(value: T[]): number {
  if (value.length === 0) {
    return write(prebuilt.array);
  }

  // If the array is already in the buffer, write a reference to it
  const foundOffset = objects.get(value);
  if (foundOffset !== undefined) {
    return marshalRef(foundOffset);
  }

  objects.set(value, offset);

  let n = write(constants.encoded.array);
  n += write(encodeNumber.u32(value.length));

  for (let i = 0; i < value.length; i++) {
    n += marshalDatum(value[i]);
  }

  return n;
}

/**
 * Marshals a set into the buffer, returns the number of bytes written.
 * The shape of this data is encoded as follows:
 * 8 bit integer to indicate the type of the data
 * 32 bit integer to indicate the length of the set
 * The content of the set
 */
function marshalSet<T>(value: Set<T>): number {
  if (value.size === 0) {
    return write(prebuilt.set);
  }

  // If the set is already in the buffer, write a reference to it
  const foundOffset = objects.get(value);
  if (foundOffset !== undefined) {
    return marshalRef(foundOffset);
  }

  objects.set(value, offset);

  let n = write(constants.encoded.set);
  n += write(encodeNumber.u32(value.size));

  for (const entry of value) {
    n += marshalDatum(entry);
  }

  return n;
}

/**
 * Marshals a record into the buffer, returns the number of bytes written.
 * The shape of this data is encoded as follows:
 * 8 bit integer to indicate the type of the data
 * 32 bit integer to indicate the length of the record
 * The content of the record (sequence of key-value pairs,
 * keys as symbols or strings and values as any other data type)
 */
function marshalRecord(value: Record<string, unknown>): number {
  const entries = getEntries(value);
  const recordOffset = offset;

  if (entries.length === 0) {
    return write(prebuilt.object);
  }

  // If the record is already in the buffer, write a reference to it
  const foundOffset = objects.get(value);
  if (foundOffset !== undefined) {
    return marshalRef(foundOffset);
  }

  objects.set(value, recordOffset);

  let n = write(constants.encoded.record);
  n += write(encodeNumber.u32(entries.length));

  let indexed: string | null = null;

  for (let i = 0; i < entries.length; i++) {
    const key = entries[i][0];

    if (typeof key === "string") {
      n += marshalString(key);
    } else {
      config.symbolExists = true;
      if (key === index && typeof entries[i][1]) {
        indexed = entries[i][1] as string;
      }

      n += marshalSymbol(key);
    }

    n += marshalDatum(entries[i][1]);
  }

  if (indexed) {
    indecies.set(indexed, recordOffset);
  }

  return n;
}

/**
 * Marshals a map into the buffer, returns the number of bytes written.
 * The shape of this data is encoded as follows:
 * 8 bit integer to indicate the type of the data
 * 32 bit integer to indicate the length of the map
 * The content of the map (sequence of key-value pairs,
 * keys as symbols or strings and values as any other data type)
 */
function marshalMap(value: Map<string, unknown>): number {
  const entries = Array.from(value.entries());

  if (entries.length === 0) {
    return write(prebuilt.map);
  }

  // If the map is already in the buffer, write a reference to it
  const foundOffset = objects.get(value);
  if (foundOffset !== undefined) {
    return marshalRef(foundOffset);
  }

  objects.set(value, offset);

  let n = write(constants.encoded.map);
  n += write(encodeNumber.u32(entries.length));

  for (let i = 0; i < entries.length; i++) {
    const key = entries[i][0];

    if (typeof key === "string") {
      n += marshalString(key);
    } else {
      config.symbolExists = true;
      n += marshalSymbol(key);
    }

    n += marshalDatum(entries[i][1]);
  }

  return n;
}

/**
 * Marshals a class instance into the buffer, returns the number of bytes written.
 * The shape of this data is encoded as follows:
 * 8 bit integer to indicate the type of the data
 * 32 bit integer to indicate the pointer to the constructor
 * 32 bit integer to indicate the length of the record
 * The content of the record (sequence of key-value pairs,
 * keys as symbols or strings and values as any other data type)
 */
function marshalClass(value: Record<string, unknown>): number {
  const entries = getEntries(value);

  // If the class instance is already in the buffer, write a reference to it
  const foundOffset = objects.get(value);
  if (foundOffset !== undefined) {
    return marshalRef(foundOffset);
  }

  const pointer = constructors.length;
  constructors.push(value.constructor as new (...args: unknown[]) => any);
  objects.set(value, offset);

  let n = write(constants.encoded.class);
  n += write(encodeNumber.u32(pointer));
  n += write(encodeNumber.u32(entries.length));

  for (let i = 0; i < entries.length; i++) {
    const key = entries[i][0];

    if (typeof key === "string") {
      n += marshalString(key);
    } else {
      config.symbolExists = true;
      n += marshalSymbol(key);
    }

    n += marshalDatum(entries[i][1]);
  }

  return n;
}

/**
 * Marshals a value of any type into the buffer, returns the number of bytes written.
 */
function marshalDatum<T>(value: T): number {
  if (value === undefined) {
    return write(prebuilt.undefined);
  }

  if (value === null) {
    return write(prebuilt.null);
  }

  switch (typeof value) {
    case "string":
      return marshalString(value);
    case "number":
      return marshalNumber(value);
    case "bigint":
      return marshalBigint(value);
    case "boolean":
      return marshalBoolean(value);
    case "symbol":
      return marshalSymbol(value);
    case "object":
      if (Array.isArray(value)) {
        return marshalArray(value);
      }

      switch (value.constructor) {
        case Function:
          return 0;
        case Map:
          return marshalMap(value as unknown as Map<string, unknown>);
        case Set:
          return marshalSet(value as unknown as Set<unknown>);
        case Date:
          return marshalDate(value as unknown as Date);
        case Object:
          return marshalRecord(value as Record<string, unknown>);
        case Uint8Array:
          console.warn("Uint8Array is not supported yet");
          return 0;
        case Uint16Array:
          console.warn("Uint16Array is not supported yet");
          return 0;
        case Uint32Array:
          console.warn("Uint32Array is not supported yet");
          return 0;
        default:
          return marshalClass(value as Record<string, unknown>);
      }
    default:
      throw new Error(`Cannot marshal value: '${typeof value}'`);
  }
}

/**
 * Marshals the config data into the buffer, returns the number of bytes written.
 * Always writes the config data at the start of the buffer.
 */
function marshalConfig(config: BinConfig): number {
  const oldOffset = offset;
  // There will be a 32 bit integer at the start of the buffer to indicate the starting offset of the indecies
  offset = 4;
  let n = marshalString(config.version);
  n += marshalBoolean(config.bigEndian);
  n += marshalBoolean(config.symbolExists);
  n += marshalBoolean(config.refExists);
  offset = oldOffset;

  return n;
}

function marshalIndecies(): number {
  // Encode the indecies start point to the beginning of the buffer.
  const oldOffset = offset;
  offset = 0;
  write(encodeNumber.u32(oldOffset));
  offset = oldOffset;

  return marshalMap(indecies);
}

export type EncodeOptions = {
  bufferSize: number;
};

/**
 * Encodes a value of any type into a binary buffer, returns the buffer. You can encode anything that can be JSON.stringify'd and additionaly symbols, classes, maps, sets, dates, typed arrays and circular references.
 * @example
 * ```ts
 * const encoded = Marshal.encode(data);
 * ```
 */
export function encode<T>(value: T, options?: EncodeOptions): Marshalled<T> {
  offset = startOffset;
  config.bigEndian = false;
  config.refExists = false;
  config.symbolExists = false;
  objects = new WeakMap();

  if (options?.bufferSize) {
    buffer = new Uint8Array(options.bufferSize);
  }

  marshalDatum(value);
  marshalIndecies();
  marshalConfig(config);

  return buffer.slice(0, offset) as Marshalled<T>;
}

/**
 * Encodes a value of any type into a binary buffer and returns the buffer and an array of constructors used in the encoding. You can pass the constructors array to the decoder to get your classes as instances of these constructors. You can encode anything that can be JSON.stringify'd and additionaly symbols, classes, maps, sets, dates, typed arrays and circular references.
 * @example
 * ```ts
 * const [encoded, constructors] = Marshal.encodeWithClasses(data);
 * ```
 */
export function encodeWithClasses<T>(
  value: T,
  options?: EncodeOptions,
): [Marshalled<T>, Array<new (...args: unknown[]) => any>] {
  offset = startOffset;
  config.bigEndian = false;
  config.refExists = false;
  config.symbolExists = false;
  constructors = [];
  indecies.clear();
  objects = new WeakMap();

  if (options?.bufferSize) {
    buffer = new Uint8Array(options.bufferSize);
  }

  marshalDatum(value);
  marshalIndecies();
  marshalConfig(config);

  return [buffer.slice(0, offset) as Marshalled<T>, constructors];
}
