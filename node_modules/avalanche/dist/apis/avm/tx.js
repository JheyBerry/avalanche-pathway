"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tx = exports.UnsignedTx = exports.SelectTxClass = void 0;
/**
 * @packageDocumentation
 * @module API-AVM-Transactions
 */
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("../../utils/bintools"));
const constants_1 = require("./constants");
const credentials_1 = require("./credentials");
const tx_1 = require("../../common/tx");
const create_hash_1 = __importDefault(require("create-hash"));
const basetx_1 = require("./basetx");
const createassettx_1 = require("./createassettx");
const operationtx_1 = require("./operationtx");
const importtx_1 = require("./importtx");
const exporttx_1 = require("./exporttx");
const serialization_1 = require("../../utils/serialization");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
const serializer = serialization_1.Serialization.getInstance();
/**
 * Takes a buffer representing the output and returns the proper [[BaseTx]] instance.
 *
 * @param txtype The id of the transaction type
 *
 * @returns An instance of an [[BaseTx]]-extended class.
 */
exports.SelectTxClass = (txtype, ...args) => {
    if (txtype === constants_1.AVMConstants.BASETX) {
        return new basetx_1.BaseTx(...args);
    }
    else if (txtype === constants_1.AVMConstants.CREATEASSETTX) {
        return new createassettx_1.CreateAssetTx(...args);
    }
    else if (txtype === constants_1.AVMConstants.OPERATIONTX) {
        return new operationtx_1.OperationTx(...args);
    }
    else if (txtype === constants_1.AVMConstants.IMPORTTX) {
        return new importtx_1.ImportTx(...args);
    }
    else if (txtype === constants_1.AVMConstants.EXPORTTX) {
        return new exporttx_1.ExportTx(...args);
    }
    /* istanbul ignore next */
    throw new Error(`Error - SelectTxClass: unknown txtype ${txtype}`);
};
class UnsignedTx extends tx_1.StandardUnsignedTx {
    constructor() {
        super(...arguments);
        this._typeName = "UnsignedTx";
        this._typeID = undefined;
    }
    //serialize is inherited
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.transaction = exports.SelectTxClass(fields["transaction"]["_typeID"]);
        this.transaction.deserialize(fields["transaction"], encoding);
    }
    getTransaction() {
        return this.transaction;
    }
    fromBuffer(bytes, offset = 0) {
        this.codecid = bintools.copyFrom(bytes, offset, offset + 2).readUInt16BE(0);
        offset += 2;
        const txtype = bintools.copyFrom(bytes, offset, offset + 4).readUInt32BE(0);
        offset += 4;
        this.transaction = exports.SelectTxClass(txtype);
        return this.transaction.fromBuffer(bytes, offset);
    }
    /**
     * Signs this [[UnsignedTx]] and returns signed [[StandardTx]]
     *
     * @param kc An [[KeyChain]] used in signing
     *
     * @returns A signed [[StandardTx]]
     */
    sign(kc) {
        const txbuff = this.toBuffer();
        const msg = buffer_1.Buffer.from(create_hash_1.default('sha256').update(txbuff).digest());
        const sigs = this.transaction.sign(msg, kc);
        return new Tx(this, sigs);
    }
}
exports.UnsignedTx = UnsignedTx;
class Tx extends tx_1.StandardTx {
    constructor() {
        super(...arguments);
        this._typeName = "Tx";
        this._typeID = undefined;
    }
    //serialize is inherited
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.unsignedTx = new UnsignedTx();
        this.unsignedTx.deserialize(fields["unsignedTx"], encoding);
        this.credentials = [];
        for (let i = 0; i < fields["credentials"].length; i++) {
            const cred = credentials_1.SelectCredentialClass(fields["credentials"][i]["_typeID"]);
            cred.deserialize(fields["credentials"][i], encoding);
            this.credentials.push(cred);
        }
    }
    /**
     * Takes a {@link https://github.com/feross/buffer|Buffer} containing an [[Tx]], parses it, populates the class, and returns the length of the Tx in bytes.
     *
     * @param bytes A {@link https://github.com/feross/buffer|Buffer} containing a raw [[Tx]]
     * @param offset A number representing the starting point of the bytes to begin parsing
     *
     * @returns The length of the raw [[Tx]]
     */
    fromBuffer(bytes, offset = 0) {
        this.unsignedTx = new UnsignedTx();
        offset = this.unsignedTx.fromBuffer(bytes, offset);
        const numcreds = bintools.copyFrom(bytes, offset, offset + 4).readUInt32BE(0);
        offset += 4;
        this.credentials = [];
        for (let i = 0; i < numcreds; i++) {
            const credid = bintools.copyFrom(bytes, offset, offset + 4).readUInt32BE(0);
            offset += 4;
            const cred = credentials_1.SelectCredentialClass(credid);
            offset = cred.fromBuffer(bytes, offset);
            this.credentials.push(cred);
        }
        return offset;
    }
}
exports.Tx = Tx;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvYXBpcy9hdm0vdHgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7OztHQUdHO0FBQ0gsb0NBQWlDO0FBQ2pDLG9FQUE0QztBQUM1QywyQ0FBMkM7QUFDM0MsK0NBQXNEO0FBR3RELHdDQUFpRTtBQUNqRSw4REFBcUM7QUFDckMscUNBQWtDO0FBQ2xDLG1EQUFnRDtBQUNoRCwrQ0FBNEM7QUFDNUMseUNBQXNDO0FBQ3RDLHlDQUFzQztBQUN0Qyw2REFBOEU7QUFFOUU7O0dBRUc7QUFDSCxNQUFNLFFBQVEsR0FBRyxrQkFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQ3hDLE1BQU0sVUFBVSxHQUFHLDZCQUFhLENBQUMsV0FBVyxFQUFFLENBQUM7QUFFL0M7Ozs7OztHQU1HO0FBQ1UsUUFBQSxhQUFhLEdBQUcsQ0FBQyxNQUFhLEVBQUUsR0FBRyxJQUFlLEVBQVMsRUFBRTtJQUN4RSxJQUFJLE1BQU0sS0FBSyx3QkFBWSxDQUFDLE1BQU0sRUFBRTtRQUNsQyxPQUFPLElBQUksZUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7S0FDNUI7U0FBTSxJQUFJLE1BQU0sS0FBSyx3QkFBWSxDQUFDLGFBQWEsRUFBRTtRQUNoRCxPQUFPLElBQUksNkJBQWEsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO0tBQ25DO1NBQU0sSUFBSSxNQUFNLEtBQUssd0JBQVksQ0FBQyxXQUFXLEVBQUU7UUFDOUMsT0FBTyxJQUFJLHlCQUFXLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztLQUNqQztTQUFNLElBQUksTUFBTSxLQUFLLHdCQUFZLENBQUMsUUFBUSxFQUFFO1FBQzNDLE9BQU8sSUFBSSxtQkFBUSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7S0FDOUI7U0FBTSxJQUFJLE1BQU0sS0FBSyx3QkFBWSxDQUFDLFFBQVEsRUFBRTtRQUMzQyxPQUFPLElBQUksbUJBQVEs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SSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQzdCO1FBQ0QsT0FBTyxNQUFNLENBQUM7SUFDaEIsQ0FBQztDQUVGO0FBMUNELGdCQTBDQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQHBhY2thZ2VEb2N1bWVudGF0aW9uXG4gKiBAbW9kdWxlIEFQSS1BVk0tVHJhbnNhY3Rpb25zXG4gKi9cbmltcG9ydCB7IEJ1ZmZlciB9IGZyb20gJ2J1ZmZlci8nO1xuaW1wb3J0IEJpblRvb2xzIGZyb20gJy4uLy4uL3V0aWxzL2JpbnRvb2xzJztcbmltcG9ydCB7IEFWTUNvbnN0YW50cyB9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7IFNlbGVjdENyZWRlbnRpYWxDbGFzcyB9IGZyb20gJy4vY3JlZGVudGlhbHMnO1xuaW1wb3J0IHsgS2V5Q2hhaW4sIEtleVBhaXIgfSBmcm9tICcuL2tleWNoYWluJztcbmltcG9ydCB7IENyZWRlbnRpYWwgfSBmcm9tICcuLi8uLi9jb21tb24vY3JlZGVudGlhbHMnO1xuaW1wb3J0IHsgU3RhbmRhcmRUeCwgU3RhbmRhcmRVbnNpZ25lZFR4IH0gZnJvbSAnLi4vLi4vY29tbW9uL3R4JztcbmltcG9ydCBjcmVhdGVIYXNoIGZyb20gJ2NyZWF0ZS1oYXNoJztcbmltcG9ydCB7IEJhc2VUeCB9IGZyb20gJy4vYmFzZXR4JztcbmltcG9ydCB7IENyZWF0ZUFzc2V0VHggfSBmcm9tICcuL2NyZWF0ZWFzc2V0dHgnO1xuaW1wb3J0IHsgT3BlcmF0aW9uVHggfSBmcm9tICcuL29wZXJhdGlvbnR4JztcbmltcG9ydCB7IEltcG9ydFR4IH0gZnJvbSAnLi9pbXBvcnR0eCc7XG5pbXBvcnQgeyBFeHBvcnRUeCB9IGZyb20gJy4vZXhwb3J0dHgnO1xuaW1wb3J0IHsgU2VyaWFsaXphdGlvbiwgU2VyaWFsaXplZEVuY29kaW5nIH0gZnJvbSAnLi4vLi4vdXRpbHMvc2VyaWFsaXphdGlvbic7XG5cbi8qKlxuICogQGlnbm9yZVxuICovXG5jb25zdCBiaW50b29scyA9IEJpblRvb2xzLmdldEluc3RhbmNlKCk7XG5jb25zdCBzZXJpYWxpemVyID0gU2VyaWFsaXphdGlvbi5nZXRJbnN0YW5jZSgpO1xuXG4vKipcbiAqIFRha2VzIGEgYnVmZmVyIHJlcHJlc2VudGluZyB0aGUgb3V0cHV0IGFuZCByZXR1cm5zIHRoZSBwcm9wZXIgW1tCYXNlVHhdXSBpbnN0YW5jZS5cbiAqXG4gKiBAcGFyYW0gdHh0eXBlIFRoZSBpZCBvZiB0aGUgdHJhbnNhY3Rpb24gdHlwZVxuICpcbiAqIEByZXR1cm5zIEFuIGluc3RhbmNlIG9mIGFuIFtbQmFzZVR4XV0tZXh0ZW5kZWQgY2xhc3MuXG4gKi9cbmV4cG9ydCBjb25zdCBTZWxlY3RUeENsYXNzID0gKHR4dHlwZTpudW1iZXIsIC4uLmFyZ3M6QXJyYXk8YW55Pik6QmFzZVR4ID0+IHtcbiAgaWYgKHR4dHlwZSA9PT0gQVZNQ29uc3RhbnRzLkJBU0VUWCkge1xuICAgIHJldHVybiBuZXcgQmFzZVR4KC4uLmFyZ3MpO1xuICB9IGVsc2UgaWYgKHR4dHlwZSA9PT0gQVZNQ29uc3RhbnRzLkNSRUFURUFTU0VUVFgpIHtcbiAgICByZXR1cm4gbmV3IENyZWF0ZUFzc2V0VHgoLi4uYXJncyk7XG4gIH0gZWxzZSBpZiAodHh0eXBlID09PSBBVk1Db25zdGFudHMuT1BFUkFUSU9OVFgpIHtcbiAgICByZXR1cm4gbmV3IE9wZXJhdGlvblR4KC4uLmFyZ3MpO1xuICB9IGVsc2UgaWYgKHR4dHlwZSA9PT0gQVZNQ29uc3RhbnRzLklNUE9SVFRYKSB7XG4gICAgcmV0dXJuIG5ldyBJbXBvcnRUeCguLi5hcmdzKTtcbiAgfSBlbHNlIGlmICh0eHR5cGUgPT09IEFWTUNvbnN0YW50cy5FWFBPUlRUWCkge1xuICAgIHJldHVybiBuZXcgRXhwb3J0VHgoLi4uYXJncyk7XG4gIH1cbiAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgdGhyb3cgbmV3IEVycm9yKGBFcnJvciAtIFNlbGVjdFR4Q2xhc3M6IHVua25vd24gdHh0eXBlICR7dHh0eXBlfWApO1xufTtcblxuXG5leHBvcnQgY2xhc3MgVW5zaWduZWRUeCBleHRlbmRzIFN0YW5kYXJkVW5zaWduZWRUeDxLZXlQYWlyLCBLZXlDaGFpbiwgQmFzZVR4PiB7XG4gIHByb3RlY3RlZCBfdHlwZU5hbWUgPSBcIlVuc2lnbmVkVHhcIjtcbiAgcHJvdGVjdGVkIF90eXBlSUQgPSB1bmRlZmluZWQ7XG5cbiAgLy9zZXJpYWxpemUgaXMgaW5oZXJpdGVkXG5cbiAgZGVzZXJpYWxpemUoZmllbGRzOm9iamVjdCwgZW5jb2Rpbmc6U2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIikge1xuICAgIHN1cGVyLmRlc2VyaWFsaXplKGZpZWxkcywgZW5jb2RpbmcpO1xuICAgIHRoaXMudHJhbnNhY3Rpb24gPSBTZWxlY3RUeENsYXNzKGZpZWxkc1tcInRyYW5zYWN0aW9uXCJdW1wiX3R5cGVJRFwiXSk7XG4gICAgdGhpcy50cmFuc2FjdGlvbi5kZXNlcmlhbGl6ZShmaWVsZHNbXCJ0cmFuc2FjdGlvblwiXSwgZW5jb2RpbmcpO1xuICB9XG5cbiAgZ2V0VHJhbnNhY3Rpb24oKTpCYXNlVHh7XG4gICAgcmV0dXJuIHRoaXMudHJhbnNhY3Rpb24gYXMgQmFzZVR4O1xuICB9XG5cbiAgZnJvbUJ1ZmZlcihieXRlczpCdWZmZXIsIG9mZnNldDpudW1iZXIgPSAwKTpudW1iZXIge1xuICAgIHRoaXMuY29kZWNpZCA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDIpLnJlYWRVSW50MTZCRSgwKTtcbiAgICBvZmZzZXQgKz0gMjtcbiAgICBjb25zdCB0eHR5cGU6bnVtYmVyID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgNCkucmVhZFVJbnQzMkJFKDApO1xuICAgIG9mZnNldCArPSA0O1xuICAgIHRoaXMudHJhbnNhY3Rpb24gPSBTZWxlY3RUeENsYXNzKHR4dHlwZSk7XG4gICAgcmV0dXJuIHRoaXMudHJhbnNhY3Rpb24uZnJvbUJ1ZmZlcihieXRlcywgb2Zmc2V0KTtcbiAgfVxuICBcbiAgLyoqXG4gICAqIFNpZ25zIHRoaXMgW1tVbnNpZ25lZFR4XV0gYW5kIHJldHVybnMgc2lnbmVkIFtbU3RhbmRhcmRUeF1dXG4gICAqXG4gICAqIEBwYXJhbSBrYyBBbiBbW0tleUNoYWluXV0gdXNlZCBpbiBzaWduaW5nXG4gICAqXG4gICAqIEByZXR1cm5zIEEgc2lnbmVkIFtbU3RhbmRhcmRUeF1dXG4gICAqL1xuICBzaWduKGtjOktleUNoYWluKTpUeCB7XG4gICAgY29uc3QgdHhidWZmID0gdGhpcy50b0J1ZmZlcigpO1xuICAgIGNvbnN0IG1zZzpCdWZmZXIgPSBCdWZmZXIuZnJvbShjcmVhdGVIYXNoKCdzaGEyNTYnKS51cGRhdGUodHhidWZmKS5kaWdlc3QoKSk7XG4gICAgY29uc3Qgc2lnczpBcnJheTxDcmVkZW50aWFsPiA9IHRoaXMudHJhbnNhY3Rpb24uc2lnbihtc2csIGtjKTtcbiAgICByZXR1cm4gbmV3IFR4KHRoaXMsIHNpZ3MpO1xuICB9XG5cbn1cblxuZXhwb3J0IGNsYXNzIFR4IGV4dGVuZHMgU3RhbmRhcmRUeDxLZXlQYWlyLCBLZXlDaGFpbiwgVW5zaWduZWRUeD4ge1xuICBwcm90ZWN0ZWQgX3R5cGVOYW1lID0gXCJUeFwiO1xuICBwcm90ZWN0ZWQgX3R5cGVJRCA9IHVuZGVmaW5lZDtcblxuICAvL3NlcmlhbGl6ZSBpcyBpbmhlcml0ZWRcblxuICBkZXNlcmlhbGl6ZShmaWVsZHM6b2JqZWN0LCBlbmNvZGluZzpTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKSB7XG4gICAgc3VwZXIuZGVzZXJpYWxpemUoZmllbGRzLCBlbmNvZGluZyk7XG4gICAgdGhpcy51bnNpZ25lZFR4ID0gbmV3IFVuc2lnbmVkVHgoKTtcbiAgICB0aGlzLnVuc2lnbmVkVHguZGVzZXJpYWxpemUoZmllbGRzW1widW5zaWduZWRUeFwiXSwgZW5jb2RpbmcpO1xuICAgIHRoaXMuY3JlZGVudGlhbHMgPSBbXTtcbiAgICBmb3IobGV0IGkgPSAwOyBpIDwgZmllbGRzW1wiY3JlZGVudGlhbHNcIl0ubGVuZ3RoOyBpKyspe1xuICAgICAgY29uc3QgY3JlZDpDcmVkZW50aWFsID0gU2VsZWN0Q3JlZGVudGlhbENsYXNzKGZpZWxkc1tcImNyZWRlbnRpYWxzXCJdW2ldW1wiX3R5cGVJRFwiXSk7XG4gICAgICBjcmVkLmRlc2VyaWFsaXplKGZpZWxkc1tcImNyZWRlbnRpYWxzXCJdW2ldLCBlbmNvZGluZyk7XG4gICAgICB0aGlzLmNyZWRlbnRpYWxzLnB1c2goY3JlZCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRha2VzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gY29udGFpbmluZyBhbiBbW1R4XV0sIHBhcnNlcyBpdCwgcG9wdWxhdGVzIHRoZSBjbGFzcywgYW5kIHJldHVybnMgdGhlIGxlbmd0aCBvZiB0aGUgVHggaW4gYnl0ZXMuXG4gICAqXG4gICAqIEBwYXJhbSBieXRlcyBBIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IGNvbnRhaW5pbmcgYSByYXcgW1tUeF1dXG4gICAqIEBwYXJhbSBvZmZzZXQgQSBudW1iZXIgcmVwcmVzZW50aW5nIHRoZSBzdGFydGluZyBwb2ludCBvZiB0aGUgYnl0ZXMgdG8gYmVnaW4gcGFyc2luZ1xuICAgKlxuICAgKiBAcmV0dXJucyBUaGUgbGVuZ3RoIG9mIHRoZSByYXcgW1tUeF1dXG4gICAqL1xuICBmcm9tQnVmZmVyKGJ5dGVzOkJ1ZmZlciwgb2Zmc2V0Om51bWJlciA9IDApOm51bWJlciB7XG4gICAgdGhpcy51bnNpZ25lZFR4ID0gbmV3IFVuc2lnbmVkVHgoKTtcbiAgICBvZmZzZXQgPSB0aGlzLnVuc2lnbmVkVHguZnJvbUJ1ZmZlcihieXRlcywgb2Zmc2V0KTtcbiAgICBjb25zdCBudW1jcmVkczpudW1iZXIgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyA0KS5yZWFkVUludDMyQkUoMCk7XG4gICAgb2Zmc2V0ICs9IDQ7XG4gICAgdGhpcy5jcmVkZW50aWFscyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtY3JlZHM7IGkrKykge1xuICAgICAgY29uc3QgY3JlZGlkOm51bWJlciA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDQpLnJlYWRVSW50MzJCRSgwKTtcbiAgICAgIG9mZnNldCArPSA0O1xuICAgICAgY29uc3QgY3JlZDpDcmVkZW50aWFsID0gU2VsZWN0Q3JlZGVudGlhbENsYXNzKGNyZWRpZCk7XG4gICAgICBvZmZzZXQgPSBjcmVkLmZyb21CdWZmZXIoYnl0ZXMsIG9mZnNldCk7XG4gICAgICB0aGlzLmNyZWRlbnRpYWxzLnB1c2goY3JlZCk7XG4gICAgfVxuICAgIHJldHVybiBvZmZzZXQ7XG4gIH1cblxufVxuIl19