"use strict";
/**
 * @packageDocumentation
 * @module Utils-Payload
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAGNETPayload = exports.ONIONPayload = exports.IPFSPayload = exports.URLPayload = exports.EMAILPayload = exports.YAMLPayload = exports.JSONPayload = exports.CSVPayload = exports.SVGPayload = exports.ICOPayload = exports.BMPPayload = exports.PNGPayload = exports.JPEGPayload = exports.SECPENCPayload = exports.SECPSIGPayload = exports.NODEIDPayload = exports.CHAINIDPayload = exports.SUBNETIDPayload = exports.NFTIDPayload = exports.UTXOIDPayload = exports.ASSETIDPayload = exports.TXIDPayload = exports.cb58EncodedPayload = exports.CCHAINADDRPayload = exports.PCHAINADDRPayload = exports.XCHAINADDRPayload = exports.ChainAddressPayload = exports.BIGNUMPayload = exports.B64STRPayload = exports.B58STRPayload = exports.HEXSTRPayload = exports.UTF8Payload = exports.BINPayload = exports.PayloadBase = exports.PayloadTypes = void 0;
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("./bintools"));
const bn_js_1 = __importDefault(require("bn.js"));
const web3_utils_1 = __importDefault(require("web3-utils"));
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
/**
 * Class for determining payload types and managing the lookup table.
 */
class PayloadTypes {
    constructor() {
        this.types = [];
        this.types = [
            "BIN", "UTF8", "HEXSTR", "B58STR", "B64STR", "BIGNUM", "XCHAINADDR", "PCHAINADDR", "CCHAINADDR", "TXID",
            "ASSETID", "UTXOID", "NFTID", "SUBNETID", "CHAINID", "NODEID", "SECPSIG", "SECPENC", "JPEG", "PNG",
            "BMP", "ICO", "SVG", "CSV", "JSON", "YAML", "EMAIL", "URL", "IPFS", "ONION", "MAGNET"
        ];
    }
    /**
     * Given an encoded payload buffer returns the payload content (minus typeID).
     */
    getContent(payload) {
        const pl = bintools.copyFrom(payload, 5);
        return pl;
    }
    /**
     * Given an encoded payload buffer returns the payload (with typeID).
     */
    getPayload(payload) {
        const pl = bintools.copyFrom(payload, 4);
        return pl;
    }
    /**
     * Given a payload buffer returns the proper TypeID.
     */
    getTypeID(payload) {
        let offset = 0;
        const size = bintools.copyFrom(payload, offset, 4).readUInt32BE(0);
        offset += 4;
        const typeid = bintools.copyFrom(payload, offset, offset + 1).readUInt8(0);
        return typeid;
    }
    /**
     * Given a type string returns the proper TypeID.
     */
    lookupID(typestr) {
        return this.types.indexOf(typestr);
    }
    /**
     * Given a TypeID returns a string describing the payload type.
     */
    lookupType(value) {
        return this.types[value];
    }
    /**
     * Given a TypeID returns the proper [[PayloadBase]].
     */
    select(typeid, ...args) {
        switch (typeid) {
            case 0:
                return new BINPayload(...args);
            case 1:
                return new UTF8Payload(...args);
            case 2:
                return new HEXSTRPayload(...args);
            case 3:
                return new B58STRPayload(...args);
            case 4:
                return new B64STRPayload(...args);
            case 5:
                return new BIGNUMPayload(...args);
            case 6:
                return new XCHAINADDRPayload(...args);
            case 7:
                return new PCHAINADDRPayload(...args);
            case 8:
                return new CCHAINADDRPayload(...args);
            case 9:
                return new TXIDPayload(...args);
            case 10:
                return new ASSETIDPayload(...args);
            case 11:
                return new UTXOIDPayload(...args);
            case 12:
                return new NFTIDPayload(...args);
            case 13:
                return new SUBNETIDPayload(...args);
            case 14:
                return new CHAINIDPayload(...args);
            case 15:
                return new NODEIDPayload(...args);
            case 16:
                return new SECPSIGPayload(...args);
            case 17:
                return new SECPENCPayload(...args);
            case 18:
                return new JPEGPayload(...args);
            case 19:
                return new PNGPayload(...args);
            case 20:
                return new BMPPayload(...args);
            case 21:
                return new ICOPayload(...args);
            case 22:
                return new SVGPayload(...args);
            case 23:
                return new CSVPayload(...args);
            case 24:
                return new JSONPayload(...args);
            case 25:
                return new YAMLPayload(...args);
            case 26:
                return new EMAILPayload(...args);
            case 27:
                return new URLPayload(...args);
            case 28:
                return new IPFSPayload(...args);
            case 29:
                return new ONIONPayload(...args);
            case 30:
                return new MAGNETPayload(...args);
        }
        throw new Error("Error - PayloadTypes.select: unknown typeid " + typeid);
    }
    /**
     * Given a [[PayloadBase]] which may not be cast properly, returns a properly cast [[PayloadBase]].
     */
    recast(unknowPayload) {
        return this.select(unknowPayload.typeID(), unknowPayload.returnType());
    }
    /**
     * Returns the [[PayloadTypes]] singleton.
     */
    static getInstance() {
        if (!PayloadTypes.instance) {
            PayloadTypes.instance = new PayloadTypes();
        }
        return PayloadTypes.instance;
    }
}
exports.PayloadTypes = PayloadTypes;
/**
 * Base class for payloads.
 */
class PayloadBase {
    constructor() {
        this.payload = buffer_1.Buffer.alloc(0);
        this.typeid = undefined;
    }
    /**
     * Returns the TypeID for the payload.
     */
    typeID() {
        return this.typeid;
    }
    /**
     * Returns the string name for the payload's type.
     */
    typeName() {
        return PayloadTypes.getInstance().lookupType(this.typeid);
    }
    /**
     * Returns the payload content (minus typeID).
     */
    getContent() {
        const pl = bintools.copyFrom(this.payload);
        return pl;
    }
    /**
     * Returns the payload (with typeID).
     */
    getPayload() {
        let typeid = buffer_1.Buffer.alloc(1);
        typeid.writeUInt8(this.typeid, 0);
        const pl = buffer_1.Buffer.concat([typeid, bintools.copyFrom(this.payload)]);
        return pl;
    }
    /**
     * Decodes the payload as a {@link https://github.com/feross/buffer|Buffer} including 4 bytes for the length and TypeID.
     */
    fromBuffer(bytes, offset = 0) {
        let size = bintools.copyFrom(bytes, offset, offset + 4).readUInt32BE(0);
        offset += 4;
        this.typeid = bintools.copyFrom(bytes, offset, offset + 1).readUInt8(0);
        offset += 1;
        this.payload = bintools.copyFrom(bytes, offset, offset + size - 1);
        offset += size - 1;
        return offset;
    }
    /**
     * Encodes the payload as a {@link https://github.com/feross/buffer|Buffer} including 4 bytes for the length and TypeID.
     */
    toBuffer() {
        let sizebuff = buffer_1.Buffer.alloc(4);
        sizebuff.writeUInt32BE(this.payload.length + 1, 0);
        let typebuff = buffer_1.Buffer.alloc(1);
        typebuff.writeUInt8(this.typeid, 0);
        return buffer_1.Buffer.concat([sizebuff, typebuff, this.payload]);
    }
}
exports.PayloadBase = PayloadBase;
/**
 * Class for payloads representing simple binary blobs.
 */
class BINPayload extends PayloadBase {
    /**
     * @param payload Buffer only
     */
    constructor(payload = undefined) {
        super();
        this.typeid = 0;
        if (payload instanceof buffer_1.Buffer) {
            this.payload = payload;
        }
        else if (typeof payload === "string") {
            this.payload = bintools.b58ToBuffer(payload);
        }
    }
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} for the payload.
     */
    returnType() {
        return this.payload;
    }
}
exports.BINPayload = BINPayload;
/**
 * Class for payloads representing UTF8 encoding.
 */
class UTF8Payload extends PayloadBase {
    /**
     * @param payload Buffer utf8 string
     */
    constructor(payload = undefined) {
        super();
        this.typeid = 1;
        if (payload instanceof buffer_1.Buffer) {
            this.payload = payload;
        }
        else if (typeof payload === "string") {
            this.payload = buffer_1.Buffer.from(payload, "utf8");
        }
    }
    /**
     * Returns a string for the payload.
     */
    returnType() {
        return this.payload.toString("utf8");
    }
}
exports.UTF8Payload = UTF8Payload;
/**
 * Class for payloads representing Hexadecimal encoding.
 */
class HEXSTRPayload extends PayloadBase {
    /**
     * @param payload Buffer or hex string
     */
    constructor(payload = undefined) {
        super();
        this.typeid = 2;
        if (payload instanceof buffer_1.Buffer) {
            this.payload = payload;
        }
        else if (typeof payload === "string") {
            if (payload.startsWith("0x") || !payload.match(/^[0-9A-Fa-f]+$/)) {
                throw new Error("HEXSTRPayload.constructor -- hex string may not start with 0x and must be in /^[0-9A-Fa-f]+$/: " + payload);
            }
            this.payload = buffer_1.Buffer.from(payload, "hex");
        }
    }
    /**
     * Returns a hex string for the payload.
     */
    returnType() {
        return this.payload.toString("hex");
    }
}
exports.HEXSTRPayload = HEXSTRPayload;
/**
 * Class for payloads representing Base58 encoding.
 */
class B58STRPayload extends PayloadBase {
    /**
     * @param payload Buffer or cb58 encoded string
     */
    constructor(payload = undefined) {
        super();
        this.typeid = 3;
        if (payload instanceof buffer_1.Buffer) {
            this.payload = payload;
        }
        else if (typeof payload === "string") {
            this.payload = bintools.b58ToBuffer(payload);
        }
    }
    /**
     * Returns a base58 string for the payload.
     */
    returnType() {
        return bintools.bufferToB58(this.payload);
    }
}
exports.B58STRPayload = B58STRPayload;
/**
 * Class for payloads representing Base64 encoding.
 */
class B64STRPayload extends PayloadBase {
    /**
     * @param payload Buffer of base64 string
     */
    constructor(payload = undefined) {
        super();
        this.typeid = 4;
        if (payload instanceof buffer_1.Buffer) {
            this.payload = payload;
        }
        else if (typeof payload === "string") {
            this.payload = buffer_1.Buffer.from(payload, "base64");
        }
    }
    /**
     * Returns a base64 string for the payload.
     */
    returnType() {
        return this.payload.toString("base64");
    }
}
exports.B64STRPayload = B64STRPayload;
/**
 * Class for payloads representing Big Numbers.
 *
 * @param payload Accepts a Buffer, BN, or base64 string
 */
class BIGNUMPayload extends PayloadBase {
    /**
     * @param payload Buffer, BN, or base64 string
     */
    constructor(payload = undefined) {
        super();
        this.typeid = 5;
        if (payload instanceof buffer_1.Buffer) {
            this.payload = payload;
        }
        else if (payload instanceof bn_js_1.default) {
            this.payload = bintools.fromBNToBuffer(payload);
        }
        else if (typeof payload === "string") {
            this.payload = buffer_1.Buffer.from(payload, "hex");
        }
    }
    /**
     * Returns a {@link https://github.com/indutny/bn.js/|BN} for the payload.
     */
    returnType() {
        return bintools.fromBufferToBN(this.payload);
    }
}
exports.BIGNUMPayload = BIGNUMPayload;
/**
 * Class for payloads representing chain addresses.
 *
 */
class ChainAddressPayload extends PayloadBase {
    /**
     * @param payload Buffer or address string
     */
    constructor(payload = undefined) {
        super();
        this.typeid = 6;
        this.chainid = "";
        if (payload instanceof buffer_1.Buffer) {
            this.payload = payload;
        }
        else if (typeof payload === "string") {
            this.payload = bintools.stringToAddress(payload);
        }
    }
    /**
     * Returns the chainid.
     */
    returnChainID() {
        return this.chainid;
    }
    /**
     * Returns an address string for the payload.
     */
    returnType(hrp) {
        return bintools.addressToString(hrp, this.chainid, this.payload);
    }
}
exports.ChainAddressPayload = ChainAddressPayload;
/**
 * Class for payloads representing X-Chin addresses.
 */
class XCHAINADDRPayload extends ChainAddressPayload {
    constructor() {
        super(...arguments);
        this.typeid = 6;
        this.chainid = "X";
    }
}
exports.XCHAINADDRPayload = XCHAINADDRPayload;
/**
 * Class for payloads representing P-Chain addresses.
 */
class PCHAINADDRPayload extends ChainAddressPayload {
    constructor() {
        super(...arguments);
        this.typeid = 7;
        this.chainid = "P";
    }
}
exports.PCHAINADDRPayload = PCHAINADDRPayload;
/**
 * Class for payloads representing C-Chain addresses.
 */
class CCHAINADDRPayload extends ChainAddressPayload {
    constructor() {
        super(...arguments);
        this.typeid = 8;
        this.chainid = "C";
    }
    /**
     * Returns an address string for the payload.
     */
    returnType() {
        return this.chainid + "-" + web3_utils_1.default.toChecksumAddress("0x" + this.payload.toString("hex"));
    }
}
exports.CCHAINADDRPayload = CCHAINADDRPayload;
/**
 * Class for payloads representing data serialized by bintools.cb58Encode().
 */
class cb58EncodedPayload extends PayloadBase {
    /**
     * Returns a bintools.cb58Encoded string for the payload.
     */
    returnType() {
        return bintools.cb58Encode(this.payload);
    }
    /**
     * @param payload Buffer or cb58 encoded string
     */
    constructor(payload = undefined) {
        super();
        if (payload instanceof buffer_1.Buffer) {
            this.payload = payload;
        }
        else if (typeof payload === "string") {
            this.payload = bintools.cb58Decode(payload);
        }
    }
}
exports.cb58EncodedPayload = cb58EncodedPayload;
/**
 * Class for payloads representing TxIDs.
 */
class TXIDPayload extends cb58EncodedPayload {
    constructor() {
        super(...arguments);
        this.typeid = 9;
    }
}
exports.TXIDPayload = TXIDPayload;
/**
 * Class for payloads representing AssetIDs.
 */
class ASSETIDPayload extends cb58EncodedPayload {
    constructor() {
        super(...arguments);
        this.typeid = 10;
    }
}
exports.ASSETIDPayload = ASSETIDPayload;
/**
 * Class for payloads representing NODEIDs.
 */
class UTXOIDPayload extends cb58EncodedPayload {
    constructor() {
        super(...arguments);
        this.typeid = 11;
    }
}
exports.UTXOIDPayload = UTXOIDPayload;
/**
 * Class for payloads representing NFTIDs (UTXOIDs in an NFT context).
 */
class NFTIDPayload extends UTXOIDPayload {
    constructor() {
        super(...arguments);
        this.typeid = 12;
    }
}
exports.NFTIDPayload = NFTIDPayload;
/**
 * Class for payloads representing SubnetIDs.
 */
class SUBNETIDPayload extends cb58EncodedPayload {
    constructor() {
        super(...arguments);
        this.typeid = 13;
    }
}
exports.SUBNETIDPayload = SUBNETIDPayload;
/**
 * Class for payloads representing ChainIDs.
 */
class CHAINIDPayload extends cb58EncodedPayload {
    constructor() {
        super(...arguments);
        this.typeid = 14;
    }
}
exports.CHAINIDPayload = CHAINIDPayload;
/**
 * Class for payloads representing NodeIDs.
 */
class NODEIDPayload extends cb58EncodedPayload {
    constructor() {
        super(...arguments);
        this.typeid = 15;
    }
}
exports.NODEIDPayload = NODEIDPayload;
/**
 * Class for payloads representing secp256k1 signatures.
 * convention: secp256k1 signature (130 bytes)
 */
class SECPSIGPayload extends B58STRPayload {
    constructor() {
        super(...arguments);
        this.typeid = 16;
    }
}
exports.SECPSIGPayload = SECPSIGPayload;
/**
 * Class for payloads representing secp256k1 encrypted messages.
 * convention: public key (65 bytes) + secp256k1 encrypted message for that public key
 */
class SECPENCPayload extends B58STRPayload {
    constructor() {
        super(...arguments);
        this.typeid = 17;
    }
}
exports.SECPENCPayload = SECPENCPayload;
/**
 * Class for payloads representing JPEG images.
 */
class JPEGPayload extends BINPayload {
    constructor() {
        super(...arguments);
        this.typeid = 18;
    }
}
exports.JPEGPayload = JPEGPayload;
class PNGPayload extends BINPayload {
    constructor() {
        super(...arguments);
        this.typeid = 19;
    }
}
exports.PNGPayload = PNGPayload;
/**
 * Class for payloads representing BMP images.
 */
class BMPPayload extends BINPayload {
    constructor() {
        super(...arguments);
        this.typeid = 20;
    }
}
exports.BMPPayload = BMPPayload;
/**
 * Class for payloads representing ICO images.
 */
class ICOPayload extends BINPayload {
    constructor() {
        super(...arguments);
        this.typeid = 21;
    }
}
exports.ICOPayload = ICOPayload;
/**
 * Class for payloads representing SVG images.
 */
class SVGPayload extends UTF8Payload {
    constructor() {
        super(...arguments);
        this.typeid = 22;
    }
}
exports.SVGPayload = SVGPayload;
/**
 * Class for payloads representing CSV files.
 */
class CSVPayload extends UTF8Payload {
    constructor() {
        super(...arguments);
        this.typeid = 23;
    }
}
exports.CSVPayload = CSVPayload;
/**
 * Class for payloads representing JSON strings.
 */
class JSONPayload extends PayloadBase {
    constructor(payload = undefined) {
        super();
        this.typeid = 24;
        if (payload instanceof buffer_1.Buffer) {
            this.payload = payload;
        }
        else if (typeof payload === "string") {
            this.payload = buffer_1.Buffer.from(payload, "utf8");
        }
        else if (payload) {
            let jsonstr = JSON.stringify(payload);
            this.payload = buffer_1.Buffer.from(jsonstr, "utf8");
        }
    }
    /**
     * Returns a JSON-decoded object for the payload.
     */
    returnType() {
        return JSON.parse(this.payload.toString("utf8"));
    }
}
exports.JSONPayload = JSONPayload;
/**
 * Class for payloads representing YAML definitions.
 */
class YAMLPayload extends UTF8Payload {
    constructor() {
        super(...arguments);
        this.typeid = 25;
    }
}
exports.YAMLPayload = YAMLPayload;
/**
 * Class for payloads representing email addresses.
 */
class EMAILPayload extends UTF8Payload {
    constructor() {
        super(...arguments);
        this.typeid = 26;
    }
}
exports.EMAILPayload = EMAILPayload;
/**
 * Class for payloads representing URL strings.
 */
class URLPayload extends UTF8Payload {
    constructor() {
        super(...arguments);
        this.typeid = 27;
    }
}
exports.URLPayload = URLPayload;
/**
 * Class for payloads representing IPFS addresses.
 */
class IPFSPayload extends B58STRPayload {
    constructor() {
        super(...arguments);
        this.typeid = 28;
    }
}
exports.IPFSPayload = IPFSPayload;
/**
 * Class for payloads representing onion URLs.
 */
class ONIONPayload extends UTF8Payload {
    constructor() {
        super(...arguments);
        this.typeid = 29;
    }
}
exports.ONIONPayload = ONIONPayload;
/**
 * Class for payloads representing torrent magnet links.
 */
class MAGNETPayload extends UTF8Payload {
    constructor() {
        super(...arguments);
        this.typeid = 30;
    }
}
exports.MAGNETPayload = MAGNETPayload;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF5bG9hZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91dGlscy9wYXlsb2FkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O0dBR0c7Ozs7OztBQUVILG9DQUFpQztBQUNqQywwREFBbUM7QUFDbkMsa0RBQXVCO0FBQ3ZCLDREQUFtQztBQUVuQzs7R0FFRztBQUNILE1BQU0sUUFBUSxHQUFHLGtCQUFRLENBQUMsV0FBVyxFQUFFLENBQUM7QUFFeEM7O0dBRUc7QUFDSCxNQUFhLFlBQVk7SUFzSXJCO1FBcElVLFVBQUssR0FBaUIsRUFBRSxDQUFDO1FBcUkvQixJQUFJLENBQUMsS0FBSyxHQUFHO1lBQ1QsS0FBSyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUUsTUFBTTtZQUN2RyxTQUFTLEVBQUUsUUFBUSxFQUFHLE9BQU8sRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxLQUFLO1lBQ25HLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxRQUFRO1NBQ3hGLENBQUM7SUFDTixDQUFDO0lBeElEOztPQUVHO0lBQ0gsVUFBVSxDQUFDLE9BQWM7UUFDckIsTUFBTSxFQUFFLEdBQVcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDakQsT0FBTyxFQUFFLENBQUM7SUFDZCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxVQUFVLENBQUMsT0FBYztRQUNyQixNQUFNLEVBQUUsR0FBVyxRQUFRLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNqRCxPQUFP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O0FBRkQsb0NBRUM7QUFFRDs7R0FFRztBQUNILE1BQWEsVUFBVyxTQUFRLFdBQVc7SUFBM0M7O1FBQ2MsV0FBTSxHQUFHLEVBQUUsQ0FBQztJQUMxQixDQUFDO0NBQUE7QUFGRCxnQ0FFQztBQUVEOztHQUVHO0FBQ0gsTUFBYSxXQUFZLFNBQVEsYUFBYTtJQUE5Qzs7UUFDYyxXQUFNLEdBQUcsRUFBRSxDQUFDO0lBQzFCLENBQUM7Q0FBQTtBQUZELGtDQUVDO0FBRUQ7O0dBRUc7QUFDSCxNQUFhLFlBQWEsU0FBUSxXQUFXO0lBQTdDOztRQUNjLFdBQU0sR0FBRyxFQUFFLENBQUM7SUFDMUIsQ0FBQztDQUFBO0FBRkQsb0NBRUM7QUFFRDs7R0FFRztBQUNILE1BQWEsYUFBYyxTQUFRLFdBQVc7SUFBOUM7O1FBQ2MsV0FBTSxHQUFHLEVBQUUsQ0FBQztJQUMxQixDQUFDO0NBQUE7QUFGRCxzQ0FFQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQHBhY2thZ2VEb2N1bWVudGF0aW9uXG4gKiBAbW9kdWxlIFV0aWxzLVBheWxvYWRcbiAqL1xuXG5pbXBvcnQgeyBCdWZmZXIgfSBmcm9tIFwiYnVmZmVyL1wiO1xuaW1wb3J0IEJpblRvb2xzICBmcm9tICcuL2JpbnRvb2xzJztcbmltcG9ydCBCTiBmcm9tIFwiYm4uanNcIjtcbmltcG9ydCBXZWIzVXRpbHMgZnJvbSBcIndlYjMtdXRpbHNcIjtcblxuLyoqXG4gKiBAaWdub3JlXG4gKi9cbmNvbnN0IGJpbnRvb2xzID0gQmluVG9vbHMuZ2V0SW5zdGFuY2UoKTtcblxuLyoqXG4gKiBDbGFzcyBmb3IgZGV0ZXJtaW5pbmcgcGF5bG9hZCB0eXBlcyBhbmQgbWFuYWdpbmcgdGhlIGxvb2t1cCB0YWJsZS5cbiAqL1xuZXhwb3J0IGNsYXNzIFBheWxvYWRUeXBlcyB7XG4gICAgcHJpdmF0ZSBzdGF0aWMgaW5zdGFuY2U6IFBheWxvYWRUeXBlcztcbiAgICBwcm90ZWN0ZWQgdHlwZXM6QXJyYXk8c3RyaW5nPiA9IFtdO1xuXG4gICAgLyoqXG4gICAgICogR2l2ZW4gYW4gZW5jb2RlZCBwYXlsb2FkIGJ1ZmZlciByZXR1cm5zIHRoZSBwYXlsb2FkIGNvbnRlbnQgKG1pbnVzIHR5cGVJRCkuXG4gICAgICovXG4gICAgZ2V0Q29udGVudChwYXlsb2FkOkJ1ZmZlcik6QnVmZmVyIHtcbiAgICAgICAgY29uc3QgcGw6IEJ1ZmZlciA9IGJpbnRvb2xzLmNvcHlGcm9tKHBheWxvYWQsIDUpO1xuICAgICAgICByZXR1cm4gcGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2l2ZW4gYW4gZW5jb2RlZCBwYXlsb2FkIGJ1ZmZlciByZXR1cm5zIHRoZSBwYXlsb2FkICh3aXRoIHR5cGVJRCkuXG4gICAgICovXG4gICAgZ2V0UGF5bG9hZChwYXlsb2FkOkJ1ZmZlcik6QnVmZmVyIHtcbiAgICAgICAgY29uc3QgcGw6IEJ1ZmZlciA9IGJpbnRvb2xzLmNvcHlGcm9tKHBheWxvYWQsIDQpO1xuICAgICAgICByZXR1cm4gcGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2l2ZW4gYSBwYXlsb2FkIGJ1ZmZlciByZXR1cm5zIHRoZSBwcm9wZXIgVHlwZUlELlxuICAgICAqL1xuICAgIGdldFR5cGVJRChwYXlsb2FkOkJ1ZmZlcik6bnVtYmVyIHtcbiAgICAgICAgbGV0IG9mZnNldDpudW1iZXIgPSAwO1xuICAgICAgICBjb25zdCBzaXplOm51bWJlciA9IGJpbnRvb2xzLmNvcHlGcm9tKHBheWxvYWQsIG9mZnNldCwgNCkucmVhZFVJbnQzMkJFKDApO1xuICAgICAgICBvZmZzZXQgKz0gNDtcbiAgICAgICAgY29uc3QgdHlwZWlkOm51bWJlciA9IGJpbnRvb2xzLmNvcHlGcm9tKHBheWxvYWQsIG9mZnNldCwgb2Zmc2V0ICsgMSkucmVhZFVJbnQ4KDApO1xuICAgICAgICByZXR1cm4gdHlwZWlkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdpdmVuIGEgdHlwZSBzdHJpbmcgcmV0dXJucyB0aGUgcHJvcGVyIFR5cGVJRC5cbiAgICAgKi9cbiAgICBsb29rdXBJRCh0eXBlc3RyOnN0cmluZyk6bnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudHlwZXMuaW5kZXhPZih0eXBlc3RyKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHaXZlbiBhIFR5cGVJRCByZXR1cm5zIGEgc3RyaW5nIGRlc2NyaWJpbmcgdGhlIHBheWxvYWQgdHlwZS5cbiAgICAgKi9cbiAgICBsb29rdXBUeXBlKHZhbHVlOm51bWJlcik6c3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudHlwZXNbdmFsdWVdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdpdmVuIGEgVHlwZUlEIHJldHVybnMgdGhlIHByb3BlciBbW1BheWxvYWRCYXNlXV0uXG4gICAgICovXG4gICAgc2VsZWN0KHR5cGVpZDpudW1iZXIsIC4uLmFyZ3M6QXJyYXk8YW55Pik6UGF5bG9hZEJhc2Uge1xuICAgICAgICBzd2l0Y2godHlwZWlkKSB7XG4gICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBCSU5QYXlsb2FkKC4uLmFyZ3MpO1xuICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgVVRGOFBheWxvYWQoLi4uYXJncyk7XG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBIRVhTVFJQYXlsb2FkKC4uLmFyZ3MpO1xuICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgQjU4U1RSUGF5bG9hZCguLi5hcmdzKTtcbiAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEI2NFNUUlBheWxvYWQoLi4uYXJncyk7XG4gICAgICAgICAgICBjYXNlIDU6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBCSUdOVU1QYXlsb2FkKC4uLmFyZ3MpO1xuICAgICAgICAgICAgY2FzZSA2OlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgWENIQUlOQUREUlBheWxvYWQoLi4uYXJncyk7XG4gICAgICAgICAgICBjYXNlIDc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQQ0hBSU5BRERSUGF5bG9hZCguLi5hcmdzKTtcbiAgICAgICAgICAgIGNhc2UgODpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IENDSEFJTkFERFJQYXlsb2FkKC4uLmFyZ3MpO1xuICAgICAgICAgICAgY2FzZSA5OlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgVFhJRFBheWxvYWQoLi4uYXJncyk7XG4gICAgICAgICAgICBjYXNlIDEwOlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgQVNTRVRJRFBheWxvYWQoLi4uYXJncyk7XG4gICAgICAgICAgICBjYXNlIDExOlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgVVRYT0lEUGF5bG9hZCguLi5hcmdzKTtcbiAgICAgICAgICAgIGNhc2UgMTI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBORlRJRFBheWxvYWQoLi4uYXJncyk7XG4gICAgICAgICAgICBjYXNlIDEzOlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgU1VCTkVUSURQYXlsb2FkKC4uLmFyZ3MpO1xuICAgICAgICAgICAgY2FzZSAxNDpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IENIQUlOSURQYXlsb2FkKC4uLmFyZ3MpO1xuICAgICAgICAgICAgY2FzZSAxNTpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IE5PREVJRFBheWxvYWQoLi4uYXJncyk7XG4gICAgICAgICAgICBjYXNlIDE2OlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgU0VDUFNJR1BheWxvYWQoLi4uYXJncyk7XG4gICAgICAgICAgICBjYXNlIDE3OlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgU0VDUEVOQ1BheWxvYWQoLi4uYXJncyk7XG4gICAgICAgICAgICBjYXNlIDE4OlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgSlBFR1BheWxvYWQoLi4uYXJncyk7XG4gICAgICAgICAgICBjYXNlIDE5OlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgUE5HUGF5bG9hZCguLi5hcmdzKTtcbiAgICAgICAgICAgIGNhc2UgMjA6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBCTVBQYXlsb2FkKC4uLmFyZ3MpO1xuICAgICAgICAgICAgY2FzZSAyMTpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IElDT1BheWxvYWQoLi4uYXJncyk7XG4gICAgICAgICAgICBjYXNlIDIyOlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgU1ZHUGF5bG9hZCguLi5hcmdzKTtcbiAgICAgICAgICAgIGNhc2UgMjM6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBDU1ZQYXlsb2FkKC4uLmFyZ3MpO1xuICAgICAgICAgICAgY2FzZSAyNDpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEpTT05QYXlsb2FkKC4uLmFyZ3MpO1xuICAgICAgICAgICAgY2FzZSAyNTpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFlBTUxQYXlsb2FkKC4uLmFyZ3MpO1xuICAgICAgICAgICAgY2FzZSAyNjpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEVNQUlMUGF5bG9hZCguLi5hcmdzKTtcbiAgICAgICAgICAgIGNhc2UgMjc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBVUkxQYXlsb2FkKC4uLmFyZ3MpO1xuICAgICAgICAgICAgY2FzZSAyODpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IElQRlNQYXlsb2FkKC4uLmFyZ3MpO1xuICAgICAgICAgICAgY2FzZSAyOTpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IE9OSU9OUGF5bG9hZCguLi5hcmdzKTtcbiAgICAgICAgICAgIGNhc2UgMzA6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBNQUdORVRQYXlsb2FkKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkVycm9yIC0gUGF5bG9hZFR5cGVzLnNlbGVjdDogdW5rbm93biB0eXBlaWQgXCIgKyB0eXBlaWQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdpdmVuIGEgW1tQYXlsb2FkQmFzZV1dIHdoaWNoIG1heSBub3QgYmUgY2FzdCBwcm9wZXJseSwgcmV0dXJucyBhIHByb3Blcmx5IGNhc3QgW1tQYXlsb2FkQmFzZV1dLlxuICAgICAqL1xuICAgIHJlY2FzdCh1bmtub3dQYXlsb2FkOlBheWxvYWRCYXNlKTpQYXlsb2FkQmFzZSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNlbGVjdCh1bmtub3dQYXlsb2FkLnR5cGVJRCgpLCB1bmtub3dQYXlsb2FkLnJldHVyblR5cGUoKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgW1tQYXlsb2FkVHlwZXNdXSBzaW5nbGV0b24uXG4gICAgICovXG4gICAgc3RhdGljIGdldEluc3RhbmNlKCk6IFBheWxvYWRUeXBlcyB7XG4gICAgICAgIGlmICghUGF5bG9hZFR5cGVzLmluc3RhbmNlKSB7XG4gICAgICAgICAgICBQYXlsb2FkVHlwZXMuaW5zdGFuY2UgPSBuZXcgUGF5bG9hZFR5cGVzKCk7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgcmV0dXJuIFBheWxvYWRUeXBlcy5pbnN0YW5jZTtcbiAgICAgIH1cblxuICAgIHByaXZhdGUgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMudHlwZXMgPSBbXG4gICAgICAgICAgICBcIkJJTlwiLCBcIlVURjhcIiwgXCJIRVhTVFJcIiwgXCJCNThTVFJcIiwgXCJCNjRTVFJcIiwgXCJCSUdOVU1cIiwgXCJYQ0hBSU5BRERSXCIsIFwiUENIQUlOQUREUlwiLCBcIkNDSEFJTkFERFJcIiwgXCJUWElEXCIsIFxuICAgICAgICAgICAgXCJBU1NFVElEXCIsIFwiVVRYT0lEXCIsICBcIk5GVElEXCIsIFwiU1VCTkVUSURcIiwgXCJDSEFJTklEXCIsIFwiTk9ERUlEXCIsIFwiU0VDUFNJR1wiLCBcIlNFQ1BFTkNcIiwgXCJKUEVHXCIsIFwiUE5HXCIsIFxuICAgICAgICAgICAgXCJCTVBcIiwgXCJJQ09cIiwgXCJTVkdcIiwgXCJDU1ZcIiwgXCJKU09OXCIsIFwiWUFNTFwiLCBcIkVNQUlMXCIsIFwiVVJMXCIsIFwiSVBGU1wiLCBcIk9OSU9OXCIsIFwiTUFHTkVUXCJcbiAgICAgICAgXTtcbiAgICB9XG59XG5cbi8qKlxuICogQmFzZSBjbGFzcyBmb3IgcGF5bG9hZHMuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBQYXlsb2FkQmFzZSAge1xuICAgIHByb3RlY3RlZCBwYXlsb2FkOkJ1ZmZlciA9IEJ1ZmZlci5hbGxvYygwKTtcbiAgICBwcm90ZWN0ZWQgdHlwZWlkOm51bWJlciA9IHVuZGVmaW5lZDtcbiAgICBcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBUeXBlSUQgZm9yIHRoZSBwYXlsb2FkLlxuICAgICAqL1xuICAgIHR5cGVJRCgpOm51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLnR5cGVpZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBzdHJpbmcgbmFtZSBmb3IgdGhlIHBheWxvYWQncyB0eXBlLlxuICAgICAqL1xuICAgIHR5cGVOYW1lKCk6c3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIFBheWxvYWRUeXBlcy5nZXRJbnN0YW5jZSgpLmxvb2t1cFR5cGUodGhpcy50eXBlaWQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIHBheWxvYWQgY29udGVudCAobWludXMgdHlwZUlEKS5cbiAgICAgKi9cbiAgICBnZXRDb250ZW50KCk6QnVmZmVyIHtcbiAgICAgICAgY29uc3QgcGw6IEJ1ZmZlciA9IGJpbnRvb2xzLmNvcHlGcm9tKHRoaXMucGF5bG9hZCk7XG4gICAgICAgIHJldHVybiBwbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBwYXlsb2FkICh3aXRoIHR5cGVJRCkuXG4gICAgICovXG4gICAgZ2V0UGF5bG9hZCgpOkJ1ZmZlciB7XG4gICAgICAgIGxldCB0eXBlaWQ6QnVmZmVyID0gQnVmZmVyLmFsbG9jKDEpO1xuICAgICAgICB0eXBlaWQud3JpdGVVSW50OCh0aGlzLnR5cGVpZCwgMCk7XG4gICAgICAgIGNvbnN0IHBsOiBCdWZmZXIgPSBCdWZmZXIuY29uY2F0KFt0eXBlaWQsIGJpbnRvb2xzLmNvcHlGcm9tKHRoaXMucGF5bG9hZCldKTtcbiAgICAgICAgcmV0dXJuIHBsOyBcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEZWNvZGVzIHRoZSBwYXlsb2FkIGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gaW5jbHVkaW5nIDQgYnl0ZXMgZm9yIHRoZSBsZW5ndGggYW5kIFR5cGVJRC5cbiAgICAgKi9cbiAgICBmcm9tQnVmZmVyKGJ5dGVzOkJ1ZmZlciwgb2Zmc2V0Om51bWJlciA9IDApOm51bWJlciB7XG4gICAgICAgIGxldCBzaXplOm51bWJlciA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDQpLnJlYWRVSW50MzJCRSgwKTtcbiAgICAgICAgb2Zmc2V0ICs9IDQ7XG4gICAgICAgIHRoaXMudHlwZWlkID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgMSkucmVhZFVJbnQ4KDApO1xuICAgICAgICBvZmZzZXQgKz0gMVxuICAgICAgICB0aGlzLnBheWxvYWQgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyBzaXplIC0gMSk7XG4gICAgICAgIG9mZnNldCArPSBzaXplLTFcbiAgICAgICAgcmV0dXJuIG9mZnNldDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFbmNvZGVzIHRoZSBwYXlsb2FkIGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gaW5jbHVkaW5nIDQgYnl0ZXMgZm9yIHRoZSBsZW5ndGggYW5kIFR5cGVJRC5cbiAgICAgKi9cbiAgICB0b0J1ZmZlcigpOkJ1ZmZlciB7XG4gICAgICAgIGxldCBzaXplYnVmZjpCdWZmZXIgPSBCdWZmZXIuYWxsb2MoNCk7XG4gICAgICAgIHNpemVidWZmLndyaXRlVUludDMyQkUodGhpcy5wYXlsb2FkLmxlbmd0aCArIDEsIDApO1xuICAgICAgICBsZXQgdHlwZWJ1ZmY6QnVmZmVyID0gQnVmZmVyLmFsbG9jKDEpO1xuICAgICAgICB0eXBlYnVmZi53cml0ZVVJbnQ4KHRoaXMudHlwZWlkLCAwKTtcbiAgICAgICAgcmV0dXJuIEJ1ZmZlci5jb25jYXQoW3NpemVidWZmLCB0eXBlYnVmZiwgdGhpcy5wYXlsb2FkXSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgZXhwZWN0ZWQgdHlwZSBmb3IgdGhlIHBheWxvYWQuXG4gICAgICovXG4gICAgYWJzdHJhY3QgcmV0dXJuVHlwZSguLi5hcmdzOmFueSk6YW55O1xuXG4gICAgY29uc3RydWN0b3IoKXt9XG5cbn1cblxuLyoqXG4gKiBDbGFzcyBmb3IgcGF5bG9hZHMgcmVwcmVzZW50aW5nIHNpbXBsZSBiaW5hcnkgYmxvYnMuXG4gKi9cbmV4cG9ydCBjbGFzcyBCSU5QYXlsb2FkIGV4dGVuZHMgUGF5bG9hZEJhc2Uge1xuICAgIHByb3RlY3RlZCB0eXBlaWQgPSAwO1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IGZvciB0aGUgcGF5bG9hZC5cbiAgICAgKi9cbiAgICByZXR1cm5UeXBlKCk6QnVmZmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGF5bG9hZDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQHBhcmFtIHBheWxvYWQgQnVmZmVyIG9ubHlcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihwYXlsb2FkOmFueSA9IHVuZGVmaW5lZCl7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIGlmKHBheWxvYWQgaW5zdGFuY2VvZiBCdWZmZXIpIHtcbiAgICAgICAgICAgIHRoaXMucGF5bG9hZCA9IHBheWxvYWQ7XG4gICAgICAgIH0gZWxzZSBpZih0eXBlb2YgcGF5bG9hZCA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgdGhpcy5wYXlsb2FkID0gYmludG9vbHMuYjU4VG9CdWZmZXIocGF5bG9hZCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogQ2xhc3MgZm9yIHBheWxvYWRzIHJlcHJlc2VudGluZyBVVEY4IGVuY29kaW5nLlxuICovXG5leHBvcnQgY2xhc3MgVVRGOFBheWxvYWQgZXh0ZW5kcyBQYXlsb2FkQmFzZSB7XG4gICAgcHJvdGVjdGVkIHR5cGVpZCA9IDE7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgc3RyaW5nIGZvciB0aGUgcGF5bG9hZC5cbiAgICAgKi9cbiAgICByZXR1cm5UeXBlKCk6c3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGF5bG9hZC50b1N0cmluZyhcInV0ZjhcIik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEBwYXJhbSBwYXlsb2FkIEJ1ZmZlciB1dGY4IHN0cmluZ1xuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHBheWxvYWQ6YW55ID0gdW5kZWZpbmVkKXtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgaWYocGF5bG9hZCBpbnN0YW5jZW9mIEJ1ZmZlcil7XG4gICAgICAgICAgICB0aGlzLnBheWxvYWQgPSBwYXlsb2FkO1xuICAgICAgICB9IGVsc2UgaWYodHlwZW9mIHBheWxvYWQgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIHRoaXMucGF5bG9hZCA9IEJ1ZmZlci5mcm9tKHBheWxvYWQsIFwidXRmOFwiKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBDbGFzcyBmb3IgcGF5bG9hZHMgcmVwcmVzZW50aW5nIEhleGFkZWNpbWFsIGVuY29kaW5nLlxuICovXG5leHBvcnQgY2xhc3MgSEVYU1RSUGF5bG9hZCBleHRlbmRzIFBheWxvYWRCYXNlIHtcbiAgICBwcm90ZWN0ZWQgdHlwZWlkID0gMjtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBoZXggc3RyaW5nIGZvciB0aGUgcGF5bG9hZC5cbiAgICAgKi9cbiAgICByZXR1cm5UeXBlKCk6c3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGF5bG9hZC50b1N0cmluZyhcImhleFwiKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQHBhcmFtIHBheWxvYWQgQnVmZmVyIG9yIGhleCBzdHJpbmdcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihwYXlsb2FkOmFueSA9IHVuZGVmaW5lZCl7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIGlmKHBheWxvYWQgaW5zdGFuY2VvZiBCdWZmZXIpe1xuICAgICAgICAgICAgdGhpcy5wYXlsb2FkID0gcGF5bG9hZDtcbiAgICAgICAgfSBlbHNlIGlmKHR5cGVvZiBwYXlsb2FkID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICBpZihwYXlsb2FkLnN0YXJ0c1dpdGgoXCIweFwiKSB8fCFwYXlsb2FkLm1hdGNoKC9eWzAtOUEtRmEtZl0rJC8pICl7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSEVYU1RSUGF5bG9hZC5jb25zdHJ1Y3RvciAtLSBoZXggc3RyaW5nIG1heSBub3Qgc3RhcnQgd2l0aCAweCBhbmQgbXVzdCBiZSBpbiAvXlswLTlBLUZhLWZdKyQvOiBcIiArIHBheWxvYWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5wYXlsb2FkID0gQnVmZmVyLmZyb20ocGF5bG9hZCwgXCJoZXhcIik7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogQ2xhc3MgZm9yIHBheWxvYWRzIHJlcHJlc2VudGluZyBCYXNlNTggZW5jb2RpbmcuXG4gKi9cbmV4cG9ydCBjbGFzcyBCNThTVFJQYXlsb2FkIGV4dGVuZHMgUGF5bG9hZEJhc2Uge1xuICAgIHByb3RlY3RlZCB0eXBlaWQgPSAzO1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIGJhc2U1OCBzdHJpbmcgZm9yIHRoZSBwYXlsb2FkLlxuICAgICAqL1xuICAgIHJldHVyblR5cGUoKTpzdHJpbmcge1xuICAgICAgICByZXR1cm4gYmludG9vbHMuYnVmZmVyVG9CNTgodGhpcy5wYXlsb2FkKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQHBhcmFtIHBheWxvYWQgQnVmZmVyIG9yIGNiNTggZW5jb2RlZCBzdHJpbmdcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihwYXlsb2FkOmFueSA9IHVuZGVmaW5lZCl7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIGlmKHBheWxvYWQgaW5zdGFuY2VvZiBCdWZmZXIpe1xuICAgICAgICAgICAgdGhpcy5wYXlsb2FkID0gcGF5bG9hZDtcbiAgICAgICAgfSBlbHNlIGlmKHR5cGVvZiBwYXlsb2FkID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICB0aGlzLnBheWxvYWQgPSBiaW50b29scy5iNThUb0J1ZmZlcihwYXlsb2FkKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBDbGFzcyBmb3IgcGF5bG9hZHMgcmVwcmVzZW50aW5nIEJhc2U2NCBlbmNvZGluZy5cbiAqL1xuZXhwb3J0IGNsYXNzIEI2NFNUUlBheWxvYWQgZXh0ZW5kcyBQYXlsb2FkQmFzZSB7XG4gICAgcHJvdGVjdGVkIHR5cGVpZCA9IDQ7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgYmFzZTY0IHN0cmluZyBmb3IgdGhlIHBheWxvYWQuXG4gICAgICovXG4gICAgcmV0dXJuVHlwZSgpOnN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLnBheWxvYWQudG9TdHJpbmcoXCJiYXNlNjRcIik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEBwYXJhbSBwYXlsb2FkIEJ1ZmZlciBvZiBiYXNlNjQgc3RyaW5nXG4gICAgICovXG4gICAgY29uc3RydWN0b3IocGF5bG9hZDphbnkgPSB1bmRlZmluZWQpe1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICBpZihwYXlsb2FkIGluc3RhbmNlb2YgQnVmZmVyKXtcbiAgICAgICAgICAgIHRoaXMucGF5bG9hZCA9IHBheWxvYWQ7XG4gICAgICAgIH0gZWxzZSBpZih0eXBlb2YgcGF5bG9hZCA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgdGhpcy5wYXlsb2FkID0gQnVmZmVyLmZyb20ocGF5bG9hZCwgXCJiYXNlNjRcIik7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogQ2xhc3MgZm9yIHBheWxvYWRzIHJlcHJlc2VudGluZyBCaWcgTnVtYmVycy5cbiAqIFxuICogQHBhcmFtIHBheWxvYWQgQWNjZXB0cyBhIEJ1ZmZlciwgQk4sIG9yIGJhc2U2NCBzdHJpbmdcbiAqL1xuZXhwb3J0IGNsYXNzIEJJR05VTVBheWxvYWQgZXh0ZW5kcyBQYXlsb2FkQmFzZSB7XG4gICAgcHJvdGVjdGVkIHR5cGVpZCA9IDU7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn0gZm9yIHRoZSBwYXlsb2FkLlxuICAgICAqL1xuICAgIHJldHVyblR5cGUoKTpCTiB7XG4gICAgICAgIHJldHVybiBiaW50b29scy5mcm9tQnVmZmVyVG9CTih0aGlzLnBheWxvYWQpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBAcGFyYW0gcGF5bG9hZCBCdWZmZXIsIEJOLCBvciBiYXNlNjQgc3RyaW5nXG4gICAgICovXG4gICAgY29uc3RydWN0b3IocGF5bG9hZDphbnkgPSB1bmRlZmluZWQpe1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICBpZihwYXlsb2FkIGluc3RhbmNlb2YgQnVmZmVyKXtcbiAgICAgICAgICAgIHRoaXMucGF5bG9hZCA9IHBheWxvYWQ7XG4gICAgICAgIH0gZWxzZSBpZiAocGF5bG9hZCBpbnN0YW5jZW9mIEJOKSB7XG4gICAgICAgICAgICB0aGlzLnBheWxvYWQgPSBiaW50b29scy5mcm9tQk5Ub0J1ZmZlcihwYXlsb2FkKTtcbiAgICAgICAgfSBlbHNlIGlmKHR5cGVvZiBwYXlsb2FkID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICB0aGlzLnBheWxvYWQgPSBCdWZmZXIuZnJvbShwYXlsb2FkLCBcImhleFwiKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBDbGFzcyBmb3IgcGF5bG9hZHMgcmVwcmVzZW50aW5nIGNoYWluIGFkZHJlc3Nlcy5cbiAqIFxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ2hhaW5BZGRyZXNzUGF5bG9hZCBleHRlbmRzIFBheWxvYWRCYXNlIHtcbiAgICBwcm90ZWN0ZWQgdHlwZWlkID0gNjtcbiAgICBwcm90ZWN0ZWQgY2hhaW5pZDpzdHJpbmcgPSBcIlwiO1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgY2hhaW5pZC5cbiAgICAgKi9cbiAgICByZXR1cm5DaGFpbklEKCk6c3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2hhaW5pZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGFuIGFkZHJlc3Mgc3RyaW5nIGZvciB0aGUgcGF5bG9hZC5cbiAgICAgKi9cbiAgICByZXR1cm5UeXBlKGhycDpzdHJpbmcpOnN0cmluZyB7XG4gICAgICAgIHJldHVybiBiaW50b29scy5hZGRyZXNzVG9TdHJpbmcoaHJwLCB0aGlzLmNoYWluaWQsIHRoaXMucGF5bG9hZCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEBwYXJhbSBwYXlsb2FkIEJ1ZmZlciBvciBhZGRyZXNzIHN0cmluZ1xuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHBheWxvYWQ6YW55ID0gdW5kZWZpbmVkKXtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgaWYocGF5bG9hZCBpbnN0YW5jZW9mIEJ1ZmZlcil7XG4gICAgICAgICAgICB0aGlzLnBheWxvYWQgPSBwYXlsb2FkO1xuICAgICAgICB9IGVsc2UgaWYodHlwZW9mIHBheWxvYWQgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIHRoaXMucGF5bG9hZCA9IGJpbnRvb2xzLnN0cmluZ1RvQWRkcmVzcyhwYXlsb2FkKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBDbGFzcyBmb3IgcGF5bG9hZHMgcmVwcmVzZW50aW5nIFgtQ2hpbiBhZGRyZXNzZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBYQ0hBSU5BRERSUGF5bG9hZCBleHRlbmRzIENoYWluQWRkcmVzc1BheWxvYWQge1xuICAgIHByb3RlY3RlZCB0eXBlaWQgPSA2O1xuICAgIHByb3RlY3RlZCBjaGFpbmlkID0gXCJYXCI7XG59XG5cbi8qKlxuICogQ2xhc3MgZm9yIHBheWxvYWRzIHJlcHJlc2VudGluZyBQLUNoYWluIGFkZHJlc3Nlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIFBDSEFJTkFERFJQYXlsb2FkIGV4dGVuZHMgQ2hhaW5BZGRyZXNzUGF5bG9hZCB7XG4gICAgcHJvdGVjdGVkIHR5cGVpZCA9IDc7XG4gICAgcHJvdGVjdGVkIGNoYWluaWQgPSBcIlBcIjtcbn1cblxuLyoqXG4gKiBDbGFzcyBmb3IgcGF5bG9hZHMgcmVwcmVzZW50aW5nIEMtQ2hhaW4gYWRkcmVzc2VzLlxuICovXG5leHBvcnQgY2xhc3MgQ0NIQUlOQUREUlBheWxvYWQgZXh0ZW5kcyBDaGFpbkFkZHJlc3NQYXlsb2FkIHtcbiAgICBwcm90ZWN0ZWQgdHlwZWlkID0gODtcbiAgICBwcm90ZWN0ZWQgY2hhaW5pZCA9IFwiQ1wiO1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhbiBhZGRyZXNzIHN0cmluZyBmb3IgdGhlIHBheWxvYWQuXG4gICAgICovXG4gICAgcmV0dXJuVHlwZSgpOnN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmNoYWluaWQgKyBcIi1cIiArIFdlYjNVdGlscy50b0NoZWNrc3VtQWRkcmVzcyhcIjB4XCIgKyB0aGlzLnBheWxvYWQudG9TdHJpbmcoXCJoZXhcIikpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBDbGFzcyBmb3IgcGF5bG9hZHMgcmVwcmVzZW50aW5nIGRhdGEgc2VyaWFsaXplZCBieSBiaW50b29scy5jYjU4RW5jb2RlKCkuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBjYjU4RW5jb2RlZFBheWxvYWQgZXh0ZW5kcyBQYXlsb2FkQmFzZSB7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgYmludG9vbHMuY2I1OEVuY29kZWQgc3RyaW5nIGZvciB0aGUgcGF5bG9hZC5cbiAgICAgKi9cbiAgICByZXR1cm5UeXBlKCk6c3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGJpbnRvb2xzLmNiNThFbmNvZGUodGhpcy5wYXlsb2FkKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQHBhcmFtIHBheWxvYWQgQnVmZmVyIG9yIGNiNTggZW5jb2RlZCBzdHJpbmdcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihwYXlsb2FkOmFueSA9IHVuZGVmaW5lZCl7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIGlmKHBheWxvYWQgaW5zdGFuY2VvZiBCdWZmZXIpe1xuICAgICAgICAgICAgdGhpcy5wYXlsb2FkID0gcGF5bG9hZDtcbiAgICAgICAgfSBlbHNlIGlmKHR5cGVvZiBwYXlsb2FkID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICB0aGlzLnBheWxvYWQgPSBiaW50b29scy5jYjU4RGVjb2RlKHBheWxvYWQpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIENsYXNzIGZvciBwYXlsb2FkcyByZXByZXNlbnRpbmcgVHhJRHMuXG4gKi9cbmV4cG9ydCBjbGFzcyBUWElEUGF5bG9hZCBleHRlbmRzIGNiNThFbmNvZGVkUGF5bG9hZCB7XG4gICAgcHJvdGVjdGVkIHR5cGVpZCA9IDk7XG59XG5cbi8qKlxuICogQ2xhc3MgZm9yIHBheWxvYWRzIHJlcHJlc2VudGluZyBBc3NldElEcy5cbiAqL1xuZXhwb3J0IGNsYXNzIEFTU0VUSURQYXlsb2FkIGV4dGVuZHMgY2I1OEVuY29kZWRQYXlsb2FkIHtcbiAgICBwcm90ZWN0ZWQgdHlwZWlkID0gMTA7XG59XG5cbi8qKlxuICogQ2xhc3MgZm9yIHBheWxvYWRzIHJlcHJlc2VudGluZyBOT0RFSURzLlxuICovXG5leHBvcnQgY2xhc3MgVVRYT0lEUGF5bG9hZCBleHRlbmRzIGNiNThFbmNvZGVkUGF5bG9hZCB7XG4gICAgcHJvdGVjdGVkIHR5cGVpZCA9IDExO1xufVxuXG4vKipcbiAqIENsYXNzIGZvciBwYXlsb2FkcyByZXByZXNlbnRpbmcgTkZUSURzIChVVFhPSURzIGluIGFuIE5GVCBjb250ZXh0KS5cbiAqL1xuZXhwb3J0IGNsYXNzIE5GVElEUGF5bG9hZCBleHRlbmRzIFVUWE9JRFBheWxvYWQge1xuICAgIHByb3RlY3RlZCB0eXBlaWQgPSAxMjtcbn1cblxuLyoqXG4gKiBDbGFzcyBmb3IgcGF5bG9hZHMgcmVwcmVzZW50aW5nIFN1Ym5ldElEcy5cbiAqL1xuZXhwb3J0IGNsYXNzIFNVQk5FVElEUGF5bG9hZCBleHRlbmRzIGNiNThFbmNvZGVkUGF5bG9hZCB7XG4gICAgcHJvdGVjdGVkIHR5cGVpZCA9IDEzO1xufVxuXG4vKipcbiAqIENsYXNzIGZvciBwYXlsb2FkcyByZXByZXNlbnRpbmcgQ2hhaW5JRHMuXG4gKi9cbmV4cG9ydCBjbGFzcyBDSEFJTklEUGF5bG9hZCBleHRlbmRzIGNiNThFbmNvZGVkUGF5bG9hZCB7XG4gICAgcHJvdGVjdGVkIHR5cGVpZCA9IDE0O1xufVxuXG4vKipcbiAqIENsYXNzIGZvciBwYXlsb2FkcyByZXByZXNlbnRpbmcgTm9kZUlEcy5cbiAqL1xuZXhwb3J0IGNsYXNzIE5PREVJRFBheWxvYWQgZXh0ZW5kcyBjYjU4RW5jb2RlZFBheWxvYWQge1xuICAgIHByb3RlY3RlZCB0eXBlaWQgPSAxNTtcbn1cblxuLyoqXG4gKiBDbGFzcyBmb3IgcGF5bG9hZHMgcmVwcmVzZW50aW5nIHNlY3AyNTZrMSBzaWduYXR1cmVzLlxuICogY29udmVudGlvbjogc2VjcDI1NmsxIHNpZ25hdHVyZSAoMTMwIGJ5dGVzKVxuICovXG5leHBvcnQgY2xhc3MgU0VDUFNJR1BheWxvYWQgZXh0ZW5kcyBCNThTVFJQYXlsb2FkIHtcbiAgICBwcm90ZWN0ZWQgdHlwZWlkID0gMTY7XG59XG5cbi8qKlxuICogQ2xhc3MgZm9yIHBheWxvYWRzIHJlcHJlc2VudGluZyBzZWNwMjU2azEgZW5jcnlwdGVkIG1lc3NhZ2VzLlxuICogY29udmVudGlvbjogcHVibGljIGtleSAoNjUgYnl0ZXMpICsgc2VjcDI1NmsxIGVuY3J5cHRlZCBtZXNzYWdlIGZvciB0aGF0IHB1YmxpYyBrZXlcbiAqL1xuZXhwb3J0IGNsYXNzIFNFQ1BFTkNQYXlsb2FkIGV4dGVuZHMgQjU4U1RSUGF5bG9hZCB7XG4gICAgcHJvdGVjdGVkIHR5cGVpZCA9IDE3O1xufVxuXG4vKipcbiAqIENsYXNzIGZvciBwYXlsb2FkcyByZXByZXNlbnRpbmcgSlBFRyBpbWFnZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBKUEVHUGF5bG9hZCBleHRlbmRzIEJJTlBheWxvYWQge1xuICAgIHByb3RlY3RlZCB0eXBlaWQgPSAxODtcbn1cblxuZXhwb3J0IGNsYXNzIFBOR1BheWxvYWQgZXh0ZW5kcyBCSU5QYXlsb2FkIHtcbiAgICBwcm90ZWN0ZWQgdHlwZWlkID0gMTk7XG59XG5cbi8qKlxuICogQ2xhc3MgZm9yIHBheWxvYWRzIHJlcHJlc2VudGluZyBCTVAgaW1hZ2VzLlxuICovXG5leHBvcnQgY2xhc3MgQk1QUGF5bG9hZCBleHRlbmRzIEJJTlBheWxvYWQge1xuICAgIHByb3RlY3RlZCB0eXBlaWQgPSAyMDtcbn1cblxuLyoqXG4gKiBDbGFzcyBmb3IgcGF5bG9hZHMgcmVwcmVzZW50aW5nIElDTyBpbWFnZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBJQ09QYXlsb2FkIGV4dGVuZHMgQklOUGF5bG9hZCB7XG4gICAgcHJvdGVjdGVkIHR5cGVpZCA9IDIxO1xufVxuXG4vKipcbiAqIENsYXNzIGZvciBwYXlsb2FkcyByZXByZXNlbnRpbmcgU1ZHIGltYWdlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIFNWR1BheWxvYWQgZXh0ZW5kcyBVVEY4UGF5bG9hZCB7XG4gICAgcHJvdGVjdGVkIHR5cGVpZCA9IDIyO1xufVxuXG4vKipcbiAqIENsYXNzIGZvciBwYXlsb2FkcyByZXByZXNlbnRpbmcgQ1NWIGZpbGVzLlxuICovXG5leHBvcnQgY2xhc3MgQ1NWUGF5bG9hZCBleHRlbmRzIFVURjhQYXlsb2FkIHtcbiAgICBwcm90ZWN0ZWQgdHlwZWlkID0gMjM7XG59XG5cbi8qKlxuICogQ2xhc3MgZm9yIHBheWxvYWRzIHJlcHJlc2VudGluZyBKU09OIHN0cmluZ3MuXG4gKi9cbmV4cG9ydCBjbGFzcyBKU09OUGF5bG9hZCBleHRlbmRzIFBheWxvYWRCYXNlIHtcbiAgICBwcm90ZWN0ZWQgdHlwZWlkID0gMjQ7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgSlNPTi1kZWNvZGVkIG9iamVjdCBmb3IgdGhlIHBheWxvYWQuXG4gICAgICovXG4gICAgcmV0dXJuVHlwZSgpOmFueSB7XG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKHRoaXMucGF5bG9hZC50b1N0cmluZyhcInV0ZjhcIikpO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKHBheWxvYWQ6YW55ID0gdW5kZWZpbmVkKXtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgaWYocGF5bG9hZCBpbnN0YW5jZW9mIEJ1ZmZlcil7XG4gICAgICAgICAgICB0aGlzLnBheWxvYWQgPSBwYXlsb2FkO1xuICAgICAgICB9IGVsc2UgaWYodHlwZW9mIHBheWxvYWQgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIHRoaXMucGF5bG9hZCA9IEJ1ZmZlci5mcm9tKHBheWxvYWQsIFwidXRmOFwiKTtcbiAgICAgICAgfSBlbHNlIGlmKHBheWxvYWQpIHtcbiAgICAgICAgICAgIGxldCBqc29uc3RyOnN0cmluZyA9IEpTT04uc3RyaW5naWZ5KHBheWxvYWQpO1xuICAgICAgICAgICAgdGhpcy5wYXlsb2FkID0gQnVmZmVyLmZyb20oanNvbnN0ciwgXCJ1dGY4XCIpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIENsYXNzIGZvciBwYXlsb2FkcyByZXByZXNlbnRpbmcgWUFNTCBkZWZpbml0aW9ucy5cbiAqL1xuZXhwb3J0IGNsYXNzIFlBTUxQYXlsb2FkIGV4dGVuZHMgVVRGOFBheWxvYWQge1xuICAgIHByb3RlY3RlZCB0eXBlaWQgPSAyNTtcbn1cblxuLyoqXG4gKiBDbGFzcyBmb3IgcGF5bG9hZHMgcmVwcmVzZW50aW5nIGVtYWlsIGFkZHJlc3Nlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIEVNQUlMUGF5bG9hZCBleHRlbmRzIFVURjhQYXlsb2FkIHtcbiAgICBwcm90ZWN0ZWQgdHlwZWlkID0gMjY7XG59XG5cbi8qKlxuICogQ2xhc3MgZm9yIHBheWxvYWRzIHJlcHJlc2VudGluZyBVUkwgc3RyaW5ncy5cbiAqL1xuZXhwb3J0IGNsYXNzIFVSTFBheWxvYWQgZXh0ZW5kcyBVVEY4UGF5bG9hZCB7XG4gICAgcHJvdGVjdGVkIHR5cGVpZCA9IDI3O1xufVxuXG4vKipcbiAqIENsYXNzIGZvciBwYXlsb2FkcyByZXByZXNlbnRpbmcgSVBGUyBhZGRyZXNzZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBJUEZTUGF5bG9hZCBleHRlbmRzIEI1OFNUUlBheWxvYWQge1xuICAgIHByb3RlY3RlZCB0eXBlaWQgPSAyODtcbn1cblxuLyoqXG4gKiBDbGFzcyBmb3IgcGF5bG9hZHMgcmVwcmVzZW50aW5nIG9uaW9uIFVSTHMuXG4gKi9cbmV4cG9ydCBjbGFzcyBPTklPTlBheWxvYWQgZXh0ZW5kcyBVVEY4UGF5bG9hZCB7XG4gICAgcHJvdGVjdGVkIHR5cGVpZCA9IDI5O1xufVxuXG4vKipcbiAqIENsYXNzIGZvciBwYXlsb2FkcyByZXByZXNlbnRpbmcgdG9ycmVudCBtYWduZXQgbGlua3MuXG4gKi9cbmV4cG9ydCBjbGFzcyBNQUdORVRQYXlsb2FkIGV4dGVuZHMgVVRGOFBheWxvYWQge1xuICAgIHByb3RlY3RlZCB0eXBlaWQgPSAzMDtcbn1cbiJdfQ==