import Marshal from "../mod.ts";
import {
  assertEquals,
  assertInstanceOf,
  assertNotEquals,
} from "https://deno.land/std@0.218.0/assert/mod.ts";

Deno.test("Marshal encoder", () => {
  const data = "Hello, World!";

  const encoded = Marshal.encode(data);

  // 13 bytes of string content, 1 byte of string type, 4 bytes of string length, 50 bytes of metadata and 5 bytes of index data
  assertEquals(encoded.length, 13 + 1 + 4 + 50 + 5);
  assertEquals(
    encoded.slice(50, 68),
    new Uint8Array([1, 13, 0, 0, 0, ...new TextEncoder().encode(data)]),
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
