// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

const memo = {
    u16: new Map(),
    i16: new Map(),
    u32: new Map(),
    i32: new Map(),
    u64: new Map(),
    i64: new Map(),
    f64: new Map()
};
const encodeNumber = {
    u8: (value)=>{
        return new Uint8Array([
            Number(value)
        ]);
    },
    i16: (value)=>{
        if (!memo.i16.has(value)) {
            const buffer = new ArrayBuffer(2);
            const view = new DataView(buffer);
            view.setInt16(0, Number(value), true);
            const encoded = new Uint8Array(buffer);
            memo.i16.set(value, encoded);
            return encoded;
        }
        return memo.i16.get(value);
    },
    u16: (value)=>{
        if (!memo.u16.has(value)) {
            const buffer = new ArrayBuffer(2);
            const view = new DataView(buffer);
            view.setUint16(0, Number(value), true);
            const encoded = new Uint8Array(buffer);
            memo.u16.set(value, encoded);
            return encoded;
        }
        return memo.u16.get(value);
    },
    i32: (value)=>{
        if (!memo.i32.has(value)) {
            const buffer = new ArrayBuffer(4);
            const view = new DataView(buffer);
            view.setInt32(0, Number(value), true);
            const encoded = new Uint8Array(buffer);
            memo.i32.set(value, encoded);
            return encoded;
        }
        return memo.i32.get(value);
    },
    u32: (value)=>{
        if (!memo.u32.has(value)) {
            const buffer = new ArrayBuffer(4);
            const view = new DataView(buffer);
            view.setUint32(0, Number(value), true);
            const encoded = new Uint8Array(buffer);
            memo.u32.set(value, encoded);
            return encoded;
        }
        return memo.u32.get(value);
    },
    i64: (value)=>{
        if (!memo.i64.has(value)) {
            const buffer = new ArrayBuffer(8);
            const view = new DataView(buffer);
            view.setBigInt64(0, BigInt(value), true);
            const encoded = new Uint8Array(buffer);
            memo.i64.set(value, encoded);
            return encoded;
        }
        return memo.i64.get(value);
    },
    u64: (value)=>{
        if (!memo.u64.has(value)) {
            const buffer = new ArrayBuffer(8);
            const view = new DataView(buffer);
            view.setBigUint64(0, BigInt(value), true);
            const encoded = new Uint8Array(buffer);
            memo.u64.set(value, encoded);
            return encoded;
        }
        return memo.u64.get(value);
    },
    f64: (value)=>{
        if (!memo.f64.has(value)) {
            const buffer = new ArrayBuffer(8);
            const view = new DataView(buffer);
            view.setFloat64(0, Number(value), true);
            const encoded = new Uint8Array(buffer);
            memo.f64.set(value, encoded);
            return encoded;
        }
        return memo.f64.get(value);
    }
};
const decodeNumber = {
    u8: (buffer)=>{
        return buffer[0];
    },
    i16: (buffer)=>{
        const view = new DataView(buffer.buffer);
        return view.getInt16(0, true);
    },
    u16: (buffer)=>{
        const view = new DataView(buffer.buffer);
        return view.getUint16(0, true);
    },
    i32: (buffer)=>{
        const view = new DataView(buffer.buffer);
        return view.getInt32(0, true);
    },
    u32: (buffer)=>{
        const view = new DataView(buffer.buffer);
        return view.getUint32(0, true);
    },
    i64: (buffer)=>{
        const view = new DataView(buffer.buffer);
        return view.getBigInt64(0, true);
    },
    u64: (buffer)=>{
        const view = new DataView(buffer.buffer);
        return view.getBigUint64(0, true);
    },
    f64: (buffer)=>{
        const view = new DataView(buffer.buffer);
        return view.getFloat64(0, true);
    }
};
const constants = {
    string: 1,
    u8: 2,
    u16: 3,
    u32: 4,
    u64: 5,
    i8: 6,
    i16: 7,
    i32: 8,
    i64: 9,
    f32: 10,
    f64: 11,
    true: 12,
    false: 13,
    null: 14,
    undefined: 15,
    array: 16,
    record: 17,
    set: 18,
    map: 19,
    date: 20,
    u8array: 21,
    u16Array: 22,
    u32Array: 23,
    i8array: 24,
    i16Array: 25,
    i32Array: 26,
    symbol: 27,
    class: 28,
    ref: 29,
    index: 30,
    terminator: 0,
    encoded: {
        string: encodeNumber.u8(1),
        u8: encodeNumber.u8(2),
        u16: encodeNumber.u8(3),
        u32: encodeNumber.u8(4),
        u64: encodeNumber.u8(5),
        i8: encodeNumber.u8(6),
        i16: encodeNumber.u8(7),
        i32: encodeNumber.u8(8),
        i64: encodeNumber.u8(9),
        f32: encodeNumber.u8(10),
        f64: encodeNumber.u8(11),
        true: encodeNumber.u8(12),
        false: encodeNumber.u8(13),
        null: encodeNumber.u8(14),
        undefined: encodeNumber.u8(15),
        array: encodeNumber.u8(16),
        record: encodeNumber.u8(17),
        set: encodeNumber.u8(18),
        map: encodeNumber.u8(19),
        date: encodeNumber.u8(20),
        u8array: encodeNumber.u8(21),
        u16Array: encodeNumber.u8(22),
        u32Array: encodeNumber.u8(23),
        i8array: encodeNumber.u8(24),
        i16Array: encodeNumber.u8(25),
        i32Array: encodeNumber.u8(26),
        symbol: encodeNumber.u8(27),
        class: encodeNumber.u8(28),
        ref: encodeNumber.u8(29),
        index: encodeNumber.u8(30),
        terminator: encodeNumber.u8(0)
    }
};
function getEntries(object) {
    const result = [];
    const enumarables = Object.getOwnPropertyNames(object);
    const symbols = Object.getOwnPropertySymbols(object);
    const length = Math.max(enumarables.length, symbols.length);
    for(let i = 0; i < length; i++){
        const enumarable = enumarables[i];
        if (enumarable) {
            result.push([
                enumarable,
                object[enumarable]
            ]);
        }
        if (symbols.length < i) {
            continue;
        }
        const symbol = symbols[i];
        if (symbol) {
            result.push([
                symbol,
                object[symbol]
            ]);
        }
    }
    return result;
}
const startOffset = 50;
const index = Symbol("Marshal.index");
const prebuilt = {
    null: constants.encoded.null,
    undefined: constants.encoded.undefined,
    true: constants.encoded.true,
    false: constants.encoded.false,
    object: new Uint8Array([
        ...constants.encoded.record,
        ...encodeNumber.u32(0)
    ]),
    map: new Uint8Array([
        ...constants.encoded.map,
        ...encodeNumber.u32(0)
    ]),
    array: new Uint8Array([
        ...constants.encoded.array,
        ...encodeNumber.u32(0)
    ]),
    set: new Uint8Array([
        ...constants.encoded.set,
        ...encodeNumber.u32(0)
    ]),
    string: new Uint8Array([
        ...constants.encoded.string,
        ...encodeNumber.u32(0)
    ])
};
const textEncoder = new TextEncoder();
const config = {
    version: "0.0.1",
    bigEndian: false,
    symbolExists: false,
    refExists: false
};
const indecies = new Map();
const memo1 = new Map();
let buffer = new Uint8Array(2 ** 24);
let constructors = [];
let objects = new WeakMap();
let offset = 50;
function write(data) {
    buffer.set(data, offset);
    offset += data.length;
    return data.length;
}
function marshalString(value) {
    if (value.length === 0) {
        return write(prebuilt.string);
    }
    const cached = memo1.get(value);
    if (cached) {
        return write(cached);
    }
    let n = write(constants.encoded.string);
    const r = textEncoder.encodeInto(value, buffer.subarray(offset + 4));
    const length = encodeNumber.u32(r.written);
    n += write(length);
    offset += r.written;
    n += r.written;
    memo1.set(value, buffer.slice(offset - n, offset));
    return n;
}
function marshalNumber(value) {
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
            return write(constants.encoded.u64) + write(encodeNumber.u64(BigInt(value)));
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
            return write(constants.encoded.i64) + write(encodeNumber.i64(BigInt(value)));
        }
    }
    return write(constants.encoded.f64) + write(encodeNumber.f64(value));
}
function marshalBigint(value) {
    return write(constants.encoded.i64) + write(encodeNumber.i64(value));
}
function marshalBoolean(value) {
    if (value) {
        return write(prebuilt.true);
    }
    return write(prebuilt.false);
}
function marshalDate(value) {
    const content = encodeNumber.u64(BigInt(value.getTime()));
    let n = write(constants.encoded.date);
    n += write(content);
    return n;
}
function marshalSymbol(value) {
    let n = write(constants.encoded.symbol);
    const r = textEncoder.encodeInto(value.description ?? "", buffer.subarray(offset + 4));
    const length = encodeNumber.u32(r.written);
    n += write(length);
    offset += r.written;
    n += r.written;
    return n;
}
function marshalRef(offset) {
    config.refExists = true;
    return write(constants.encoded.ref) + write(encodeNumber.u32(offset));
}
function marshalArray(value) {
    if (value.length === 0) {
        return write(prebuilt.array);
    }
    const foundOffset = objects.get(value);
    if (foundOffset !== undefined) {
        return marshalRef(foundOffset);
    }
    objects.set(value, offset);
    let n = write(constants.encoded.array);
    n += write(encodeNumber.u32(value.length));
    for(let i = 0; i < value.length; i++){
        n += marshalDatum(value[i]);
    }
    return n;
}
function marshalSet(value) {
    if (value.size === 0) {
        return write(prebuilt.set);
    }
    const foundOffset = objects.get(value);
    if (foundOffset !== undefined) {
        return marshalRef(foundOffset);
    }
    objects.set(value, offset);
    let n = write(constants.encoded.set);
    n += write(encodeNumber.u32(value.size));
    for (const entry of value){
        n += marshalDatum(entry);
    }
    return n;
}
function marshalRecord(value) {
    const entries = getEntries(value);
    const recordOffset = offset;
    if (entries.length === 0) {
        return write(prebuilt.object);
    }
    const foundOffset = objects.get(value);
    if (foundOffset !== undefined) {
        return marshalRef(foundOffset);
    }
    objects.set(value, recordOffset);
    let n = write(constants.encoded.record);
    n += write(encodeNumber.u32(entries.length));
    let indexed = null;
    for(let i = 0; i < entries.length; i++){
        const key = entries[i][0];
        if (typeof key === "string") {
            n += marshalString(key);
        } else {
            config.symbolExists = true;
            if (key === index && typeof entries[i][1]) {
                indexed = entries[i][1];
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
function marshalMap(value) {
    const entries = Array.from(value.entries());
    if (entries.length === 0) {
        return write(prebuilt.map);
    }
    const foundOffset = objects.get(value);
    if (foundOffset !== undefined) {
        return marshalRef(foundOffset);
    }
    objects.set(value, offset);
    let n = write(constants.encoded.map);
    n += write(encodeNumber.u32(entries.length));
    for(let i = 0; i < entries.length; i++){
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
function marshalClass(value) {
    const entries = getEntries(value);
    const foundOffset = objects.get(value);
    if (foundOffset !== undefined) {
        return marshalRef(foundOffset);
    }
    const pointer = constructors.length;
    constructors.push(value.constructor);
    objects.set(value, offset);
    let n = write(constants.encoded.class);
    n += write(encodeNumber.u32(pointer));
    n += write(encodeNumber.u32(entries.length));
    for(let i = 0; i < entries.length; i++){
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
function marshalDatum(value) {
    if (value === undefined) {
        return write(prebuilt.undefined);
    }
    if (value === null) {
        return write(prebuilt.null);
    }
    switch(typeof value){
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
            switch(value.constructor){
                case Function:
                    return 0;
                case Map:
                    return marshalMap(value);
                case Set:
                    return marshalSet(value);
                case Date:
                    return marshalDate(value);
                case Object:
                    return marshalRecord(value);
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
                    return marshalClass(value);
            }
        default:
            throw new Error(`Cannot marshal value: '${typeof value}'`);
    }
}
function marshalConfig(config) {
    const oldOffset = offset;
    offset = 4;
    let n = marshalString(config.version);
    n += marshalBoolean(config.bigEndian);
    n += marshalBoolean(config.symbolExists);
    n += marshalBoolean(config.refExists);
    offset = oldOffset;
    return n;
}
function marshalIndecies() {
    const oldOffset = offset;
    offset = 0;
    write(encodeNumber.u32(oldOffset));
    offset = oldOffset;
    return marshalMap(indecies);
}
function encode(value, options) {
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
    return buffer.slice(0, offset);
}
function encodeWithClasses(value, options) {
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
    return [
        buffer.slice(0, offset),
        constructors
    ];
}
const objects1 = new Map();
let offset1 = 50;
let input;
let config1;
let constructors1 = [];
const textDecoder = new TextDecoder();
function peek(n, off = 0) {
    return input.slice(offset1 + off, offset1 + off + n);
}
function decodeSize(off = 0) {
    return input[0 + offset1 + off] | input[1 + offset1 + off] << 8 | input[2 + offset1 + off] << 16 | input[3 + offset1 + off] << 24;
}
function unmarshalString() {
    const length = decodeSize();
    offset1 += 4;
    if (length === 0) {
        return "";
    }
    const content = peek(length);
    offset1 += length;
    const result = textDecoder.decode(content);
    return result;
}
function unmarshalSymbol() {
    const length = decodeSize();
    offset1 += 4;
    const content = peek(length);
    offset1 += length;
    return Symbol(textDecoder.decode(content));
}
function unmarshalKey() {
    offset1++;
    if (!config1.symbolExists) {
        return unmarshalString();
    }
    const type = input[offset1 - 1];
    return type === constants.string ? unmarshalString() : unmarshalSymbol();
}
function unmarshalInteger() {
    const type = input[offset1 - 1];
    let result = 0;
    switch(type){
        case constants.i8:
            result = input[offset1] << 24 >> 24;
            offset1 += 1;
            return result;
        case constants.u8:
            result = input[offset1];
            offset1 += 1;
            return result;
        case constants.i16:
            result = decodeNumber.i16(peek(2));
            offset1 += 2;
            return result;
        case constants.u16:
            result = decodeNumber.u16(peek(2));
            offset1 += 2;
            return result;
        case constants.i32:
            result = decodeNumber.i32(peek(4));
            offset1 += 4;
            return result;
        case constants.u32:
            result = decodeSize();
            offset1 += 4;
            return result;
        default:
            return result;
    }
}
function unmarshalNumber() {
    const content = decodeNumber.f64(peek(8));
    offset1 += 8;
    return content;
}
function unmarshalBigint() {
    const content = decodeNumber.i64(peek(8));
    offset1 += 8;
    return content;
}
function unmarshalDate() {
    const content = decodeNumber.u64(peek(8));
    offset1 += 8;
    return new Date(Number(content));
}
function unmarshalArray() {
    const length = decodeSize();
    offset1 += 4;
    if (length === 0) {
        return [];
    }
    const content = new Array(length);
    for(let i = 0; i < length; i++){
        content[i] = unmarshalDatum();
    }
    return content;
}
function unmarshalSet() {
    const length = decodeSize();
    offset1 += 4;
    if (length === 0) {
        return new Set();
    }
    const content = new Set();
    for(let i = 0; i < length; i++){
        content.add(unmarshalDatum());
    }
    return content;
}
function unmarshalRecord() {
    const startOffset = offset1 - 1;
    const circular = [];
    const length = decodeSize();
    offset1 += 4;
    if (length === 0) {
        return {};
    }
    const content = {};
    for(let i = 0; i < length; i++){
        const key = unmarshalKey();
        if (config1.refExists) {
            const datumType = input[offset1];
            if (datumType === constants.ref) {
                offset1++;
                const refOffset = decodeSize();
                offset1 += 4;
                if (startOffset === refOffset) {
                    circular.push(key);
                } else {
                    content[key] = objects1.get(refOffset);
                }
                continue;
            } else {
                content[key] = unmarshalDatum();
            }
        } else {
            content[key] = unmarshalDatum();
        }
    }
    for(let i = 0; i < circular.length; i++){
        content[circular[i]] = content;
    }
    objects1.set(startOffset, content);
    return content;
}
function unmarshalMap() {
    const startOffset = offset1 - 1;
    const circular = [];
    const length = decodeSize();
    offset1 += 4;
    if (length === 0) {
        return new Map();
    }
    const content = new Map();
    for(let i = 0; i < length; i++){
        const key = unmarshalKey();
        if (config1.refExists) {
            const datumType = input[offset1];
            if (datumType === constants.ref) {
                offset1++;
                const refOffset = decodeSize(2);
                offset1 += 4;
                if (startOffset == refOffset) {
                    circular.push(key);
                } else {
                    content.set(key, objects1.get(refOffset));
                }
                offset1 += 4;
                continue;
            } else {
                content.set(key, unmarshalDatum());
            }
        } else {
            content.set(key, unmarshalDatum());
        }
    }
    for(let i = 0; i < circular.length; i++){
        content.set(circular[i], content);
    }
    objects1.set(startOffset, content);
    return content;
}
function unmarshalClass() {
    const startOffset = offset1;
    const circular = [];
    const pointer = decodeSize();
    offset1 += 4;
    const length = decodeSize();
    offset1 += 4;
    const content = {};
    for(let i = 0; i < length; i++){
        const key = unmarshalKey();
        if (config1.refExists) {
            const datumType = input[offset1];
            if (datumType === constants.ref) {
                offset1++;
                const refOffset = decodeSize(2);
                offset1 += 4;
                if (startOffset == refOffset) {
                    circular.push(key);
                } else {
                    content[key] = objects1.get(refOffset);
                }
                offset1 += 4;
            } else {
                content[key] = unmarshalDatum();
            }
        } else {
            content[key] = unmarshalDatum();
        }
    }
    for(let i = 0; i < circular.length; i++){
        content[circular[i]] = content;
    }
    if (constructors1[pointer] === undefined) {
        objects1.set(startOffset, content);
        return content;
    }
    const instance = Object.create(constructors1[pointer].prototype);
    Object.assign(instance, content);
    objects1.set(startOffset, instance);
    return instance;
}
function unmarshalRef() {
    const ref_offset = decodeSize();
    offset1 += 4;
    return objects1.get(ref_offset);
}
function unmarshalDatum() {
    const type = input[offset1];
    offset1++;
    switch(type){
        case constants.string:
            return unmarshalString();
        case constants.i8:
        case constants.i16:
        case constants.i32:
        case constants.u8:
        case constants.u16:
        case constants.u32:
            return unmarshalInteger();
        case constants.f64:
            return unmarshalNumber();
        case constants.u64:
            return unmarshalBigint();
        case constants.true:
        case constants.false:
            return input[offset1 - 1] === constants.true;
        case constants.null:
            return null;
        case constants.undefined:
            return undefined;
        case constants.array:
            return unmarshalArray();
        case constants.record:
            return unmarshalRecord();
        case constants.set:
            return unmarshalSet();
        case constants.map:
            return unmarshalMap();
        case constants.date:
            return unmarshalDate();
        case constants.symbol:
            return unmarshalSymbol();
        case constants.class:
            return unmarshalClass();
        case constants.ref:
            return unmarshalRef();
    }
    throw new Error(`Parse error: unknown type ${type} at position ${offset1}`);
}
function unmarshalConfig() {
    offset1 = 5;
    const version = unmarshalString();
    const bigEndian = input[offset1] === constants.true;
    offset1++;
    const symbolExists = input[offset1] === constants.true;
    offset1++;
    const refExists = input[offset1] === constants.true;
    return {
        version,
        bigEndian,
        symbolExists,
        refExists
    };
}
function decode(value, constructors_ = []) {
    objects1.clear();
    input = value;
    config1 = unmarshalConfig();
    offset1 = startOffset;
    constructors1 = constructors_;
    const unmarshalled = unmarshalDatum();
    input = undefined;
    config1 = {};
    return unmarshalled;
}
function readFromIndex(value, name, constructors_ = []) {
    objects1.clear();
    input = value;
    config1 = unmarshalConfig();
    constructors1 = constructors_;
    offset1 = 0;
    offset1 = decodeSize();
    offset1++;
    const indecies = unmarshalMap();
    const index = indecies.get(name);
    if (index === undefined) {
        throw new Error(`Index ${name} not found`);
    }
    offset1 = index;
    const unmarshalled = unmarshalDatum();
    return unmarshalled;
}
export { encode as encode, encodeWithClasses as encodeWithClasses };
export { decode as decode, readFromIndex as readFromIndex };
export { index as index };
const Marshal = {
    encode,
    encodeWithClasses,
    decode,
    readFromIndex
};
export { Marshal as default };

