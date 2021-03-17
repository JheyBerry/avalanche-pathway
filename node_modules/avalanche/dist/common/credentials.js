"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Credential = exports.Signature = exports.SigIdx = void 0;
/**
 * @packageDocumentation
 * @module Common-Signature
 */
const nbytes_1 = require("./nbytes");
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("../utils/bintools"));
const serialization_1 = require("../utils/serialization");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
const serializer = serialization_1.Serialization.getInstance();
/**
 * Type representing a [[Signature]] index used in [[Input]]
 */
class SigIdx extends nbytes_1.NBytes {
    /**
     * Type representing a [[Signature]] index used in [[Input]]
     */
    constructor() {
        super();
        this._typeName = "SigIdx";
        this._typeID = undefined;
        this.source = buffer_1.Buffer.alloc(20);
        this.bytes = buffer_1.Buffer.alloc(4);
        this.bsize = 4;
        /**
         * Sets the source address for the signature
         */
        this.setSource = (address) => {
            this.source = address;
        };
        /**
         * Retrieves the source address for the signature
         */
        this.getSource = () => this.source;
    }
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { "source": serializer.encoder(this.source, encoding, "Buffer", "hex") });
    }
    ;
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.source = serializer.decoder(fields["source"], encoding, "hex", "Buffer");
    }
    clone() {
        let newbase = new SigIdx();
        newbase.fromBuffer(this.toBuffer());
        return newbase;
    }
    create(...args) {
        return new SigIdx();
    }
}
exports.SigIdx = SigIdx;
/**
 * Signature for a [[Tx]]
 */
class Signature extends nbytes_1.NBytes {
    /**
     * Signature for a [[Tx]]
     */
    constructor() {
        super();
        this._typeName = "Signature";
        this._typeID = undefined;
        //serialize and deserialize both are inherited
        this.bytes = buffer_1.Buffer.alloc(65);
        this.bsize = 65;
    }
    clone() {
        let newbase = new Signature();
        newbase.fromBuffer(this.toBuffer());
        return newbase;
    }
    create(...args) {
        return new Signature();
    }
}
exports.Signature = Signature;
class Credential extends serialization_1.Serializable {
    constructor(sigarray = undefined) {
        super();
        this._typeName = "Credential";
        this._typeID = undefined;
        this.sigArray = [];
        /**
           * Adds a signature to the credentials and returns the index off the added signature.
           */
        this.addSignature = (sig) => {
            this.sigArray.push(sig);
            return this.sigArray.length - 1;
        };
        if (typeof sigarray !== 'undefined') {
            /* istanbul ignore next */
            this.sigArray = sigarray;
        }
    }
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { "sigArray": this.sigArray.map((s) => s.serialize(encoding)) });
    }
    ;
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.sigArray = fields["sigArray"].map((s) => {
            let sig = new Signature();
            sig.deserialize(s, encoding);
            return sig;
        });
    }
    setCodecID(codecID) { }
    ;
    fromBuffer(bytes, offset = 0) {
        const siglen = bintools.copyFrom(bytes, offset, offset + 4).readUInt32BE(0);
        offset += 4;
        this.sigArray = [];
        for (let i = 0; i < siglen; i++) {
            const sig = new Signature();
            offset = sig.fromBuffer(bytes, offset);
            this.sigArray.push(sig);
        }
        return offset;
    }
    toBuffer() {
        const siglen = buffer_1.Buffer.alloc(4);
        siglen.writeInt32BE(this.sigArray.length, 0);
        const barr = [siglen];
        let bsize = siglen.length;
        for (let i = 0; i < this.sigArray.length; i++) {
            const sigbuff = this.sigArray[i].toBuffer();
            bsize += sigbuff.length;
            barr.push(sigbuff);
        }
        return buffer_1.Buffer.concat(barr, bsize);
    }
}
exports.Credential = Credential;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlZGVudGlhbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbW9uL2NyZWRlbnRpYWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7R0FHRztBQUNILHFDQUFrQztBQUNsQyxvQ0FBaUM7QUFDakMsaUVBQXlDO0FBQ3pDLDBEQUF5RjtBQUd6Rjs7R0FFRztBQUNILE1BQU0sUUFBUSxHQUFZLGtCQUFRLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDakQsTUFBTSxVQUFVLEdBQUcsNkJBQWEsQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUUvQzs7R0FFRztBQUNILE1BQWEsTUFBTyxTQUFRLGVBQU07SUEyQ2hDOztPQUVHO0lBQ0g7UUFDSSxLQUFLLEVBQUUsQ0FBQztRQTlDRixjQUFTLEdBQUcsUUFBUSxDQUFDO1FBQ3JCLFlBQU8sR0FBRyxTQUFTLENBQUM7UUFjcEIsV0FBTSxHQUFVLGVBQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDakMsVUFBSyxHQUFHLGVBQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDeEIsVUFBSyxHQUFHLENBQUMsQ0FBQztRQUVwQjs7V0FFRztRQUNILGNBQVMsR0FBRyxDQUFDLE9BQWMsRUFBRSxFQUFFO1lBQzNCLElBQUksQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDO1FBQzFCLENBQUMsQ0FBQztRQUVGOztXQUVHO1FBQ0gsY0FBUyxHQUFHLEdBQVUsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7SUFrQnJDLENBQUM7SUE1Q0QsU0FBUyxDQUFDLFdBQThCLEtBQUs7UUFDM0MsSUFBSSxNQUFNLEdBQVUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM5Qyx1Q0FDSyxNQUFNLEtBQ1QsUUFBUSxFQUFFLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFF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RCxNQUFNLE9BQU8sR0FBVSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ25ELEtBQUssSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDO1lBQ3hCLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDcEI7UUFDRCxPQUFPLGVBQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3BDLENBQUM7Q0FlRjtBQXZFRCxnQ0F1RUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBwYWNrYWdlRG9jdW1lbnRhdGlvblxuICogQG1vZHVsZSBDb21tb24tU2lnbmF0dXJlXG4gKi9cbmltcG9ydCB7IE5CeXRlcyB9IGZyb20gJy4vbmJ5dGVzJztcbmltcG9ydCB7IEJ1ZmZlciB9IGZyb20gJ2J1ZmZlci8nO1xuaW1wb3J0IEJpblRvb2xzIGZyb20gJy4uL3V0aWxzL2JpbnRvb2xzJztcbmltcG9ydCB7IFNlcmlhbGl6YWJsZSwgU2VyaWFsaXphdGlvbiwgU2VyaWFsaXplZEVuY29kaW5nIH0gZnJvbSAnLi4vdXRpbHMvc2VyaWFsaXphdGlvbic7XG5cblxuLyoqXG4gKiBAaWdub3JlXG4gKi9cbmNvbnN0IGJpbnRvb2xzOkJpblRvb2xzID0gQmluVG9vbHMuZ2V0SW5zdGFuY2UoKTtcbmNvbnN0IHNlcmlhbGl6ZXIgPSBTZXJpYWxpemF0aW9uLmdldEluc3RhbmNlKCk7XG5cbi8qKlxuICogVHlwZSByZXByZXNlbnRpbmcgYSBbW1NpZ25hdHVyZV1dIGluZGV4IHVzZWQgaW4gW1tJbnB1dF1dXG4gKi9cbmV4cG9ydCBjbGFzcyBTaWdJZHggZXh0ZW5kcyBOQnl0ZXMge1xuICBwcm90ZWN0ZWQgX3R5cGVOYW1lID0gXCJTaWdJZHhcIjtcbiAgcHJvdGVjdGVkIF90eXBlSUQgPSB1bmRlZmluZWQ7XG5cbiAgc2VyaWFsaXplKGVuY29kaW5nOlNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpOm9iamVjdCB7XG4gICAgbGV0IGZpZWxkczpvYmplY3QgPSBzdXBlci5zZXJpYWxpemUoZW5jb2RpbmcpO1xuICAgIHJldHVybiB7XG4gICAgICAuLi5maWVsZHMsXG4gICAgICBcInNvdXJjZVwiOiBzZXJpYWxpemVyLmVuY29kZXIodGhpcy5zb3VyY2UsIGVuY29kaW5nLCBcIkJ1ZmZlclwiLCBcImhleFwiKVxuICAgIH1cbiAgfTtcbiAgZGVzZXJpYWxpemUoZmllbGRzOm9iamVjdCwgZW5jb2Rpbmc6U2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIikge1xuICAgIHN1cGVyLmRlc2VyaWFsaXplKGZpZWxkcywgZW5jb2RpbmcpO1xuICAgIHRoaXMuc291cmNlID0gc2VyaWFsaXplci5kZWNvZGVyKGZpZWxkc1tcInNvdXJjZVwiXSwgZW5jb2RpbmcsIFwiaGV4XCIsIFwiQnVmZmVyXCIpO1xuICB9XG5cbiAgcHJvdGVjdGVkIHNvdXJjZTpCdWZmZXIgPSBCdWZmZXIuYWxsb2MoMjApO1xuICBwcm90ZWN0ZWQgYnl0ZXMgPSBCdWZmZXIuYWxsb2MoNCk7XG4gIHByb3RlY3RlZCBic2l6ZSA9IDQ7XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHNvdXJjZSBhZGRyZXNzIGZvciB0aGUgc2lnbmF0dXJlXG4gICAqL1xuICBzZXRTb3VyY2UgPSAoYWRkcmVzczpCdWZmZXIpID0+IHtcbiAgICAgIHRoaXMuc291cmNlID0gYWRkcmVzcztcbiAgfTtcblxuICAvKipcbiAgICogUmV0cmlldmVzIHRoZSBzb3VyY2UgYWRkcmVzcyBmb3IgdGhlIHNpZ25hdHVyZVxuICAgKi9cbiAgZ2V0U291cmNlID0gKCk6QnVmZmVyID0+IHRoaXMuc291cmNlO1xuXG4gIGNsb25lKCk6dGhpcyB7XG4gICAgbGV0IG5ld2Jhc2U6U2lnSWR4ID0gbmV3IFNpZ0lkeCgpO1xuICAgIG5ld2Jhc2UuZnJvbUJ1ZmZlcih0aGlzLnRvQnVmZmVyKCkpO1xuICAgIHJldHVybiBuZXdiYXNlIGFzIHRoaXM7XG4gIH1cblxuICBjcmVhdGUoLi4uYXJnczphbnlbXSk6dGhpcyB7XG4gICAgcmV0dXJuIG5ldyBTaWdJZHgoKSBhcyB0aGlzO1xuICB9XG5cblxuICAvKipcbiAgICogVHlwZSByZXByZXNlbnRpbmcgYSBbW1NpZ25hdHVyZV1dIGluZGV4IHVzZWQgaW4gW1tJbnB1dF1dXG4gICAqL1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgIHN1cGVyKCk7XG4gIH1cbn1cblxuLyoqXG4gKiBTaWduYXR1cmUgZm9yIGEgW1tUeF1dXG4gKi9cbmV4cG9ydCBjbGFzcyBTaWduYXR1cmUgZXh0ZW5kcyBOQnl0ZXMge1xuICBwcm90ZWN0ZWQgX3R5cGVOYW1lID0gXCJTaWduYXR1cmVcIjtcbiAgcHJvdGVjdGVkIF90eXBlSUQgPSB1bmRlZmluZWQ7XG5cbiAgLy9zZXJpYWxpemUgYW5kIGRlc2VyaWFsaXplIGJvdGggYXJlIGluaGVyaXRlZFxuXG4gIHByb3RlY3RlZCBieXRlcyA9IEJ1ZmZlci5hbGxvYyg2NSk7XG4gIHByb3RlY3RlZCBic2l6ZSA9IDY1O1xuXG4gIGNsb25lKCk6dGhpcyB7XG4gICAgbGV0IG5ld2Jhc2U6U2lnbmF0dXJlID0gbmV3IFNpZ25hdHVyZSgpO1xuICAgIG5ld2Jhc2UuZnJvbUJ1ZmZlcih0aGlzLnRvQnVmZmVyKCkpO1xuICAgIHJldHVybiBuZXdiYXNlIGFzIHRoaXM7XG4gIH1cblxuICBjcmVhdGUoLi4uYXJnczphbnlbXSk6dGhpcyB7XG4gICAgcmV0dXJuIG5ldyBTaWduYXR1cmUoKSBhcyB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNpZ25hdHVyZSBmb3IgYSBbW1R4XV1cbiAgICovXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgICAgc3VwZXIoKTtcbiAgfVxufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ3JlZGVudGlhbCBleHRlbmRzIFNlcmlhbGl6YWJsZXtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiQ3JlZGVudGlhbFwiO1xuICBwcm90ZWN0ZWQgX3R5cGVJRCA9IHVuZGVmaW5lZDtcblxuICBzZXJpYWxpemUoZW5jb2Rpbmc6U2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIik6b2JqZWN0IHtcbiAgICBsZXQgZmllbGRzOm9iamVjdCA9IHN1cGVyLnNlcmlhbGl6ZShlbmNvZGluZyk7XG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLmZpZWxkcyxcbiAgICAgIFwic2lnQXJyYXlcIjogdGhpcy5zaWdBcnJheS5tYXAoKHMpID0+IHMuc2VyaWFsaXplKGVuY29kaW5nKSlcbiAgICB9XG4gIH07XG4gIGRlc2VyaWFsaXplKGZpZWxkczpvYmplY3QsIGVuY29kaW5nOlNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpIHtcbiAgICBzdXBlci5kZXNlcmlhbGl6ZShmaWVsZHMsIGVuY29kaW5nKTtcbiAgICB0aGlzLnNpZ0FycmF5ID0gZmllbGRzW1wic2lnQXJyYXlcIl0ubWFwKChzOm9iamVjdCkgPT4ge1xuICAgICAgbGV0IHNpZzpTaWduYXR1cmUgPSBuZXcgU2lnbmF0dXJlKCk7XG4gICAgICBzaWcuZGVzZXJpYWxpemUocywgZW5jb2RpbmcpO1xuICAgICAgcmV0dXJuIHNpZztcbiAgICB9KTtcbiAgfVxuXG4gIHByb3RlY3RlZCBzaWdBcnJheTpBcnJheTxTaWduYXR1cmU+ID0gW107XG5cbiAgYWJzdHJhY3QgZ2V0Q3JlZGVudGlhbElEKCk6bnVtYmVyO1xuICBzZXRDb2RlY0lEKGNvZGVjSUQ6IG51bWJlcik6dm9pZCB7fTtcblxuICAvKipcbiAgICAgKiBBZGRzIGEgc2lnbmF0dXJlIHRvIHRoZSBjcmVkZW50aWFscyBhbmQgcmV0dXJucyB0aGUgaW5kZXggb2ZmIHRoZSBhZGRlZCBzaWduYXR1cmUuXG4gICAgICovXG4gIGFkZFNpZ25hdHVyZSA9IChzaWc6U2lnbmF0dXJlKTpudW1iZXIgPT4ge1xuICAgIHRoaXMuc2lnQXJyYXkucHVzaChzaWcpO1xuICAgIHJldHVybiB0aGlzLnNpZ0FycmF5Lmxlbmd0aCAtIDE7XG4gIH07XG5cbiAgZnJvbUJ1ZmZlcihieXRlcywgb2Zmc2V0Om51bWJlciA9IDApOm51bWJlciB7XG4gICAgY29uc3Qgc2lnbGVuOm51bWJlciA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDQpLnJlYWRVSW50MzJCRSgwKTtcbiAgICBvZmZzZXQgKz0gNDtcbiAgICB0aGlzLnNpZ0FycmF5ID0gW107XG4gICAgZm9yIChsZXQgaTpudW1iZXIgPSAwOyBpIDwgc2lnbGVuOyBpKyspIHtcbiAgICAgIGNvbnN0IHNpZzpTaWduYXR1cmUgPSBuZXcgU2lnbmF0dXJlKCk7XG4gICAgICBvZmZzZXQgPSBzaWcuZnJvbUJ1ZmZlcihieXRlcywgb2Zmc2V0KTtcbiAgICAgIHRoaXMuc2lnQXJyYXkucHVzaChzaWcpO1xuICAgIH1cbiAgICByZXR1cm4gb2Zmc2V0O1xuICB9XG5cbiAgdG9CdWZmZXIoKTpCdWZmZXIge1xuICAgIGNvbnN0IHNpZ2xlbjpCdWZmZXIgPSBCdWZmZXIuYWxsb2MoNCk7XG4gICAgc2lnbGVuLndyaXRlSW50MzJCRSh0aGlzLnNpZ0FycmF5Lmxlbmd0aCwgMCk7XG4gICAgY29uc3QgYmFycjpBcnJheTxCdWZmZXI+ID0gW3NpZ2xlbl07XG4gICAgbGV0IGJzaXplOm51bWJlciA9IHNpZ2xlbi5sZW5ndGg7XG4gICAgZm9yIChsZXQgaTpudW1iZXIgPSAwOyBpIDwgdGhpcy5zaWdBcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3Qgc2lnYnVmZjpCdWZmZXIgPSB0aGlzLnNpZ0FycmF5W2ldLnRvQnVmZmVyKCk7XG4gICAgICBic2l6ZSArPSBzaWdidWZmLmxlbmd0aDtcbiAgICAgIGJhcnIucHVzaChzaWdidWZmKTtcbiAgICB9XG4gICAgcmV0dXJuIEJ1ZmZlci5jb25jYXQoYmFyciwgYnNpemUpO1xuICB9XG5cbiAgYWJzdHJhY3QgY2xvbmUoKTp0aGlzO1xuXG4gIGFic3RyYWN0IGNyZWF0ZSguLi5hcmdzOmFueVtdKTp0aGlzO1xuXG4gIGFic3RyYWN0IHNlbGVjdChpZDpudW1iZXIsIC4uLmFyZ3M6YW55W10pOkNyZWRlbnRpYWw7XG5cbiAgY29uc3RydWN0b3Ioc2lnYXJyYXk6QXJyYXk8U2lnbmF0dXJlPiA9IHVuZGVmaW5lZCkge1xuICAgIHN1cGVyKCk7XG4gICAgaWYgKHR5cGVvZiBzaWdhcnJheSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICB0aGlzLnNpZ0FycmF5ID0gc2lnYXJyYXk7XG4gICAgfVxuICB9XG59Il19