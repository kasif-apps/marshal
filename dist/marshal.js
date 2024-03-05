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
    i8: (value)=>{
        return new Uint8Array([
            Number(value)
        ]);
    },
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
            view.setBigUint64(0, value, true);
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
    u16: (data)=>{
        const view = new DataView(data.buffer);
        return view.getUint16(0, true);
    },
    i64: (data)=>{
        const view = new DataView(data.buffer);
        return view.getBigInt64(0, true);
    },
    u64: (data)=>{
        const view = new DataView(data.buffer);
        return view.getBigUint64(0, true);
    },
    f64: (data)=>{
        const view = new DataView(data.buffer);
        return view.getFloat64(0, true);
    }
};
const constants = {
    string: 1,
    u8: 2,
    u8Clamped: 3,
    u16: 4,
    u32: 5,
    u64: 6,
    i8: 7,
    i16: 8,
    i32: 9,
    i64: 10,
    f32: 11,
    f64: 12,
    true: 13,
    false: 14,
    null: 15,
    undefined: 16,
    array: 17,
    record: 18,
    set: 19,
    map: 20,
    date: 21,
    u8array: 22,
    u16Array: 23,
    u32Array: 24,
    i8array: 25,
    i16Array: 26,
    i32Array: 27,
    symbol: 28,
    class: 29,
    regex: 30,
    ref: 31,
    index: 32,
    terminator: 0,
    encoded: {
        string: encodeNumber.u8(1),
        u8: encodeNumber.u8(2),
        u8Clamped: encodeNumber.u8(3),
        u16: encodeNumber.u8(4),
        u32: encodeNumber.u8(5),
        u64: encodeNumber.u8(6),
        i8: encodeNumber.u8(7),
        i16: encodeNumber.u8(8),
        i32: encodeNumber.u8(9),
        i64: encodeNumber.u8(10),
        f32: encodeNumber.u8(11),
        f64: encodeNumber.u8(12),
        true: encodeNumber.u8(13),
        false: encodeNumber.u8(14),
        null: encodeNumber.u8(15),
        undefined: encodeNumber.u8(16),
        array: encodeNumber.u8(17),
        record: encodeNumber.u8(18),
        set: encodeNumber.u8(19),
        map: encodeNumber.u8(20),
        date: encodeNumber.u8(21),
        u8Array: encodeNumber.u8(22),
        u16Array: encodeNumber.u8(23),
        u32Array: encodeNumber.u8(24),
        i8Array: encodeNumber.u8(25),
        i16Array: encodeNumber.u8(26),
        i32Array: encodeNumber.u8(27),
        symbol: encodeNumber.u8(28),
        class: encodeNumber.u8(29),
        regex: encodeNumber.u8(30),
        ref: encodeNumber.u8(31),
        index: encodeNumber.u8(32),
        terminator: encodeNumber.u8(0)
    }
};
function getEntries(object) {
    const result = [];
    let onlyStringKeys = true;
    const enumarables = Object.getOwnPropertyNames(object);
    const symbols = Object.getOwnPropertySymbols(object);
    const length = Math.max(enumarables.length, symbols.length);
    for(let i = 0; i < length; i++){
        if (typeof enumarables[i] !== "string") {
            onlyStringKeys = false;
        }
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
            onlyStringKeys = false;
            result.push([
                symbol,
                object[symbol]
            ]);
        }
    }
    return [
        result,
        onlyStringKeys
    ];
}
const startOffset = 100;
const index = Symbol("Marshal.index");
const version = "0.2.0";
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
    ]),
    symbol: new Uint8Array([
        ...constants.encoded.symbol,
        ...encodeNumber.u32(0)
    ]),
    u8Array: new Uint8Array([
        ...constants.encoded.u8Array,
        ...encodeNumber.u32(0)
    ]),
    i8Array: new Uint8Array([
        ...constants.encoded.i8Array,
        ...encodeNumber.u32(0)
    ]),
    u16Array: new Uint8Array([
        ...constants.encoded.u16Array,
        ...encodeNumber.u32(0)
    ]),
    i16Array: new Uint8Array([
        ...constants.encoded.i16Array,
        ...encodeNumber.u32(0)
    ]),
    u32Array: new Uint8Array([
        ...constants.encoded.u32Array,
        ...encodeNumber.u32(0)
    ]),
    i32Array: new Uint8Array([
        ...constants.encoded.i32Array,
        ...encodeNumber.u32(0)
    ])
};
const textEncoder = new TextEncoder();
let config = {
    v: version,
    be: false,
    hs: false,
    hn: false,
    dn: false,
    aa: true,
    re: false
};
const indecies = new Map();
const memo1 = new Map();
let buffer = new Uint8Array(2 ** 11);
let constructors = [];
let objects = new WeakMap();
let offset = 100;
function write(data) {
    buffer.set(data, offset);
    offset += data.length;
    return data.length;
}
function isASCII(str) {
    return /^[\x00-\xFF]*$/.test(str);
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
    const isAllAscii = isASCII(value);
    if (!isAllAscii) {
        config.aa = false;
    }
    memo1.set(value, buffer.slice(offset - n, offset));
    return n;
}
function marshalNumber(value) {
    if (!config.dn) {
        return write(constants.encoded.f64) + write(encodeNumber.f64(value));
    }
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
function marshalSymbol(data) {
    const value = data.description ?? "";
    if (value.length === 0) {
        return write(prebuilt.symbol);
    }
    let n = write(constants.encoded.symbol);
    const r = textEncoder.encodeInto(value, buffer.subarray(offset + 4));
    const length = encodeNumber.u32(r.written);
    n += write(length);
    offset += r.written;
    n += r.written;
    const isAllAscii = isASCII(value);
    if (!isAllAscii) {
        config.aa = false;
    }
    return n;
}
function marshalRef(offset) {
    config.re = true;
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
function marshalKey(key, value) {
    let n = 0;
    let indexed = null;
    switch(typeof key){
        case "string":
            n += marshalString(key);
            break;
        case "number":
            config.hn = true;
            n += marshalNumber(key);
            break;
        case "symbol":
            config.hs = true;
            if (key === index && typeof value === "string") {
                indexed = key;
            }
            n += marshalSymbol(key);
            break;
        default:
            throw new Error(`Cannot marshal key: '${typeof key}'`);
    }
    return [
        n,
        indexed
    ];
}
function marshalRecord(value) {
    const [entries, onlyStringKeys] = getEntries(value);
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
        if (onlyStringKeys) {
            n += marshalString(entries[i][0]);
            n += marshalDatum(entries[i][1]);
            continue;
        }
        const [w, w_indexed] = marshalKey(entries[i][0], entries[i][1]);
        n += w;
        indexed = w_indexed;
        n += marshalDatum(entries[i][1]);
    }
    if (indexed) {
        indecies.set(value[indexed], recordOffset);
    }
    return n;
}
function marshalMap(value) {
    const entries = Array.from(value.entries());
    const mapOffset = offset;
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
    let indexed = null;
    for(let i = 0; i < entries.length; i++){
        const [w, w_indexed] = marshalKey(entries[i][0], entries[i][1]);
        n += w;
        indexed = w_indexed;
        n += marshalDatum(entries[i][1]);
    }
    if (indexed) {
        indecies.set(value.get(indexed), mapOffset);
    }
    return n;
}
function marshalClass(value) {
    const [entries, onlyStringKeys] = getEntries(value);
    const instanceOffset = offset;
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
    let indexed = null;
    for(let i = 0; i < entries.length; i++){
        if (onlyStringKeys) {
            n += marshalString(entries[i][0]);
            n += marshalDatum(entries[i][1]);
            continue;
        }
        const [w, w_indexed] = marshalKey(entries[i][0], entries[i][1]);
        n += w;
        indexed = w_indexed;
        n += marshalDatum(entries[i][1]);
    }
    if (indexed) {
        indecies.set(value[indexed], instanceOffset);
    }
    return n;
}
function marshalRegex(value) {
    const map = {
        flags: value.flags,
        global: value.global,
        hasIndices: value.hasIndices,
        ignoreCase: value.ignoreCase,
        lastIndex: value.lastIndex,
        multiline: value.multiline,
        source: value.source,
        sticky: value.sticky,
        unicode: value.unicode
    };
    return write(constants.encoded.regex) + marshalRecord(map);
}
function marshalU8Array(value) {
    if (value.length === 0) {
        return write(prebuilt.u8Array);
    }
    const foundOffset = objects.get(value);
    if (foundOffset !== undefined) {
        return marshalRef(foundOffset);
    }
    objects.set(value, offset);
    let n = write(constants.encoded.u8Array);
    n += write(encodeNumber.u32(value.length));
    n += write(value);
    return n;
}
function marshalI8Array(value) {
    if (value.length === 0) {
        return write(prebuilt.i8Array);
    }
    const foundOffset = objects.get(value);
    if (foundOffset !== undefined) {
        return marshalRef(foundOffset);
    }
    objects.set(value, offset);
    let n = write(constants.encoded.i8Array);
    n += write(encodeNumber.u32(value.length));
    const asU8 = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
    buffer.set(asU8, offset);
    offset += value.byteLength;
    n += value.byteLength;
    return n;
}
function marshalU16Array(value) {
    if (value.length === 0) {
        return write(prebuilt.u16Array);
    }
    const foundOffset = objects.get(value);
    if (foundOffset !== undefined) {
        return marshalRef(foundOffset);
    }
    objects.set(value, offset);
    let n = write(constants.encoded.u16Array);
    n += write(encodeNumber.u32(value.length));
    const asU8 = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
    buffer.set(asU8, offset);
    offset += value.byteLength;
    n += value.byteLength;
    return n;
}
function marshalI16Array(value) {
    if (value.length === 0) {
        return write(prebuilt.i16Array);
    }
    const foundOffset = objects.get(value);
    if (foundOffset !== undefined) {
        return marshalRef(foundOffset);
    }
    objects.set(value, offset);
    let n = write(constants.encoded.i16Array);
    n += write(encodeNumber.u32(value.length));
    const asU8 = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
    buffer.set(asU8, offset);
    offset += value.byteLength;
    n += value.byteLength;
    return n;
}
function marshalU32Array(value) {
    if (value.length === 0) {
        return write(prebuilt.u32Array);
    }
    const foundOffset = objects.get(value);
    if (foundOffset !== undefined) {
        return marshalRef(foundOffset);
    }
    objects.set(value, offset);
    let n = write(constants.encoded.u32Array);
    n += write(encodeNumber.u32(value.length));
    const asU8 = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
    buffer.set(asU8, offset);
    offset += value.byteLength;
    n += value.byteLength;
    return n;
}
function marshalI32Array(value) {
    if (value.length === 0) {
        return write(prebuilt.i32Array);
    }
    const foundOffset = objects.get(value);
    if (foundOffset !== undefined) {
        return marshalRef(foundOffset);
    }
    objects.set(value, offset);
    let n = write(constants.encoded.i32Array);
    n += write(encodeNumber.u32(value.length));
    const asU8 = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
    buffer.set(asU8, offset);
    offset += value.byteLength;
    n += value.byteLength;
    return n;
}
const unsupported = [
    Function,
    ArrayBuffer,
    DataView,
    Float32Array,
    Float64Array,
    Uint8ClampedArray
];
function marshalDatum(value) {
    if (value === undefined) {
        return write(prebuilt.undefined);
    }
    if (value === null) {
        return write(prebuilt.null);
    }
    if (unsupported.includes(value.constructor)) {
        console.warn(`Unsupported type '${value.constructor.name}'`);
        return 0;
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
        case "undefined":
            return write(prebuilt.undefined);
        case "function":
            console.warn(`Unsupported type '${typeof value}'`);
            return 0;
        case "object":
            if (Array.isArray(value)) {
                return marshalArray(value);
            }
            switch(value.constructor){
                case Map:
                    return marshalMap(value);
                case Set:
                    return marshalSet(value);
                case Date:
                    return marshalDate(value);
                case Object:
                    return marshalRecord(value);
                case RegExp:
                    return marshalRegex(value);
                case Uint8Array:
                    return marshalU8Array(value);
                case Int8Array:
                    return marshalI8Array(value);
                case Uint16Array:
                    return marshalU16Array(value);
                case Int16Array:
                    return marshalI16Array(value);
                case Uint32Array:
                    return marshalU32Array(value);
                case Int32Array:
                    return marshalI32Array(value);
                default:
                    return marshalClass(value);
            }
        default:
            throw new Error(`Unknown type: '${typeof value}'`);
    }
}
function marshalConfig(config) {
    const oldOffset = offset;
    offset = 4;
    const n = marshalRecord(config);
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
function reset(options) {
    offset = startOffset;
    config = {
        v: version,
        be: false,
        re: false,
        hs: false,
        hn: false,
        aa: true,
        dn: false
    };
    if (options?.useDynamicNumbers) {
        config.dn = true;
    }
    constructors = [];
    indecies.clear();
    objects = new WeakMap();
}
function encode(value, options) {
    reset(options);
    if (options?.buffer) {
        buffer = options.buffer;
    }
    marshalDatum(value);
    marshalIndecies();
    marshalConfig(config);
    return buffer.slice(0, offset);
}
function encodeWithClasses(value, options) {
    reset(options);
    if (options?.buffer) {
        buffer = options.buffer;
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
let offset1 = 100;
let config1 = {};
let constructors1 = [];
let input;
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
    const result = textDecoder.decode(input.subarray(offset1, offset1 + length));
    offset1 += length;
    return result;
}
function unmarshalSymbol() {
    const length = decodeSize();
    offset1 += 4;
    if (length === 0) {
        return Symbol("");
    }
    const result = textDecoder.decode(input.subarray(offset1, offset1 + length));
    offset1 += length;
    return Symbol(result);
}
function unmarshalKey() {
    if (!config1.hs && !config1.hn) {
        offset1++;
        return unmarshalString();
    }
    const type = input[offset1];
    offset1++;
    switch(type){
        case constants.string:
            return unmarshalString();
        case constants.symbol:
            return unmarshalSymbol();
        case constants.i8:
        case constants.i16:
        case constants.i32:
        case constants.u8:
        case constants.u16:
        case constants.u32:
            return unmarshalInteger();
        case constants.f64:
            return unmarshalNumber();
        default:
            throw new Error(`Parse error: unknown key type ${type} at position ${offset1}`);
    }
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
    const dateOffset = offset1 - 1;
    const content = decodeNumber.u64(peek(8));
    offset1 += 8;
    const date = new Date(Number(content));
    objects1.set(dateOffset, date);
    return date;
}
function unmarshalArray() {
    const arrayOffset = offset1 - 1;
    const length = decodeSize();
    offset1 += 4;
    if (length === 0) {
        return [];
    }
    const content = new Array(length);
    for(let i = 0; i < length; i++){
        content[i] = unmarshalDatum();
    }
    objects1.set(arrayOffset, content);
    return content;
}
function unmarshalSet() {
    const setOffset = offset1 - 1;
    const length = decodeSize();
    offset1 += 4;
    if (length === 0) {
        return new Set();
    }
    const content = new Set();
    for(let i = 0; i < length; i++){
        content.add(unmarshalDatum());
    }
    objects1.set(setOffset, content);
    return content;
}
function unmarshalRecord() {
    const recordOffset = offset1 - 1;
    const circular = [];
    const length = decodeSize();
    offset1 += 4;
    if (length === 0) {
        return {};
    }
    const content = {};
    for(let i = 0; i < length; i++){
        const key = unmarshalKey();
        if (config1.re) {
            const datumType = input[offset1];
            if (datumType === constants.ref) {
                offset1++;
                const refOffset = decodeSize();
                offset1 += 4;
                if (recordOffset === refOffset) {
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
    objects1.set(recordOffset, content);
    return content;
}
function unmarshalMap() {
    const mapOffset = offset1 - 1;
    const circular = [];
    const length = decodeSize();
    offset1 += 4;
    if (length === 0) {
        return new Map();
    }
    const content = new Map();
    for(let i = 0; i < length; i++){
        const key = unmarshalKey();
        if (config1.re) {
            const datumType = input[offset1];
            if (datumType === constants.ref) {
                offset1++;
                const refOffset = decodeSize();
                offset1 += 4;
                if (mapOffset === refOffset) {
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
    objects1.set(mapOffset, content);
    return content;
}
function unmarshalClass() {
    const classOffset = offset1 - 1;
    const circular = [];
    const pointer = decodeSize();
    offset1 += 4;
    const length = decodeSize();
    offset1 += 4;
    const content = {};
    for(let i = 0; i < length; i++){
        const key = unmarshalKey();
        if (config1.re) {
            const datumType = input[offset1];
            if (datumType === constants.ref) {
                offset1++;
                const refOffset = decodeSize();
                offset1 += 4;
                if (classOffset === refOffset) {
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
    if (constructors1[pointer] === undefined) {
        for(let i = 0; i < circular.length; i++){
            content[circular[i]] = content;
        }
        objects1.set(classOffset, content);
        return content;
    }
    const instance = Object.create(constructors1[pointer].prototype);
    Object.assign(instance, content);
    for(let i = 0; i < circular.length; i++){
        instance[circular[i]] = instance;
    }
    objects1.set(classOffset, instance);
    return instance;
}
function unmarshalRef() {
    const ref_offset = decodeSize();
    offset1 += 4;
    return objects1.get(ref_offset);
}
function unmarshalRegex() {
    const regexOffset = offset1 - 1;
    offset1++;
    const map = unmarshalRecord();
    const result = new RegExp(map.source, map.flags);
    objects1.set(regexOffset, result);
    return result;
}
function unmarshalU8Array() {
    const arrayOffset = offset1 - 1;
    const length = decodeSize();
    offset1 += 4;
    if (length === 0) {
        return new Uint8Array(0);
    }
    const result = input.slice(offset1, offset1 + length);
    offset1 += length;
    objects1.set(arrayOffset, result);
    return result;
}
function unmarshalI8Array() {
    const arrayOffset = offset1 - 1;
    const length = decodeSize();
    offset1 += 4;
    if (length === 0) {
        return new Int8Array(0);
    }
    const asU8 = input.subarray(offset1, offset1 + length);
    const content = new Int8Array(asU8.buffer, asU8.byteOffset, length);
    offset1 += length;
    objects1.set(arrayOffset, content);
    return content;
}
function unmarshalU16Array() {
    const arrayOffset = offset1 - 1;
    const length = decodeSize();
    offset1 += 4;
    if (length === 0) {
        return new Uint16Array(0);
    }
    const asU8 = input.slice(offset1, offset1 + length * 2);
    const content = new Uint16Array(asU8.buffer, asU8.byteOffset, length);
    offset1 += length * 2;
    objects1.set(arrayOffset, content);
    return content;
}
function unmarshalI16Array() {
    const arrayOffset = offset1 - 1;
    const length = decodeSize();
    offset1 += 4;
    if (length === 0) {
        return new Int16Array(0);
    }
    const asU8 = input.slice(offset1, offset1 + length * 2);
    const content = new Int16Array(asU8.buffer, asU8.byteOffset, length);
    offset1 += length * 2;
    objects1.set(arrayOffset, content);
    return content;
}
function unmarshalU32Array() {
    const arrayOffset = offset1 - 1;
    const length = decodeSize();
    offset1 += 4;
    if (length === 0) {
        return new Uint32Array(0);
    }
    const asU8 = input.slice(offset1, offset1 + length * 4);
    const content = new Uint32Array(asU8.buffer, asU8.byteOffset, length);
    offset1 += length * 4;
    objects1.set(arrayOffset, content);
    return content;
}
function unmarshalI32Array() {
    const arrayOffset = offset1 - 1;
    const length = decodeSize();
    offset1 += 4;
    if (length === 0) {
        return new Int32Array(0);
    }
    const asU8 = input.slice(offset1, offset1 + length * 4);
    const content = new Int32Array(asU8.buffer, asU8.byteOffset, length);
    offset1 += length * 4;
    objects1.set(arrayOffset, content);
    return content;
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
        case constants.i64:
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
        case constants.regex:
            return unmarshalRegex();
        case constants.u8array:
            return unmarshalU8Array();
        case constants.i8array:
            return unmarshalI8Array();
        case constants.u16Array:
            return unmarshalU16Array();
        case constants.i16Array:
            return unmarshalI16Array();
        case constants.u32Array:
            return unmarshalU32Array();
        case constants.i32Array:
            return unmarshalI32Array();
        case constants.ref:
            return unmarshalRef();
    }
    throw new Error(`Parse error: unknown type ${type} at position ${offset1}`);
}
function unmarshalConfig() {
    offset1 = 5;
    const result = unmarshalRecord();
    return result;
}
function decode(value, classes = []) {
    objects1.clear();
    input = value;
    config1 = unmarshalConfig();
    if (config1.v !== version) {
        console.warn(`The encoded value is not compatible with this version of marshal. The archive is encoded with @kasif-apps/marshal@v${config1.v} and you are using @kasif-apps/marshal@v${version}. Some features may not work as expected.`);
    }
    offset1 = startOffset;
    constructors1 = classes;
    const unmarshalled = unmarshalDatum();
    input = undefined;
    config1 = {};
    return unmarshalled;
}
function readFromIndex(value, name, classes = []) {
    objects1.clear();
    input = value;
    config1 = unmarshalConfig();
    constructors1 = classes;
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
    input = undefined;
    config1 = {};
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

