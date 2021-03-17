"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StandardTx = exports.StandardUnsignedTx = exports.StandardBaseTx = void 0;
/**
 * @packageDocumentation
 * @module Common-Transactions
 */
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
class StandardBaseTx extends serialization_1.Serializable {
    /**
     * Class representing a StandardBaseTx which is the foundation for all transactions.
     *
     * @param networkid Optional networkid, [[DefaultNetworkID]]
     * @param blockchainid Optional blockchainid, default Buffer.alloc(32, 16)
     * @param outs Optional array of the [[TransferableOutput]]s
     * @param ins Optional array of the [[TransferableInput]]s
     * @param memo Optional {@link https://github.com/feross/buffer|Buffer} for the memo field
     */
    constructor(networkid = constants_1.DefaultNetworkID, blockchainid = buffer_1.Buffer.alloc(32, 16), outs = undefined, ins = undefined, memo = undefined) {
        super();
        this._typeName = "StandardBaseTx";
        this._typeID = undefined;
        this.networkid = buffer_1.Buffer.alloc(4);
        this.blockchainid = buffer_1.Buffer.alloc(32);
        this.numouts = buffer_1.Buffer.alloc(4);
        this.numins = buffer_1.Buffer.alloc(4);
        this.memo = buffer_1.Buffer.alloc(0);
        /**
         * Returns the NetworkID as a number
         */
        this.getNetworkID = () => this.networkid.readUInt32BE(0);
        /**
         * Returns the Buffer representation of the BlockchainID
         */
        this.getBlockchainID = () => this.blockchainid;
        /**
         * Returns the {@link https://github.com/feross/buffer|Buffer} representation of the memo
         */
        this.getMemo = () => this.memo;
        this.networkid.writeUInt32BE(networkid, 0);
        this.blockchainid = blockchainid;
        if (typeof memo != "undefined") {
            this.memo = memo;
        }
        if (typeof ins !== 'undefined' && typeof outs !== 'undefined') {
            this.numouts.writeUInt32BE(outs.length, 0);
            this.outs = outs.sort(output_1.StandardTransferableOutput.comparator());
            this.numins.writeUInt32BE(ins.length, 0);
            this.ins = ins.sort(input_1.StandardTransferableInput.comparator());
        }
    }
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { "networkid": serializer.encoder(this.networkid, encoding, "Buffer", "decimalString"), "blockchainid": serializer.encoder(this.blockchainid, encoding, "Buffer", "cb58"), "outs": this.outs.map((o) => o.serialize(encoding)), "ins": this.ins.map((i) => i.serialize(encoding)), "memo": serializer.encoder(this.memo, encoding, "Buffer", "hex") });
    }
    ;
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.networkid = serializer.decoder(fields["networkid"], encoding, "decimalString", "Buffer", 4);
        this.blockchainid = serializer.decoder(fields["blockchainid"], encoding, "cb58", "Buffer", 32);
        this.memo = serializer.decoder(fields["memo"], encoding, "hex", "Buffer");
    }
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[StandardBaseTx]].
     */
    toBuffer() {
        this.outs.sort(output_1.StandardTransferableOutput.comparator());
        this.ins.sort(input_1.StandardTransferableInput.comparator());
        this.numouts.writeUInt32BE(this.outs.length, 0);
        this.numins.writeUInt32BE(this.ins.length, 0);
        let bsize = this.networkid.length + this.blockchainid.length + this.numouts.length;
        const barr = [this.networkid, this.blockchainid, this.numouts];
        for (let i = 0; i < this.outs.length; i++) {
            const b = this.outs[i].toBuffer();
            barr.push(b);
            bsize += b.length;
        }
        barr.push(this.numins);
        bsize += this.numins.length;
        for (let i = 0; i < this.ins.length; i++) {
            const b = this.ins[i].toBuffer();
            barr.push(b);
            bsize += b.length;
        }
        let memolen = buffer_1.Buffer.alloc(4);
        memolen.writeUInt32BE(this.memo.length, 0);
        barr.push(memolen);
        bsize += 4;
        barr.push(this.memo);
        bsize += this.memo.length;
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
exports.StandardBaseTx = StandardBaseTx;
/**
 * Class representing an unsigned transaction.
 */
class StandardUnsignedTx extends serialization_1.Serializable {
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
            const ins = this.getTransaction().getIns();
            const aIDHex = assetID.toString('hex');
            let total = new bn_js_1.default(0);
            for (let i = 0; i < ins.length; i++) {
                // only check StandardAmountInputs
                if (ins[i].getInput() instanceof input_1.StandardAmountInput && aIDHex === ins[i].getAssetID().toString('hex')) {
                    const input = ins[i].getInput();
                    total = total.add(input.getAmount());
                }
            }
            return total;
        };
        /**
         * Returns the outputTotal as a BN
         */
        this.getOutputTotal = (assetID) => {
            const outs = this.getTransaction().getTotalOuts();
            const aIDHex = assetID.toString('hex');
            let total = new bn_js_1.default(0);
            for (let i = 0; i < outs.length; i++) {
                // only check StandardAmountOutput
                if (outs[i].getOutput() instanceof output_1.StandardAmountOutput && aIDHex === outs[i].getAssetID().toString('hex')) {
                    const output = outs[i].getOutput();
                    total = total.add(output.getAmount());
                }
            }
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
        const codecBuf = buffer_1.Buffer.alloc(2);
        codecBuf.writeUInt16BE(this.transaction.getCodecID(), 0);
        const txtype = buffer_1.Buffer.alloc(4);
        txtype.writeUInt32BE(this.transaction.getTxType(), 0);
        const basebuff = this.transaction.toBuffer();
        return buffer_1.Buffer.concat([codecBuf, txtype, basebuff], codecBuf.length + txtype.length + basebuff.length);
    }
}
exports.StandardUnsignedTx = StandardUnsignedTx;
/**
 * Class representing a signed transaction.
 */
class StandardTx extends serialization_1.Serializable {
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
        const tx = this.unsignedTx.getTransaction();
        const codecID = tx.getCodecID();
        const txbuff = this.unsignedTx.toBuffer();
        let bsize = txbuff.length;
        const credlen = buffer_1.Buffer.alloc(4);
        credlen.writeUInt32BE(this.credentials.length, 0);
        const barr = [txbuff, credlen];
        bsize += credlen.length;
        for (let i = 0; i < this.credentials.length; i++) {
            this.credentials[i].setCodecID(codecID);
            const credid = buffer_1.Buffer.alloc(4);
            credid.writeUInt32BE(this.credentials[i].getCredentialID(), 0);
            barr.push(credid);
            bsize += credid.length;
            const credbuff = this.credentials[i].toBuffer();
            bsize += credbuff.length;
            barr.push(credbuff);
        }
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
exports.StandardTx = StandardTx;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbW9uL3R4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7R0FHRztBQUNILG9DQUFpQztBQUNqQyxpRUFBeUM7QUFFekMsa0RBQXVCO0FBRXZCLG1DQUF5RTtBQUN6RSxxQ0FBNEU7QUFDNUUsa0RBQXNEO0FBQ3RELDBEQUF5RjtBQUV6Rjs7R0FFRztBQUNILE1BQU0sUUFBUSxHQUFHLGtCQUFRLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDeEMsTUFBTSxVQUFVLEdBQUcsNkJBQWEsQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUUvQzs7R0FFRztBQUNILE1BQXNCLGNBQTJGLFNBQVEsNEJBQVk7SUEwSG5JOzs7Ozs7OztPQVFHO0lBQ0gsWUFBWSxZQUFtQiw0QkFBZ0IsRUFBRSxlQUFzQixlQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxPQUF5QyxTQUFTLEVBQUUsTUFBdUMsU0FBUyxFQUFFLE9BQWMsU0FBUztRQUN4TixLQUFLLEVBQUUsQ0FBQztRQW5JQSxjQUFTLEdBQUcsZ0JBQWdCLENBQUM7UUFDN0IsWUFBTyxHQUFHLFNBQVMsQ0FBQztRQXNCcEIsY0FBUyxHQUFVLGVBQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkMsaUJBQVksR0FBVSxlQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZDLFlBQU8sR0FBVSxlQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRWpDLFdBQU0sR0FBVSxlQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRWhDLFNBQUksR0FBVyxlQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBT3pDOztXQUVHO1FBQ0gsaUJBQVksR0FBRyxHQUFVLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVks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UUFDMUIsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztJQUMxRCxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxRQUFRO1FBQ04sT0FBTyxRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBQzlDLENBQUM7Q0FpQkY7QUFqR0QsZ0NBaUdDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAcGFja2FnZURvY3VtZW50YXRpb25cbiAqIEBtb2R1bGUgQ29tbW9uLVRyYW5zYWN0aW9uc1xuICovXG5pbXBvcnQgeyBCdWZmZXIgfSBmcm9tICdidWZmZXIvJztcbmltcG9ydCBCaW5Ub29scyBmcm9tICcuLi91dGlscy9iaW50b29scyc7XG5pbXBvcnQgeyBDcmVkZW50aWFsIH0gZnJvbSAnLi9jcmVkZW50aWFscyc7XG5pbXBvcnQgQk4gZnJvbSAnYm4uanMnO1xuaW1wb3J0IHsgU3RhbmRhcmRLZXlDaGFpbiwgU3RhbmRhcmRLZXlQYWlyIH0gZnJvbSAnLi9rZXljaGFpbic7XG5pbXBvcnQgeyBTdGFuZGFyZEFtb3VudElucHV0LCBTdGFuZGFyZFRyYW5zZmVyYWJsZUlucHV0IH0gZnJvbSAnLi9pbnB1dCc7XG5pbXBvcnQgeyBTdGFuZGFyZEFtb3VudE91dHB1dCwgU3RhbmRhcmRUcmFuc2ZlcmFibGVPdXRwdXQgfSBmcm9tICcuL291dHB1dCc7XG5pbXBvcnQgeyBEZWZhdWx0TmV0d29ya0lEIH0gZnJvbSAnLi4vdXRpbHMvY29uc3RhbnRzJztcbmltcG9ydCB7IFNlcmlhbGl6YWJsZSwgU2VyaWFsaXphdGlvbiwgU2VyaWFsaXplZEVuY29kaW5nIH0gZnJvbSAnLi4vdXRpbHMvc2VyaWFsaXphdGlvbic7XG5cbi8qKlxuICogQGlnbm9yZVxuICovXG5jb25zdCBiaW50b29scyA9IEJpblRvb2xzLmdldEluc3RhbmNlKCk7XG5jb25zdCBzZXJpYWxpemVyID0gU2VyaWFsaXphdGlvbi5nZXRJbnN0YW5jZSgpO1xuXG4vKipcbiAqIENsYXNzIHJlcHJlc2VudGluZyBhIGJhc2UgZm9yIGFsbCB0cmFuc2FjdGlvbnMuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBTdGFuZGFyZEJhc2VUeDxLUENsYXNzIGV4dGVuZHMgU3RhbmRhcmRLZXlQYWlyLCBLQ0NsYXNzIGV4dGVuZHMgU3RhbmRhcmRLZXlDaGFpbjxLUENsYXNzPj4gZXh0ZW5kcyBTZXJpYWxpemFibGV7XG4gIHByb3RlY3RlZCBfdHlwZU5hbWUgPSBcIlN0YW5kYXJkQmFzZVR4XCI7XG4gIHByb3RlY3RlZCBfdHlwZUlEID0gdW5kZWZpbmVkO1xuXG4gIHNlcmlhbGl6ZShlbmNvZGluZzpTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKTpvYmplY3Qge1xuICAgIGxldCBmaWVsZHM6b2JqZWN0ID0gc3VwZXIuc2VyaWFsaXplKGVuY29kaW5nKTtcbiAgICByZXR1cm4ge1xuICAgICAgLi4uZmllbGRzLFxuICAgICAgXCJuZXR3b3JraWRcIjogc2VyaWFsaXplci5lbmNvZGVyKHRoaXMubmV0d29ya2lkLCBlbmNvZGluZywgXCJCdWZmZXJcIiwgXCJkZWNpbWFsU3RyaW5nXCIpLFxuICAgICAgXCJibG9ja2NoYWluaWRcIjogc2VyaWFsaXplci5lbmNvZGVyKHRoaXMuYmxvY2tjaGFpbmlkLCBlbmNvZGluZywgXCJCdWZmZXJcIiwgXCJjYjU4XCIpLFxuICAgICAgXCJvdXRzXCI6IHRoaXMub3V0cy5tYXAoKG8pID0+IG8uc2VyaWFsaXplKGVuY29kaW5nKSksXG4gICAgICBcImluc1wiOiB0aGlzLmlucy5tYXAoKGkpID0+IGkuc2VyaWFsaXplKGVuY29kaW5nKSksXG4gICAgICBcIm1lbW9cIjogc2VyaWFsaXplci5lbmNvZGVyKHRoaXMubWVtbywgZW5jb2RpbmcsIFwiQnVmZmVyXCIsIFwiaGV4XCIpXG4gICAgfVxuICB9O1xuXG4gIGRlc2VyaWFsaXplKGZpZWxkczpvYmplY3QsIGVuY29kaW5nOlNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpIHtcbiAgICBzdXBlci5kZXNlcmlhbGl6ZShmaWVsZHMsIGVuY29kaW5nKTtcbiAgICB0aGlzLm5ldHdvcmtpZCA9IHNlcmlhbGl6ZXIuZGVjb2RlcihmaWVsZHNbXCJuZXR3b3JraWRcIl0sIGVuY29kaW5nLCBcImRlY2ltYWxTdHJpbmdcIiwgXCJCdWZmZXJcIiwgNCk7XG4gICAgdGhpcy5ibG9ja2NoYWluaWQgPSBzZXJpYWxpemVyLmRlY29kZXIoZmllbGRzW1wiYmxvY2tjaGFpbmlkXCJdLCBlbmNvZGluZywgXCJjYjU4XCIsIFwiQnVmZmVyXCIsIDMyKTtcbiAgICB0aGlzLm1lbW8gPSBzZXJpYWxpemVyLmRlY29kZXIoZmllbGRzW1wibWVtb1wiXSwgZW5jb2RpbmcsIFwiaGV4XCIsIFwiQnVmZmVyXCIpO1xuICB9XG5cblxuICBwcm90ZWN0ZWQgbmV0d29ya2lkOkJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyg0KTtcbiAgcHJvdGVjdGVkIGJsb2NrY2hhaW5pZDpCdWZmZXIgPSBCdWZmZXIuYWxsb2MoMzIpO1xuICBwcm90ZWN0ZWQgbnVtb3V0czpCdWZmZXIgPSBCdWZmZXIuYWxsb2MoNCk7XG4gIHByb3RlY3RlZCBvdXRzOkFycmF5PFN0YW5kYXJkVHJhbnNmZXJhYmxlT3V0cHV0PjtcbiAgcHJvdGVjdGVkIG51bWluczpCdWZmZXIgPSBCdWZmZXIuYWxsb2MoNCk7XG4gIHByb3RlY3RlZCBpbnM6QXJyYXk8U3RhbmRhcmRUcmFuc2ZlcmFibGVJbnB1dD47XG4gIHByb3RlY3RlZCBtZW1vOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoMCk7XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGlkIG9mIHRoZSBbW1N0YW5kYXJkQmFzZVR4XV1cbiAgICovXG4gIGFic3RyYWN0IGdldFR4VHlwZTooKSA9PiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIE5ldHdvcmtJRCBhcyBhIG51bWJlclxuICAgKi9cbiAgZ2V0TmV0d29ya0lEID0gKCk6bnVtYmVyID0+IHRoaXMubmV0d29ya2lkLnJlYWRVSW50MzJCRSgwKTtcblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgQnVmZmVyIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBCbG9ja2NoYWluSURcbiAgICovXG4gIGdldEJsb2NrY2hhaW5JRCA9ICgpOkJ1ZmZlciA9PiB0aGlzLmJsb2NrY2hhaW5pZDtcblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgYXJyYXkgb2YgW1tTdGFuZGFyZFRyYW5zZmVyYWJsZUlucHV0XV1zXG4gICAqL1xuICBhYnN0cmFjdCBnZXRJbnMoKTpBcnJheTxTdGFuZGFyZFRyYW5zZmVyYWJsZUlucHV0PjtcblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgYXJyYXkgb2YgW1tTdGFuZGFyZFRyYW5zZmVyYWJsZU91dHB1dF1dc1xuICAgKi9cbiAgYWJzdHJhY3QgZ2V0T3V0cygpOkFycmF5PFN0YW5kYXJkVHJhbnNmZXJhYmxlT3V0cHV0PjtcblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgYXJyYXkgb2YgY29tYmluZWQgdG90YWwgW1tTdGFuZGFyZFRyYW5zZmVyYWJsZU91dHB1dF1dc1xuICAgKi9cbiAgYWJzdHJhY3QgZ2V0VG90YWxPdXRzKCk6QXJyYXk8U3RhbmRhcmRUcmFuc2ZlcmFibGVPdXRwdXQ+O1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSByZXByZXNlbnRhdGlvbiBvZiB0aGUgbWVtbyBcbiAgICovXG4gIGdldE1lbW8gPSAoKTpCdWZmZXIgPT4gdGhpcy5tZW1vO1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gcmVwcmVzZW50YXRpb24gb2YgdGhlIFtbU3RhbmRhcmRCYXNlVHhdXS5cbiAgICovXG4gIHRvQnVmZmVyKCk6QnVmZmVyIHtcbiAgICB0aGlzLm91dHMuc29ydChTdGFuZGFyZFRyYW5zZmVyYWJsZU91dHB1dC5jb21wYXJhdG9yKCkpO1xuICAgIHRoaXMuaW5zLnNvcnQoU3RhbmRhcmRUcmFuc2ZlcmFibGVJbnB1dC5jb21wYXJhdG9yKCkpO1xuICAgIHRoaXMubnVtb3V0cy53cml0ZVVJbnQzMkJFKHRoaXMub3V0cy5sZW5ndGgsIDApO1xuICAgIHRoaXMubnVtaW5zLndyaXRlVUludDMyQkUodGhpcy5pbnMubGVuZ3RoLCAwKTtcbiAgICBsZXQgYnNpemU6bnVtYmVyID0gdGhpcy5uZXR3b3JraWQubGVuZ3RoICsgdGhpcy5ibG9ja2NoYWluaWQubGVuZ3RoICsgdGhpcy5udW1vdXRzLmxlbmd0aDtcbiAgICBjb25zdCBiYXJyOkFycmF5PEJ1ZmZlcj4gPSBbdGhpcy5uZXR3b3JraWQsIHRoaXMuYmxvY2tjaGFpbmlkLCB0aGlzLm51bW91dHNdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5vdXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBiOkJ1ZmZlciA9IHRoaXMub3V0c1tpXS50b0J1ZmZlcigpO1xuICAgICAgYmFyci5wdXNoKGIpO1xuICAgICAgYnNpemUgKz0gYi5sZW5ndGg7XG4gICAgfVxuICAgIGJhcnIucHVzaCh0aGlzLm51bWlucyk7XG4gICAgYnNpemUgKz0gdGhpcy5udW1pbnMubGVuZ3RoO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5pbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGI6QnVmZmVyID0gdGhpcy5pbnNbaV0udG9CdWZmZXIoKTtcbiAgICAgIGJhcnIucHVzaChiKTtcbiAgICAgIGJzaXplICs9IGIubGVuZ3RoO1xuICAgIH1cbiAgICBsZXQgbWVtb2xlbjpCdWZmZXIgPSBCdWZmZXIuYWxsb2MoNCk7XG4gICAgbWVtb2xlbi53cml0ZVVJbnQzMkJFKHRoaXMubWVtby5sZW5ndGgsIDApO1xuICAgIGJhcnIucHVzaChtZW1vbGVuKTtcbiAgICBic2l6ZSArPSA0O1xuICAgIGJhcnIucHVzaCh0aGlzLm1lbW8pO1xuICAgIGJzaXplICs9IHRoaXMubWVtby5sZW5ndGg7XG4gICAgY29uc3QgYnVmZjpCdWZmZXIgPSBCdWZmZXIuY29uY2F0KGJhcnIsIGJzaXplKTtcbiAgICByZXR1cm4gYnVmZjtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgYmFzZS01OCByZXByZXNlbnRhdGlvbiBvZiB0aGUgW1tTdGFuZGFyZEJhc2VUeF1dLlxuICAgKi9cbiAgdG9TdHJpbmcoKTpzdHJpbmcge1xuICAgIHJldHVybiBiaW50b29scy5idWZmZXJUb0I1OCh0aGlzLnRvQnVmZmVyKCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRha2VzIHRoZSBieXRlcyBvZiBhbiBbW1Vuc2lnbmVkVHhdXSBhbmQgcmV0dXJucyBhbiBhcnJheSBvZiBbW0NyZWRlbnRpYWxdXXNcbiAgICpcbiAgICogQHBhcmFtIG1zZyBBIEJ1ZmZlciBmb3IgdGhlIFtbVW5zaWduZWRUeF1dXG4gICAqIEBwYXJhbSBrYyBBbiBbW0tleUNoYWluXV0gdXNlZCBpbiBzaWduaW5nXG4gICAqXG4gICAqIEByZXR1cm5zIEFuIGFycmF5IG9mIFtbQ3JlZGVudGlhbF1dc1xuICAgKi9cbiAgYWJzdHJhY3Qgc2lnbihtc2c6QnVmZmVyLCBrYzpTdGFuZGFyZEtleUNoYWluPEtQQ2xhc3M+KTpBcnJheTxDcmVkZW50aWFsPjtcblxuICBhYnN0cmFjdCBjbG9uZSgpOnRoaXM7XG5cbiAgYWJzdHJhY3QgY3JlYXRlKC4uLmFyZ3M6YW55W10pOnRoaXM7XG5cbiAgYWJzdHJhY3Qgc2VsZWN0KGlkOm51bWJlciwgLi4uYXJnczphbnlbXSk6dGhpcztcblxuICAvKipcbiAgICogQ2xhc3MgcmVwcmVzZW50aW5nIGEgU3RhbmRhcmRCYXNlVHggd2hpY2ggaXMgdGhlIGZvdW5kYXRpb24gZm9yIGFsbCB0cmFuc2FjdGlvbnMuXG4gICAqXG4gICAqIEBwYXJhbSBuZXR3b3JraWQgT3B0aW9uYWwgbmV0d29ya2lkLCBbW0RlZmF1bHROZXR3b3JrSURdXVxuICAgKiBAcGFyYW0gYmxvY2tjaGFpbmlkIE9wdGlvbmFsIGJsb2NrY2hhaW5pZCwgZGVmYXVsdCBCdWZmZXIuYWxsb2MoMzIsIDE2KVxuICAgKiBAcGFyYW0gb3V0cyBPcHRpb25hbCBhcnJheSBvZiB0aGUgW1tUcmFuc2ZlcmFibGVPdXRwdXRdXXNcbiAgICogQHBhcmFtIGlucyBPcHRpb25hbCBhcnJheSBvZiB0aGUgW1tUcmFuc2ZlcmFibGVJbnB1dF1dc1xuICAgKiBAcGFyYW0gbWVtbyBPcHRpb25hbCB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBmb3IgdGhlIG1lbW8gZmllbGRcbiAgICovXG4gIGNvbnN0cnVjdG9yKG5ldHdvcmtpZDpudW1iZXIgPSBEZWZhdWx0TmV0d29ya0lELCBibG9ja2NoYWluaWQ6QnVmZmVyID0gQnVmZmVyLmFsbG9jKDMyLCAxNiksIG91dHM6QXJyYXk8U3RhbmRhcmRUcmFuc2ZlcmFibGVPdXRwdXQ+ID0gdW5kZWZpbmVkLCBpbnM6QXJyYXk8U3RhbmRhcmRUcmFuc2ZlcmFibGVJbnB1dD4gPSB1bmRlZmluZWQsIG1lbW86QnVmZmVyID0gdW5kZWZpbmVkKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLm5ldHdvcmtpZC53cml0ZVVJbnQzMkJFKG5ldHdvcmtpZCwgMCk7XG4gICAgdGhpcy5ibG9ja2NoYWluaWQgPSBibG9ja2NoYWluaWQ7XG4gICAgaWYodHlwZW9mIG1lbW8gIT0gXCJ1bmRlZmluZWRcIil7XG4gICAgICB0aGlzLm1lbW8gPSBtZW1vO1xuICAgIH1cbiAgICBcbiAgICBpZiAodHlwZW9mIGlucyAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIG91dHMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aGlzLm51bW91dHMud3JpdGVVSW50MzJCRShvdXRzLmxlbmd0aCwgMCk7XG4gICAgICB0aGlzLm91dHMgPSBvdXRzLnNvcnQoU3RhbmRhcmRUcmFuc2ZlcmFibGVPdXRwdXQuY29tcGFyYXRvcigpKTtcbiAgICAgIHRoaXMubnVtaW5zLndyaXRlVUludDMyQkUoaW5zLmxlbmd0aCwgMCk7XG4gICAgICB0aGlzLmlucyA9IGlucy5zb3J0KFN0YW5kYXJkVHJhbnNmZXJhYmxlSW5wdXQuY29tcGFyYXRvcigpKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBDbGFzcyByZXByZXNlbnRpbmcgYW4gdW5zaWduZWQgdHJhbnNhY3Rpb24uXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBTdGFuZGFyZFVuc2lnbmVkVHg8S1BDbGFzcyBleHRlbmRzIFN0YW5kYXJkS2V5UGFpciwgXG5LQ0NsYXNzIGV4dGVuZHMgU3RhbmRhcmRLZXlDaGFpbjxLUENsYXNzPiwgXG5TQlR4IGV4dGVuZHMgU3RhbmRhcmRCYXNlVHg8S1BDbGFzcywgS0NDbGFzcz5cbj4gZXh0ZW5kcyBTZXJpYWxpemFibGV7XG4gIHByb3RlY3RlZCBfdHlwZU5hbWUgPSBcIlN0YW5kYXJkVW5zaWduZWRUeFwiO1xuICBwcm90ZWN0ZWQgX3R5cGVJRCA9IHVuZGVmaW5lZDtcblxuICBzZXJpYWxpemUoZW5jb2Rpbmc6U2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIik6b2JqZWN0IHtcbiAgICBsZXQgZmllbGRzOm9iamVjdCA9IHN1cGVyLnNlcmlhbGl6ZShlbmNvZGluZyk7XG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLmZpZWxkcyxcbiAgICAgIFwiY29kZWNpZFwiOiBzZXJpYWxpemVyLmVuY29kZXIodGhpcy5jb2RlY2lkLCBlbmNvZGluZywgXCJudW1iZXJcIiwgXCJkZWNpbWFsU3RyaW5nXCIsIDIpLFxuICAgICAgXCJ0cmFuc2FjdGlvblwiOiB0aGlzLnRyYW5zYWN0aW9uLnNlcmlhbGl6ZShlbmNvZGluZylcbiAgICB9O1xuICB9O1xuXG4gIGRlc2VyaWFsaXplKGZpZWxkczpvYmplY3QsIGVuY29kaW5nOlNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpIHtcbiAgICBzdXBlci5kZXNlcmlhbGl6ZShmaWVsZHMsIGVuY29kaW5nKTtcbiAgICB0aGlzLmNvZGVjaWQgPSBzZXJpYWxpemVyLmRlY29kZXIoZmllbGRzW1wiY29kZWNpZFwiXSwgZW5jb2RpbmcsIFwiZGVjaW1hbFN0cmluZ1wiLCBcIm51bWJlclwiKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBjb2RlY2lkOm51bWJlciA9IDA7XG4gIHByb3RlY3RlZCB0cmFuc2FjdGlvbjpTQlR4O1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBDb2RlY0lEIGFzIGEgbnVtYmVyXG4gICAqL1xuICBnZXRDb2RlY0lEID0gKCk6bnVtYmVyID0+IHRoaXMuY29kZWNpZDtcblxuICAvKipcbiAgKiBSZXR1cm5zIHRoZSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSByZXByZXNlbnRhdGlvbiBvZiB0aGUgQ29kZWNJRFxuICAqL1xuICBnZXRDb2RlY0lEQnVmZmVyID0gKCk6QnVmZmVyID0+IHtcbiAgICBsZXQgY29kZWNCdWY6QnVmZmVyID0gQnVmZmVyLmFsbG9jKDIpO1xuICAgIGNvZGVjQnVmLndyaXRlVUludDE2QkUodGhpcy5jb2RlY2lkLCAwKTtcbiAgICByZXR1cm4gY29kZWNCdWY7XG4gIH0gXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGlucHV0VG90YWwgYXMgYSBCTiBcbiAgICovXG4gIGdldElucHV0VG90YWwgPSAoYXNzZXRJRDpCdWZmZXIpOkJOPT4ge1xuICAgIGNvbnN0IGluczpBcnJheTxTdGFuZGFyZFRyYW5zZmVyYWJsZUlucHV0PiA9IHRoaXMuZ2V0VHJhbnNhY3Rpb24oKS5nZXRJbnMoKTtcbiAgICBjb25zdCBhSURIZXg6c3RyaW5nID0gYXNzZXRJRC50b1N0cmluZygnaGV4Jyk7XG4gICAgbGV0IHRvdGFsOkJOID0gbmV3IEJOKDApO1xuXG4gICAgZm9yKGxldCBpOm51bWJlciA9IDA7IGkgPCBpbnMubGVuZ3RoOyBpKyspe1xuICAgICAgIFxuXG4gICAgICAvLyBvbmx5IGNoZWNrIFN0YW5kYXJkQW1vdW50SW5wdXRzXG4gICAgICBpZihpbnNbaV0uZ2V0SW5wdXQoKSBpbnN0YW5jZW9mIFN0YW5kYXJkQW1vdW50SW5wdXQgJiYgYUlESGV4ID09PSBpbnNbaV0uZ2V0QXNzZXRJRCgpLnRvU3RyaW5nKCdoZXgnKSkge1xuICAgICAgICBjb25zdCBpbnB1dCA9IGluc1tpXS5nZXRJbnB1dCgpIGFzIFN0YW5kYXJkQW1vdW50SW5wdXQ7XG4gICAgICAgIHRvdGFsID0gdG90YWwuYWRkKGlucHV0LmdldEFtb3VudCgpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRvdGFsO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIG91dHB1dFRvdGFsIGFzIGEgQk5cbiAgICovXG4gIGdldE91dHB1dFRvdGFsID0gKGFzc2V0SUQ6QnVmZmVyKTpCTiA9PiB7XG4gICAgY29uc3Qgb3V0czpBcnJheTxTdGFuZGFyZFRyYW5zZmVyYWJsZU91dHB1dD4gPSB0aGlzLmdldFRyYW5zYWN0aW9uKCkuZ2V0VG90YWxPdXRzKCk7XG4gICAgY29uc3QgYUlESGV4OnN0cmluZyA9IGFzc2V0SUQudG9TdHJpbmcoJ2hleCcpO1xuICAgIGxldCB0b3RhbDpCTiA9IG5ldyBCTigwKTtcblxuICAgIGZvcihsZXQgaTpudW1iZXIgPSAwOyBpIDwgb3V0cy5sZW5ndGg7IGkrKyl7XG5cbiAgICAgIC8vIG9ubHkgY2hlY2sgU3RhbmRhcmRBbW91bnRPdXRwdXRcbiAgICAgIGlmKG91dHNbaV0uZ2V0T3V0cHV0KCkgaW5zdGFuY2VvZiBTdGFuZGFyZEFtb3VudE91dHB1dCAmJiBhSURIZXggPT09IG91dHNbaV0uZ2V0QXNzZXRJRCgpLnRvU3RyaW5nKCdoZXgnKSkge1xuICAgICAgICBjb25zdCBvdXRwdXQ6U3RhbmRhcmRBbW91bnRPdXRwdXQgPSBvdXRzW2ldLmdldE91dHB1dCgpIGFzIFN0YW5kYXJkQW1vdW50T3V0cHV0O1xuICAgICAgICB0b3RhbCA9IHRvdGFsLmFkZChvdXRwdXQuZ2V0QW1vdW50KCkpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdG90YWw7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbnVtYmVyIG9mIGJ1cm5lZCB0b2tlbnMgYXMgYSBCTlxuICAgKi9cbiAgZ2V0QnVybiA9IChhc3NldElEOkJ1ZmZlcik6Qk4gPT4ge1xuICAgIHJldHVybiB0aGlzLmdldElucHV0VG90YWwoYXNzZXRJRCkuc3ViKHRoaXMuZ2V0T3V0cHV0VG90YWwoYXNzZXRJRCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIFRyYW5zYWN0aW9uXG4gICAqL1xuICBhYnN0cmFjdCBnZXRUcmFuc2FjdGlvbigpOlNCVHg7XG5cbiAgYWJzdHJhY3QgZnJvbUJ1ZmZlcihieXRlczpCdWZmZXIsIG9mZnNldD86bnVtYmVyKTpudW1iZXI7XG5cbiAgdG9CdWZmZXIoKTpCdWZmZXIge1xuICAgIGNvbnN0IGNvZGVjQnVmOkJ1ZmZlciA9IEJ1ZmZlci5hbGxvYygyKTtcbiAgICBjb2RlY0J1Zi53cml0ZVVJbnQxNkJFKHRoaXMudHJhbnNhY3Rpb24uZ2V0Q29kZWNJRCgpLCAwKVxuICAgIGNvbnN0IHR4dHlwZTpCdWZmZXIgPSBCdWZmZXIuYWxsb2MoNCk7XG4gICAgdHh0eXBlLndyaXRlVUludDMyQkUodGhpcy50cmFuc2FjdGlvbi5nZXRUeFR5cGUoKSwgMCk7XG4gICAgY29uc3QgYmFzZWJ1ZmYgPSB0aGlzLnRyYW5zYWN0aW9uLnRvQnVmZmVyKCk7XG4gICAgcmV0dXJuIEJ1ZmZlci5jb25jYXQoW2NvZGVjQnVmLCB0eHR5cGUsIGJhc2VidWZmXSwgY29kZWNCdWYubGVuZ3RoICsgdHh0eXBlLmxlbmd0aCArIGJhc2VidWZmLmxlbmd0aCk7XG4gIH1cblxuICAvKipcbiAgICogU2lnbnMgdGhpcyBbW1Vuc2lnbmVkVHhdXSBhbmQgcmV0dXJucyBzaWduZWQgW1tTdGFuZGFyZFR4XV1cbiAgICpcbiAgICogQHBhcmFtIGtjIEFuIFtbS2V5Q2hhaW5dXSB1c2VkIGluIHNpZ25pbmdcbiAgICpcbiAgICogQHJldHVybnMgQSBzaWduZWQgW1tTdGFuZGFyZFR4XV1cbiAgICovXG4gIGFic3RyYWN0IHNpZ24oa2M6S0NDbGFzcyk6U3RhbmRhcmRUeDxcbiAgICBLUENsYXNzLCBcbiAgICBLQ0NsYXNzLCBcbiAgICBTdGFuZGFyZFVuc2lnbmVkVHg8S1BDbGFzcywgS0NDbGFzcywgU0JUeD5cbiAgPjtcblxuICBjb25zdHJ1Y3Rvcih0cmFuc2FjdGlvbjpTQlR4ID0gdW5kZWZpbmVkLCBjb2RlY2lkOm51bWJlciA9IDApIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuY29kZWNpZCA9IGNvZGVjaWQ7XG4gICAgdGhpcy50cmFuc2FjdGlvbiA9IHRyYW5zYWN0aW9uO1xuICB9XG59XG5cbi8qKlxuICogQ2xhc3MgcmVwcmVzZW50aW5nIGEgc2lnbmVkIHRyYW5zYWN0aW9uLlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgU3RhbmRhcmRUeDxcbiAgICBLUENsYXNzIGV4dGVuZHMgU3RhbmRhcmRLZXlQYWlyLCBcbiAgICBLQ0NsYXNzIGV4dGVuZHMgU3RhbmRhcmRLZXlDaGFpbjxLUENsYXNzPiwgXG4gICAgU1VCVHggZXh0ZW5kcyBTdGFuZGFyZFVuc2lnbmVkVHg8XG4gICAgICAgIEtQQ2xhc3MsIFxuICAgICAgICBLQ0NsYXNzLCBcbiAgICAgICAgU3RhbmRhcmRCYXNlVHg8S1BDbGFzcywgS0NDbGFzcz4+XG4gICAgPiBleHRlbmRzIFNlcmlhbGl6YWJsZSB7XG4gIHByb3RlY3RlZCBfdHlwZU5hbWUgPSBcIlN0YW5kYXJkVHhcIjtcbiAgcHJvdGVjdGVkIF90eXBlSUQgPSB1bmRlZmluZWQ7XG5cbiAgc2VyaWFsaXplKGVuY29kaW5nOlNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpOm9iamVjdCB7XG4gICAgbGV0IGZpZWxkczpvYmplY3QgPSBzdXBlci5zZXJpYWxpemUoZW5jb2RpbmcpO1xuICAgIHJldHVybiB7XG4gICAgICAuLi5maWVsZHMsXG4gICAgICBcInVuc2lnbmVkVHhcIjogdGhpcy51bnNpZ25lZFR4LnNlcmlhbGl6ZShlbmNvZGluZyksXG4gICAgICBcImNyZWRlbnRpYWxzXCI6IHRoaXMuY3JlZGVudGlhbHMubWFwKChjKSA9PiBjLnNlcmlhbGl6ZShlbmNvZGluZykpXG4gICAgfVxuICB9O1xuXG4gIHByb3RlY3RlZCB1bnNpZ25lZFR4OlNVQlR4ID0gdW5kZWZpbmVkO1xuICBwcm90ZWN0ZWQgY3JlZGVudGlhbHM6QXJyYXk8Q3JlZGVudGlhbD4gPSBbXTtcblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgW1tTdGFuZGFyZFVuc2lnbmVkVHhdXVxuICAgKi9cbiAgZ2V0VW5zaWduZWRUeCA9ICgpOlNVQlR4ID0+IHtcbiAgICByZXR1cm4gdGhpcy51bnNpZ25lZFR4O1xuICB9XG5cbiAgYWJzdHJhY3QgZnJvbUJ1ZmZlcihieXRlczpCdWZmZXIsIG9mZnNldD86bnVtYmVyKTpudW1iZXI7XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSByZXByZXNlbnRhdGlvbiBvZiB0aGUgW1tTdGFuZGFyZFR4XV0uXG4gICAqL1xuICB0b0J1ZmZlcigpOkJ1ZmZlciB7XG4gICAgY29uc3QgdHggPSB0aGlzLnVuc2lnbmVkVHguZ2V0VHJhbnNhY3Rpb24oKTtcbiAgICBjb25zdCBjb2RlY0lEOiBudW1iZXIgPSB0eC5nZXRDb2RlY0lEKCk7XG4gICAgY29uc3QgdHhidWZmOkJ1ZmZlciA9IHRoaXMudW5zaWduZWRUeC50b0J1ZmZlcigpO1xuICAgIGxldCBic2l6ZTpudW1iZXIgPSB0eGJ1ZmYubGVuZ3RoO1xuICAgIGNvbnN0IGNyZWRsZW46QnVmZmVyID0gQnVmZmVyLmFsbG9jKDQpO1xuICAgIGNyZWRsZW4ud3JpdGVVSW50MzJCRSh0aGlzLmNyZWRlbnRpYWxzLmxlbmd0aCwgMCk7XG4gICAgY29uc3QgYmFycjpBcnJheTxCdWZmZXI+ID0gW3R4YnVmZiwgY3JlZGxlbl07XG4gICAgYnNpemUgKz0gY3JlZGxlbi5sZW5ndGg7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmNyZWRlbnRpYWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB0aGlzLmNyZWRlbnRpYWxzW2ldLnNldENvZGVjSUQoY29kZWNJRCk7XG4gICAgICBjb25zdCBjcmVkaWQ6QnVmZmVyID0gQnVmZmVyLmFsbG9jKDQpO1xuICAgICAgY3JlZGlkLndyaXRlVUludDMyQkUodGhpcy5jcmVkZW50aWFsc1tpXS5nZXRDcmVkZW50aWFsSUQoKSwgMCk7XG4gICAgICBiYXJyLnB1c2goY3JlZGlkKTtcbiAgICAgIGJzaXplICs9IGNyZWRpZC5sZW5ndGg7XG4gICAgICBjb25zdCBjcmVkYnVmZjpCdWZmZXIgPSB0aGlzLmNyZWRlbnRpYWxzW2ldLnRvQnVmZmVyKCk7XG4gICAgICBic2l6ZSArPSBjcmVkYnVmZi5sZW5ndGg7XG4gICAgICBiYXJyLnB1c2goY3JlZGJ1ZmYpO1xuICAgIH1cbiAgICBjb25zdCBidWZmOkJ1ZmZlciA9IEJ1ZmZlci5jb25jYXQoYmFyciwgYnNpemUpO1xuICAgIHJldHVybiBidWZmO1xuICB9XG5cbiAgLyoqXG4gICAqIFRha2VzIGEgYmFzZS01OCBzdHJpbmcgY29udGFpbmluZyBhbiBbW1N0YW5kYXJkVHhdXSwgcGFyc2VzIGl0LCBwb3B1bGF0ZXMgdGhlIGNsYXNzLCBhbmQgcmV0dXJucyB0aGUgbGVuZ3RoIG9mIHRoZSBUeCBpbiBieXRlcy5cbiAgICpcbiAgICogQHBhcmFtIHNlcmlhbGl6ZWQgQSBiYXNlLTU4IHN0cmluZyBjb250YWluaW5nIGEgcmF3IFtbU3RhbmRhcmRUeF1dXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSBsZW5ndGggb2YgdGhlIHJhdyBbW1N0YW5kYXJkVHhdXVxuICAgKlxuICAgKiBAcmVtYXJrc1xuICAgKiB1bmxpa2UgbW9zdCBmcm9tU3RyaW5ncywgaXQgZXhwZWN0cyB0aGUgc3RyaW5nIHRvIGJlIHNlcmlhbGl6ZWQgaW4gY2I1OCBmb3JtYXRcbiAgICovXG4gIGZyb21TdHJpbmcoc2VyaWFsaXplZDpzdHJpbmcpOm51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZnJvbUJ1ZmZlcihiaW50b29scy5jYjU4RGVjb2RlKHNlcmlhbGl6ZWQpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgY2I1OCByZXByZXNlbnRhdGlvbiBvZiB0aGUgW1tTdGFuZGFyZFR4XV0uXG4gICAqXG4gICAqIEByZW1hcmtzXG4gICAqIHVubGlrZSBtb3N0IHRvU3RyaW5ncywgdGhpcyByZXR1cm5zIGluIGNiNTggc2VyaWFsaXphdGlvbiBmb3JtYXRcbiAgICovXG4gIHRvU3RyaW5nKCk6c3RyaW5nIHtcbiAgICByZXR1cm4gYmludG9vbHMuY2I1OEVuY29kZSh0aGlzLnRvQnVmZmVyKCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIENsYXNzIHJlcHJlc2VudGluZyBhIHNpZ25lZCB0cmFuc2FjdGlvbi5cbiAgICpcbiAgICogQHBhcmFtIHVuc2lnbmVkVHggT3B0aW9uYWwgW1tTdGFuZGFyZFVuc2lnbmVkVHhdXVxuICAgKiBAcGFyYW0gc2lnbmF0dXJlcyBPcHRpb25hbCBhcnJheSBvZiBbW0NyZWRlbnRpYWxdXXNcbiAgICovXG4gIGNvbnN0cnVjdG9yKHVuc2lnbmVkVHg6U1VCVHggPSB1bmRlZmluZWQsIGNyZWRlbnRpYWxzOkFycmF5PENyZWRlbnRpYWw+ID0gdW5kZWZpbmVkKSB7XG4gICAgc3VwZXIoKTtcbiAgICBpZiAodHlwZW9mIHVuc2lnbmVkVHggIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aGlzLnVuc2lnbmVkVHggPSB1bnNpZ25lZFR4O1xuICAgICAgaWYgKHR5cGVvZiBjcmVkZW50aWFscyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgdGhpcy5jcmVkZW50aWFscyA9IGNyZWRlbnRpYWxzO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19