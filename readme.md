# Marshal

## Introduction

Marshal is a lightweight JavaScript library for efficient binary serialization and deserialization
in any environment, allowing you to encode JavaScript objects into binary data and decode binary data back into JavaScript objects. It has zero dependencies and can serialize/deserialize a multitude of data types such as:

- Strings
- Booleans
- Numbers
- Arbitrary arrays
- Arbitrary JavaScript objects
- Sets
- Maps
- Symbols
- Dates
- null & undefined
- Class instances

It doesn't yet support:

- Javascript Uint8Array
- Javascript Uint16Array
- Javascript Uint32Array

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
<script src=""></script>
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