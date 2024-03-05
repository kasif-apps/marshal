import Marshal, { index } from "./mod.ts";
import {
  assertEquals,
  assertInstanceOf,
  assertNotEquals,
  assertNotStrictEquals,
} from "https://deno.land/std@0.218.0/assert/mod.ts";
import { startOffset, constants } from "./util.ts";

Deno.test("Test encoder", () => {
  const buffer = new Uint8Array(2 ** 11);

  let data: any = "Hello, World!";
  let encoded = Marshal.encode(data, { useDynamicNumbers: true, buffer });

  // 13 bytes of string content, 1 byte of string type, 4 bytes of string length, 100 bytes of metadata and 5 bytes of index data
  assertEquals(encoded.length, 13 + 1 + 4 + startOffset + 5);
  assertEquals(
    encoded.slice(startOffset, startOffset + 18),
    new Uint8Array([1, 13, 0, 0, 0, ...new TextEncoder().encode(data)])
  );

  data = true;
  encoded = Marshal.encode(data, { useDynamicNumbers: true, buffer });

  // 1 byte of boolean type, 100 bytes of metadata and 5 bytes of index data
  assertEquals(encoded.length, 1 + startOffset + 5);
  assertEquals(
    encoded.slice(startOffset, startOffset + 1),
    new Uint8Array([constants.true])
  );

  data = false;
  encoded = Marshal.encode(data, { useDynamicNumbers: true, buffer });

  // 1 byte of boolean type, 100 bytes of metadata and 5 bytes of index data
  assertEquals(encoded.length, 1 + startOffset + 5);
  assertEquals(
    encoded.slice(startOffset, startOffset + 1),
    new Uint8Array([constants.false])
  );

  data = [];
  encoded = Marshal.encode(data, { useDynamicNumbers: true, buffer });

  // 1 byte of array type, 4 bytes of array length, 100 bytes of metadata and 5 bytes of index data
  assertEquals(encoded.length, 1 + 4 + startOffset + 5);
  assertEquals(
    encoded.slice(startOffset, startOffset + 5),
    new Uint8Array([constants.array, 0, 0, 0, 0])
  );

  data = new Set([1, 2, 3, 1, 256]);
  encoded = Marshal.encode(data, { useDynamicNumbers: true, buffer });

  // 1 byte of set type, 7 bytes of set length, 6 bytes of content, 100 bytes of metadata and 5 bytes of index data
  assertEquals(encoded.length, 1 + 7 + 6 + startOffset + 5);
  assertEquals(
    encoded.slice(startOffset, startOffset + 14),
    new Uint8Array([
      constants.set,
      4,
      0,
      0,
      0,
      constants.u8,
      1,
      constants.u8,
      2,
      constants.u8,
      3,
      constants.u16,
      0,
      1,
    ])
  );

  data = new Map([
    [1, 2],
    [3, 4],
  ]);
  encoded = Marshal.encode(data, { useDynamicNumbers: true, buffer });

  // 1 byte of map type, 4 bytes of map length, 8 bytes of content, 100 bytes of metadata and 5 bytes of index data
  assertEquals(encoded.length, 1 + 4 + 8 + startOffset + 5);
  assertEquals(
    encoded.slice(startOffset, startOffset + 13),
    new Uint8Array([
      constants.map,
      2,
      0,
      0,
      0,
      constants.u8,
      1,
      constants.u8,
      2,
      constants.u8,
      3,
      constants.u8,
      4,
    ])
  );

  data = { key: "", key2: new Date() };
  encoded = Marshal.encode(data, { useDynamicNumbers: true, buffer });

  // 1 byte of record type, 4 bytes of record length, 1 byte of string type, 4 bytes of string length, 3 bytes of string content, 1 byte of string type, 4 bytes of string length, 0 bytes of string content, 1 byte of string type, 4 bytes of string length, 4 bytes of string content, 1 byte of date type 8 bytes of date content, 100 bytes of metadata and 5 bytes of index data
  assertEquals(
    encoded.length,
    1 + 4 + 1 + 4 + 3 + 1 + 4 + 0 + 1 + 4 + 4 + 1 + 8 + 100 + 5
  );

  // Assert that there is no error
  Marshal.encode(1, { useDynamicNumbers: true, buffer });
  Marshal.encode(-1, { useDynamicNumbers: true, buffer });
  Marshal.encode(300, { useDynamicNumbers: true, buffer });
  Marshal.encode(-120, { useDynamicNumbers: true, buffer });
  Marshal.encode(65540, { useDynamicNumbers: true, buffer });
  Marshal.encode(-32760, { useDynamicNumbers: true, buffer });
  Marshal.encode(4294967290, { useDynamicNumbers: true, buffer });
  Marshal.encode(-2147483640, { useDynamicNumbers: true, buffer });

  data = new Map();
  data.set("string-key", 10);
  data.set(10, "string-value");
  data.set("key-2", new Date());
  data.set("key-3", new Set([1, 2, 3, 1, 256]));
  data.set(
    "key-4",
    new Map([
      [1, 2.5],
      [3, 4],
    ])
  );
  data.set("key-5", {
    [Symbol("symbol-key")]: "",
    "key-2": new Date(),
    "😎": "emoji",
    "key-3": {},
    "key-4": [],
    "key-5": new Map(),
    "key-6": new Set(),
  });
  data.set("key-6", [1, 2, 3, 1, 256]);
  encoded = Marshal.encode(data, { useDynamicNumbers: true, buffer });
  Marshal.decode(encoded);
});

class Test {
  public value = "Hello, World!";

  public method() {
    return "Hello, World!";
  }
}

Deno.test("Test clone", () => {
  const instance = new Test();
  const clone = Marshal.decode(...Marshal.encodeWithClasses(instance));

  assertEquals(clone, instance);
  clone.value = "Hello, Mars!";

  assertInstanceOf(clone, Test);
  assertNotEquals(instance, clone);
  assertEquals(instance.value, "Hello, World!");
  assertEquals(clone.value, "Hello, Mars!");
  assertEquals(instance.method(), "Hello, World!");
  assertEquals(clone.method(), "Hello, World!");
});

Deno.test("Test reference", () => {
  let data: any = {
    a: { value: "Hello, World!" },
  };
  data.b = data.a;

  let encoded = Marshal.encode(data);
  let decoded = Marshal.decode(encoded);

  assertEquals(decoded.a, decoded.b);
  decoded.a.value = "Hello, Mars!";
  assertEquals(decoded.a, decoded.b);

  data = { a: { value: "Hello, World!" } };
  data.a.circular = data.a;

  encoded = Marshal.encode(data);
  decoded = Marshal.decode(encoded);

  assertEquals(decoded.a, decoded.a.circular);
  decoded.a.value = "Hello, Mars!";
  assertEquals(decoded.a, decoded.a.circular);

  data.c = new Test();
  data.c.circular = data.c;
  decoded = Marshal.decode(
    ...Marshal.encodeWithClasses(data, { buffer: new Uint8Array(2 ** 10) })
  );

  assertEquals(decoded.c, decoded.c.circular);
});

Deno.test("Test unmdecodearshal", () => {
  const date = new Date();
  const bigint = BigInt(10);

  let data: any = {
    a: { value: "Hello, World!" },
    b: new Test(),
    c: date,
    d: bigint,
  };
  let decoded = Marshal.decode(...Marshal.encodeWithClasses(data));

  assertEquals(decoded.a.value, "Hello, World!");
  assertEquals(decoded.b.value, "Hello, World!");
  assertEquals(decoded.b.method(), "Hello, World!");
  assertEquals(decoded.c.getTime(), date.getTime());
  assertEquals(decoded.d, 10n);

  data = new Test();
  decoded = Marshal.decode(Marshal.encode(data));

  assertEquals(decoded.value, "Hello, World!");
  assertEquals(decoded.method, undefined);

  data = {};
  decoded = Marshal.decode(Marshal.encode(data));

  assertEquals(decoded, {});
  assertNotStrictEquals(decoded, data);
});

Deno.test("Test UTF-8", () => {
  const data = "😎🤔🤯🤩🤓";

  const encoded = Marshal.encode(data);
  const decoded = Marshal.decode(encoded);

  assertEquals(decoded, data);
});

Deno.test("Test index", () => {
  const data = {
    a: { value: "Hello, World!", [index]: "index" },
  };
  const encoded = Marshal.encode(data);
  const a = Marshal.readFromIndex<typeof data.a>(encoded, "index");

  assertEquals(a.value, "Hello, World!");
  assertNotStrictEquals(a, data.a);
});

Deno.test("Test regex", () => {
  const data = new RegExp("[a-z]", "g");
  const encoded = Marshal.encode(data);
  const decoded = Marshal.decode(encoded);

  assertNotEquals(decoded.test, undefined);
  assertEquals(decoded.flags, "g");
  assertEquals(decoded.source, "[a-z]");
  assertEquals(decoded.global, true);
  assertEquals(decoded.test("w"), true);
  assertEquals(decoded.test("L"), false);
});

Deno.test("Test uint8 array", () => {
  let data = new Uint8Array([100, 101]);
  let encoded = Marshal.encode(data);
  let decoded = Marshal.decode(encoded);

  assertInstanceOf(decoded, Uint8Array);
  assertEquals(decoded[0], 100);
  assertEquals(decoded[1], 101);
  assertEquals(decoded.length, 2);

  data = new Uint8Array([]);
  encoded = Marshal.encode(data);
  decoded = Marshal.decode(encoded);

  assertInstanceOf(decoded, Uint8Array);
  assertEquals(decoded.length, 0);

  data = new TextEncoder().encode("Hello, World!");
  encoded = Marshal.encode(data);
  decoded = Marshal.decode(encoded);

  assertEquals(decoded.length, 13);
  assertEquals(new TextDecoder().decode(decoded), "Hello, World!");
});

Deno.test("Test uint16 array", () => {
  let data = new Uint16Array([256, 257]);
  let encoded = Marshal.encode(data);
  let decoded = Marshal.decode(encoded);

  assertInstanceOf(decoded, Uint16Array);
  assertEquals(decoded[0], 256);
  assertEquals(decoded[1], 257);
  assertEquals(decoded.length, 2);

  data = new Uint16Array([]);
  encoded = Marshal.encode(data);
  decoded = Marshal.decode(encoded);

  assertInstanceOf(decoded, Uint16Array);
  assertEquals(decoded.length, 0);
});

Deno.test("Test uint32 array", () => {
  let data = new Uint32Array([65536, 65537, 65538]);
  let encoded = Marshal.encode(data);
  let decoded = Marshal.decode(encoded);

  assertInstanceOf(decoded, Uint32Array);
  assertEquals(decoded[0], 65536);
  assertEquals(decoded[1], 65537);
  assertEquals(decoded[2], 65538);
  assertEquals(decoded.length, 3);

  data = new Uint32Array([]);
  encoded = Marshal.encode(data);
  decoded = Marshal.decode(encoded);

  assertInstanceOf(decoded, Uint32Array);
  assertEquals(decoded.length, 0);
});

Deno.test("Test int8 array", () => {
  let data = new Int8Array([-1, -2]);
  let encoded = Marshal.encode(data);
  let decoded = Marshal.decode(encoded);

  assertInstanceOf(decoded, Int8Array);
  assertEquals(decoded[0], -1);
  assertEquals(decoded[1], -2);
  assertEquals(decoded.length, 2);

  data = new Int8Array([]);
  encoded = Marshal.encode(data);
  decoded = Marshal.decode(encoded);

  assertInstanceOf(decoded, Int8Array);
  assertEquals(decoded.length, 0);
});

Deno.test("Test int16 array", () => {
  let data = new Int16Array([-129, -130]);
  let encoded = Marshal.encode(data);
  let decoded = Marshal.decode(encoded);

  assertInstanceOf(decoded, Int16Array);
  assertEquals(decoded[0], -129);
  assertEquals(decoded[1], -130);
  assertEquals(decoded.length, 2);

  data = new Int16Array([]);
  encoded = Marshal.encode(data);
  decoded = Marshal.decode(encoded);

  assertInstanceOf(decoded, Int16Array);
  assertEquals(decoded.length, 0);
});

Deno.test("Test int32 array", () => {
  let data = new Int32Array([-32769, -32770]);
  let encoded = Marshal.encode(data);
  let decoded = Marshal.decode(encoded);

  assertInstanceOf(decoded, Int32Array);
  assertEquals(decoded[0], -32769);
  assertEquals(decoded[1], -32770);
  assertEquals(decoded.length, 2);

  data = new Int32Array([]);
  encoded = Marshal.encode(data);
  decoded = Marshal.decode(encoded);

  assertInstanceOf(decoded, Int32Array);
  assertEquals(decoded.length, 0);
});

Deno.test("Test typed array reference", () => {
  const a = new Uint8Array([1, 2, 3]);
  const data = { a: a, b: a };

  const encoded = Marshal.encode(data);
  const decoded = Marshal.decode(encoded);

  assertEquals(decoded.a, decoded.b);
  decoded.a[0] = 10;
  assertEquals(decoded.a, decoded.b);
});
