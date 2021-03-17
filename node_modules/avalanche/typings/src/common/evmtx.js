"use strict";
/**
 * @packageDocumentation
 * @module Common-Transactions
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EVMStandardTx = exports.EVMStandardUnsignedTx = exports.EVMStandardBaseTx = void 0;
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("../utils/bintools"));
const bn_js_1 = __importDefault(require("bn.js"));
const input_1 = require("./input");
const output_1 = require("./output");
const constants_1 = require("../utils/constants");
const serialization_1 = require("../utils/serialization");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
const serializer = serialization_1.Serialization.getInstance();
/**
 * Class representing a base for all transactions.
 */
class EVMStandardBaseTx extends serialization_1.Serializable {
    /**
     * Class representing a StandardBaseTx which is the foundation for all transactions.
     *
     * @param networkid Optional networkid, [[DefaultNetworkID]]
     * @param blockchainid Optional blockchainid, default Buffer.alloc(32, 16)
     * @param outs Optional array of the [[TransferableOutput]]s
     * @param ins Optional array of the [[TransferableInput]]s
     */
    constructor(networkid = constants_1.DefaultNetworkID, blockchainid = buffer_1.Buffer.alloc(32, 16)) {
        super();
        this._typeName = "EVMStandardBaseTx";
        this._typeID = undefined;
        this.networkid = buffer_1.Buffer.alloc(4);
        this.blockchainid = buffer_1.Buffer.alloc(32);
        /**
         * Returns the NetworkID as a number
         */
        this.getNetworkID = () => this.networkid.readUInt32BE(0);
        /**
         * Returns the Buffer representation of the BlockchainID
         */
        this.getBlockchainID = () => this.blockchainid;
        this.networkid.writeUInt32BE(networkid, 0);
        this.blockchainid = blockchainid;
    }
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { "networkid": serializer.encoder(this.networkid, encoding, "Buffer", "decimalString"), "blockchainid": serializer.encoder(this.blockchainid, encoding, "Buffer", "cb58") });
    }
    ;
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.networkid = serializer.decoder(fields["networkid"], encoding, "decimalString", "Buffer", 4);
        this.blockchainid = serializer.decoder(fields["blockchainid"], encoding, "cb58", "Buffer", 32);
    }
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[StandardBaseTx]].
     */
    toBuffer() {
        let bsize = this.networkid.length + this.blockchainid.length;
        const barr = [this.networkid, this.blockchainid];
        const buff = buffer_1.Buffer.concat(barr, bsize);
        return buff;
    }
    /**
     * Returns a base-58 representation of the [[StandardBaseTx]].
     */
    toString() {
        return bintools.bufferToB58(this.toBuffer());
    }
}
exports.EVMStandardBaseTx = EVMStandardBaseTx;
/**
 * Class representing an unsigned transaction.
 */
class EVMStandardUnsignedTx extends serialization_1.Serializable {
    constructor(transaction = undefined, codecid = 0) {
        super();
        this._typeName = "StandardUnsignedTx";
        this._typeID = undefined;
        this.codecid = 0;
        /**
         * Returns the CodecID as a number
         */
        this.getCodecID = () => this.codecid;
        /**
        * Returns the {@link https://github.com/feross/buffer|Buffer} representation of the CodecID
        */
        this.getCodecIDBuffer = () => {
            let codecBuf = buffer_1.Buffer.alloc(2);
            codecBuf.writeUInt16BE(this.codecid, 0);
            return codecBuf;
        };
        /**
         * Returns the inputTotal as a BN
         */
        this.getInputTotal = (assetID) => {
            const ins = [];
            const aIDHex = assetID.toString('hex');
            let total = new bn_js_1.default(0);
            ins.forEach((input) => {
                // only check StandardAmountInputs
                if (input.getInput() instanceof input_1.StandardAmountInput && aIDHex === input.getAssetID().toString('hex')) {
                    const i = input.getInput();
                    total = total.add(i.getAmount());
                }
            });
            return total;
        };
        /**
         * Returns the outputTotal as a BN
         */
        this.getOutputTotal = (assetID) => {
            const outs = [];
            const aIDHex = assetID.toString('hex');
            let total = new bn_js_1.default(0);
            outs.forEach((out) => {
                // only check StandardAmountOutput
                if (out.getOutput() instanceof output_1.StandardAmountOutput && aIDHex === out.getAssetID().toString('hex')) {
                    const output = out.getOutput();
                    total = total.add(output.getAmount());
                }
            });
            return total;
        };
        /**
         * Returns the number of burned tokens as a BN
         */
        this.getBurn = (assetID) => {
            return this.getInputTotal(assetID).sub(this.getOutputTotal(assetID));
        };
        this.codecid = codecid;
        this.transaction = transaction;
    }
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { "codecid": serializer.encoder(this.codecid, encoding, "number", "decimalString", 2), "transaction": this.transaction.serialize(encoding) });
    }
    ;
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.codecid = serializer.decoder(fields["codecid"], encoding, "decimalString", "number");
    }
    toBuffer() {
        const codecid = this.getCodecIDBuffer();
        const txtype = buffer_1.Buffer.alloc(4);
        txtype.writeUInt32BE(this.transaction.getTxType(), 0);
        const basebuff = this.transaction.toBuffer();
        return buffer_1.Buffer.concat([codecid, txtype, basebuff], codecid.length + txtype.length + basebuff.length);
    }
}
exports.EVMStandardUnsignedTx = EVMStandardUnsignedTx;
/**
 * Class representing a signed transaction.
 */
class EVMStandardTx extends serialization_1.Serializable {
    /**
     * Class representing a signed transaction.
     *
     * @param unsignedTx Optional [[StandardUnsignedTx]]
     * @param signatures Optional array of [[Credential]]s
     */
    constructor(unsignedTx = undefined, credentials = undefined) {
        super();
        this._typeName = "StandardTx";
        this._typeID = undefined;
        this.unsignedTx = undefined;
        this.credentials = [];
        /**
         * Returns the [[StandardUnsignedTx]]
         */
        this.getUnsignedTx = () => {
            return this.unsignedTx;
        };
        if (typeof unsignedTx !== 'undefined') {
            this.unsignedTx = unsignedTx;
            if (typeof credentials !== 'undefined') {
                this.credentials = credentials;
            }
        }
    }
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { "unsignedTx": this.unsignedTx.serialize(encoding), "credentials": this.credentials.map((c) => c.serialize(encoding)) });
    }
    ;
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[StandardTx]].
     */
    toBuffer() {
        const txbuff = this.unsignedTx.toBuffer();
        let bsize = txbuff.length;
        const credlen = buffer_1.Buffer.alloc(4);
        credlen.writeUInt32BE(this.credentials.length, 0);
        const barr = [txbuff, credlen];
        bsize += credlen.length;
        this.credentials.forEach((credential) => {
            const credid = buffer_1.Buffer.alloc(4);
            credid.writeUInt32BE(credential.getCredentialID(), 0);
            barr.push(credid);
            bsize += credid.length;
            const credbuff = credential.toBuffer();
            bsize += credbuff.length;
            barr.push(credbuff);
        });
        const buff = buffer_1.Buffer.concat(barr, bsize);
        return buff;
    }
    /**
     * Takes a base-58 string containing an [[StandardTx]], parses it, populates the class, and returns the length of the Tx in bytes.
     *
     * @param serialized A base-58 string containing a raw [[StandardTx]]
     *
     * @returns The length of the raw [[StandardTx]]
     *
     * @remarks
     * unlike most fromStrings, it expects the string to be serialized in cb58 format
     */
    fromString(serialized) {
        return this.fromBuffer(bintools.cb58Decode(serialized));
    }
    /**
     * Returns a cb58 representation of the [[StandardTx]].
     *
     * @remarks
     * unlike most toStrings, this returns in cb58 serialization format
     */
    toString() {
        return bintools.cb58Encode(this.toBuffer());
    }
}
exports.EVMStandardTx = EVMStandardTx;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZtdHguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbW9uL2V2bXR4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O0dBR0c7Ozs7OztBQUVILG9DQUFpQztBQUNqQyxpRUFBeUM7QUFFekMsa0RBQXVCO0FBRXZCLG1DQUF5RTtBQUN6RSxxQ0FBNEU7QUFDNUUsa0RBQXNEO0FBQ3RELDBEQUF5RjtBQUV6Rjs7R0FFRztBQUNILE1BQU0sUUFBUSxHQUFhLGtCQUFRLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDbEQsTUFBTSxVQUFVLEdBQWtCLDZCQUFhLENBQUMsV0FBVyxFQUFFLENBQUM7QUFFOUQ7O0dBRUc7QUFDSCxNQUFzQixpQkFBOEYsU0FBUSw0QkFBWTtJQTREdEk7Ozs7Ozs7T0FPRztJQUNILFlBQVksWUFBb0IsNEJBQWdCLEVBQUUsZUFBdUIsZUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDO1FBQzNGLEtBQUssRUFBRSxDQUFDO1FBcEVBLGNBQVMsR0FBRyxtQkFBbUIsQ0FBQztRQUNoQyxZQUFPLEdBQUcsU0FBUyxDQUFDO1FBaUJwQixjQUFTLEdBQVcsZUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNwQyxpQkFBWSxHQUFXLGVBQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7UUFPbEQ7O1dBRUc7UUFDSCxpQkFBWSxHQUFHLEdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRTVEOztXQUVHO1FBQ0gsb0JBQWUsR0FBRyxHQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDO1FBbUNoRCxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDM0MsSUFBSSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUM7SUFDbkMsQ0FBQztJ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QUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7SUFDOUMsQ0FBQztDQWlCRjtBQTlGRCxzQ0E4RkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBwYWNrYWdlRG9jdW1lbnRhdGlvblxuICogQG1vZHVsZSBDb21tb24tVHJhbnNhY3Rpb25zXG4gKi9cblxuaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSAnYnVmZmVyLyc7XG5pbXBvcnQgQmluVG9vbHMgZnJvbSAnLi4vdXRpbHMvYmludG9vbHMnO1xuaW1wb3J0IHsgQ3JlZGVudGlhbCB9IGZyb20gJy4vY3JlZGVudGlhbHMnO1xuaW1wb3J0IEJOIGZyb20gJ2JuLmpzJztcbmltcG9ydCB7IFN0YW5kYXJkS2V5Q2hhaW4sIFN0YW5kYXJkS2V5UGFpciB9IGZyb20gJy4va2V5Y2hhaW4nO1xuaW1wb3J0IHsgU3RhbmRhcmRBbW91bnRJbnB1dCwgU3RhbmRhcmRUcmFuc2ZlcmFibGVJbnB1dCB9IGZyb20gJy4vaW5wdXQnO1xuaW1wb3J0IHsgU3RhbmRhcmRBbW91bnRPdXRwdXQsIFN0YW5kYXJkVHJhbnNmZXJhYmxlT3V0cHV0IH0gZnJvbSAnLi9vdXRwdXQnO1xuaW1wb3J0IHsgRGVmYXVsdE5ldHdvcmtJRCB9IGZyb20gJy4uL3V0aWxzL2NvbnN0YW50cyc7XG5pbXBvcnQgeyBTZXJpYWxpemFibGUsIFNlcmlhbGl6YXRpb24sIFNlcmlhbGl6ZWRFbmNvZGluZyB9IGZyb20gJy4uL3V0aWxzL3NlcmlhbGl6YXRpb24nO1xuXG4vKipcbiAqIEBpZ25vcmVcbiAqL1xuY29uc3QgYmludG9vbHM6IEJpblRvb2xzID0gQmluVG9vbHMuZ2V0SW5zdGFuY2UoKTtcbmNvbnN0IHNlcmlhbGl6ZXI6IFNlcmlhbGl6YXRpb24gPSBTZXJpYWxpemF0aW9uLmdldEluc3RhbmNlKCk7XG5cbi8qKlxuICogQ2xhc3MgcmVwcmVzZW50aW5nIGEgYmFzZSBmb3IgYWxsIHRyYW5zYWN0aW9ucy5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEVWTVN0YW5kYXJkQmFzZVR4PEtQQ2xhc3MgZXh0ZW5kcyBTdGFuZGFyZEtleVBhaXIsIEtDQ2xhc3MgZXh0ZW5kcyBTdGFuZGFyZEtleUNoYWluPEtQQ2xhc3M+PiBleHRlbmRzIFNlcmlhbGl6YWJsZXtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiRVZNU3RhbmRhcmRCYXNlVHhcIjtcbiAgcHJvdGVjdGVkIF90eXBlSUQgPSB1bmRlZmluZWQ7XG5cbiAgc2VyaWFsaXplKGVuY29kaW5nOiBTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKTogb2JqZWN0IHtcbiAgICBsZXQgZmllbGRzOiBvYmplY3QgPSBzdXBlci5zZXJpYWxpemUoZW5jb2RpbmcpO1xuICAgIHJldHVybiB7XG4gICAgICAuLi5maWVsZHMsXG4gICAgICBcIm5ldHdvcmtpZFwiOiBzZXJpYWxpemVyLmVuY29kZXIodGhpcy5uZXR3b3JraWQsIGVuY29kaW5nLCBcIkJ1ZmZlclwiLCBcImRlY2ltYWxTdHJpbmdcIiksXG4gICAgICBcImJsb2NrY2hhaW5pZFwiOiBzZXJpYWxpemVyLmVuY29kZXIodGhpcy5ibG9ja2NoYWluaWQsIGVuY29kaW5nLCBcIkJ1ZmZlclwiLCBcImNiNThcIilcbiAgICB9XG4gIH07XG5cbiAgZGVzZXJpYWxpemUoZmllbGRzOiBvYmplY3QsIGVuY29kaW5nOiBTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKSB7XG4gICAgc3VwZXIuZGVzZXJpYWxpemUoZmllbGRzLCBlbmNvZGluZyk7XG4gICAgdGhpcy5uZXR3b3JraWQgPSBzZXJpYWxpemVyLmRlY29kZXIoZmllbGRzW1wibmV0d29ya2lkXCJdLCBlbmNvZGluZywgXCJkZWNpbWFsU3RyaW5nXCIsIFwiQnVmZmVyXCIsIDQpO1xuICAgIHRoaXMuYmxvY2tjaGFpbmlkID0gc2VyaWFsaXplci5kZWNvZGVyKGZpZWxkc1tcImJsb2NrY2hhaW5pZFwiXSwgZW5jb2RpbmcsIFwiY2I1OFwiLCBcIkJ1ZmZlclwiLCAzMik7XG4gIH1cblxuICBwcm90ZWN0ZWQgbmV0d29ya2lkOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoNCk7XG4gIHByb3RlY3RlZCBibG9ja2NoYWluaWQ6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYygzMik7XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGlkIG9mIHRoZSBbW1N0YW5kYXJkQmFzZVR4XV1cbiAgICovXG4gIGFic3RyYWN0IGdldFR4VHlwZTooKSA9PiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIE5ldHdvcmtJRCBhcyBhIG51bWJlclxuICAgKi9cbiAgZ2V0TmV0d29ya0lEID0gKCk6IG51bWJlciA9PiB0aGlzLm5ldHdvcmtpZC5yZWFkVUludDMyQkUoMCk7XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIEJ1ZmZlciByZXByZXNlbnRhdGlvbiBvZiB0aGUgQmxvY2tjaGFpbklEXG4gICAqL1xuICBnZXRCbG9ja2NoYWluSUQgPSAoKTogQnVmZmVyID0+IHRoaXMuYmxvY2tjaGFpbmlkO1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gcmVwcmVzZW50YXRpb24gb2YgdGhlIFtbU3RhbmRhcmRCYXNlVHhdXS5cbiAgICovXG4gIHRvQnVmZmVyKCk6IEJ1ZmZlciB7XG4gICAgbGV0IGJzaXplOiBudW1iZXIgPSB0aGlzLm5ldHdvcmtpZC5sZW5ndGggKyB0aGlzLmJsb2NrY2hhaW5pZC5sZW5ndGg7XG4gICAgY29uc3QgYmFycjogQnVmZmVyW10gPSBbdGhpcy5uZXR3b3JraWQsIHRoaXMuYmxvY2tjaGFpbmlkXTtcbiAgICBjb25zdCBidWZmOiBCdWZmZXIgPSBCdWZmZXIuY29uY2F0KGJhcnIsIGJzaXplKTtcbiAgICByZXR1cm4gYnVmZjtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgYmFzZS01OCByZXByZXNlbnRhdGlvbiBvZiB0aGUgW1tTdGFuZGFyZEJhc2VUeF1dLlxuICAgKi9cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYmludG9vbHMuYnVmZmVyVG9CNTgodGhpcy50b0J1ZmZlcigpKTtcbiAgfVxuXG4gIGFic3RyYWN0IGNsb25lKCk6IHRoaXM7XG5cbiAgYWJzdHJhY3QgY3JlYXRlKC4uLmFyZ3M6YW55W10pOiB0aGlzO1xuXG4gIGFic3RyYWN0IHNlbGVjdChpZDpudW1iZXIsIC4uLmFyZ3M6YW55W10pOiB0aGlzO1xuXG4gIC8qKlxuICAgKiBDbGFzcyByZXByZXNlbnRpbmcgYSBTdGFuZGFyZEJhc2VUeCB3aGljaCBpcyB0aGUgZm91bmRhdGlvbiBmb3IgYWxsIHRyYW5zYWN0aW9ucy5cbiAgICpcbiAgICogQHBhcmFtIG5ldHdvcmtpZCBPcHRpb25hbCBuZXR3b3JraWQsIFtbRGVmYXVsdE5ldHdvcmtJRF1dXG4gICAqIEBwYXJhbSBibG9ja2NoYWluaWQgT3B0aW9uYWwgYmxvY2tjaGFpbmlkLCBkZWZhdWx0IEJ1ZmZlci5hbGxvYygzMiwgMTYpXG4gICAqIEBwYXJhbSBvdXRzIE9wdGlvbmFsIGFycmF5IG9mIHRoZSBbW1RyYW5zZmVyYWJsZU91dHB1dF1dc1xuICAgKiBAcGFyYW0gaW5zIE9wdGlvbmFsIGFycmF5IG9mIHRoZSBbW1RyYW5zZmVyYWJsZUlucHV0XV1zXG4gICAqL1xuICBjb25zdHJ1Y3RvcihuZXR3b3JraWQ6IG51bWJlciA9IERlZmF1bHROZXR3b3JrSUQsIGJsb2NrY2hhaW5pZDogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDMyLCAxNikpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMubmV0d29ya2lkLndyaXRlVUludDMyQkUobmV0d29ya2lkLCAwKTtcbiAgICB0aGlzLmJsb2NrY2hhaW5pZCA9IGJsb2NrY2hhaW5pZDtcbiAgfVxufVxuXG4vKipcbiAqIENsYXNzIHJlcHJlc2VudGluZyBhbiB1bnNpZ25lZCB0cmFuc2FjdGlvbi5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEVWTVN0YW5kYXJkVW5zaWduZWRUeDxLUENsYXNzIGV4dGVuZHMgU3RhbmRhcmRLZXlQYWlyLCBcbktDQ2xhc3MgZXh0ZW5kcyBTdGFuZGFyZEtleUNoYWluPEtQQ2xhc3M+LCBcblNCVHggZXh0ZW5kcyBFVk1TdGFuZGFyZEJhc2VUeDxLUENsYXNzLCBLQ0NsYXNzPlxuPiBleHRlbmRzIFNlcmlhbGl6YWJsZXtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiU3RhbmRhcmRVbnNpZ25lZFR4XCI7XG4gIHByb3RlY3RlZCBfdHlwZUlEID0gdW5kZWZpbmVkO1xuXG4gIHNlcmlhbGl6ZShlbmNvZGluZzogU2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIik6IG9iamVjdCB7XG4gICAgbGV0IGZpZWxkczogb2JqZWN0ID0gc3VwZXIuc2VyaWFsaXplKGVuY29kaW5nKTtcbiAgICByZXR1cm4ge1xuICAgICAgLi4uZmllbGRzLFxuICAgICAgXCJjb2RlY2lkXCI6IHNlcmlhbGl6ZXIuZW5jb2Rlcih0aGlzLmNvZGVjaWQsIGVuY29kaW5nLCBcIm51bWJlclwiLCBcImRlY2ltYWxTdHJpbmdcIiwgMiksXG4gICAgICBcInRyYW5zYWN0aW9uXCI6IHRoaXMudHJhbnNhY3Rpb24uc2VyaWFsaXplKGVuY29kaW5nKVxuICAgIH07XG4gIH07XG5cbiAgZGVzZXJpYWxpemUoZmllbGRzOiBvYmplY3QsIGVuY29kaW5nOiBTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKSB7XG4gICAgc3VwZXIuZGVzZXJpYWxpemUoZmllbGRzLCBlbmNvZGluZyk7XG4gICAgdGhpcy5jb2RlY2lkID0gc2VyaWFsaXplci5kZWNvZGVyKGZpZWxkc1tcImNvZGVjaWRcIl0sIGVuY29kaW5nLCBcImRlY2ltYWxTdHJpbmdcIiwgXCJudW1iZXJcIik7XG4gIH1cblxuICBwcm90ZWN0ZWQgY29kZWNpZDogbnVtYmVyID0gMDtcbiAgcHJvdGVjdGVkIHRyYW5zYWN0aW9uOiBTQlR4O1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBDb2RlY0lEIGFzIGEgbnVtYmVyXG4gICAqL1xuICBnZXRDb2RlY0lEID0gKCk6IG51bWJlciA9PiB0aGlzLmNvZGVjaWQ7XG5cbiAgLyoqXG4gICogUmV0dXJucyB0aGUge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gcmVwcmVzZW50YXRpb24gb2YgdGhlIENvZGVjSURcbiAgKi9cbiAgZ2V0Q29kZWNJREJ1ZmZlciA9ICgpOiBCdWZmZXIgPT4ge1xuICAgIGxldCBjb2RlY0J1ZjogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDIpO1xuICAgIGNvZGVjQnVmLndyaXRlVUludDE2QkUodGhpcy5jb2RlY2lkLCAwKTtcbiAgICByZXR1cm4gY29kZWNCdWY7XG4gIH0gXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGlucHV0VG90YWwgYXMgYSBCTiBcbiAgICovXG4gIGdldElucHV0VG90YWwgPSAoYXNzZXRJRDogQnVmZmVyKTogQk49PiB7XG4gICAgY29uc3QgaW5zOiBTdGFuZGFyZFRyYW5zZmVyYWJsZUlucHV0W10gPSBbXTtcbiAgICBjb25zdCBhSURIZXg6IHN0cmluZyA9IGFzc2V0SUQudG9TdHJpbmcoJ2hleCcpO1xuICAgIGxldCB0b3RhbDogQk4gPSBuZXcgQk4oMCk7XG4gICAgaW5zLmZvckVhY2goKGlucHV0OiBTdGFuZGFyZFRyYW5zZmVyYWJsZUlucHV0KSA9PiB7XG4gICAgICAvLyBvbmx5IGNoZWNrIFN0YW5kYXJkQW1vdW50SW5wdXRzXG4gICAgICBpZihpbnB1dC5nZXRJbnB1dCgpIGluc3RhbmNlb2YgU3RhbmRhcmRBbW91bnRJbnB1dCAmJiBhSURIZXggPT09IGlucHV0LmdldEFzc2V0SUQoKS50b1N0cmluZygnaGV4JykpIHtcbiAgICAgICAgY29uc3QgaSA9IGlucHV0LmdldElucHV0KCkgYXMgU3RhbmRhcmRBbW91bnRJbnB1dDtcbiAgICAgICAgdG90YWwgPSB0b3RhbC5hZGQoaS5nZXRBbW91bnQoKSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHRvdGFsO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIG91dHB1dFRvdGFsIGFzIGEgQk5cbiAgICovXG4gIGdldE91dHB1dFRvdGFsID0gKGFzc2V0SUQ6IEJ1ZmZlcik6IEJOID0+IHtcbiAgICBjb25zdCBvdXRzOiBTdGFuZGFyZFRyYW5zZmVyYWJsZU91dHB1dFtdID0gW107XG4gICAgY29uc3QgYUlESGV4OiBzdHJpbmcgPSBhc3NldElELnRvU3RyaW5nKCdoZXgnKTtcbiAgICBsZXQgdG90YWw6IEJOID0gbmV3IEJOKDApO1xuXG4gICAgb3V0cy5mb3JFYWNoKChvdXQ6IFN0YW5kYXJkVHJhbnNmZXJhYmxlT3V0cHV0KSA9PiB7XG4gICAgICAvLyBvbmx5IGNoZWNrIFN0YW5kYXJkQW1vdW50T3V0cHV0XG4gICAgICBpZihvdXQuZ2V0T3V0cHV0KCkgaW5zdGFuY2VvZiBTdGFuZGFyZEFtb3VudE91dHB1dCAmJiBhSURIZXggPT09IG91dC5nZXRBc3NldElEKCkudG9TdHJpbmcoJ2hleCcpKSB7XG4gICAgICAgIGNvbnN0IG91dHB1dDogU3RhbmRhcmRBbW91bnRPdXRwdXQgPSBvdXQuZ2V0T3V0cHV0KCkgYXMgU3RhbmRhcmRBbW91bnRPdXRwdXQ7XG4gICAgICAgIHRvdGFsID0gdG90YWwuYWRkKG91dHB1dC5nZXRBbW91bnQoKSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHRvdGFsO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIG51bWJlciBvZiBidXJuZWQgdG9rZW5zIGFzIGEgQk5cbiAgICovXG4gIGdldEJ1cm4gPSAoYXNzZXRJRDogQnVmZmVyKTogQk4gPT4ge1xuICAgIHJldHVybiB0aGlzLmdldElucHV0VG90YWwoYXNzZXRJRCkuc3ViKHRoaXMuZ2V0T3V0cHV0VG90YWwoYXNzZXRJRCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIFRyYW5zYWN0aW9uXG4gICAqL1xuICBhYnN0cmFjdCBnZXRUcmFuc2FjdGlvbigpOiBTQlR4O1xuXG4gIGFic3RyYWN0IGZyb21CdWZmZXIoYnl0ZXM6IEJ1ZmZlciwgb2Zmc2V0PzogbnVtYmVyKTogbnVtYmVyO1xuXG4gIHRvQnVmZmVyKCk6IEJ1ZmZlciB7XG4gICAgY29uc3QgY29kZWNpZDogQnVmZmVyID0gdGhpcy5nZXRDb2RlY0lEQnVmZmVyKCk7XG4gICAgY29uc3QgdHh0eXBlOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoNCk7XG4gICAgdHh0eXBlLndyaXRlVUludDMyQkUodGhpcy50cmFuc2FjdGlvbi5nZXRUeFR5cGUoKSwgMCk7XG4gICAgY29uc3QgYmFzZWJ1ZmY6IEJ1ZmZlciA9IHRoaXMudHJhbnNhY3Rpb24udG9CdWZmZXIoKTtcbiAgICByZXR1cm4gQnVmZmVyLmNvbmNhdChbY29kZWNpZCwgdHh0eXBlLCBiYXNlYnVmZl0sIGNvZGVjaWQubGVuZ3RoICsgdHh0eXBlLmxlbmd0aCArIGJhc2VidWZmLmxlbmd0aCk7XG4gIH1cblxuICAvKipcbiAgICogU2lnbnMgdGhpcyBbW1Vuc2lnbmVkVHhdXSBhbmQgcmV0dXJucyBzaWduZWQgW1tTdGFuZGFyZFR4XV1cbiAgICpcbiAgICogQHBhcmFtIGtjIEFuIFtbS2V5Q2hhaW5dXSB1c2VkIGluIHNpZ25pbmdcbiAgICpcbiAgICogQHJldHVybnMgQSBzaWduZWQgW1tTdGFuZGFyZFR4XV1cbiAgICovXG4gIGFic3RyYWN0IHNpZ24oa2M6IEtDQ2xhc3MpOiBFVk1TdGFuZGFyZFR4PFxuICAgIEtQQ2xhc3MsIFxuICAgIEtDQ2xhc3MsIFxuICAgIEVWTVN0YW5kYXJkVW5zaWduZWRUeDxLUENsYXNzLCBLQ0NsYXNzLCBTQlR4PlxuICA+O1xuXG4gIGNvbnN0cnVjdG9yKHRyYW5zYWN0aW9uOiBTQlR4ID0gdW5kZWZpbmVkLCBjb2RlY2lkOiBudW1iZXIgPSAwKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmNvZGVjaWQgPSBjb2RlY2lkO1xuICAgIHRoaXMudHJhbnNhY3Rpb24gPSB0cmFuc2FjdGlvbjtcbiAgfVxufVxuXG4vKipcbiAqIENsYXNzIHJlcHJlc2VudGluZyBhIHNpZ25lZCB0cmFuc2FjdGlvbi5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEVWTVN0YW5kYXJkVHg8XG4gICAgS1BDbGFzcyBleHRlbmRzIFN0YW5kYXJkS2V5UGFpciwgXG4gICAgS0NDbGFzcyBleHRlbmRzIFN0YW5kYXJkS2V5Q2hhaW48S1BDbGFzcz4sIFxuICAgIFNVQlR4IGV4dGVuZHMgRVZNU3RhbmRhcmRVbnNpZ25lZFR4PFxuICAgICAgICBLUENsYXNzLCBcbiAgICAgICAgS0NDbGFzcywgXG4gICAgICAgIEVWTVN0YW5kYXJkQmFzZVR4PEtQQ2xhc3MsIEtDQ2xhc3M+PlxuICAgID4gZXh0ZW5kcyBTZXJpYWxpemFibGUge1xuICBwcm90ZWN0ZWQgX3R5cGVOYW1lID0gXCJTdGFuZGFyZFR4XCI7XG4gIHByb3RlY3RlZCBfdHlwZUlEID0gdW5kZWZpbmVkO1xuXG4gIHNlcmlhbGl6ZShlbmNvZGluZzogU2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIik6IG9iamVjdCB7XG4gICAgbGV0IGZpZWxkczogb2JqZWN0ID0gc3VwZXIuc2VyaWFsaXplKGVuY29kaW5nKTtcbiAgICByZXR1cm4ge1xuICAgICAgLi4uZmllbGRzLFxuICAgICAgXCJ1bnNpZ25lZFR4XCI6IHRoaXMudW5zaWduZWRUeC5zZXJpYWxpemUoZW5jb2RpbmcpLFxuICAgICAgXCJjcmVkZW50aWFsc1wiOiB0aGlzLmNyZWRlbnRpYWxzLm1hcCgoYykgPT4gYy5zZXJpYWxpemUoZW5jb2RpbmcpKVxuICAgIH1cbiAgfTtcblxuICBwcm90ZWN0ZWQgdW5zaWduZWRUeDogU1VCVHggPSB1bmRlZmluZWQ7XG4gIHByb3RlY3RlZCBjcmVkZW50aWFsczogQ3JlZGVudGlhbFtdID0gW107XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIFtbU3RhbmRhcmRVbnNpZ25lZFR4XV1cbiAgICovXG4gIGdldFVuc2lnbmVkVHggPSAoKTogU1VCVHggPT4ge1xuICAgIHJldHVybiB0aGlzLnVuc2lnbmVkVHg7XG4gIH1cblxuICBhYnN0cmFjdCBmcm9tQnVmZmVyKGJ5dGVzOiBCdWZmZXIsIG9mZnNldD86IG51bWJlcik6IG51bWJlcjtcblxuICAvKipcbiAgICogUmV0dXJucyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBbW1N0YW5kYXJkVHhdXS5cbiAgICovXG4gIHRvQnVmZmVyKCk6IEJ1ZmZlciB7XG4gICAgY29uc3QgdHhidWZmOiBCdWZmZXIgPSB0aGlzLnVuc2lnbmVkVHgudG9CdWZmZXIoKTtcbiAgICBsZXQgYnNpemU6IG51bWJlciA9IHR4YnVmZi5sZW5ndGg7XG4gICAgY29uc3QgY3JlZGxlbjogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDQpO1xuICAgIGNyZWRsZW4ud3JpdGVVSW50MzJCRSh0aGlzLmNyZWRlbnRpYWxzLmxlbmd0aCwgMCk7XG4gICAgY29uc3QgYmFycjogQnVmZmVyW10gPSBbdHhidWZmLCBjcmVkbGVuXTtcbiAgICBic2l6ZSArPSBjcmVkbGVuLmxlbmd0aDtcbiAgICB0aGlzLmNyZWRlbnRpYWxzLmZvckVhY2goKGNyZWRlbnRpYWw6IENyZWRlbnRpYWwpID0+IHtcbiAgICAgIGNvbnN0IGNyZWRpZDogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDQpO1xuICAgICAgY3JlZGlkLndyaXRlVUludDMyQkUoY3JlZGVudGlhbC5nZXRDcmVkZW50aWFsSUQoKSwgMCk7XG4gICAgICBiYXJyLnB1c2goY3JlZGlkKTtcbiAgICAgIGJzaXplICs9IGNyZWRpZC5sZW5ndGg7XG4gICAgICBjb25zdCBjcmVkYnVmZjogQnVmZmVyID0gY3JlZGVudGlhbC50b0J1ZmZlcigpO1xuICAgICAgYnNpemUgKz0gY3JlZGJ1ZmYubGVuZ3RoO1xuICAgICAgYmFyci5wdXNoKGNyZWRidWZmKTtcbiAgICB9KTtcbiAgICBjb25zdCBidWZmOiBCdWZmZXIgPSBCdWZmZXIuY29uY2F0KGJhcnIsIGJzaXplKTtcbiAgICByZXR1cm4gYnVmZjtcbiAgfVxuXG4gIC8qKlxuICAgKiBUYWtlcyBhIGJhc2UtNTggc3RyaW5nIGNvbnRhaW5pbmcgYW4gW1tTdGFuZGFyZFR4XV0sIHBhcnNlcyBpdCwgcG9wdWxhdGVzIHRoZSBjbGFzcywgYW5kIHJldHVybnMgdGhlIGxlbmd0aCBvZiB0aGUgVHggaW4gYnl0ZXMuXG4gICAqXG4gICAqIEBwYXJhbSBzZXJpYWxpemVkIEEgYmFzZS01OCBzdHJpbmcgY29udGFpbmluZyBhIHJhdyBbW1N0YW5kYXJkVHhdXVxuICAgKlxuICAgKiBAcmV0dXJucyBUaGUgbGVuZ3RoIG9mIHRoZSByYXcgW1tTdGFuZGFyZFR4XV1cbiAgICpcbiAgICogQHJlbWFya3NcbiAgICogdW5saWtlIG1vc3QgZnJvbVN0cmluZ3MsIGl0IGV4cGVjdHMgdGhlIHN0cmluZyB0byBiZSBzZXJpYWxpemVkIGluIGNiNTggZm9ybWF0XG4gICAqL1xuICBmcm9tU3RyaW5nKHNlcmlhbGl6ZWQ6IHN0cmluZyk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZnJvbUJ1ZmZlcihiaW50b29scy5jYjU4RGVjb2RlKHNlcmlhbGl6ZWQpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgY2I1OCByZXByZXNlbnRhdGlvbiBvZiB0aGUgW1tTdGFuZGFyZFR4XV0uXG4gICAqXG4gICAqIEByZW1hcmtzXG4gICAqIHVubGlrZSBtb3N0IHRvU3RyaW5ncywgdGhpcyByZXR1cm5zIGluIGNiNTggc2VyaWFsaXphdGlvbiBmb3JtYXRcbiAgICovXG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGJpbnRvb2xzLmNiNThFbmNvZGUodGhpcy50b0J1ZmZlcigpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGFzcyByZXByZXNlbnRpbmcgYSBzaWduZWQgdHJhbnNhY3Rpb24uXG4gICAqXG4gICAqIEBwYXJhbSB1bnNpZ25lZFR4IE9wdGlvbmFsIFtbU3RhbmRhcmRVbnNpZ25lZFR4XV1cbiAgICogQHBhcmFtIHNpZ25hdHVyZXMgT3B0aW9uYWwgYXJyYXkgb2YgW1tDcmVkZW50aWFsXV1zXG4gICAqL1xuICBjb25zdHJ1Y3Rvcih1bnNpZ25lZFR4OiBTVUJUeCA9IHVuZGVmaW5lZCwgY3JlZGVudGlhbHM6IENyZWRlbnRpYWxbXSA9IHVuZGVmaW5lZCkge1xuICAgIHN1cGVyKCk7XG4gICAgaWYgKHR5cGVvZiB1bnNpZ25lZFR4ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhpcy51bnNpZ25lZFR4ID0gdW5zaWduZWRUeDtcbiAgICAgIGlmICh0eXBlb2YgY3JlZGVudGlhbHMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHRoaXMuY3JlZGVudGlhbHMgPSBjcmVkZW50aWFscztcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==