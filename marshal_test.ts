import Marshal from "./mod.ts";
import {
  assertEquals,
  assertInstanceOf,
  assertNotEquals,
} from "https://deno.land/std@0.218.0/assert/mod.ts";

Deno.test("Marshal encoder", () => {
  let data: any = "Hello, World!";
  let encoded = Marshal.encode(data);

  // 13 bytes of string content, 1 byte of string type, 4 bytes of string length, 50 bytes of metadata and 5 bytes of index data
  assertEquals(encoded.length, 13 + 1 + 4 + 50 + 5);
  assertEquals(
    encoded.slice(50, 68),
    new Uint8Array([1, 13, 0, 0, 0, ...new TextEncoder().encode(data)])
  );

  data = true;
  encoded = Marshal.encode(data);

  // 1 byte of boolean type, 50 bytes of metadata and 5 bytes of index data
  assertEquals(encoded.length, 1 + 50 + 5);
  assertEquals(encoded.slice(50, 51), new Uint8Array([12]));

  data = false;
  encoded = Marshal.encode(data);

  // 1 byte of boolean type, 50 bytes of metadata and 5 bytes of index data
  assertEquals(encoded.length, 1 + 50 + 5);
  assertEquals(encoded.slice(50, 51), new Uint8Array([13]));

  data = [];
  encoded = Marshal.encode(data);

  // 1 byte of array type, 4 bytes of array length, 50 bytes of metadata and 5 bytes of index data
  assertEquals(encoded.length, 1 + 4 + 50 + 5);
  assertEquals(encoded.slice(50, 55), new Uint8Array([16, 0, 0, 0, 0]));

  data = new Set([1, 2, 3, 1]);
  encoded = Marshal.encode(data);

  // 1 byte of set type, 4 bytes of set length, 6 bytes of content, 50 bytes of metadata and 5 bytes of index data
  assertEquals(encoded.length, 1 + 4 + 6 + 50 + 5);
  assertEquals(
    encoded.slice(50, 61),
    new Uint8Array([18, 3, 0, 0, 0, 2, 1, 2, 2, 2, 3])
  );

  data = new Map([
    [1, 2],
    [3, 4],
  ]);
  encoded = Marshal.encode(data);

  // 1 byte of map type, 4 bytes of map length, 8 bytes of content, 50 bytes of metadata and 5 bytes of index data
  assertEquals(encoded.length, 1 + 4 + 8 + 50 + 5);
  assertEquals(
    encoded.slice(50, 63),
    new Uint8Array([19, 2, 0, 0, 0, 2, 1, 2, 2, 2, 3, 2, 4])
  );
});

Deno.test("Marshal clone", () => {
  class Test {
    public value = "Hello, World!";

    public method() {
      return "Hello, World!";
    }
  }

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
});
