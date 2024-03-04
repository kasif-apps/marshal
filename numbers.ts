/**
 * number module contains number encoding functions that are used internally.
 */

const memo: Record<string, Map<number | bigint, Uint8Array>> = {
  u16: new Map(),
  i16: new Map(),
  u32: new Map(),
  i32: new Map(),
  u64: new Map(),
  i64: new Map(),
  f64: new Map(),
};

export const encodeNumber: Record<
  string,
  (value: number | bigint) => Uint8Array
> = {
  i8: (value: number | bigint) => {
    return new Uint8Array([Number(value)]);
  },
  u8: (value: number | bigint) => {
    return new Uint8Array([Number(value)]);
  },
  i16: (value: number | bigint) => {
    if (!memo.i16.has(value)) {
      const buffer = new ArrayBuffer(2);
      const view = new DataView(buffer);
      view.setInt16(0, Number(value), true);
      const encoded = new Uint8Array(buffer);

      memo.i16.set(value, encoded);

      return encoded;
    }

    return memo.i16.get(value)!;
  },
  u16: (value: number | bigint) => {
    if (!memo.u16.has(value)) {
      const buffer = new ArrayBuffer(2);
      const view = new DataView(buffer);
      view.setUint16(0, Number(value), true);
      const encoded = new Uint8Array(buffer);

      memo.u16.set(value, encoded);

      return encoded;
    }

    return memo.u16.get(value)!;
  },
  i32: (value: number | bigint) => {
    if (!memo.i32.has(value)) {
      const buffer = new ArrayBuffer(4);
      const view = new DataView(buffer);
      view.setInt32(0, Number(value), true);
      const encoded = new Uint8Array(buffer);

      memo.i32.set(value, encoded);

      return encoded;
    }

    return memo.i32.get(value)!;
  },
  u32: (value: number | bigint) => {
    if (!memo.u32.has(value)) {
      const buffer = new ArrayBuffer(4);
      const view = new DataView(buffer);
      view.setUint32(0, Number(value), true);
      const encoded = new Uint8Array(buffer);

      memo.u32.set(value, encoded);

      return encoded;
    }

    return memo.u32.get(value)!;
  },
  i64: (value: number | bigint) => {
    if (!memo.i64.has(value)) {
      const buffer = new ArrayBuffer(8);
      const view = new DataView(buffer);
      view.setBigInt64(0, BigInt(value), true);
      const encoded = new Uint8Array(buffer);

      memo.i64.set(value, encoded);

      return encoded;
    }

    return memo.i64.get(value)!;
  },
  u64: (value: number | bigint) => {
    if (!memo.u64.has(value)) {
      const buffer = new ArrayBuffer(8);
      const view = new DataView(buffer);
      view.setBigUint64(0, value as bigint, true);
      const encoded = new Uint8Array(buffer);

      memo.u64.set(value, encoded);

      return encoded;
    }

    return memo.u64.get(value)!;
  },
  f64: (value: number | bigint) => {
    if (!memo.f64.has(value)) {
      const buffer = new ArrayBuffer(8);
      const view = new DataView(buffer);
      view.setFloat64(0, Number(value), true);
      const encoded = new Uint8Array(buffer);

      memo.f64.set(value, encoded);

      return encoded;
    }

    return memo.f64.get(value)!;
  },
};

export const decodeNumber: Record<
  string,
  (data: Uint8Array) => number | bigint
> = {
  u16: (data: Uint8Array) => {
    const view = new DataView(data.buffer);
    return view.getUint16(0, true);
  },
  i64: (data: Uint8Array) => {
    const view = new DataView(data.buffer);
    return view.getBigInt64(0, true);
  },
  u64: (data: Uint8Array) => {
    const view = new DataView(data.buffer);
    return view.getBigUint64(0, true);
  },
  f64: (data: Uint8Array) => {
    const view = new DataView(data.buffer);
    return view.getFloat64(0, true);
  },
};
