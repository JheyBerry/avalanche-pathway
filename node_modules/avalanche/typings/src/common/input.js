"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StandardAmountInput = exports.StandardTransferableInput = exports.StandardParseableInput = exports.Input = void 0;
/**
 * @packageDocumentation
 * @module Common-Inputs
 */
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("../utils/bintools"));
const bn_js_1 = __importDefault(require("bn.js"));
const credentials_1 = require("./credentials");
const serialization_1 = require("../utils/serialization");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
const serializer = serialization_1.Serialization.getInstance();
class Input extends serialization_1.Serializable {
    constructor() {
        super(...arguments);
        this._typeName = "Input";
        this._typeID = undefined;
        this.sigCount = buffer_1.Buffer.alloc(4);
        this.sigIdxs = []; // idxs of signers from utxo
        /**
         * Returns the array of [[SigIdx]] for this [[Input]]
         */
        this.getSigIdxs = () => this.sigIdxs;
        /**
         * Creates and adds a [[SigIdx]] to the [[Input]].
         *
         * @param addressIdx The index of the address to reference in the signatures
         * @param address The address of the source of the signature
         */
        this.addSignatureIdx = (addressIdx, address) => {
            const sigidx = new credentials_1.SigIdx();
            const b = buffer_1.Buffer.alloc(4);
            b.writeUInt32BE(addressIdx, 0);
            sigidx.fromBuffer(b);
            sigidx.setSource(address);
            this.sigIdxs.push(sigidx);
            this.sigCount.writeUInt32BE(this.sigIdxs.length, 0);
        };
    }
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { "sigIdxs": this.sigIdxs.map((s) => s.serialize(encoding)) });
    }
    ;
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.sigIdxs = fields["sigIdxs"].map((s) => {
            let sidx = new credentials_1.SigIdx();
            sidx.deserialize(s, encoding);
            return sidx;
        });
        this.sigCount.writeUInt32BE(this.sigIdxs.length, 0);
    }
    fromBuffer(bytes, offset = 0) {
        this.sigCount = bintools.copyFrom(bytes, offset, offset + 4);
        offset += 4;
        const sigCount = this.sigCount.readUInt32BE(0);
        this.sigIdxs = [];
        for (let i = 0; i < sigCount; i++) {
            const sigidx = new credentials_1.SigIdx();
            const sigbuff = bintools.copyFrom(bytes, offset, offset + 4);
            sigidx.fromBuffer(sigbuff);
            offset += 4;
            this.sigIdxs.push(sigidx);
        }
        return offset;
    }
    toBuffer() {
        this.sigCount.writeUInt32BE(this.sigIdxs.length, 0);
        let bsize = this.sigCount.length;
        const barr = [this.sigCount];
        for (let i = 0; i < this.sigIdxs.length; i++) {
            const b = this.sigIdxs[i].toBuffer();
            barr.push(b);
            bsize += b.length;
        }
        return buffer_1.Buffer.concat(barr, bsize);
    }
    /**
     * Returns a base-58 representation of the [[Input]].
     */
    toString() {
        return bintools.bufferToB58(this.toBuffer());
    }
}
exports.Input = Input;
Input.comparator = () => (a, b) => {
    const aoutid = buffer_1.Buffer.alloc(4);
    aoutid.writeUInt32BE(a.getInputID(), 0);
    const abuff = a.toBuffer();
    const boutid = buffer_1.Buffer.alloc(4);
    boutid.writeUInt32BE(b.getInputID(), 0);
    const bbuff = b.toBuffer();
    const asort = buffer_1.Buffer.concat([aoutid, abuff], aoutid.length + abuff.length);
    const bsort = buffer_1.Buffer.concat([boutid, bbuff], boutid.length + bbuff.length);
    return buffer_1.Buffer.compare(asort, bsort);
};
class StandardParseableInput extends serialization_1.Serializable {
    /**
     * Class representing an [[StandardParseableInput]] for a transaction.
     *
     * @param input A number representing the InputID of the [[StandardParseableInput]]
     */
    constructor(input = undefined) {
        super();
        this._typeName = "StandardParseableInput";
        this._typeID = undefined;
        this.getInput = () => this.input;
        if (input instanceof Input) {
            this.input = input;
        }
    }
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { "input": this.input.serialize(encoding) });
    }
    ;
    toBuffer() {
        const inbuff = this.input.toBuffer();
        const inid = buffer_1.Buffer.alloc(4);
        inid.writeUInt32BE(this.input.getInputID(), 0);
        const barr = [inid, inbuff];
        return buffer_1.Buffer.concat(barr, inid.length + inbuff.length);
    }
}
exports.StandardParseableInput = StandardParseableInput;
/**
 * Returns a function used to sort an array of [[StandardParseableInput]]s
 */
StandardParseableInput.comparator = () => (a, b) => {
    const sorta = a.toBuffer();
    const sortb = b.toBuffer();
    return buffer_1.Buffer.compare(sorta, sortb);
};
class StandardTransferableInput extends StandardParseableInput {
    /**
     * Class representing an [[StandardTransferableInput]] for a transaction.
     *
     * @param txid A {@link https://github.com/feross/buffer|Buffer} containing the transaction ID of the referenced UTXO
     * @param outputidx A {@link https://github.com/feross/buffer|Buffer} containing the index of the output in the transaction consumed in the [[StandardTransferableInput]]
     * @param assetID A {@link https://github.com/feross/buffer|Buffer} representing the assetID of the [[Input]]
     * @param input An [[Input]] to be made transferable
     */
    constructor(txid = undefined, outputidx = undefined, assetID = undefined, input = undefined) {
        super();
        this._typeName = "StandardTransferableInput";
        this._typeID = undefined;
        this.txid = buffer_1.Buffer.alloc(32);
        this.outputidx = buffer_1.Buffer.alloc(4);
        this.assetid = buffer_1.Buffer.alloc(32);
        /**
         * Returns a {@link https://github.com/feross/buffer|Buffer} of the TxID.
         */
        this.getTxID = () => this.txid;
        /**
         * Returns a {@link https://github.com/feross/buffer|Buffer}  of the OutputIdx.
         */
        this.getOutputIdx = () => this.outputidx;
        /**
         * Returns a base-58 string representation of the UTXOID this [[StandardTransferableInput]] references.
         */
        this.getUTXOID = () => bintools.bufferToB58(buffer_1.Buffer.concat([this.txid, this.outputidx]));
        /**
         * Returns the input.
         */
        this.getInput = () => this.input;
        /**
         * Returns the assetID of the input.
         */
        this.getAssetID = () => this.assetid;
        if (typeof txid !== 'undefined' && typeof outputidx !== 'undefined' && typeof assetID !== 'undefined' && input instanceof Input) {
            this.input = input;
            this.txid = txid;
            this.outputidx = outputidx;
            this.assetid = assetID;
        }
    }
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { "txid": serializer.encoder(this.txid, encoding, "Buffer", "cb58"), "outputidx": serializer.encoder(this.outputidx, encoding, "Buffer", "decimalString"), "assetid": serializer.encoder(this.assetid, encoding, "Buffer", "cb58") });
    }
    ;
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.txid = serializer.decoder(fields["txid"], encoding, "cb58", "Buffer", 32);
        this.outputidx = serializer.decoder(fields["outputidx"], encoding, "decimalString", "Buffer", 4);
        this.assetid = serializer.decoder(fields["assetid"], encoding, "cb58", "Buffer", 32);
        //input deserialization must be implmented in child classes
    }
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[StandardTransferableInput]].
     */
    toBuffer() {
        const parseableBuff = super.toBuffer();
        const bsize = this.txid.length + this.outputidx.length + this.assetid.length + parseableBuff.length;
        const barr = [this.txid, this.outputidx, this.assetid, parseableBuff];
        const buff = buffer_1.Buffer.concat(barr, bsize);
        return buff;
    }
    /**
     * Returns a base-58 representation of the [[StandardTransferableInput]].
     */
    toString() {
        /* istanbul ignore next */
        return bintools.bufferToB58(this.toBuffer());
    }
}
exports.StandardTransferableInput = StandardTransferableInput;
/**
 * An [[Input]] class which specifies a token amount .
 */
class StandardAmountInput extends Input {
    /**
     * An [[AmountInput]] class which issues a payment on an assetID.
     *
     * @param amount A {@link https://github.com/indutny/bn.js/|BN} representing the amount in the input
     */
    constructor(amount = undefined) {
        super();
        this._typeName = "StandardAmountInput";
        this._typeID = undefined;
        this.amount = buffer_1.Buffer.alloc(8);
        this.amountValue = new bn_js_1.default(0);
        /**
         * Returns the amount as a {@link https://github.com/indutny/bn.js/|BN}.
         */
        this.getAmount = () => this.amountValue.clone();
        if (amount) {
            this.amountValue = amount.clone();
            this.amount = bintools.fromBNToBuffer(amount, 8);
        }
    }
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { "amount": serializer.encoder(this.amount, encoding, "Buffer", "decimalString", 8) });
    }
    ;
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.amount = serializer.decoder(fields["amount"], encoding, "decimalString", "Buffer", 8);
        this.amountValue = bintools.fromBufferToBN(this.amount);
    }
    /**
     * Popuates the instance from a {@link https://github.com/feross/buffer|Buffer} representing the [[AmountInput]] and returns the size of the input.
     */
    fromBuffer(bytes, offset = 0) {
        this.amount = bintools.copyFrom(bytes, offset, offset + 8);
        this.amountValue = bintools.fromBufferToBN(this.amount);
        offset += 8;
        return super.fromBuffer(bytes, offset);
    }
    /**
     * Returns the buffer representing the [[AmountInput]] instance.
     */
    toBuffer() {
        const superbuff = super.toBuffer();
        const bsize = this.amount.length + superbuff.length;
        const barr = [this.amount, superbuff];
        return buffer_1.Buffer.concat(barr, bsize);
    }
}
exports.StandardAmountInput = StandardAmountInput;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5wdXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbW9uL2lucHV0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7R0FHRztBQUNILG9DQUFpQztBQUNqQyxpRUFBeUM7QUFDekMsa0RBQXVCO0FBQ3ZCLCtDQUF1QztBQUN2QywwREFBeUY7QUFFekY7O0dBRUc7QUFDSCxNQUFNLFFBQVEsR0FBRyxrQkFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQ3hDLE1BQU0sVUFBVSxHQUFHLDZCQUFhLENBQUMsV0FBVyxFQUFFLENBQUM7QUFFL0MsTUFBc0IsS0FBTSxTQUFRLDRCQUFZO0lBQWhEOztRQUNZLGNBQVMsR0FBRyxPQUFPLENBQUM7UUFDcEIsWUFBTyxHQUFHLFNBQVMsQ0FBQztRQW1CcEIsYUFBUSxHQUFVLGVBQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbEMsWUFBTyxHQUFpQixFQUFFLENBQUMsQ0FBQyw0QkFBNEI7UUFrQmxFOztXQUVHO1FBQ0gsZUFBVSxHQUFHLEdBQWlCLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBSTlDOzs7OztXQUtHO1FBQ0gsb0JBQWUsR0FBRyxDQUFDLFVBQWlCLEVBQUUsT0FBYyxFQUFFLEVBQUU7WUFDdEQsTUFBTSxNQUFNLEdBQVUsSUFBSSxvQkFBTSxFQUFFLENBQUM7WUFDbkMsTUFBTSxDQUFDLEdBQVUsZUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNqQyxDQUFDLENBQUMsYUFBYSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMvQixNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLE1BQU0sQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDMUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDMUIsSUFBSSxDQUFD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QUFDLFdBQVcsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN4RCxNQUFNLElBQUksQ0FBQyxDQUFDO1FBQ1osT0FBTyxLQUFLLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztJQUN6QyxDQUFDO0lBRUQ7O09BRUc7SUFDSCxRQUFRO1FBQ04sTUFBTSxTQUFTLEdBQVUsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQzFDLE1BQU0sS0FBSyxHQUFVLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUM7UUFDM0QsTUFBTSxJQUFJLEdBQWlCLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQztRQUNwRCxPQUFPLGVBQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3BDLENBQUM7Q0FjRjtBQXpERCxrREF5REMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBwYWNrYWdlRG9jdW1lbnRhdGlvblxuICogQG1vZHVsZSBDb21tb24tSW5wdXRzXG4gKi9cbmltcG9ydCB7IEJ1ZmZlciB9IGZyb20gJ2J1ZmZlci8nO1xuaW1wb3J0IEJpblRvb2xzIGZyb20gJy4uL3V0aWxzL2JpbnRvb2xzJztcbmltcG9ydCBCTiBmcm9tICdibi5qcyc7XG5pbXBvcnQgeyBTaWdJZHggfSBmcm9tICcuL2NyZWRlbnRpYWxzJztcbmltcG9ydCB7IFNlcmlhbGl6YWJsZSwgU2VyaWFsaXphdGlvbiwgU2VyaWFsaXplZEVuY29kaW5nIH0gZnJvbSAnLi4vdXRpbHMvc2VyaWFsaXphdGlvbic7XG5cbi8qKlxuICogQGlnbm9yZVxuICovXG5jb25zdCBiaW50b29scyA9IEJpblRvb2xzLmdldEluc3RhbmNlKCk7XG5jb25zdCBzZXJpYWxpemVyID0gU2VyaWFsaXphdGlvbi5nZXRJbnN0YW5jZSgpO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgSW5wdXQgZXh0ZW5kcyBTZXJpYWxpemFibGUge1xuICBwcm90ZWN0ZWQgX3R5cGVOYW1lID0gXCJJbnB1dFwiO1xuICBwcm90ZWN0ZWQgX3R5cGVJRCA9IHVuZGVmaW5lZDtcblxuICBzZXJpYWxpemUoZW5jb2Rpbmc6U2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIik6b2JqZWN0IHtcbiAgICBsZXQgZmllbGRzOm9iamVjdCA9IHN1cGVyLnNlcmlhbGl6ZShlbmNvZGluZyk7XG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLmZpZWxkcyxcbiAgICAgIFwic2lnSWR4c1wiOiB0aGlzLnNpZ0lkeHMubWFwKChzKSA9PiBzLnNlcmlhbGl6ZShlbmNvZGluZykpXG4gICAgfVxuICB9O1xuICBkZXNlcmlhbGl6ZShmaWVsZHM6b2JqZWN0LCBlbmNvZGluZzpTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKSB7XG4gICAgc3VwZXIuZGVzZXJpYWxpemUoZmllbGRzLCBlbmNvZGluZyk7XG4gICAgdGhpcy5zaWdJZHhzID0gZmllbGRzW1wic2lnSWR4c1wiXS5tYXAoKHM6b2JqZWN0KSA9PiB7XG4gICAgICBsZXQgc2lkeDpTaWdJZHggPSBuZXcgU2lnSWR4KCk7XG4gICAgICBzaWR4LmRlc2VyaWFsaXplKHMsIGVuY29kaW5nKTtcbiAgICAgIHJldHVybiBzaWR4O1xuICAgIH0pO1xuICAgIHRoaXMuc2lnQ291bnQud3JpdGVVSW50MzJCRSh0aGlzLnNpZ0lkeHMubGVuZ3RoLCAwKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBzaWdDb3VudDpCdWZmZXIgPSBCdWZmZXIuYWxsb2MoNCk7XG4gIHByb3RlY3RlZCBzaWdJZHhzOkFycmF5PFNpZ0lkeD4gPSBbXTsgLy8gaWR4cyBvZiBzaWduZXJzIGZyb20gdXR4b1xuXG4gIHN0YXRpYyBjb21wYXJhdG9yID0gKCk6KGE6SW5wdXQsIGI6SW5wdXQpID0+ICgxfC0xfDApID0+IChhOklucHV0LCBiOklucHV0KTooMXwtMXwwKSA9PiB7XG4gICAgY29uc3QgYW91dGlkOkJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyg0KTtcbiAgICBhb3V0aWQud3JpdGVVSW50MzJCRShhLmdldElucHV0SUQoKSwgMCk7XG4gICAgY29uc3QgYWJ1ZmY6QnVmZmVyID0gYS50b0J1ZmZlcigpO1xuXG4gICAgY29uc3QgYm91dGlkOkJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyg0KTtcbiAgICBib3V0aWQud3JpdGVVSW50MzJCRShiLmdldElucHV0SUQoKSwgMCk7XG4gICAgY29uc3QgYmJ1ZmY6QnVmZmVyID0gYi50b0J1ZmZlcigpO1xuXG4gICAgY29uc3QgYXNvcnQ6QnVmZmVyID0gQnVmZmVyLmNvbmNhdChbYW91dGlkLCBhYnVmZl0sIGFvdXRpZC5sZW5ndGggKyBhYnVmZi5sZW5ndGgpO1xuICAgIGNvbnN0IGJzb3J0OkJ1ZmZlciA9IEJ1ZmZlci5jb25jYXQoW2JvdXRpZCwgYmJ1ZmZdLCBib3V0aWQubGVuZ3RoICsgYmJ1ZmYubGVuZ3RoKTtcbiAgICByZXR1cm4gQnVmZmVyLmNvbXBhcmUoYXNvcnQsIGJzb3J0KSBhcyAoMXwtMXwwKTtcbiAgfTtcblxuICBhYnN0cmFjdCBnZXRJbnB1dElEKCk6bnVtYmVyO1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBhcnJheSBvZiBbW1NpZ0lkeF1dIGZvciB0aGlzIFtbSW5wdXRdXVxuICAgKi9cbiAgZ2V0U2lnSWR4cyA9ICgpOkFycmF5PFNpZ0lkeD4gPT4gdGhpcy5zaWdJZHhzO1xuXG4gIGFic3RyYWN0IGdldENyZWRlbnRpYWxJRCgpOm51bWJlcjtcblxuICAvKipcbiAgICogQ3JlYXRlcyBhbmQgYWRkcyBhIFtbU2lnSWR4XV0gdG8gdGhlIFtbSW5wdXRdXS5cbiAgICpcbiAgICogQHBhcmFtIGFkZHJlc3NJZHggVGhlIGluZGV4IG9mIHRoZSBhZGRyZXNzIHRvIHJlZmVyZW5jZSBpbiB0aGUgc2lnbmF0dXJlc1xuICAgKiBAcGFyYW0gYWRkcmVzcyBUaGUgYWRkcmVzcyBvZiB0aGUgc291cmNlIG9mIHRoZSBzaWduYXR1cmVcbiAgICovXG4gIGFkZFNpZ25hdHVyZUlkeCA9IChhZGRyZXNzSWR4Om51bWJlciwgYWRkcmVzczpCdWZmZXIpID0+IHtcbiAgICBjb25zdCBzaWdpZHg6U2lnSWR4ID0gbmV3IFNpZ0lkeCgpO1xuICAgIGNvbnN0IGI6QnVmZmVyID0gQnVmZmVyLmFsbG9jKDQpO1xuICAgIGIud3JpdGVVSW50MzJCRShhZGRyZXNzSWR4LCAwKTtcbiAgICBzaWdpZHguZnJvbUJ1ZmZlcihiKTtcbiAgICBzaWdpZHguc2V0U291cmNlKGFkZHJlc3MpO1xuICAgIHRoaXMuc2lnSWR4cy5wdXNoKHNpZ2lkeCk7XG4gICAgdGhpcy5zaWdDb3VudC53cml0ZVVJbnQzMkJFKHRoaXMuc2lnSWR4cy5sZW5ndGgsIDApO1xuICB9O1xuXG4gIGZyb21CdWZmZXIoYnl0ZXM6QnVmZmVyLCBvZmZzZXQ6bnVtYmVyID0gMCk6bnVtYmVyIHtcbiAgICB0aGlzLnNpZ0NvdW50ID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgNCk7XG4gICAgb2Zmc2V0ICs9IDQ7XG4gICAgY29uc3Qgc2lnQ291bnQ6bnVtYmVyID0gdGhpcy5zaWdDb3VudC5yZWFkVUludDMyQkUoMCk7XG4gICAgdGhpcy5zaWdJZHhzID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaWdDb3VudDsgaSsrKSB7XG4gICAgICBjb25zdCBzaWdpZHggPSBuZXcgU2lnSWR4KCk7XG4gICAgICBjb25zdCBzaWdidWZmOkJ1ZmZlciA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDQpO1xuICAgICAgc2lnaWR4LmZyb21CdWZmZXIoc2lnYnVmZik7XG4gICAgICBvZmZzZXQgKz0gNDtcbiAgICAgIHRoaXMuc2lnSWR4cy5wdXNoKHNpZ2lkeCk7XG4gICAgfVxuICAgIHJldHVybiBvZmZzZXQ7XG4gIH1cblxuICB0b0J1ZmZlcigpOkJ1ZmZlciB7XG4gICAgdGhpcy5zaWdDb3VudC53cml0ZVVJbnQzMkJFKHRoaXMuc2lnSWR4cy5sZW5ndGgsIDApO1xuICAgIGxldCBic2l6ZTpudW1iZXIgPSB0aGlzLnNpZ0NvdW50Lmxlbmd0aDtcbiAgICBjb25zdCBiYXJyOkFycmF5PEJ1ZmZlcj4gPSBbdGhpcy5zaWdDb3VudF07XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnNpZ0lkeHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGI6QnVmZmVyID0gdGhpcy5zaWdJZHhzW2ldLnRvQnVmZmVyKCk7XG4gICAgICBiYXJyLnB1c2goYik7XG4gICAgICBic2l6ZSArPSBiLmxlbmd0aDtcbiAgICB9XG4gICAgcmV0dXJuIEJ1ZmZlci5jb25jYXQoYmFyciwgYnNpemUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBiYXNlLTU4IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBbW0lucHV0XV0uXG4gICAqL1xuICB0b1N0cmluZygpOnN0cmluZyB7XG4gICAgcmV0dXJuIGJpbnRvb2xzLmJ1ZmZlclRvQjU4KHRoaXMudG9CdWZmZXIoKSk7XG4gIH1cblxuICBhYnN0cmFjdCBjbG9uZSgpOnRoaXM7XG5cbiAgYWJzdHJhY3QgY3JlYXRlKC4uLmFyZ3M6YW55W10pOnRoaXM7XG5cbiAgYWJzdHJhY3Qgc2VsZWN0KGlkOm51bWJlciwgLi4uYXJnczphbnlbXSk6SW5wdXQ7XG4gIFxufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgU3RhbmRhcmRQYXJzZWFibGVJbnB1dCBleHRlbmRzIFNlcmlhbGl6YWJsZSB7XG4gIHByb3RlY3RlZCBfdHlwZU5hbWUgPSBcIlN0YW5kYXJkUGFyc2VhYmxlSW5wdXRcIjtcbiAgcHJvdGVjdGVkIF90eXBlSUQgPSB1bmRlZmluZWQ7XG5cbiAgc2VyaWFsaXplKGVuY29kaW5nOlNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpOm9iamVjdCB7XG4gICAgbGV0IGZpZWxkczpvYmplY3QgPSBzdXBlci5zZXJpYWxpemUoZW5jb2RpbmcpO1xuICAgIHJldHVybiB7XG4gICAgICAuLi5maWVsZHMsXG4gICAgICBcImlucHV0XCI6IHRoaXMuaW5wdXQuc2VyaWFsaXplKGVuY29kaW5nKVxuICAgIH1cbiAgfTtcblxuICBwcm90ZWN0ZWQgaW5wdXQ6SW5wdXQ7XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBmdW5jdGlvbiB1c2VkIHRvIHNvcnQgYW4gYXJyYXkgb2YgW1tTdGFuZGFyZFBhcnNlYWJsZUlucHV0XV1zXG4gICAqL1xuICBzdGF0aWMgY29tcGFyYXRvciA9ICgpOihhOlN0YW5kYXJkUGFyc2VhYmxlSW5wdXQsIGI6U3RhbmRhcmRQYXJzZWFibGVJbnB1dCkgPT4gKDF8LTF8MCkgPT4gKGE6U3RhbmRhcmRQYXJzZWFibGVJbnB1dCwgYjpTdGFuZGFyZFBhcnNlYWJsZUlucHV0KTooMXwtMXwwKSA9PiB7XG4gICAgY29uc3Qgc29ydGEgPSBhLnRvQnVmZmVyKCk7XG4gICAgY29uc3Qgc29ydGIgPSBiLnRvQnVmZmVyKCk7XG4gICAgcmV0dXJuIEJ1ZmZlci5jb21wYXJlKHNvcnRhLCBzb3J0YikgYXMgKDF8LTF8MCk7XG4gIH07XG5cbiAgZ2V0SW5wdXQgPSAoKTpJbnB1dCA9PiB0aGlzLmlucHV0O1xuXG4gIC8vIG11c3QgYmUgaW1wbGVtZW50ZWQgdG8gc2VsZWN0IGlucHV0IHR5cGVzIGZvciB0aGUgVk0gaW4gcXVlc3Rpb25cbiAgYWJzdHJhY3QgZnJvbUJ1ZmZlcihieXRlczpCdWZmZXIsIG9mZnNldD86bnVtYmVyKTpudW1iZXI7IFxuXG4gIHRvQnVmZmVyKCk6QnVmZmVyIHtcbiAgICBjb25zdCBpbmJ1ZmY6QnVmZmVyID0gdGhpcy5pbnB1dC50b0J1ZmZlcigpO1xuICAgIGNvbnN0IGluaWQ6QnVmZmVyID0gQnVmZmVyLmFsbG9jKDQpO1xuICAgIGluaWQud3JpdGVVSW50MzJCRSh0aGlzLmlucHV0LmdldElucHV0SUQoKSwgMCk7XG4gICAgY29uc3QgYmFycjpBcnJheTxCdWZmZXI+ID0gW2luaWQsIGluYnVmZl07XG4gICAgcmV0dXJuIEJ1ZmZlci5jb25jYXQoYmFyciwgaW5pZC5sZW5ndGggKyBpbmJ1ZmYubGVuZ3RoKTtcbiAgfVxuICBcbiAgLyoqXG4gICAqIENsYXNzIHJlcHJlc2VudGluZyBhbiBbW1N0YW5kYXJkUGFyc2VhYmxlSW5wdXRdXSBmb3IgYSB0cmFuc2FjdGlvbi5cbiAgICogXG4gICAqIEBwYXJhbSBpbnB1dCBBIG51bWJlciByZXByZXNlbnRpbmcgdGhlIElucHV0SUQgb2YgdGhlIFtbU3RhbmRhcmRQYXJzZWFibGVJbnB1dF1dXG4gICAqL1xuICBjb25zdHJ1Y3RvcihpbnB1dDpJbnB1dCA9IHVuZGVmaW5lZCkge1xuICAgIHN1cGVyKCk7XG4gICAgaWYgKGlucHV0IGluc3RhbmNlb2YgSW5wdXQpIHtcbiAgICAgIHRoaXMuaW5wdXQgPSBpbnB1dDtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFN0YW5kYXJkVHJhbnNmZXJhYmxlSW5wdXQgZXh0ZW5kcyBTdGFuZGFyZFBhcnNlYWJsZUlucHV0e1xuICBwcm90ZWN0ZWQgX3R5cGVOYW1lID0gXCJTdGFuZGFyZFRyYW5zZmVyYWJsZUlucHV0XCI7XG4gIHByb3RlY3RlZCBfdHlwZUlEID0gdW5kZWZpbmVkO1xuXG4gIHNlcmlhbGl6ZShlbmNvZGluZzpTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKTpvYmplY3Qge1xuICAgIGxldCBmaWVsZHM6b2JqZWN0ID0gc3VwZXIuc2VyaWFsaXplKGVuY29kaW5nKTtcbiAgICByZXR1cm4ge1xuICAgICAgLi4uZmllbGRzLFxuICAgICAgXCJ0eGlkXCI6IHNlcmlhbGl6ZXIuZW5jb2Rlcih0aGlzLnR4aWQsIGVuY29kaW5nLCBcIkJ1ZmZlclwiLCBcImNiNThcIiksXG4gICAgICBcIm91dHB1dGlkeFwiOiBzZXJpYWxpemVyLmVuY29kZXIodGhpcy5vdXRwdXRpZHgsIGVuY29kaW5nLCBcIkJ1ZmZlclwiLCBcImRlY2ltYWxTdHJpbmdcIiksXG4gICAgICBcImFzc2V0aWRcIjogc2VyaWFsaXplci5lbmNvZGVyKHRoaXMuYXNzZXRpZCwgZW5jb2RpbmcsIFwiQnVmZmVyXCIsIFwiY2I1OFwiKSxcbiAgICB9XG4gIH07XG4gIGRlc2VyaWFsaXplKGZpZWxkczpvYmplY3QsIGVuY29kaW5nOlNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpIHtcbiAgICBzdXBlci5kZXNlcmlhbGl6ZShmaWVsZHMsIGVuY29kaW5nKTtcbiAgICB0aGlzLnR4aWQgPSBzZXJpYWxpemVyLmRlY29kZXIoZmllbGRzW1widHhpZFwiXSwgZW5jb2RpbmcsIFwiY2I1OFwiLCBcIkJ1ZmZlclwiLCAzMik7XG4gICAgdGhpcy5vdXRwdXRpZHggPSBzZXJpYWxpemVyLmRlY29kZXIoZmllbGRzW1wib3V0cHV0aWR4XCJdLCBlbmNvZGluZywgXCJkZWNpbWFsU3RyaW5nXCIsIFwiQnVmZmVyXCIsIDQpO1xuICAgIHRoaXMuYXNzZXRpZCA9IHNlcmlhbGl6ZXIuZGVjb2RlcihmaWVsZHNbXCJhc3NldGlkXCJdLCBlbmNvZGluZywgXCJjYjU4XCIsIFwiQnVmZmVyXCIsIDMyKTtcbiAgICAvL2lucHV0IGRlc2VyaWFsaXphdGlvbiBtdXN0IGJlIGltcGxtZW50ZWQgaW4gY2hpbGQgY2xhc3Nlc1xuICB9XG5cbiAgcHJvdGVjdGVkIHR4aWQ6QnVmZmVyID0gQnVmZmVyLmFsbG9jKDMyKTtcbiAgcHJvdGVjdGVkIG91dHB1dGlkeDpCdWZmZXIgPSBCdWZmZXIuYWxsb2MoNCk7XG4gIHByb3RlY3RlZCBhc3NldGlkOkJ1ZmZlciA9IEJ1ZmZlci5hbGxvYygzMik7XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBvZiB0aGUgVHhJRC5cbiAgICovXG4gIGdldFR4SUQgPSAoKVxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICA6QnVmZmVyID0+IHRoaXMudHhpZDtcblxuICAvKipcbiAgICogUmV0dXJucyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9ICBvZiB0aGUgT3V0cHV0SWR4LlxuICAgKi9cbiAgZ2V0T3V0cHV0SWR4ID0gKClcbiAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgOkJ1ZmZlciA9PiB0aGlzLm91dHB1dGlkeDtcblxuICAvKipcbiAgICogUmV0dXJucyBhIGJhc2UtNTggc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBVVFhPSUQgdGhpcyBbW1N0YW5kYXJkVHJhbnNmZXJhYmxlSW5wdXRdXSByZWZlcmVuY2VzLlxuICAgKi9cbiAgZ2V0VVRYT0lEID0gKCk6c3RyaW5nID0+IGJpbnRvb2xzLmJ1ZmZlclRvQjU4KEJ1ZmZlci5jb25jYXQoW3RoaXMudHhpZCwgdGhpcy5vdXRwdXRpZHhdKSk7XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGlucHV0LlxuICAgKi9cbiAgZ2V0SW5wdXQgPSAoKTpJbnB1dCA9PiB0aGlzLmlucHV0O1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBhc3NldElEIG9mIHRoZSBpbnB1dC5cbiAgICovXG4gIGdldEFzc2V0SUQgPSAoKTpCdWZmZXIgPT4gdGhpcy5hc3NldGlkO1xuXG4gIGFic3RyYWN0IGZyb21CdWZmZXIoYnl0ZXM6QnVmZmVyLCBvZmZzZXQ/Om51bWJlcik6bnVtYmVyOyBcblxuICAvKipcbiAgICogUmV0dXJucyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBbW1N0YW5kYXJkVHJhbnNmZXJhYmxlSW5wdXRdXS5cbiAgICovXG4gIHRvQnVmZmVyKCk6QnVmZmVyIHtcbiAgICBjb25zdCBwYXJzZWFibGVCdWZmOkJ1ZmZlciA9IHN1cGVyLnRvQnVmZmVyKCk7XG4gICAgY29uc3QgYnNpemU6bnVtYmVyID0gdGhpcy50eGlkLmxlbmd0aCArIHRoaXMub3V0cHV0aWR4Lmxlbmd0aCArIHRoaXMuYXNzZXRpZC5sZW5ndGggKyBwYXJzZWFibGVCdWZmLmxlbmd0aDtcbiAgICBjb25zdCBiYXJyOkFycmF5PEJ1ZmZlcj4gPSBbdGhpcy50eGlkLCB0aGlzLm91dHB1dGlkeCwgdGhpcy5hc3NldGlkLCBwYXJzZWFibGVCdWZmXTtcbiAgICBjb25zdCBidWZmOiBCdWZmZXIgPSBCdWZmZXIuY29uY2F0KGJhcnIsIGJzaXplKTtcbiAgICByZXR1cm4gYnVmZjtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgYmFzZS01OCByZXByZXNlbnRhdGlvbiBvZiB0aGUgW1tTdGFuZGFyZFRyYW5zZmVyYWJsZUlucHV0XV0uXG4gICAqL1xuICB0b1N0cmluZygpOnN0cmluZyB7XG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICByZXR1cm4gYmludG9vbHMuYnVmZmVyVG9CNTgodGhpcy50b0J1ZmZlcigpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGFzcyByZXByZXNlbnRpbmcgYW4gW1tTdGFuZGFyZFRyYW5zZmVyYWJsZUlucHV0XV0gZm9yIGEgdHJhbnNhY3Rpb24uXG4gICAqXG4gICAqIEBwYXJhbSB0eGlkIEEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gY29udGFpbmluZyB0aGUgdHJhbnNhY3Rpb24gSUQgb2YgdGhlIHJlZmVyZW5jZWQgVVRYT1xuICAgKiBAcGFyYW0gb3V0cHV0aWR4IEEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gY29udGFpbmluZyB0aGUgaW5kZXggb2YgdGhlIG91dHB1dCBpbiB0aGUgdHJhbnNhY3Rpb24gY29uc3VtZWQgaW4gdGhlIFtbU3RhbmRhcmRUcmFuc2ZlcmFibGVJbnB1dF1dXG4gICAqIEBwYXJhbSBhc3NldElEIEEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gcmVwcmVzZW50aW5nIHRoZSBhc3NldElEIG9mIHRoZSBbW0lucHV0XV1cbiAgICogQHBhcmFtIGlucHV0IEFuIFtbSW5wdXRdXSB0byBiZSBtYWRlIHRyYW5zZmVyYWJsZVxuICAgKi9cbiAgY29uc3RydWN0b3IodHhpZDpCdWZmZXIgPSB1bmRlZmluZWQsIG91dHB1dGlkeDpCdWZmZXIgPSB1bmRlZmluZWQsIGFzc2V0SUQ6QnVmZmVyID0gdW5kZWZpbmVkLCBpbnB1dDpJbnB1dCA9IHVuZGVmaW5lZCkge1xuICAgIHN1cGVyKCk7XG4gICAgaWYgKHR5cGVvZiB0eGlkICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2Ygb3V0cHV0aWR4ICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgYXNzZXRJRCAhPT0gJ3VuZGVmaW5lZCcgJiYgaW5wdXQgaW5zdGFuY2VvZiBJbnB1dCkge1xuICAgICAgdGhpcy5pbnB1dCA9IGlucHV0O1xuICAgICAgdGhpcy50eGlkID0gdHhpZDtcbiAgICAgIHRoaXMub3V0cHV0aWR4ID0gb3V0cHV0aWR4O1xuICAgICAgdGhpcy5hc3NldGlkID0gYXNzZXRJRDtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBBbiBbW0lucHV0XV0gY2xhc3Mgd2hpY2ggc3BlY2lmaWVzIGEgdG9rZW4gYW1vdW50IC5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFN0YW5kYXJkQW1vdW50SW5wdXQgZXh0ZW5kcyBJbnB1dCB7XG4gIHByb3RlY3RlZCBfdHlwZU5hbWUgPSBcIlN0YW5kYXJkQW1vdW50SW5wdXRcIjtcbiAgcHJvdGVjdGVkIF90eXBlSUQgPSB1bmRlZmluZWQ7XG5cbiAgc2VyaWFsaXplKGVuY29kaW5nOlNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpOm9iamVjdCB7XG4gICAgbGV0IGZpZWxkczpvYmplY3QgPSBzdXBlci5zZXJpYWxpemUoZW5jb2RpbmcpO1xuICAgIHJldHVybiB7XG4gICAgICAuLi5maWVsZHMsXG4gICAgICBcImFtb3VudFwiOiBzZXJpYWxpemVyLmVuY29kZXIodGhpcy5hbW91bnQsIGVuY29kaW5nLCBcIkJ1ZmZlclwiLCBcImRlY2ltYWxTdHJpbmdcIiwgOClcbiAgICB9XG4gIH07XG4gIGRlc2VyaWFsaXplKGZpZWxkczpvYmplY3QsIGVuY29kaW5nOlNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpIHtcbiAgICBzdXBlci5kZXNlcmlhbGl6ZShmaWVsZHMsIGVuY29kaW5nKTtcbiAgICB0aGlzLmFtb3VudCA9IHNlcmlhbGl6ZXIuZGVjb2RlcihmaWVsZHNbXCJhbW91bnRcIl0sIGVuY29kaW5nLCBcImRlY2ltYWxTdHJpbmdcIiwgXCJCdWZmZXJcIiwgOCk7XG4gICAgdGhpcy5hbW91bnRWYWx1ZSA9IGJpbnRvb2xzLmZyb21CdWZmZXJUb0JOKHRoaXMuYW1vdW50KTtcbiAgfVxuXG4gIHByb3RlY3RlZCBhbW91bnQ6QnVmZmVyID0gQnVmZmVyLmFsbG9jKDgpO1xuICBwcm90ZWN0ZWQgYW1vdW50VmFsdWU6Qk4gPSBuZXcgQk4oMCk7XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGFtb3VudCBhcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59LlxuICAgKi9cbiAgZ2V0QW1vdW50ID0gKCk6Qk4gPT4gdGhpcy5hbW91bnRWYWx1ZS5jbG9uZSgpO1xuXG4gIC8qKlxuICAgKiBQb3B1YXRlcyB0aGUgaW5zdGFuY2UgZnJvbSBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHJlcHJlc2VudGluZyB0aGUgW1tBbW91bnRJbnB1dF1dIGFuZCByZXR1cm5zIHRoZSBzaXplIG9mIHRoZSBpbnB1dC5cbiAgICovXG4gIGZyb21CdWZmZXIoYnl0ZXM6QnVmZmVyLCBvZmZzZXQ6bnVtYmVyID0gMCk6bnVtYmVyIHtcbiAgICB0aGlzLmFtb3VudCA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDgpO1xuICAgIHRoaXMuYW1vdW50VmFsdWUgPSBiaW50b29scy5mcm9tQnVmZmVyVG9CTih0aGlzLmFtb3VudCk7XG4gICAgb2Zmc2V0ICs9IDg7XG4gICAgcmV0dXJuIHN1cGVyLmZyb21CdWZmZXIoYnl0ZXMsIG9mZnNldCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgYnVmZmVyIHJlcHJlc2VudGluZyB0aGUgW1tBbW91bnRJbnB1dF1dIGluc3RhbmNlLlxuICAgKi9cbiAgdG9CdWZmZXIoKTpCdWZmZXIge1xuICAgIGNvbnN0IHN1cGVyYnVmZjpCdWZmZXIgPSBzdXBlci50b0J1ZmZlcigpO1xuICAgIGNvbnN0IGJzaXplOm51bWJlciA9IHRoaXMuYW1vdW50Lmxlbmd0aCArIHN1cGVyYnVmZi5sZW5ndGg7XG4gICAgY29uc3QgYmFycjpBcnJheTxCdWZmZXI+ID0gW3RoaXMuYW1vdW50LCBzdXBlcmJ1ZmZdO1xuICAgIHJldHVybiBCdWZmZXIuY29uY2F0KGJhcnIsIGJzaXplKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBbW0Ftb3VudElucHV0XV0gY2xhc3Mgd2hpY2ggaXNzdWVzIGEgcGF5bWVudCBvbiBhbiBhc3NldElELlxuICAgKlxuICAgKiBAcGFyYW0gYW1vdW50IEEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn0gcmVwcmVzZW50aW5nIHRoZSBhbW91bnQgaW4gdGhlIGlucHV0XG4gICAqL1xuICBjb25zdHJ1Y3RvcihhbW91bnQ6Qk4gPSB1bmRlZmluZWQpIHtcbiAgICBzdXBlcigpO1xuICAgIGlmIChhbW91bnQpIHtcbiAgICAgIHRoaXMuYW1vdW50VmFsdWUgPSBhbW91bnQuY2xvbmUoKTtcbiAgICAgIHRoaXMuYW1vdW50ID0gYmludG9vbHMuZnJvbUJOVG9CdWZmZXIoYW1vdW50LCA4KTtcbiAgICB9XG4gIH1cbn0iXX0=