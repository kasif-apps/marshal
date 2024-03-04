import Marshal from "./mod.ts";
import {
  assertEquals,
  assertInstanceOf,
  assertNotEquals,
} from "https://deno.land/std@0.218.0/assert/mod.ts";
import { startOffset } from "./util.ts";

Deno.test("Marshal encoder", () => {
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
    new Uint8Array([12])
  );

  data = false;
  encoded = Marshal.encode(data, { useDynamicNumbers: true, buffer });

  // 1 byte of boolean type, 100 bytes of metadata and 5 bytes of index data
  assertEquals(encoded.length, 1 + startOffset + 5);
  assertEquals(
    encoded.slice(startOffset, startOffset + 1),
    new Uint8Array([13])
  );

  data = [];
  encoded = Marshal.encode(data, { useDynamicNumbers: true, buffer });

  // 1 byte of array type, 4 bytes of array length, 100 bytes of metadata and 5 bytes of index data
  assertEquals(encoded.length, 1 + 4 + startOffset + 5);
  assertEquals(
    encoded.slice(startOffset, startOffset + 5),
    new Uint8Array([16, 0, 0, 0, 0])
  );

  data = new Set([1, 2, 3, 1, 256]);
  encoded = Marshal.encode(data, { useDynamicNumbers: true, buffer });

  // 1 byte of set type, 7 bytes of set length, 6 bytes of content, 100 bytes of metadata and 5 bytes of index data
  assertEquals(encoded.length, 1 + 7 + 6 + startOffset + 5);
  assertEquals(
    encoded.slice(startOffset, startOffset + 14),
    new Uint8Array([18, 4, 0, 0, 0, 2, 1, 2, 2, 2, 3, 3, 0, 1])
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
    new Uint8Array([19, 2, 0, 0, 0, 2, 1, 2, 2, 2, 3, 2, 4])
  );

  data = { key: "", key2: new Date() };
  encoded = Marshal.encode(data, { useDynamicNumbers: true, buffer });

  // 1 byte of record type, 4 bytes of record length, 1 byte of string type, 4 bytes of string length, 3 bytes of string content, 1 byte of string type, 4 bytes of string length, 0 bytes of string content, 1 byte of string type, 4 bytes of string length, 4 bytes of string content, 1 byte of date type 8 bytes of date content, 100 bytes of metadata and 5 bytes of index data
  assertEquals(
    encoded.length,
    1 + 4 + 1 + 4 + 3 + 1 + 4 + 0 + 1 + 4 + 4 + 1 + 8 + 100 + 5
  );

  // Assert that there is no error
  Marshal.encode(1, { useDynamicNumbers: false, buffer });
  Marshal.encode(-1, { useDynamicNumbers: false, buffer });
  Marshal.encode(300, { useDynamicNumbers: false, buffer });
  Marshal.encode(-120, { useDynamicNumbers: false, buffer });
  Marshal.encode(65540, { useDynamicNumbers: false, buffer });
  Marshal.encode(-32760, { useDynamicNumbers: false, buffer });
  Marshal.encode(4294967300, { useDynamicNumbers: false, buffer });
  Marshal.encode(-2147483640, { useDynamicNumbers: false, buffer });

  data = new Map();
  data.set("string-key", 10);
  data.set(10, "string-value");
  data.set("key-2", new Date());
  data.set("key-3", new Set([1, 2, 3, 1, 256]));
  data.set(
    "key-4",
    new Map([
      [1, 2],
      [3, 4],
    ])
  );
  data.set("key-5", {
    [Symbol("symbol-key")]: "",
    "key-2": new Date(),
    "😎": "emoji",
  });
  data.set("key-6", [1, 2, 3, 1, 256]);
  encoded = Marshal.encode(data, { useDynamicNumbers: true, buffer });
});

class Test {
  public value = "Hello, World!";

  public method() {
    return "Hello, World!";
  }
}

Deno.test("Marshal clone", () => {
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
