"use strict";
/**
 * @packageDocumentation
 * @module Common-Output
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseNFTOutput = exports.StandardAmountOutput = exports.StandardTransferableOutput = exports.StandardParseableOutput = exports.Output = exports.OutputOwners = exports.Address = void 0;
const buffer_1 = require("buffer/");
const bn_js_1 = __importDefault(require("bn.js"));
const bintools_1 = __importDefault(require("../utils/bintools"));
const nbytes_1 = require("./nbytes");
const helperfunctions_1 = require("../utils/helperfunctions");
const serialization_1 = require("../utils/serialization");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
const serializer = serialization_1.Serialization.getInstance();
/**
 * Class for representing an address used in [[Output]] types
 */
class Address extends nbytes_1.NBytes {
    /**
     * Class for representing an address used in [[Output]] types
     */
    constructor() {
        super();
        this._typeName = "Address";
        this._typeID = undefined;
        //serialize and deserialize both are inherited
        this.bytes = buffer_1.Buffer.alloc(20);
        this.bsize = 20;
    }
    /**
       * Returns a base-58 representation of the [[Address]].
       */
    toString() {
        return bintools.cb58Encode(this.toBuffer());
    }
    /**
       * Takes a base-58 string containing an [[Address]], parses it, populates the class, and returns the length of the Address in bytes.
       *
       * @param bytes A base-58 string containing a raw [[Address]]
       *
       * @returns The length of the raw [[Address]]
       */
    fromString(addr) {
        const addrbuff = bintools.b58ToBuffer(addr);
        if (addrbuff.length === 24 && bintools.validateChecksum(addrbuff)) {
            const newbuff = bintools.copyFrom(addrbuff, 0, addrbuff.length - 4);
            if (newbuff.length === 20) {
                this.bytes = newbuff;
            }
        }
        else if (addrbuff.length === 24) {
            throw new Error('Error - Address.fromString: invalid checksum on address');
        }
        else if (addrbuff.length === 20) {
            this.bytes = addrbuff;
        }
        else {
            /* istanbul ignore next */
            throw new Error('Error - Address.fromString: invalid address');
        }
        return this.getSize();
    }
    clone() {
        let newbase = new Address();
        newbase.fromBuffer(this.toBuffer());
        return newbase;
    }
    create(...args) {
        return new Address();
    }
}
exports.Address = Address;
/**
 * Returns a function used to sort an array of [[Address]]es
 */
Address.comparator = () => (a, b) => buffer_1.Buffer.compare(a.toBuffer(), b.toBuffer());
/**
 * Defines the most basic values for output ownership. Mostly inherited from, but can be used in population of NFT Owner data.
 */
class OutputOwners extends serialization_1.Serializable {
    /**
     * An [[Output]] class which contains addresses, locktimes, and thresholds.
     *
     * @param addresses An array of {@link https://github.com/feross/buffer|Buffer}s representing output owner's addresses
     * @param locktime A {@link https://github.com/indutny/bn.js/|BN} representing the locktime
     * @param threshold A number representing the the threshold number of signers required to sign the transaction
     */
    constructor(addresses = undefined, locktime = undefined, threshold = undefined) {
        super();
        this._typeName = "OutputOwners";
        this._typeID = undefined;
        this.locktime = buffer_1.Buffer.alloc(8);
        this.threshold = buffer_1.Buffer.alloc(4);
        this.numaddrs = buffer_1.Buffer.alloc(4);
        this.addresses = [];
        /**
         * Returns the threshold of signers required to spend this output.
         */
        this.getThreshold = () => this.threshold.readUInt32BE(0);
        /**
         * Returns the a {@link https://github.com/indutny/bn.js/|BN} repersenting the UNIX Timestamp when the lock is made available.
         */
        this.getLocktime = () => bintools.fromBufferToBN(this.locktime);
        /**
         * Returns an array of {@link https://github.com/feross/buffer|Buffer}s for the addresses.
         */
        this.getAddresses = () => {
            const result = [];
            for (let i = 0; i < this.addresses.length; i++) {
                result.push(this.addresses[i].toBuffer());
            }
            return result;
        };
        /**
         * Returns the index of the address.
         *
         * @param address A {@link https://github.com/feross/buffer|Buffer} of the address to look up to return its index.
         *
         * @returns The index of the address.
         */
        this.getAddressIdx = (address) => {
            for (let i = 0; i < this.addresses.length; i++) {
                if (this.addresses[i].toBuffer().toString('hex') === address.toString('hex')) {
                    return i;
                }
            }
            /* istanbul ignore next */
            return -1;
        };
        /**
         * Returns the address from the index provided.
         *
         * @param idx The index of the address.
         *
         * @returns Returns the string representing the address.
         */
        this.getAddress = (idx) => {
            if (idx < this.addresses.length) {
                return this.addresses[idx].toBuffer();
            }
            throw new Error('Error - Output.getAddress: idx out of range');
        };
        /**
         * Given an array of address {@link https://github.com/feross/buffer|Buffer}s and an optional timestamp, returns true if the addresses meet the threshold required to spend the output.
         */
        this.meetsThreshold = (addresses, asOf = undefined) => {
            let now;
            if (typeof asOf === 'undefined') {
                now = helperfunctions_1.UnixNow();
            }
            else {
                now = asOf;
            }
            const qualified = this.getSpenders(addresses, now);
            const threshold = this.threshold.readUInt32BE(0);
            if (qualified.length >= threshold) {
                return true;
            }
            return false;
        };
        /**
         * Given an array of addresses and an optional timestamp, select an array of address {@link https://github.com/feross/buffer|Buffer}s of qualified spenders for the output.
         */
        this.getSpenders = (addresses, asOf = undefined) => {
            const qualified = [];
            let now;
            if (typeof asOf === 'undefined') {
                now = helperfunctions_1.UnixNow();
            }
            else {
                now = asOf;
            }
            const locktime = bintools.fromBufferToBN(this.locktime);
            if (now.lte(locktime)) { // not unlocked, not spendable
                return qualified;
            }
            const threshold = this.threshold.readUInt32BE(0);
            for (let i = 0; i < this.addresses.length && qualified.length < threshold; i++) {
                for (let j = 0; j < addresses.length && qualified.length < threshold; j++) {
                    if (addresses[j].toString('hex') === this.addresses[i].toBuffer().toString('hex')) {
                        qualified.push(addresses[j]);
                    }
                }
            }
            return qualified;
        };
        if (typeof addresses !== "undefined" && addresses.length) {
            const addrs = [];
            for (let i = 0; i < addresses.length; i++) {
                addrs[i] = new Address();
                addrs[i].fromBuffer(addresses[i]);
            }
            this.addresses = addrs;
            this.addresses.sort(Address.comparator());
            this.numaddrs.writeUInt32BE(this.addresses.length, 0);
        }
        if (typeof threshold !== undefined) {
            this.threshold.writeUInt32BE((threshold || 1), 0);
        }
        if (typeof locktime !== "undefined") {
            this.locktime = bintools.fromBNToBuffer(locktime, 8);
        }
    }
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { "locktime": serializer.encoder(this.locktime, encoding, "Buffer", "decimalString", 8), "threshold": serializer.encoder(this.threshold, encoding, "Buffer", "decimalString", 4), "addresses": this.addresses.map((a) => a.serialize(encoding)) });
    }
    ;
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.locktime = serializer.decoder(fields["locktime"], encoding, "decimalString", "Buffer", 8);
        this.threshold = serializer.decoder(fields["threshold"], encoding, "decimalString", "Buffer", 4);
        this.addresses = fields["addresses"].map((a) => {
            let addr = new Address();
            addr.deserialize(a, encoding);
            return addr;
        });
        this.numaddrs = buffer_1.Buffer.alloc(4);
        this.numaddrs.writeUInt32BE(this.addresses.length, 0);
    }
    /**
     * Returns a base-58 string representing the [[Output]].
     */
    fromBuffer(bytes, offset = 0) {
        this.locktime = bintools.copyFrom(bytes, offset, offset + 8);
        offset += 8;
        this.threshold = bintools.copyFrom(bytes, offset, offset + 4);
        offset += 4;
        this.numaddrs = bintools.copyFrom(bytes, offset, offset + 4);
        offset += 4;
        const numaddrs = this.numaddrs.readUInt32BE(0);
        this.addresses = [];
        for (let i = 0; i < numaddrs; i++) {
            const addr = new Address();
            offset = addr.fromBuffer(bytes, offset);
            this.addresses.push(addr);
        }
        this.addresses.sort(Address.comparator());
        return offset;
    }
    /**
     * Returns the buffer representing the [[Output]] instance.
     */
    toBuffer() {
        this.addresses.sort(Address.comparator());
        this.numaddrs.writeUInt32BE(this.addresses.length, 0);
        let bsize = this.locktime.length + this.threshold.length + this.numaddrs.length;
        const barr = [this.locktime, this.threshold, this.numaddrs];
        for (let i = 0; i < this.addresses.length; i++) {
            const b = this.addresses[i].toBuffer();
            barr.push(b);
            bsize += b.length;
        }
        return buffer_1.Buffer.concat(barr, bsize);
    }
    /**
     * Returns a base-58 string representing the [[Output]].
     */
    toString() {
        return bintools.bufferToB58(this.toBuffer());
    }
}
exports.OutputOwners = OutputOwners;
OutputOwners.comparator = () => (a, b) => {
    const aoutid = buffer_1.Buffer.alloc(4);
    aoutid.writeUInt32BE(a.getOutputID(), 0);
    const abuff = a.toBuffer();
    const boutid = buffer_1.Buffer.alloc(4);
    boutid.writeUInt32BE(b.getOutputID(), 0);
    const bbuff = b.toBuffer();
    const asort = buffer_1.Buffer.concat([aoutid, abuff], aoutid.length + abuff.length);
    const bsort = buffer_1.Buffer.concat([boutid, bbuff], boutid.length + bbuff.length);
    return buffer_1.Buffer.compare(asort, bsort);
};
class Output extends OutputOwners {
    constructor() {
        super(...arguments);
        this._typeName = "Output";
        this._typeID = undefined;
    }
}
exports.Output = Output;
class StandardParseableOutput extends serialization_1.Serializable {
    /**
     * Class representing an [[ParseableOutput]] for a transaction.
     *
     * @param output A number representing the InputID of the [[ParseableOutput]]
     */
    constructor(output = undefined) {
        super();
        this._typeName = "StandardParseableOutput";
        this._typeID = undefined;
        this.getOutput = () => this.output;
        if (output instanceof Output) {
            this.output = output;
        }
    }
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { "output": this.output.serialize(encoding) });
    }
    ;
    toBuffer() {
        const outbuff = this.output.toBuffer();
        const outid = buffer_1.Buffer.alloc(4);
        outid.writeUInt32BE(this.output.getOutputID(), 0);
        const barr = [outid, outbuff];
        return buffer_1.Buffer.concat(barr, outid.length + outbuff.length);
    }
}
exports.StandardParseableOutput = StandardParseableOutput;
/**
 * Returns a function used to sort an array of [[ParseableOutput]]s
 */
StandardParseableOutput.comparator = () => (a, b) => {
    const sorta = a.toBuffer();
    const sortb = b.toBuffer();
    return buffer_1.Buffer.compare(sorta, sortb);
};
class StandardTransferableOutput extends StandardParseableOutput {
    /**
     * Class representing an [[StandardTransferableOutput]] for a transaction.
     *
     * @param assetID A {@link https://github.com/feross/buffer|Buffer} representing the assetID of the [[Output]]
     * @param output A number representing the InputID of the [[StandardTransferableOutput]]
     */
    constructor(assetID = undefined, output = undefined) {
        super(output);
        this._typeName = "StandardTransferableOutput";
        this._typeID = undefined;
        this.assetID = undefined;
        this.getAssetID = () => this.assetID;
        if (typeof assetID !== 'undefined') {
            this.assetID = assetID;
        }
    }
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { "assetID": serializer.encoder(this.assetID, encoding, "Buffer", "cb58") });
    }
    ;
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.assetID = serializer.decoder(fields["assetID"], encoding, "cb58", "Buffer", 32);
    }
    toBuffer() {
        const parseableBuff = super.toBuffer();
        const barr = [this.assetID, parseableBuff];
        return buffer_1.Buffer.concat(barr, this.assetID.length + parseableBuff.length);
    }
}
exports.StandardTransferableOutput = StandardTransferableOutput;
/**
 * An [[Output]] class which specifies a token amount .
 */
class StandardAmountOutput extends Output {
    /**
     * A [[StandardAmountOutput]] class which issues a payment on an assetID.
     *
     * @param amount A {@link https://github.com/indutny/bn.js/|BN} representing the amount in the output
     * @param addresses An array of {@link https://github.com/feross/buffer|Buffer}s representing addresses
     * @param locktime A {@link https://github.com/indutny/bn.js/|BN} representing the locktime
     * @param threshold A number representing the the threshold number of signers required to sign the transaction
     */
    constructor(amount = undefined, addresses = undefined, locktime = undefined, threshold = undefined) {
        super(addresses, locktime, threshold);
        this._typeName = "StandardAmountOutput";
        this._typeID = undefined;
        this.amount = buffer_1.Buffer.alloc(8);
        this.amountValue = new bn_js_1.default(0);
        /**
         * Returns the amount as a {@link https://github.com/indutny/bn.js/|BN}.
         */
        this.getAmount = () => this.amountValue.clone();
        if (typeof amount !== "undefined") {
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
     * Popuates the instance from a {@link https://github.com/feross/buffer|Buffer} representing the [[StandardAmountOutput]] and returns the size of the output.
     */
    fromBuffer(outbuff, offset = 0) {
        this.amount = bintools.copyFrom(outbuff, offset, offset + 8);
        this.amountValue = bintools.fromBufferToBN(this.amount);
        offset += 8;
        return super.fromBuffer(outbuff, offset);
    }
    /**
     * Returns the buffer representing the [[StandardAmountOutput]] instance.
     */
    toBuffer() {
        const superbuff = super.toBuffer();
        const bsize = this.amount.length + superbuff.length;
        this.numaddrs.writeUInt32BE(this.addresses.length, 0);
        const barr = [this.amount, superbuff];
        return buffer_1.Buffer.concat(barr, bsize);
    }
}
exports.StandardAmountOutput = StandardAmountOutput;
/**
 * An [[Output]] class which specifies an NFT.
 */
class BaseNFTOutput extends Output {
    constructor() {
        super(...arguments);
        this._typeName = "BaseNFTOutput";
        this._typeID = undefined;
        this.groupID = buffer_1.Buffer.alloc(4);
        /**
         * Returns the groupID as a number.
         */
        this.getGroupID = () => {
            return this.groupID.readUInt32BE(0);
        };
    }
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { "groupID": serializer.encoder(this.groupID, encoding, "Buffer", "decimalString", 4) });
    }
    ;
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.groupID = serializer.decoder(fields["groupID"], encoding, "decimalString", "Buffer", 4);
    }
}
exports.BaseNFTOutput = BaseNFTOutput;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3V0cHV0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1vbi9vdXRwdXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7R0FHRzs7Ozs7O0FBRUgsb0NBQWlDO0FBQ2pDLGtEQUF1QjtBQUN2QixpRUFBeUM7QUFDekMscUNBQWtDO0FBQ2xDLDhEQUFtRDtBQUNuRCwwREFBeUY7QUFFekY7O0dBRUc7QUFDSCxNQUFNLFFBQVEsR0FBWSxrQkFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQ2pELE1BQU0sVUFBVSxHQUFHLDZCQUFhLENBQUMsV0FBVyxFQUFFLENBQUM7QUFFL0M7O0dBRUc7QUFDSCxNQUFhLE9BQVEsU0FBUSxlQUFNO0lBMERqQzs7T0FFRztJQUNIO1FBQ0UsS0FBSyxFQUFFLENBQUM7UUE3REEsY0FBUyxHQUFHLFNBQVMsQ0FBQztRQUN0QixZQUFPLEdBQUcsU0FBUyxDQUFDO1FBRTlCLDhDQUE4QztRQUVwQyxVQUFLLEdBQUcsZUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN6QixVQUFLLEdBQUcsRUFBRSxDQUFDO0lBd0RyQixDQUFDO0lBL0NEOztTQUVLO0lBQ0wsUUFBUTtRQUNOLE9BQU8sUUFBUSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUM5QyxDQUFDO0lBRUQ7Ozs7OztTQU1LO0lBQ0wsVUFBVSxDQUFDLElBQVc7UUFDcEIsTUFBTSxRQUFRLEdBQVUsUUFBUSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNuRCxJQUFJLFFBQVEsQ0FBQyxNQUFNLEtBQUssRUFBRSxJQUFJLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUNqRSxNQUFNLE9BQU8sR0FBVSxRQUFRLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FB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LENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRTNDOztXQUVHO1FBQ0gsZUFBVSxHQUFHLEdBQVUsRUFBRTtZQUNyQixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3hDLENBQUMsQ0FBQTtJQUNILENBQUM7SUFwQkMsU0FBUyxDQUFDLFdBQThCLEtBQUs7UUFDM0MsSUFBSSxNQUFNLEdBQVUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM5Qyx1Q0FDSyxNQUFNLEtBQ1QsU0FBUyxFQUFFLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLGVBQWUsRUFBRSxDQUFDLENBQUMsSUFDcEY7SUFDSCxDQUFDO0lBQUEsQ0FBQztJQUNGLFdBQVcsQ0FBQyxNQUFhLEVBQUUsV0FBOEIsS0FBSztRQUM1RCxLQUFLLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztRQUNwQyxJQUFJLENBQUMsT0FBTyxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxlQUFlLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQy9GLENBQUM7Q0FVRjtBQXhCRCxzQ0F3QkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBwYWNrYWdlRG9jdW1lbnRhdGlvblxuICogQG1vZHVsZSBDb21tb24tT3V0cHV0XG4gKi9cblxuaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSAnYnVmZmVyLyc7XG5pbXBvcnQgQk4gZnJvbSAnYm4uanMnO1xuaW1wb3J0IEJpblRvb2xzIGZyb20gJy4uL3V0aWxzL2JpbnRvb2xzJztcbmltcG9ydCB7IE5CeXRlcyB9IGZyb20gJy4vbmJ5dGVzJztcbmltcG9ydCB7IFVuaXhOb3cgfSBmcm9tICcuLi91dGlscy9oZWxwZXJmdW5jdGlvbnMnO1xuaW1wb3J0IHsgU2VyaWFsaXphYmxlLCBTZXJpYWxpemF0aW9uLCBTZXJpYWxpemVkRW5jb2RpbmcgfSBmcm9tICcuLi91dGlscy9zZXJpYWxpemF0aW9uJztcblxuLyoqXG4gKiBAaWdub3JlXG4gKi9cbmNvbnN0IGJpbnRvb2xzOkJpblRvb2xzID0gQmluVG9vbHMuZ2V0SW5zdGFuY2UoKTtcbmNvbnN0IHNlcmlhbGl6ZXIgPSBTZXJpYWxpemF0aW9uLmdldEluc3RhbmNlKCk7XG5cbi8qKlxuICogQ2xhc3MgZm9yIHJlcHJlc2VudGluZyBhbiBhZGRyZXNzIHVzZWQgaW4gW1tPdXRwdXRdXSB0eXBlc1xuICovXG5leHBvcnQgY2xhc3MgQWRkcmVzcyBleHRlbmRzIE5CeXRlcyB7XG4gIHByb3RlY3RlZCBfdHlwZU5hbWUgPSBcIkFkZHJlc3NcIjtcbiAgcHJvdGVjdGVkIF90eXBlSUQgPSB1bmRlZmluZWQ7XG5cbiAgLy9zZXJpYWxpemUgYW5kIGRlc2VyaWFsaXplIGJvdGggYXJlIGluaGVyaXRlZFxuXG4gIHByb3RlY3RlZCBieXRlcyA9IEJ1ZmZlci5hbGxvYygyMCk7XG4gIHByb3RlY3RlZCBic2l6ZSA9IDIwO1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgZnVuY3Rpb24gdXNlZCB0byBzb3J0IGFuIGFycmF5IG9mIFtbQWRkcmVzc11dZXNcbiAgICovXG4gIHN0YXRpYyBjb21wYXJhdG9yID0gKClcbiAgICAgIDooYTpBZGRyZXNzLCBiOkFkZHJlc3MpID0+ICgxfC0xfDApID0+IChhOkFkZHJlc3MsIGI6QWRkcmVzcylcbiAgICAgIDooMXwtMXwwKSA9PiBCdWZmZXIuY29tcGFyZShhLnRvQnVmZmVyKCksIGIudG9CdWZmZXIoKSkgYXMgKDF8LTF8MCk7XG5cbiAgLyoqXG4gICAgICogUmV0dXJucyBhIGJhc2UtNTggcmVwcmVzZW50YXRpb24gb2YgdGhlIFtbQWRkcmVzc11dLlxuICAgICAqL1xuICB0b1N0cmluZygpOnN0cmluZyB7XG4gICAgcmV0dXJuIGJpbnRvb2xzLmNiNThFbmNvZGUodGhpcy50b0J1ZmZlcigpKTtcbiAgfVxuXG4gIC8qKlxuICAgICAqIFRha2VzIGEgYmFzZS01OCBzdHJpbmcgY29udGFpbmluZyBhbiBbW0FkZHJlc3NdXSwgcGFyc2VzIGl0LCBwb3B1bGF0ZXMgdGhlIGNsYXNzLCBhbmQgcmV0dXJucyB0aGUgbGVuZ3RoIG9mIHRoZSBBZGRyZXNzIGluIGJ5dGVzLlxuICAgICAqXG4gICAgICogQHBhcmFtIGJ5dGVzIEEgYmFzZS01OCBzdHJpbmcgY29udGFpbmluZyBhIHJhdyBbW0FkZHJlc3NdXVxuICAgICAqXG4gICAgICogQHJldHVybnMgVGhlIGxlbmd0aCBvZiB0aGUgcmF3IFtbQWRkcmVzc11dXG4gICAgICovXG4gIGZyb21TdHJpbmcoYWRkcjpzdHJpbmcpOm51bWJlciB7XG4gICAgY29uc3QgYWRkcmJ1ZmY6QnVmZmVyID0gYmludG9vbHMuYjU4VG9CdWZmZXIoYWRkcik7XG4gICAgaWYgKGFkZHJidWZmLmxlbmd0aCA9PT0gMjQgJiYgYmludG9vbHMudmFsaWRhdGVDaGVja3N1bShhZGRyYnVmZikpIHtcbiAgICAgIGNvbnN0IG5ld2J1ZmY6QnVmZmVyID0gYmludG9vbHMuY29weUZyb20oYWRkcmJ1ZmYsIDAsIGFkZHJidWZmLmxlbmd0aCAtIDQpO1xuICAgICAgaWYgKG5ld2J1ZmYubGVuZ3RoID09PSAyMCkge1xuICAgICAgICB0aGlzLmJ5dGVzID0gbmV3YnVmZjtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGFkZHJidWZmLmxlbmd0aCA9PT0gMjQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRXJyb3IgLSBBZGRyZXNzLmZyb21TdHJpbmc6IGludmFsaWQgY2hlY2tzdW0gb24gYWRkcmVzcycpO1xuICAgIH0gZWxzZSBpZiAoYWRkcmJ1ZmYubGVuZ3RoID09PSAyMCkge1xuICAgICAgdGhpcy5ieXRlcyA9IGFkZHJidWZmO1xuICAgIH0gZWxzZSB7XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdFcnJvciAtIEFkZHJlc3MuZnJvbVN0cmluZzogaW52YWxpZCBhZGRyZXNzJyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmdldFNpemUoKTtcbiAgfVxuXG4gIGNsb25lKCk6dGhpcyB7XG4gICAgbGV0IG5ld2Jhc2U6QWRkcmVzcyA9IG5ldyBBZGRyZXNzKCk7XG4gICAgbmV3YmFzZS5mcm9tQnVmZmVyKHRoaXMudG9CdWZmZXIoKSk7XG4gICAgcmV0dXJuIG5ld2Jhc2UgYXMgdGhpcztcbiAgfVxuXG4gIGNyZWF0ZSguLi5hcmdzOmFueVtdKTp0aGlzIHtcbiAgICByZXR1cm4gbmV3IEFkZHJlc3MoKSBhcyB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIENsYXNzIGZvciByZXByZXNlbnRpbmcgYW4gYWRkcmVzcyB1c2VkIGluIFtbT3V0cHV0XV0gdHlwZXNcbiAgICovXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gIH1cbn1cblxuICAvKipcbiAgICogRGVmaW5lcyB0aGUgbW9zdCBiYXNpYyB2YWx1ZXMgZm9yIG91dHB1dCBvd25lcnNoaXAuIE1vc3RseSBpbmhlcml0ZWQgZnJvbSwgYnV0IGNhbiBiZSB1c2VkIGluIHBvcHVsYXRpb24gb2YgTkZUIE93bmVyIGRhdGEuXG4gICAqL1xuZXhwb3J0IGNsYXNzIE91dHB1dE93bmVycyBleHRlbmRzIFNlcmlhbGl6YWJsZSB7XG4gIHByb3RlY3RlZCBfdHlwZU5hbWUgPSBcIk91dHB1dE93bmVyc1wiO1xuICBwcm90ZWN0ZWQgX3R5cGVJRCA9IHVuZGVmaW5lZDtcblxuICBzZXJpYWxpemUoZW5jb2Rpbmc6U2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIik6b2JqZWN0IHtcbiAgICBsZXQgZmllbGRzOm9iamVjdCA9IHN1cGVyLnNlcmlhbGl6ZShlbmNvZGluZyk7XG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLmZpZWxkcyxcbiAgICAgIFwibG9ja3RpbWVcIjogc2VyaWFsaXplci5lbmNvZGVyKHRoaXMubG9ja3RpbWUsIGVuY29kaW5nLCBcIkJ1ZmZlclwiLCBcImRlY2ltYWxTdHJpbmdcIiwgOCksXG4gICAgICBcInRocmVzaG9sZFwiOiBzZXJpYWxpemVyLmVuY29kZXIodGhpcy50aHJlc2hvbGQsIGVuY29kaW5nLCBcIkJ1ZmZlclwiLCBcImRlY2ltYWxTdHJpbmdcIiwgNCksXG4gICAgICBcImFkZHJlc3Nlc1wiOiB0aGlzLmFkZHJlc3Nlcy5tYXAoKGEpID0+IGEuc2VyaWFsaXplKGVuY29kaW5nKSlcbiAgICB9XG4gIH07XG4gIGRlc2VyaWFsaXplKGZpZWxkczpvYmplY3QsIGVuY29kaW5nOlNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpIHtcbiAgICBzdXBlci5kZXNlcmlhbGl6ZShmaWVsZHMsIGVuY29kaW5nKTtcbiAgICB0aGlzLmxvY2t0aW1lID0gc2VyaWFsaXplci5kZWNvZGVyKGZpZWxkc1tcImxvY2t0aW1lXCJdLCBlbmNvZGluZywgXCJkZWNpbWFsU3RyaW5nXCIsIFwiQnVmZmVyXCIsIDgpO1xuICAgIHRoaXMudGhyZXNob2xkID0gc2VyaWFsaXplci5kZWNvZGVyKGZpZWxkc1tcInRocmVzaG9sZFwiXSwgZW5jb2RpbmcsIFwiZGVjaW1hbFN0cmluZ1wiLCBcIkJ1ZmZlclwiLCA0KTtcbiAgICB0aGlzLmFkZHJlc3NlcyA9IGZpZWxkc1tcImFkZHJlc3Nlc1wiXS5tYXAoKGE6b2JqZWN0KSA9PiB7XG4gICAgICBsZXQgYWRkcjpBZGRyZXNzID0gbmV3IEFkZHJlc3MoKTtcbiAgICAgIGFkZHIuZGVzZXJpYWxpemUoYSwgZW5jb2RpbmcpO1xuICAgICAgcmV0dXJuIGFkZHI7XG4gICAgfSk7XG4gICAgdGhpcy5udW1hZGRycyA9IEJ1ZmZlci5hbGxvYyg0KTtcbiAgICB0aGlzLm51bWFkZHJzLndyaXRlVUludDMyQkUodGhpcy5hZGRyZXNzZXMubGVuZ3RoLCAwKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBsb2NrdGltZTpCdWZmZXIgPSBCdWZmZXIuYWxsb2MoOCk7XG4gIHByb3RlY3RlZCB0aHJlc2hvbGQ6QnVmZmVyID0gQnVmZmVyLmFsbG9jKDQpO1xuICBwcm90ZWN0ZWQgbnVtYWRkcnM6QnVmZmVyID0gQnVmZmVyLmFsbG9jKDQpO1xuICBwcm90ZWN0ZWQgYWRkcmVzc2VzOkFycmF5PEFkZHJlc3M+ID0gW107XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHRocmVzaG9sZCBvZiBzaWduZXJzIHJlcXVpcmVkIHRvIHNwZW5kIHRoaXMgb3V0cHV0LlxuICAgKi9cbiAgZ2V0VGhyZXNob2xkID0gKCk6bnVtYmVyID0+IHRoaXMudGhyZXNob2xkLnJlYWRVSW50MzJCRSgwKTtcblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfSByZXBlcnNlbnRpbmcgdGhlIFVOSVggVGltZXN0YW1wIHdoZW4gdGhlIGxvY2sgaXMgbWFkZSBhdmFpbGFibGUuXG4gICAqL1xuICBnZXRMb2NrdGltZSA9ICgpOkJOID0+IGJpbnRvb2xzLmZyb21CdWZmZXJUb0JOKHRoaXMubG9ja3RpbWUpO1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIGFycmF5IG9mIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9cyBmb3IgdGhlIGFkZHJlc3Nlcy5cbiAgICovXG4gIGdldEFkZHJlc3NlcyA9ICgpOkFycmF5PEJ1ZmZlcj4gPT4ge1xuICAgIGNvbnN0IHJlc3VsdDpBcnJheTxCdWZmZXI+ID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmFkZHJlc3Nlcy5sZW5ndGg7IGkrKykge1xuICAgICAgcmVzdWx0LnB1c2godGhpcy5hZGRyZXNzZXNbaV0udG9CdWZmZXIoKSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGluZGV4IG9mIHRoZSBhZGRyZXNzLlxuICAgKlxuICAgKiBAcGFyYW0gYWRkcmVzcyBBIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IG9mIHRoZSBhZGRyZXNzIHRvIGxvb2sgdXAgdG8gcmV0dXJuIGl0cyBpbmRleC5cbiAgICpcbiAgICogQHJldHVybnMgVGhlIGluZGV4IG9mIHRoZSBhZGRyZXNzLlxuICAgKi9cbiAgZ2V0QWRkcmVzc0lkeCA9IChhZGRyZXNzOkJ1ZmZlcik6bnVtYmVyID0+IHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuYWRkcmVzc2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAodGhpcy5hZGRyZXNzZXNbaV0udG9CdWZmZXIoKS50b1N0cmluZygnaGV4JykgPT09IGFkZHJlc3MudG9TdHJpbmcoJ2hleCcpKSB7XG4gICAgICAgIHJldHVybiBpO1xuICAgICAgfVxuICAgIH1cbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIHJldHVybiAtMTtcbiAgfTtcblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgYWRkcmVzcyBmcm9tIHRoZSBpbmRleCBwcm92aWRlZC5cbiAgICpcbiAgICogQHBhcmFtIGlkeCBUaGUgaW5kZXggb2YgdGhlIGFkZHJlc3MuXG4gICAqXG4gICAqIEByZXR1cm5zIFJldHVybnMgdGhlIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIGFkZHJlc3MuXG4gICAqL1xuICBnZXRBZGRyZXNzID0gKGlkeDpudW1iZXIpOkJ1ZmZlciA9PiB7XG4gICAgaWYgKGlkeCA8IHRoaXMuYWRkcmVzc2VzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIHRoaXMuYWRkcmVzc2VzW2lkeF0udG9CdWZmZXIoKTtcbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKCdFcnJvciAtIE91dHB1dC5nZXRBZGRyZXNzOiBpZHggb3V0IG9mIHJhbmdlJyk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEdpdmVuIGFuIGFycmF5IG9mIGFkZHJlc3Mge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn1zIGFuZCBhbiBvcHRpb25hbCB0aW1lc3RhbXAsIHJldHVybnMgdHJ1ZSBpZiB0aGUgYWRkcmVzc2VzIG1lZXQgdGhlIHRocmVzaG9sZCByZXF1aXJlZCB0byBzcGVuZCB0aGUgb3V0cHV0LlxuICAgKi9cbiAgbWVldHNUaHJlc2hvbGQgPSAoYWRkcmVzc2VzOkFycmF5PEJ1ZmZlcj4sIGFzT2Y6Qk4gPSB1bmRlZmluZWQpOmJvb2xlYW4gPT4ge1xuICAgIGxldCBub3c6Qk47XG4gICAgaWYgKHR5cGVvZiBhc09mID09PSAndW5kZWZpbmVkJykge1xuICAgICAgbm93ID0gVW5peE5vdygpO1xuICAgIH0gZWxzZSB7XG4gICAgICBub3cgPSBhc09mO1xuICAgIH1cbiAgICBjb25zdCBxdWFsaWZpZWQ6QXJyYXk8QnVmZmVyPiA9IHRoaXMuZ2V0U3BlbmRlcnMoYWRkcmVzc2VzLCBub3cpO1xuICAgIGNvbnN0IHRocmVzaG9sZDpudW1iZXIgPSB0aGlzLnRocmVzaG9sZC5yZWFkVUludDMyQkUoMCk7XG4gICAgaWYgKHF1YWxpZmllZC5sZW5ndGggPj0gdGhyZXNob2xkKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH07XG5cbiAgLyoqXG4gICAqIEdpdmVuIGFuIGFycmF5IG9mIGFkZHJlc3NlcyBhbmQgYW4gb3B0aW9uYWwgdGltZXN0YW1wLCBzZWxlY3QgYW4gYXJyYXkgb2YgYWRkcmVzcyB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfXMgb2YgcXVhbGlmaWVkIHNwZW5kZXJzIGZvciB0aGUgb3V0cHV0LlxuICAgKi9cbiAgZ2V0U3BlbmRlcnMgPSAoYWRkcmVzc2VzOkFycmF5PEJ1ZmZlcj4sIGFzT2Y6Qk4gPSB1bmRlZmluZWQpOkFycmF5PEJ1ZmZlcj4gPT4ge1xuICAgIGNvbnN0IHF1YWxpZmllZDpBcnJheTxCdWZmZXI+ID0gW107XG4gICAgbGV0IG5vdzpCTjtcbiAgICBpZiAodHlwZW9mIGFzT2YgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBub3cgPSBVbml4Tm93KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5vdyA9IGFzT2Y7XG4gICAgfVxuICAgIGNvbnN0IGxvY2t0aW1lOkJOID0gYmludG9vbHMuZnJvbUJ1ZmZlclRvQk4odGhpcy5sb2NrdGltZSk7XG4gICAgaWYgKG5vdy5sdGUobG9ja3RpbWUpKSB7IC8vIG5vdCB1bmxvY2tlZCwgbm90IHNwZW5kYWJsZVxuICAgICAgcmV0dXJuIHF1YWxpZmllZDtcbiAgICB9XG5cbiAgICBjb25zdCB0aHJlc2hvbGQ6bnVtYmVyID0gdGhpcy50aHJlc2hvbGQucmVhZFVJbnQzMkJFKDApO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5hZGRyZXNzZXMubGVuZ3RoICYmIHF1YWxpZmllZC5sZW5ndGggPCB0aHJlc2hvbGQ7IGkrKykge1xuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBhZGRyZXNzZXMubGVuZ3RoICYmIHF1YWxpZmllZC5sZW5ndGggPCB0aHJlc2hvbGQ7IGorKykge1xuICAgICAgICBpZiAoYWRkcmVzc2VzW2pdLnRvU3RyaW5nKCdoZXgnKSA9PT0gdGhpcy5hZGRyZXNzZXNbaV0udG9CdWZmZXIoKS50b1N0cmluZygnaGV4JykpIHtcbiAgICAgICAgICBxdWFsaWZpZWQucHVzaChhZGRyZXNzZXNbal0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHF1YWxpZmllZDtcbiAgfTtcblxuICAvKipcbiAgICogUmV0dXJucyBhIGJhc2UtNTggc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgW1tPdXRwdXRdXS5cbiAgICovXG4gIGZyb21CdWZmZXIoYnl0ZXM6QnVmZmVyLCBvZmZzZXQ6bnVtYmVyID0gMCk6bnVtYmVyIHtcbiAgICB0aGlzLmxvY2t0aW1lID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgOCk7XG4gICAgb2Zmc2V0ICs9IDg7XG4gICAgdGhpcy50aHJlc2hvbGQgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyA0KTtcbiAgICBvZmZzZXQgKz0gNDtcbiAgICB0aGlzLm51bWFkZHJzID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgNCk7XG4gICAgb2Zmc2V0ICs9IDQ7XG4gICAgY29uc3QgbnVtYWRkcnM6bnVtYmVyID0gdGhpcy5udW1hZGRycy5yZWFkVUludDMyQkUoMCk7XG4gICAgdGhpcy5hZGRyZXNzZXMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG51bWFkZHJzOyBpKyspIHtcbiAgICAgIGNvbnN0IGFkZHI6QWRkcmVzcyA9IG5ldyBBZGRyZXNzKCk7XG4gICAgICBvZmZzZXQgPSBhZGRyLmZyb21CdWZmZXIoYnl0ZXMsIG9mZnNldCk7XG4gICAgICB0aGlzLmFkZHJlc3Nlcy5wdXNoKGFkZHIpO1xuICAgIH1cbiAgICB0aGlzLmFkZHJlc3Nlcy5zb3J0KEFkZHJlc3MuY29tcGFyYXRvcigpKTtcbiAgICByZXR1cm4gb2Zmc2V0O1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGJ1ZmZlciByZXByZXNlbnRpbmcgdGhlIFtbT3V0cHV0XV0gaW5zdGFuY2UuXG4gICAqL1xuICB0b0J1ZmZlcigpOkJ1ZmZlciB7XG4gICAgdGhpcy5hZGRyZXNzZXMuc29ydChBZGRyZXNzLmNvbXBhcmF0b3IoKSk7XG4gICAgdGhpcy5udW1hZGRycy53cml0ZVVJbnQzMkJFKHRoaXMuYWRkcmVzc2VzLmxlbmd0aCwgMCk7XG4gICAgbGV0IGJzaXplOm51bWJlciA9IHRoaXMubG9ja3RpbWUubGVuZ3RoICsgdGhpcy50aHJlc2hvbGQubGVuZ3RoICsgdGhpcy5udW1hZGRycy5sZW5ndGg7XG4gICAgY29uc3QgYmFycjpBcnJheTxCdWZmZXI+ID0gW3RoaXMubG9ja3RpbWUsIHRoaXMudGhyZXNob2xkLCB0aGlzLm51bWFkZHJzXTtcbiAgICBmb3IgKGxldCBpOm51bWJlciA9IDA7IGkgPCB0aGlzLmFkZHJlc3Nlcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgYjogQnVmZmVyID0gdGhpcy5hZGRyZXNzZXNbaV0udG9CdWZmZXIoKTtcbiAgICAgIGJhcnIucHVzaChiKTtcbiAgICAgIGJzaXplICs9IGIubGVuZ3RoO1xuICAgIH1cbiAgICByZXR1cm4gQnVmZmVyLmNvbmNhdChiYXJyLCBic2l6ZSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIGJhc2UtNTggc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgW1tPdXRwdXRdXS5cbiAgICovXG4gIHRvU3RyaW5nKCk6c3RyaW5nIHtcbiAgICByZXR1cm4gYmludG9vbHMuYnVmZmVyVG9CNTgodGhpcy50b0J1ZmZlcigpKTtcbiAgfVxuXG4gIHN0YXRpYyBjb21wYXJhdG9yID0gKCk6KGE6T3V0cHV0LCBiOk91dHB1dCkgPT4gKDF8LTF8MCkgPT4gKGE6T3V0cHV0LCBiOk91dHB1dCk6KDF8LTF8MCkgPT4ge1xuICAgIGNvbnN0IGFvdXRpZDpCdWZmZXIgPSBCdWZmZXIuYWxsb2MoNCk7XG4gICAgYW91dGlkLndyaXRlVUludDMyQkUoYS5nZXRPdXRwdXRJRCgpLCAwKTtcbiAgICBjb25zdCBhYnVmZjpCdWZmZXIgPSBhLnRvQnVmZmVyKCk7XG5cbiAgICBjb25zdCBib3V0aWQ6QnVmZmVyID0gQnVmZmVyLmFsbG9jKDQpO1xuICAgIGJvdXRpZC53cml0ZVVJbnQzMkJFKGIuZ2V0T3V0cHV0SUQoKSwgMCk7XG4gICAgY29uc3QgYmJ1ZmY6QnVmZmVyID0gYi50b0J1ZmZlcigpO1xuXG4gICAgY29uc3QgYXNvcnQ6QnVmZmVyID0gQnVmZmVyLmNvbmNhdChbYW91dGlkLCBhYnVmZl0sIGFvdXRpZC5sZW5ndGggKyBhYnVmZi5sZW5ndGgpO1xuICAgIGNvbnN0IGJzb3J0OkJ1ZmZlciA9IEJ1ZmZlci5jb25jYXQoW2JvdXRpZCwgYmJ1ZmZdLCBib3V0aWQubGVuZ3RoICsgYmJ1ZmYubGVuZ3RoKTtcbiAgICByZXR1cm4gQnVmZmVyLmNvbXBhcmUoYXNvcnQsIGJzb3J0KSBhcyAoMXwtMXwwKTtcbiAgfTtcblxuICAvKipcbiAgICogQW4gW1tPdXRwdXRdXSBjbGFzcyB3aGljaCBjb250YWlucyBhZGRyZXNzZXMsIGxvY2t0aW1lcywgYW5kIHRocmVzaG9sZHMuXG4gICAqXG4gICAqIEBwYXJhbSBhZGRyZXNzZXMgQW4gYXJyYXkgb2Yge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn1zIHJlcHJlc2VudGluZyBvdXRwdXQgb3duZXIncyBhZGRyZXNzZXNcbiAgICogQHBhcmFtIGxvY2t0aW1lIEEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn0gcmVwcmVzZW50aW5nIHRoZSBsb2NrdGltZVxuICAgKiBAcGFyYW0gdGhyZXNob2xkIEEgbnVtYmVyIHJlcHJlc2VudGluZyB0aGUgdGhlIHRocmVzaG9sZCBudW1iZXIgb2Ygc2lnbmVycyByZXF1aXJlZCB0byBzaWduIHRoZSB0cmFuc2FjdGlvblxuICAgKi9cbiAgY29uc3RydWN0b3IoYWRkcmVzc2VzOkFycmF5PEJ1ZmZlcj4gPSB1bmRlZmluZWQsIGxvY2t0aW1lOkJOID0gdW5kZWZpbmVkLCB0aHJlc2hvbGQ6bnVtYmVyID0gdW5kZWZpbmVkKSB7XG4gICAgc3VwZXIoKTtcbiAgICBpZih0eXBlb2YgYWRkcmVzc2VzICE9PSBcInVuZGVmaW5lZFwiICYmIGFkZHJlc3Nlcy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IGFkZHJzOkFycmF5PEFkZHJlc3M+ID0gW107XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFkZHJlc3Nlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBhZGRyc1tpXSA9IG5ldyBBZGRyZXNzKCk7XG4gICAgICAgIGFkZHJzW2ldLmZyb21CdWZmZXIoYWRkcmVzc2VzW2ldKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuYWRkcmVzc2VzID0gYWRkcnM7XG4gICAgICB0aGlzLmFkZHJlc3Nlcy5zb3J0KEFkZHJlc3MuY29tcGFyYXRvcigpKTtcbiAgICAgIHRoaXMubnVtYWRkcnMud3JpdGVVSW50MzJCRSh0aGlzLmFkZHJlc3Nlcy5sZW5ndGgsIDApO1xuICAgIH1cbiAgICBpZih0eXBlb2YgdGhyZXNob2xkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMudGhyZXNob2xkLndyaXRlVUludDMyQkUoKHRocmVzaG9sZCB8fCAxKSwgMCk7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgbG9ja3RpbWUgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIHRoaXMubG9ja3RpbWUgPSBiaW50b29scy5mcm9tQk5Ub0J1ZmZlcihsb2NrdGltZSwgOCk7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBPdXRwdXQgZXh0ZW5kcyBPdXRwdXRPd25lcnMge1xuICBwcm90ZWN0ZWQgX3R5cGVOYW1lID0gXCJPdXRwdXRcIjtcbiAgcHJvdGVjdGVkIF90eXBlSUQgPSB1bmRlZmluZWQ7XG4gIFxuICAvL3NlcmlhbGl6ZSBhbmQgZGVzZXJpYWxpemUgYm90aCBhcmUgaW5oZXJpdGVkXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIG91dHB1dElEIGZvciB0aGUgb3V0cHV0IHdoaWNoIHRlbGxzIHBhcnNlcnMgd2hhdCB0eXBlIGl0IGlzXG4gICAqL1xuICBhYnN0cmFjdCBnZXRPdXRwdXRJRCgpOm51bWJlcjtcblxuICBhYnN0cmFjdCBjbG9uZSgpOnRoaXM7XG5cbiAgYWJzdHJhY3QgY3JlYXRlKC4uLmFyZ3M6YW55W10pOnRoaXM7XG5cbiAgYWJzdHJhY3Qgc2VsZWN0KGlkOm51bWJlciwgLi4uYXJnczphbnlbXSk6T3V0cHV0O1xuXG4gIC8qKlxuICAgKiBcbiAgICogQHBhcmFtIGFzc2V0SUQgQW4gYXNzZXRJRCB3aGljaCBpcyB3cmFwcGVkIGFyb3VuZCB0aGUgQnVmZmVyIG9mIHRoZSBPdXRwdXRcbiAgICogXG4gICAqIE11c3QgYmUgaW1wbGVtZW50ZWQgdG8gdXNlIHRoZSBhcHByb3ByaWF0ZSBUcmFuc2ZlcmFibGVPdXRwdXQgZm9yIHRoZSBWTS5cbiAgICovXG4gIGFic3RyYWN0IG1ha2VUcmFuc2ZlcmFibGUoYXNzZXRJRDpCdWZmZXIpOlN0YW5kYXJkVHJhbnNmZXJhYmxlT3V0cHV0O1xufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgU3RhbmRhcmRQYXJzZWFibGVPdXRwdXQgZXh0ZW5kcyBTZXJpYWxpemFibGUge1xuICBwcm90ZWN0ZWQgX3R5cGVOYW1lID0gXCJTdGFuZGFyZFBhcnNlYWJsZU91dHB1dFwiO1xuICBwcm90ZWN0ZWQgX3R5cGVJRCA9IHVuZGVmaW5lZDtcblxuICBzZXJpYWxpemUoZW5jb2Rpbmc6U2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIik6b2JqZWN0IHtcbiAgICBsZXQgZmllbGRzOm9iamVjdCA9IHN1cGVyLnNlcmlhbGl6ZShlbmNvZGluZyk7XG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLmZpZWxkcyxcbiAgICAgIFwib3V0cHV0XCI6IHRoaXMub3V0cHV0LnNlcmlhbGl6ZShlbmNvZGluZylcbiAgICB9XG4gIH07XG5cbiAgcHJvdGVjdGVkIG91dHB1dDpPdXRwdXQ7XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBmdW5jdGlvbiB1c2VkIHRvIHNvcnQgYW4gYXJyYXkgb2YgW1tQYXJzZWFibGVPdXRwdXRdXXNcbiAgICovXG4gIHN0YXRpYyBjb21wYXJhdG9yID0gKCk6KGE6U3RhbmRhcmRQYXJzZWFibGVPdXRwdXQsIGI6U3RhbmRhcmRQYXJzZWFibGVPdXRwdXQpID0+ICgxfC0xfDApID0+IChhOlN0YW5kYXJkUGFyc2VhYmxlT3V0cHV0LCBiOlN0YW5kYXJkUGFyc2VhYmxlT3V0cHV0KTooMXwtMXwwKSA9PiB7XG4gICAgY29uc3Qgc29ydGEgPSBhLnRvQnVmZmVyKCk7XG4gICAgY29uc3Qgc29ydGIgPSBiLnRvQnVmZmVyKCk7XG4gICAgcmV0dXJuIEJ1ZmZlci5jb21wYXJlKHNvcnRhLCBzb3J0YikgYXMgKDF8LTF8MCk7XG4gIH07XG5cbiAgZ2V0T3V0cHV0ID0gKCk6T3V0cHV0ID0+IHRoaXMub3V0cHV0O1xuXG4gIC8vIG11c3QgYmUgaW1wbGVtZW50ZWQgdG8gc2VsZWN0IG91dHB1dCB0eXBlcyBmb3IgdGhlIFZNIGluIHF1ZXN0aW9uXG4gIGFic3RyYWN0IGZyb21CdWZmZXIoYnl0ZXM6QnVmZmVyLCBvZmZzZXQ/Om51bWJlcik6bnVtYmVyOyBcblxuICB0b0J1ZmZlcigpOkJ1ZmZlciB7XG4gICAgY29uc3Qgb3V0YnVmZjpCdWZmZXIgPSB0aGlzLm91dHB1dC50b0J1ZmZlcigpO1xuICAgIGNvbnN0IG91dGlkOkJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyg0KTtcbiAgICBvdXRpZC53cml0ZVVJbnQzMkJFKHRoaXMub3V0cHV0LmdldE91dHB1dElEKCksIDApO1xuICAgIGNvbnN0IGJhcnI6QXJyYXk8QnVmZmVyPiA9IFtvdXRpZCwgb3V0YnVmZl07XG4gICAgcmV0dXJuIEJ1ZmZlci5jb25jYXQoYmFyciwgb3V0aWQubGVuZ3RoICsgb3V0YnVmZi5sZW5ndGgpO1xuICB9XG4gIFxuICAvKipcbiAgICogQ2xhc3MgcmVwcmVzZW50aW5nIGFuIFtbUGFyc2VhYmxlT3V0cHV0XV0gZm9yIGEgdHJhbnNhY3Rpb24uXG4gICAqIFxuICAgKiBAcGFyYW0gb3V0cHV0IEEgbnVtYmVyIHJlcHJlc2VudGluZyB0aGUgSW5wdXRJRCBvZiB0aGUgW1tQYXJzZWFibGVPdXRwdXRdXVxuICAgKi9cbiAgY29uc3RydWN0b3Iob3V0cHV0Ok91dHB1dCA9IHVuZGVmaW5lZCkge1xuICAgIHN1cGVyKCk7XG4gICAgaWYgKG91dHB1dCBpbnN0YW5jZW9mIE91dHB1dCkge1xuICAgICAgdGhpcy5vdXRwdXQgPSBvdXRwdXQ7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBTdGFuZGFyZFRyYW5zZmVyYWJsZU91dHB1dCBleHRlbmRzIFN0YW5kYXJkUGFyc2VhYmxlT3V0cHV0IHtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiU3RhbmRhcmRUcmFuc2ZlcmFibGVPdXRwdXRcIjtcbiAgcHJvdGVjdGVkIF90eXBlSUQgPSB1bmRlZmluZWQ7XG5cbiAgc2VyaWFsaXplKGVuY29kaW5nOlNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpOm9iamVjdCB7XG4gICAgbGV0IGZpZWxkczpvYmplY3QgPSBzdXBlci5zZXJpYWxpemUoZW5jb2RpbmcpO1xuICAgIHJldHVybiB7XG4gICAgICAuLi5maWVsZHMsXG4gICAgICBcImFzc2V0SURcIjogc2VyaWFsaXplci5lbmNvZGVyKHRoaXMuYXNzZXRJRCwgZW5jb2RpbmcsIFwiQnVmZmVyXCIsIFwiY2I1OFwiKVxuICAgIH1cbiAgfTtcbiAgZGVzZXJpYWxpemUoZmllbGRzOm9iamVjdCwgZW5jb2Rpbmc6U2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIikge1xuICAgIHN1cGVyLmRlc2VyaWFsaXplKGZpZWxkcywgZW5jb2RpbmcpO1xuICAgIHRoaXMuYXNzZXRJRCA9IHNlcmlhbGl6ZXIuZGVjb2RlcihmaWVsZHNbXCJhc3NldElEXCJdLCBlbmNvZGluZywgXCJjYjU4XCIsIFwiQnVmZmVyXCIsIDMyKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBhc3NldElEOkJ1ZmZlciA9IHVuZGVmaW5lZDtcblxuICBnZXRBc3NldElEID0gKCk6QnVmZmVyID0+IHRoaXMuYXNzZXRJRDtcblxuICAvLyBtdXN0IGJlIGltcGxlbWVudGVkIHRvIHNlbGVjdCBvdXRwdXQgdHlwZXMgZm9yIHRoZSBWTSBpbiBxdWVzdGlvblxuICBhYnN0cmFjdCBmcm9tQnVmZmVyKGJ5dGVzOkJ1ZmZlciwgb2Zmc2V0PzpudW1iZXIpOm51bWJlcjsgXG5cbiAgdG9CdWZmZXIoKTpCdWZmZXIge1xuICAgIGNvbnN0IHBhcnNlYWJsZUJ1ZmY6QnVmZmVyID0gc3VwZXIudG9CdWZmZXIoKTtcbiAgICBjb25zdCBiYXJyOkFycmF5PEJ1ZmZlcj4gPSBbdGhpcy5hc3NldElELCBwYXJzZWFibGVCdWZmXTtcbiAgICByZXR1cm4gQnVmZmVyLmNvbmNhdChiYXJyLCB0aGlzLmFzc2V0SUQubGVuZ3RoICsgcGFyc2VhYmxlQnVmZi5sZW5ndGgpO1xuICB9XG5cbiAgLyoqXG4gICAqIENsYXNzIHJlcHJlc2VudGluZyBhbiBbW1N0YW5kYXJkVHJhbnNmZXJhYmxlT3V0cHV0XV0gZm9yIGEgdHJhbnNhY3Rpb24uXG4gICAqXG4gICAqIEBwYXJhbSBhc3NldElEIEEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gcmVwcmVzZW50aW5nIHRoZSBhc3NldElEIG9mIHRoZSBbW091dHB1dF1dXG4gICAqIEBwYXJhbSBvdXRwdXQgQSBudW1iZXIgcmVwcmVzZW50aW5nIHRoZSBJbnB1dElEIG9mIHRoZSBbW1N0YW5kYXJkVHJhbnNmZXJhYmxlT3V0cHV0XV1cbiAgICovXG4gIGNvbnN0cnVjdG9yKGFzc2V0SUQ6QnVmZmVyID0gdW5kZWZpbmVkLCBvdXRwdXQ6T3V0cHV0ID0gdW5kZWZpbmVkKSB7XG4gICAgc3VwZXIob3V0cHV0KTtcbiAgICBpZiAodHlwZW9mIGFzc2V0SUQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aGlzLmFzc2V0SUQgPSBhc3NldElEO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEFuIFtbT3V0cHV0XV0gY2xhc3Mgd2hpY2ggc3BlY2lmaWVzIGEgdG9rZW4gYW1vdW50IC5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFN0YW5kYXJkQW1vdW50T3V0cHV0IGV4dGVuZHMgT3V0cHV0IHtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiU3RhbmRhcmRBbW91bnRPdXRwdXRcIjtcbiAgcHJvdGVjdGVkIF90eXBlSUQgPSB1bmRlZmluZWQ7XG5cbiAgc2VyaWFsaXplKGVuY29kaW5nOlNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpOm9iamVjdCB7XG4gICAgbGV0IGZpZWxkczpvYmplY3QgPSBzdXBlci5zZXJpYWxpemUoZW5jb2RpbmcpO1xuICAgIHJldHVybiB7XG4gICAgICAuLi5maWVsZHMsXG4gICAgICBcImFtb3VudFwiOiBzZXJpYWxpemVyLmVuY29kZXIodGhpcy5hbW91bnQsIGVuY29kaW5nLCBcIkJ1ZmZlclwiLCBcImRlY2ltYWxTdHJpbmdcIiwgOClcbiAgICB9XG4gIH07XG4gIGRlc2VyaWFsaXplKGZpZWxkczpvYmplY3QsIGVuY29kaW5nOlNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpIHtcbiAgICBzdXBlci5kZXNlcmlhbGl6ZShmaWVsZHMsIGVuY29kaW5nKTtcbiAgICB0aGlzLmFtb3VudCA9IHNlcmlhbGl6ZXIuZGVjb2RlcihmaWVsZHNbXCJhbW91bnRcIl0sIGVuY29kaW5nLCBcImRlY2ltYWxTdHJpbmdcIiwgXCJCdWZmZXJcIiwgOCk7XG4gICAgdGhpcy5hbW91bnRWYWx1ZSA9IGJpbnRvb2xzLmZyb21CdWZmZXJUb0JOKHRoaXMuYW1vdW50KTtcbiAgfVxuXG4gIHByb3RlY3RlZCBhbW91bnQ6QnVmZmVyID0gQnVmZmVyLmFsbG9jKDgpO1xuICBwcm90ZWN0ZWQgYW1vdW50VmFsdWU6Qk4gPSBuZXcgQk4oMCk7XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGFtb3VudCBhcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59LlxuICAgKi9cbiAgZ2V0QW1vdW50ID0gKCk6Qk4gPT4gdGhpcy5hbW91bnRWYWx1ZS5jbG9uZSgpO1xuXG4gIC8qKlxuICAgKiBQb3B1YXRlcyB0aGUgaW5zdGFuY2UgZnJvbSBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHJlcHJlc2VudGluZyB0aGUgW1tTdGFuZGFyZEFtb3VudE91dHB1dF1dIGFuZCByZXR1cm5zIHRoZSBzaXplIG9mIHRoZSBvdXRwdXQuXG4gICAqL1xuICBmcm9tQnVmZmVyKG91dGJ1ZmY6QnVmZmVyLCBvZmZzZXQ6bnVtYmVyID0gMCk6bnVtYmVyIHtcbiAgICB0aGlzLmFtb3VudCA9IGJpbnRvb2xzLmNvcHlGcm9tKG91dGJ1ZmYsIG9mZnNldCwgb2Zmc2V0ICsgOCk7XG4gICAgdGhpcy5hbW91bnRWYWx1ZSA9IGJpbnRvb2xzLmZyb21CdWZmZXJUb0JOKHRoaXMuYW1vdW50KTtcbiAgICBvZmZzZXQgKz0gODtcbiAgICByZXR1cm4gc3VwZXIuZnJvbUJ1ZmZlcihvdXRidWZmLCBvZmZzZXQpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGJ1ZmZlciByZXByZXNlbnRpbmcgdGhlIFtbU3RhbmRhcmRBbW91bnRPdXRwdXRdXSBpbnN0YW5jZS5cbiAgICovXG4gIHRvQnVmZmVyKCk6QnVmZmVyIHtcbiAgICBjb25zdCBzdXBlcmJ1ZmY6QnVmZmVyID0gc3VwZXIudG9CdWZmZXIoKTtcbiAgICBjb25zdCBic2l6ZTpudW1iZXIgPSB0aGlzLmFtb3VudC5sZW5ndGggKyBzdXBlcmJ1ZmYubGVuZ3RoO1xuICAgIHRoaXMubnVtYWRkcnMud3JpdGVVSW50MzJCRSh0aGlzLmFkZHJlc3Nlcy5sZW5ndGgsIDApO1xuICAgIGNvbnN0IGJhcnI6QXJyYXk8QnVmZmVyPiA9IFt0aGlzLmFtb3VudCwgc3VwZXJidWZmXTtcbiAgICByZXR1cm4gQnVmZmVyLmNvbmNhdChiYXJyLCBic2l6ZSk7XG4gIH1cblxuICAvKipcbiAgICogQSBbW1N0YW5kYXJkQW1vdW50T3V0cHV0XV0gY2xhc3Mgd2hpY2ggaXNzdWVzIGEgcGF5bWVudCBvbiBhbiBhc3NldElELlxuICAgKlxuICAgKiBAcGFyYW0gYW1vdW50IEEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn0gcmVwcmVzZW50aW5nIHRoZSBhbW91bnQgaW4gdGhlIG91dHB1dFxuICAgKiBAcGFyYW0gYWRkcmVzc2VzIEFuIGFycmF5IG9mIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9cyByZXByZXNlbnRpbmcgYWRkcmVzc2VzXG4gICAqIEBwYXJhbSBsb2NrdGltZSBBIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59IHJlcHJlc2VudGluZyB0aGUgbG9ja3RpbWVcbiAgICogQHBhcmFtIHRocmVzaG9sZCBBIG51bWJlciByZXByZXNlbnRpbmcgdGhlIHRoZSB0aHJlc2hvbGQgbnVtYmVyIG9mIHNpZ25lcnMgcmVxdWlyZWQgdG8gc2lnbiB0aGUgdHJhbnNhY3Rpb25cbiAgICovXG4gIGNvbnN0cnVjdG9yKGFtb3VudDpCTiA9IHVuZGVmaW5lZCwgYWRkcmVzc2VzOkFycmF5PEJ1ZmZlcj4gPSB1bmRlZmluZWQsIGxvY2t0aW1lOkJOID0gdW5kZWZpbmVkLCB0aHJlc2hvbGQ6bnVtYmVyID0gdW5kZWZpbmVkKSB7XG4gICAgc3VwZXIoYWRkcmVzc2VzLCBsb2NrdGltZSwgdGhyZXNob2xkKTtcbiAgICBpZiAodHlwZW9mIGFtb3VudCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgdGhpcy5hbW91bnRWYWx1ZSA9IGFtb3VudC5jbG9uZSgpO1xuICAgICAgdGhpcy5hbW91bnQgPSBiaW50b29scy5mcm9tQk5Ub0J1ZmZlcihhbW91bnQsIDgpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEFuIFtbT3V0cHV0XV0gY2xhc3Mgd2hpY2ggc3BlY2lmaWVzIGFuIE5GVC5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEJhc2VORlRPdXRwdXQgZXh0ZW5kcyBPdXRwdXQge1xuICBwcm90ZWN0ZWQgX3R5cGVOYW1lID0gXCJCYXNlTkZUT3V0cHV0XCI7XG4gIHByb3RlY3RlZCBfdHlwZUlEID0gdW5kZWZpbmVkO1xuXG4gIHNlcmlhbGl6ZShlbmNvZGluZzpTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKTpvYmplY3Qge1xuICAgIGxldCBmaWVsZHM6b2JqZWN0ID0gc3VwZXIuc2VyaWFsaXplKGVuY29kaW5nKTtcbiAgICByZXR1cm4ge1xuICAgICAgLi4uZmllbGRzLFxuICAgICAgXCJncm91cElEXCI6IHNlcmlhbGl6ZXIuZW5jb2Rlcih0aGlzLmdyb3VwSUQsIGVuY29kaW5nLCBcIkJ1ZmZlclwiLCBcImRlY2ltYWxTdHJpbmdcIiwgNClcbiAgICB9XG4gIH07XG4gIGRlc2VyaWFsaXplKGZpZWxkczpvYmplY3QsIGVuY29kaW5nOlNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpIHtcbiAgICBzdXBlci5kZXNlcmlhbGl6ZShmaWVsZHMsIGVuY29kaW5nKTtcbiAgICB0aGlzLmdyb3VwSUQgPSBzZXJpYWxpemVyLmRlY29kZXIoZmllbGRzW1wiZ3JvdXBJRFwiXSwgZW5jb2RpbmcsIFwiZGVjaW1hbFN0cmluZ1wiLCBcIkJ1ZmZlclwiLCA0KTtcbiAgfVxuXG4gIHByb3RlY3RlZCBncm91cElEOkJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyg0KTtcblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgZ3JvdXBJRCBhcyBhIG51bWJlci5cbiAgICovXG4gIGdldEdyb3VwSUQgPSAoKTpudW1iZXIgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMuZ3JvdXBJRC5yZWFkVUludDMyQkUoMCk7XG4gIH1cbn0iXX0=