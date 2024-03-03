import Marshal from "./mod.ts";
import data from "./benchmarks/sample.json" with { type: "json" };

Deno.bench("Marshal encoder", { group: "Encoding all" }, () => {
  Marshal.encode(data);
});

Deno.bench("JSON encoder", { group: "Encoding all" }, () => {
  JSON.stringify(data);
});

let i: number;

i = 0;
Deno.bench("Marshal encoder", { group: "Encoding" }, () => {
  Marshal.encode(data[i++ % data.length]);
});

i = 0;
Deno.bench("JSON encoder", { group: "Encoding" }, () => {
  JSON.stringify(data[i++ % data.length]);
});

const m_encoded = Marshal.encode(data);

Deno.bench("Marshal decoder", { group: "Decoding" }, () => {
  Marshal.decode(m_encoded);
});

const j_encoded = JSON.stringify(data);

Deno.bench("JSON decoder", { group: "Decoding" }, () => {
  JSON.parse(j_encoded);
});

i = 0;
Deno.bench("Marshal clone", { group: "Cloning entry" }, () => {
  Marshal.decode(Marshal.encode(data[i++ % data.length]));
});

i = 0;
Deno.bench("JSON clone", { group: "Cloning entry" }, () => {
  JSON.parse(JSON.stringify(data[i++ % data.length]));
});

i = 0;
Deno.bench("Structured clone", { group: "Cloning entry" }, () => {
  structuredClone(data[i++ % data.length]);
});

Deno.bench("Marshal clone", { group: "Cloning all" }, () => {
  Marshal.decode(Marshal.encode(data));
});

Deno.bench("JSON clone", { group: "Cloning all" }, () => {
  JSON.parse(JSON.stringify(data));
});

Deno.bench("Structured clone", { group: "Cloning all" }, () => {
  structuredClone(data);
});

class User {
  id = crypto.randomUUID();
  friends: User[] = [];

  constructor(public name: string, public age: number) {}

  bio(): string {
    return `${this.name} is ${this.age} years old.`;
  }
}

const user = new User("John Doe", 30);

Deno.bench("Encode/Decode instance", () => {
  Marshal.decode(...Marshal.encodeWithClasses(user));
});