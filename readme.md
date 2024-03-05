# Marshal

[See documentation](https://jsr.io/@kasif-apps/marshal)

## Introduction

Marshal is a lightweight JavaScript library for efficient binary serialization and deserialization
in any environment, allowing you to encode JavaScript objects into binary data and decode binary data back into JavaScript objects. It has zero dependencies and can serialize/deserialize a multitude of data types such as:

- Strings
- Booleans
- Numbers
- Arbitrary arrays
- Arbitrary objects
- RegExp
- Sets
- Maps
- Symbols
- Dates
- null & undefined
- Class instances
- Uint8Array
- Int8Array
- Uint16Array
- Int16Array
- Uint32Array
- Int32Array

It doesn't yet support:

- Float32Array
- Float64Array
- ArrayBuffer
- DataView

It can handle circular and non circular references, meaning any bound objects before serialization will be bound after deserialization as well.

## Installation

Use [jsr](https://jsr.io) to install this package.

### Deno

```
deno add @kasif-apps/marshal
```

### Node/Bun

```
npx jsr add @kasif-apps/marshal
```

### Browser

```html
<script src="https://cdn.jsdelivr.net/gh/kasif-apps/marshal@v0.0.4-alpha/dist/marshal.js"></script>
```

## Usage

Import `Marshal` and encode/decode your data.

```typescript
import Marshal from "@kasif-apps/marshal";

const data = new Set([1, 2, 3, 1]);
const encoded = Marshal.encode(data);
const decoded = Marshal.decode(data);
// Set([1, 2, 3])
```

> Marshal is written in TypeScript so encode and decode functions have type inference. You will see that encode has a type of `Marshalled<Set<number>>` and decoding it will return a `Set<number>` type.

If you are getting your binary data from another runtime, you can just annotate your types as you wish in typescript.

```typescript
import Marshal, { Marshalled } from "@kasif-apps/marshal";

const raw = /* ... */
const data: Marshalled<string> = raw;
const decoded = Marshal.decode(data);
//    ^ typeof string
```

You can encode your custom class instances but of course it comes with a catch. Unless you are decoding this encoded data in the same runtime that encoded it or you can replicate the `class`es, the encoded instance will be returned as a simple JavaScript object. But nontheless, it has some benefits like cloning your data.

Use `encodeWithClasses` function to encode your instances and get a tuple with your data and constructors.

```typescript
import Marshal from "@kasif-apps/marshal";

class User {
  constructor(public username: string, public age: number) {
    console.log("User constructor is called.");
  }

  bio(): string {
    return `${this.name} is ${this.age} years old.`;
  }
}

const data = new User("John", 30);
const [encoded, constructors] = Marshal.encodeWithClasses(data);
const decoded = Marshal.decode(encoded, constructors);
console.log(decoded.bio()); // John is 30 years old.
```

> You will see that `User` constructor is called only once and decoded is an instance of user.

You can create your own clone function.

```typescript
function clone<T>(data: T): T {
  return Marshal.decode(...Marshal.encodeWithClasses(data));
}
```

> This has the advantage of being able to use custom objects over JavaScript's own `structuredClone`.

## Performance

### My Personal Take

Marshal does not have the best performance when it comes to serializing and deserializing data but for its feature set, ergonomics and use cases, I believe it is good enough. I have done my due diligence to improve the performance as much as I can and contributions that could improve the performance are welcome.

Compared to `JSON.stringify`, `Marshal.encode` encodes data 2-4x slower. With small objects with 10-20 keys, encoding take microseconds. At that scale 2-4x slowness seems negligable to me.

Compared to `JSON.parse`, `Marshal.decode` decodes data 3-5x slower. Considering `JSON.parse` already is slower than you might think, marshal library becomes less negligable.

Cloning data at small and large scale is 5-6x slower than both `JSON.parse(JSON.stringify(data))` and `structuredClone(data)`.

So if you need a faster solution that does not require you to include extended JavaScript objects and custom class instances, you should use the builtin `JSON`. If you want to compile your structured data to binary, I can recommend [seqproto](https://github.com/askorama/seqproto) which _can_ be faster that `JSON` but less ergonomic to use.

### Benchmarks

You can run `deno task bench` to create your own `benchmarks.json` file or `deno bench` to see the results in your terminal.

Runtime: Deno/1.41.1 aarch64-apple-darwin
CPU: Apple M2 8 Cores
RAM: 16GB

#### sample.json

> Dataset: [sample.json](https://github.com/kasif-apps/marshal/blob/main/benchmarks/sample.json) (411kb)
> An array of objects with 20 keys, mostly strings, some arrays and objects.

**Encoding the whole file**

| Benchmark        | Average Time | Iterations per second | Min       | Max     | p75     | p99     |
| ---------------- | ------------ | --------------------- | --------- | ------- | ------- | ------- |
| `Marshal.encode` | 2.64 ms      | 378.3                 | 2.24 ms   | 3.34 ms | 3.01 ms | 3.31 ms |
| `JSON.stringify` | 764.69 µs    | 1,307.7               | 657.12 µs | 1.45 ms | 783 µs  | 1.01 ms |

`JSON.stringify` is **3.46x** _faster_ than `Marshal.encode`

**Encoding a single entry**

| Benchmark        | Average Time | Iterations per second | Min     | Max     | p75     | p99     |
| ---------------- | ------------ | --------------------- | ------- | ------- | ------- | ------- |
| `Marshal.encode` | 5.19 µs      | 192,606.4             | 5 µs    | 5.44 µs | 5.31 µs | 5.44 µs |
| `JSON.stringify` | 1.66 µs      | 601,689.1             | 1.64 µs | 1.69 ms | 1.67 µs | 1.69 µs |

`JSON.stringify` is **3.12x** _faster_ than `Marshal.encode`

**Decoding the whole file**

| Benchmark        | Average Time | Iterations per second | Min     | Max      | p75     | p99      |
| ---------------- | ------------ | --------------------- | ------- | -------- | ------- | -------- |
| `Marshal.decode` | 14.27 ms     | 70.1                  | 9.84 ms | 26.12 ms | 16.6 ms | 16.12 ms |
| `JSON.parse`     | 1.17 ms      | 854.6                 | 1.13 ms | 1.58 ms  | 1.39 ms | 1.47 ms  |

`JSON.parse` is **12.2x** _faster_ than `Marshal.decode`

**Cloning a single entry**

| Benchmark         | Average Time | Iterations per second | Min     | Max     | p75      | p99      |
| ----------------- | ------------ | --------------------- | ------- | ------- | -------- | -------- |
| `Marshal`         | 25.91 µs     | 38,589.2              | 9.79 µs | 7.26 ms | 23.67 µs | 69.25 µs |
| `JSON`            | 3.82 µs      | 261,793.5             | 3.75 µs | 3.99 µs | 3.84 µs  | 3.99 µs  |
| `structuredClone` | 4.39 µs      | 228,022.4             | 4.24 µs | 4.46 µs | 4.42 µs  | 4.46 µs  |

`JSON` is **6.78x** _faster_ than `Marshal`
`structuredClone` is **6.47x** _faster_ than `Marshal`

**Cloning the whole data**

| Benchmark         | Average Time | Iterations per second | Min      | Max      | p75      | p99      |
| ----------------- | ------------ | --------------------- | -------- | -------- | -------- | -------- |
| `Marshal`         | 15.5 ms      | 64.5                  | 12.26 ms | 24.44 ms | 18.22 ms | 24.44 ms |
| `JSON`            | 1.86 ms      | 537.5                 | 1.76 ms  | 2.36 ms  | 1.86 ms  | 2.14 ms  |
| `structuredClone` | 1.73 ms      | 578.6                 | 1.64 ms  | 1.95 ms  | 1.74 ms  | 1.92 ms  |

`JSON` is **8.30x** _faster_ than `Marshal`
`structuredClone` is **8.97x** _faster_ than `Marshal`

### Final notes

Your use case with Marshal should **not** be cloning 411kb of data. Marshal is designed to encode runtime values and effectively snapshot their states. At a larger scale, Marshal does suffer from performance but it has a niche usecase where it is more than tolerable.
