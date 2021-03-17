"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StandardUTXOSet = exports.StandardUTXO = void 0;
/**
 * @packageDocumentation
 * @module Common-UTXOs
 */
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("../utils/bintools"));
const bn_js_1 = __importDefault(require("bn.js"));
const output_1 = require("./output");
const helperfunctions_1 = require("../utils/helperfunctions");
const serialization_1 = require("../utils/serialization");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
const serializer = serialization_1.Serialization.getInstance();
/**
 * Class for representing a single StandardUTXO.
 */
class StandardUTXO extends serialization_1.Serializable {
    /**
       * Class for representing a single StandardUTXO.
       *
       * @param codecID Optional number which specifies the codeID of the UTXO. Default 1
       * @param txid Optional {@link https://github.com/feross/buffer|Buffer} of transaction ID for the StandardUTXO
       * @param txidx Optional {@link https://github.com/feross/buffer|Buffer} or number for the index of the transaction's [[Output]]
       * @param assetid Optional {@link https://github.com/feross/buffer|Buffer} of the asset ID for the StandardUTXO
       * @param outputid Optional {@link https://github.com/feross/buffer|Buffer} or number of the output ID for the StandardUTXO
       */
    constructor(codecID = 0, txid = undefined, outputidx = undefined, assetid = undefined, output = undefined) {
        super();
        this._typeName = "StandardUTXO";
        this._typeID = undefined;
        this.codecid = buffer_1.Buffer.alloc(2);
        this.txid = buffer_1.Buffer.alloc(32);
        this.outputidx = buffer_1.Buffer.alloc(4);
        this.assetid = buffer_1.Buffer.alloc(32);
        this.output = undefined;
        /**
           * Returns the numeric representation of the CodecID.
           */
        this.getCodecID = () => this.codecid.readUInt8(0);
        /**
         * Returns the {@link https://github.com/feross/buffer|Buffer} representation of the CodecID
          */
        this.getCodecIDBuffer = () => this.codecid;
        /**
           * Returns a {@link https://github.com/feross/buffer|Buffer} of the TxID.
           */
        this.getTxID = () => this.txid;
        /**
           * Returns a {@link https://github.com/feross/buffer|Buffer}  of the OutputIdx.
           */
        this.getOutputIdx = () => this.outputidx;
        /**
           * Returns the assetID as a {@link https://github.com/feross/buffer|Buffer}.
           */
        this.getAssetID = () => this.assetid;
        /**
           * Returns the UTXOID as a base-58 string (UTXOID is a string )
           */
        this.getUTXOID = () => bintools.bufferToB58(buffer_1.Buffer.concat([this.getTxID(), this.getOutputIdx()]));
        /**
         * Returns a reference to the output;
        */
        this.getOutput = () => this.output;
        if (typeof codecID !== 'undefined') {
            this.codecid.writeUInt8(codecID, 0);
        }
        if (typeof txid !== 'undefined') {
            this.txid = txid;
        }
        if (typeof outputidx === 'number') {
            this.outputidx.writeUInt32BE(outputidx, 0);
        }
        else if (outputidx instanceof buffer_1.Buffer) {
            this.outputidx = outputidx;
        }
        if (typeof assetid !== 'undefined') {
            this.assetid = assetid;
        }
        if (typeof output !== 'undefined') {
            this.output = output;
        }
    }
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { "codecid": serializer.encoder(this.codecid, encoding, "Buffer", "decimalString"), "txid": serializer.encoder(this.txid, encoding, "Buffer", "cb58"), "outputidx": serializer.encoder(this.outputidx, encoding, "Buffer", "decimalString"), "assetid": serializer.encoder(this.assetid, encoding, "Buffer", "cb58"), "output": this.output.serialize(encoding) });
    }
    ;
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.codecid = serializer.decoder(fields["codecid"], encoding, "decimalString", "Buffer", 2);
        this.txid = serializer.decoder(fields["txid"], encoding, "cb58", "Buffer", 32);
        this.outputidx = serializer.decoder(fields["outputidx"], encoding, "decimalString", "Buffer", 4);
        this.assetid = serializer.decoder(fields["assetid"], encoding, "cb58", "Buffer", 32);
    }
    /**
       * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[StandardUTXO]].
       */
    toBuffer() {
        const outbuff = this.output.toBuffer();
        const outputidbuffer = buffer_1.Buffer.alloc(4);
        outputidbuffer.writeUInt32BE(this.output.getOutputID(), 0);
        const barr = [this.codecid, this.txid, this.outputidx, this.assetid, outputidbuffer, outbuff];
        return buffer_1.Buffer.concat(barr, this.codecid.length + this.txid.length
            + this.outputidx.length + this.assetid.length
            + outputidbuffer.length + outbuff.length);
    }
}
exports.StandardUTXO = StandardUTXO;
/**
 * Class representing a set of [[StandardUTXO]]s.
 */
class StandardUTXOSet extends serialization_1.Serializable {
    constructor() {
        super(...arguments);
        this._typeName = "StandardUTXOSet";
        this._typeID = undefined;
        this.utxos = {};
        this.addressUTXOs = {}; // maps address to utxoids:locktime
        /**
         * Returns true if the [[StandardUTXO]] is in the StandardUTXOSet.
         *
         * @param utxo Either a [[StandardUTXO]] a cb58 serialized string representing a StandardUTXO
         */
        this.includes = (utxo) => {
            let utxoX = undefined;
            let utxoid = undefined;
            try {
                utxoX = this.parseUTXO(utxo);
                utxoid = utxoX.getUTXOID();
            }
            catch (e) {
                if (e instanceof Error) {
                    console.log(e.message);
                }
                else {
                    console.log(e);
                }
                return false;
            }
            return (utxoid in this.utxos);
        };
        /**
           * Removes a [[StandardUTXO]] from the [[StandardUTXOSet]] if it exists.
           *
           * @param utxo Either a [[StandardUTXO]] an cb58 serialized string representing a StandardUTXO
           *
           * @returns A [[StandardUTXO]] if it was removed and undefined if nothing was removed.
           */
        this.remove = (utxo) => {
            let utxovar = undefined;
            try {
                utxovar = this.parseUTXO(utxo);
            }
            catch (e) {
                if (e instanceof Error) {
                    console.log(e.message);
                }
                else {
                    console.log(e);
                }
                return undefined;
            }
            const utxoid = utxovar.getUTXOID();
            if (!(utxoid in this.utxos)) {
                return undefined;
            }
            delete this.utxos[utxoid];
            const addresses = Object.keys(this.addressUTXOs);
            for (let i = 0; i < addresses.length; i++) {
                if (utxoid in this.addressUTXOs[addresses[i]]) {
                    delete this.addressUTXOs[addresses[i]][utxoid];
                }
            }
            return utxovar;
        };
        /**
           * Removes an array of [[StandardUTXO]]s to the [[StandardUTXOSet]].
           *
           * @param utxo Either a [[StandardUTXO]] an cb58 serialized string representing a StandardUTXO
           * @param overwrite If true, if the UTXOID already exists, overwrite it... default false
           *
           * @returns An array of UTXOs which were removed.
           */
        this.removeArray = (utxos) => {
            const removed = [];
            for (let i = 0; i < utxos.length; i++) {
                const result = this.remove(utxos[i]);
                if (typeof result !== 'undefined') {
                    removed.push(result);
                }
            }
            return removed;
        };
        /**
           * Gets a [[StandardUTXO]] from the [[StandardUTXOSet]] by its UTXOID.
           *
           * @param utxoid String representing the UTXOID
           *
           * @returns A [[StandardUTXO]] if it exists in the set.
           */
        this.getUTXO = (utxoid) => this.utxos[utxoid];
        /**
           * Gets all the [[StandardUTXO]]s, optionally that match with UTXOIDs in an array
           *
           * @param utxoids An optional array of UTXOIDs, returns all [[StandardUTXO]]s if not provided
           *
           * @returns An array of [[StandardUTXO]]s.
           */
        this.getAllUTXOs = (utxoids = undefined) => {
            let results = [];
            if (typeof utxoids !== 'undefined' && Array.isArray(utxoids)) {
                for (let i = 0; i < utxoids.length; i++) {
                    if (utxoids[i] in this.utxos && !(utxoids[i] in results)) {
                        results.push(this.utxos[utxoids[i]]);
                    }
                }
            }
            else {
                results = Object.values(this.utxos);
            }
            return results;
        };
        /**
           * Gets all the [[StandardUTXO]]s as strings, optionally that match with UTXOIDs in an array.
           *
           * @param utxoids An optional array of UTXOIDs, returns all [[StandardUTXO]]s if not provided
           *
           * @returns An array of [[StandardUTXO]]s as cb58 serialized strings.
           */
        this.getAllUTXOStrings = (utxoids = undefined) => {
            const results = [];
            const utxos = Object.keys(this.utxos);
            if (typeof utxoids !== 'undefined' && Array.isArray(utxoids)) {
                for (let i = 0; i < utxoids.length; i++) {
                    if (utxoids[i] in this.utxos) {
                        results.push(this.utxos[utxoids[i]].toString());
                    }
                }
            }
            else {
                for (const u of utxos) {
                    results.push(this.utxos[u].toString());
                }
            }
            return results;
        };
        /**
           * Given an address or array of addresses, returns all the UTXOIDs for those addresses
           *
           * @param address An array of address {@link https://github.com/feross/buffer|Buffer}s
           * @param spendable If true, only retrieves UTXOIDs whose locktime has passed
           *
           * @returns An array of addresses.
           */
        this.getUTXOIDs = (addresses = undefined, spendable = true) => {
            if (typeof addresses !== 'undefined') {
                const results = [];
                const now = helperfunctions_1.UnixNow();
                for (let i = 0; i < addresses.length; i++) {
                    if (addresses[i].toString('hex') in this.addressUTXOs) {
                        const entries = Object.entries(this.addressUTXOs[addresses[i].toString('hex')]);
                        for (const [utxoid, locktime] of entries) {
                            if ((results.indexOf(utxoid) === -1
                                && (spendable && locktime.lte(now)))
                                || !spendable) {
                                results.push(utxoid);
                            }
                        }
                    }
                }
                return results;
            }
            return Object.keys(this.utxos);
        };
        /**
           * Gets the addresses in the [[StandardUTXOSet]] and returns an array of {@link https://github.com/feross/buffer|Buffer}.
           */
        this.getAddresses = () => Object.keys(this.addressUTXOs)
            .map((k) => buffer_1.Buffer.from(k, 'hex'));
        /**
           * Returns the balance of a set of addresses in the StandardUTXOSet.
           *
           * @param addresses An array of addresses
           * @param assetID Either a {@link https://github.com/feross/buffer|Buffer} or an cb58 serialized representation of an AssetID
           * @param asOf The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
           *
           * @returns Returns the total balance as a {@link https://github.com/indutny/bn.js/|BN}.
           */
        this.getBalance = (addresses, assetID, asOf = undefined) => {
            const utxoids = this.getUTXOIDs(addresses);
            const utxos = this.getAllUTXOs(utxoids);
            let spend = new bn_js_1.default(0);
            let asset;
            if (typeof assetID === 'string') {
                asset = bintools.cb58Decode(assetID);
            }
            else {
                asset = assetID;
            }
            for (let i = 0; i < utxos.length; i++) {
                if (utxos[i].getOutput() instanceof output_1.StandardAmountOutput
                    && utxos[i].getAssetID().toString('hex') === asset.toString('hex')
                    && utxos[i].getOutput().meetsThreshold(addresses, asOf)) {
                    spend = spend.add(utxos[i].getOutput().getAmount());
                }
            }
            return spend;
        };
        /**
           * Gets all the Asset IDs, optionally that match with Asset IDs in an array
           *
           * @param utxoids An optional array of Addresses as string or Buffer, returns all Asset IDs if not provided
           *
           * @returns An array of {@link https://github.com/feross/buffer|Buffer} representing the Asset IDs.
           */
        this.getAssetIDs = (addresses = undefined) => {
            const results = new Set();
            let utxoids = [];
            if (typeof addresses !== 'undefined') {
                utxoids = this.getUTXOIDs(addresses);
            }
            else {
                utxoids = this.getUTXOIDs();
            }
            for (let i = 0; i < utxoids.length; i++) {
                if (utxoids[i] in this.utxos && !(utxoids[i] in results)) {
                    results.add(this.utxos[utxoids[i]].getAssetID());
                }
            }
            return [...results];
        };
        /**
           * Returns a new set with copy of UTXOs in this and set parameter.
           *
           * @param utxoset The [[StandardUTXOSet]] to merge with this one
           * @param hasUTXOIDs Will subselect a set of [[StandardUTXO]]s which have the UTXOIDs provided in this array, defults to all UTXOs
           *
           * @returns A new StandardUTXOSet that contains all the filtered elements.
           */
        this.merge = (utxoset, hasUTXOIDs = undefined) => {
            const results = this.create();
            const utxos1 = this.getAllUTXOs(hasUTXOIDs);
            const utxos2 = utxoset.getAllUTXOs(hasUTXOIDs);
            const process = (utxo) => {
                results.add(utxo);
            };
            utxos1.forEach(process);
            utxos2.forEach(process);
            return results;
        };
        /**
           * Set intersetion between this set and a parameter.
           *
           * @param utxoset The set to intersect
           *
           * @returns A new StandardUTXOSet containing the intersection
           */
        this.intersection = (utxoset) => {
            const us1 = this.getUTXOIDs();
            const us2 = utxoset.getUTXOIDs();
            const results = us1.filter((utxoid) => us2.includes(utxoid));
            return this.merge(utxoset, results);
        };
        /**
           * Set difference between this set and a parameter.
           *
           * @param utxoset The set to difference
           *
           * @returns A new StandardUTXOSet containing the difference
           */
        this.difference = (utxoset) => {
            const us1 = this.getUTXOIDs();
            const us2 = utxoset.getUTXOIDs();
            const results = us1.filter((utxoid) => !us2.includes(utxoid));
            return this.merge(utxoset, results);
        };
        /**
           * Set symmetrical difference between this set and a parameter.
           *
           * @param utxoset The set to symmetrical difference
           *
           * @returns A new StandardUTXOSet containing the symmetrical difference
           */
        this.symDifference = (utxoset) => {
            const us1 = this.getUTXOIDs();
            const us2 = utxoset.getUTXOIDs();
            const results = us1.filter((utxoid) => !us2.includes(utxoid))
                .concat(us2.filter((utxoid) => !us1.includes(utxoid)));
            return this.merge(utxoset, results);
        };
        /**
           * Set union between this set and a parameter.
           *
           * @param utxoset The set to union
           *
           * @returns A new StandardUTXOSet containing the union
           */
        this.union = (utxoset) => this.merge(utxoset);
        /**
           * Merges a set by the rule provided.
           *
           * @param utxoset The set to merge by the MergeRule
           * @param mergeRule The [[MergeRule]] to apply
           *
           * @returns A new StandardUTXOSet containing the merged data
           *
           * @remarks
           * The merge rules are as follows:
           *   * "intersection" - the intersection of the set
           *   * "differenceSelf" - the difference between the existing data and new set
           *   * "differenceNew" - the difference between the new data and the existing set
           *   * "symDifference" - the union of the differences between both sets of data
           *   * "union" - the unique set of all elements contained in both sets
           *   * "unionMinusNew" - the unique set of all elements contained in both sets, excluding values only found in the new set
           *   * "unionMinusSelf" - the unique set of all elements contained in both sets, excluding values only found in the existing set
           */
        this.mergeByRule = (utxoset, mergeRule) => {
            let uSet;
            switch (mergeRule) {
                case 'intersection':
                    return this.intersection(utxoset);
                case 'differenceSelf':
                    return this.difference(utxoset);
                case 'differenceNew':
                    return utxoset.difference(this);
                case 'symDifference':
                    return this.symDifference(utxoset);
                case 'union':
                    return this.union(utxoset);
                case 'unionMinusNew':
                    uSet = this.union(utxoset);
                    return uSet.difference(utxoset);
                case 'unionMinusSelf':
                    uSet = this.union(utxoset);
                    return uSet.difference(this);
                default:
                    throw new Error(`Error - StandardUTXOSet.mergeByRule: bad MergeRule - ${mergeRule}`);
            }
        };
    }
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        let utxos = {};
        for (let utxoid in this.utxos) {
            let utxoidCleaned = serializer.encoder(utxoid, encoding, "base58", "base58");
            utxos[utxoidCleaned] = this.utxos[utxoid].serialize(encoding);
        }
        let addressUTXOs = {};
        for (let address in this.addressUTXOs) {
            let addressCleaned = serializer.encoder(address, encoding, "hex", "cb58");
            let utxobalance = {};
            for (let utxoid in this.addressUTXOs[address]) {
                let utxoidCleaned = serializer.encoder(utxoid, encoding, "base58", "base58");
                utxobalance[utxoidCleaned] = serializer.encoder(this.addressUTXOs[address][utxoid], encoding, "BN", "decimalString");
            }
            addressUTXOs[addressCleaned] = utxobalance;
        }
        return Object.assign(Object.assign({}, fields), { utxos,
            addressUTXOs });
    }
    ;
    /**
       * Adds a [[StandardUTXO]] to the StandardUTXOSet.
       *
       * @param utxo Either a [[StandardUTXO]] an cb58 serialized string representing a StandardUTXO
       * @param overwrite If true, if the UTXOID already exists, overwrite it... default false
       *
       * @returns A [[StandardUTXO]] if one was added and undefined if nothing was added.
       */
    add(utxo, overwrite = false) {
        let utxovar = undefined;
        try {
            utxovar = this.parseUTXO(utxo);
        }
        catch (e) {
            if (e instanceof Error) {
                console.log(e.message);
            }
            else {
                console.log(e);
            }
            return undefined;
        }
        const utxoid = utxovar.getUTXOID();
        if (!(utxoid in this.utxos) || overwrite === true) {
            this.utxos[utxoid] = utxovar;
            const addresses = utxovar.getOutput().getAddresses();
            const locktime = utxovar.getOutput().getLocktime();
            for (let i = 0; i < addresses.length; i++) {
                const address = addresses[i].toString('hex');
                if (!(address in this.addressUTXOs)) {
                    this.addressUTXOs[address] = {};
                }
                this.addressUTXOs[address][utxoid] = locktime;
            }
            return utxovar;
        }
        return undefined;
    }
    ;
    /**
       * Adds an array of [[StandardUTXO]]s to the [[StandardUTXOSet]].
       *
       * @param utxo Either a [[StandardUTXO]] an cb58 serialized string representing a StandardUTXO
       * @param overwrite If true, if the UTXOID already exists, overwrite it... default false
       *
       * @returns An array of StandardUTXOs which were added.
       */
    addArray(utxos, overwrite = false) {
        const added = [];
        for (let i = 0; i < utxos.length; i++) {
            let result = this.add(utxos[i], overwrite);
            if (typeof result !== 'undefined') {
                added.push(result);
            }
        }
        return added;
    }
    ;
    filter(args, lambda) {
        let newset = this.clone();
        let utxos = this.getAllUTXOs();
        for (let i = 0; i < utxos.length; i++) {
            if (lambda(utxos[i], ...args) === false) {
                newset.remove(utxos[i]);
            }
        }
        return newset;
    }
}
exports.StandardUTXOSet = StandardUTXOSet;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXR4b3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbW9uL3V0eG9zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7R0FHRztBQUNILG9DQUFpQztBQUNqQyxpRUFBeUM7QUFDekMsa0RBQXVCO0FBQ3ZCLHFDQUF3RDtBQUN4RCw4REFBbUQ7QUFFbkQsMERBQXlGO0FBRXpGOztHQUVHO0FBQ0gsTUFBTSxRQUFRLEdBQUcsa0JBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUN4QyxNQUFNLFVBQVUsR0FBRyw2QkFBYSxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBRS9DOztHQUVHO0FBQ0gsTUFBc0IsWUFBYSxTQUFRLDRCQUFZO0lBd0dyRDs7Ozs7Ozs7U0FRSztJQUNMLFlBQVksVUFBaUIsQ0FBQyxFQUFFLE9BQWMsU0FBUyxFQUNyRCxZQUE0QixTQUFTLEVBQ3JDLFVBQWlCLFNBQVMsRUFDMUIsU0FBZ0IsU0FBUztRQUN6QixLQUFLLEVBQUUsQ0FBQztRQXBIQSxjQUFTLEdBQUcsY0FBYyxDQUFDO1FBQzNCLFlBQU8sR0FBRyxTQUFTLENBQUM7UUFxQnBCLFlBQU8sR0FBVSxlQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2pDLFNBQUksR0FBVSxlQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQy9CLGNBQVMsR0FBVSxlQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ25DLFlBQU8sR0FBVSxlQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2xDLFdBQU0sR0FBVSxTQUFTLENBQUM7UUFFcEM7O2FBRUs7UUFDTCxlQUFVLEdBQUcsR0FFTCxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFckM7O1lBRUk7UUFDSixxQkFBZ0IsR0FBRyxHQUFVLEVBQUUsQ0FBQyxJQUFJLENB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QU8sU0FBUyxDQUFDO0lBQ25CLENBQUM7SUFBQSxDQUFDO0lBRUY7Ozs7Ozs7U0FPSztJQUNMLFFBQVEsQ0FBQyxLQUErQixFQUFFLFlBQW9CLEtBQUs7UUFDakUsTUFBTSxLQUFLLEdBQW9CLEVBQUUsQ0FBQztRQUNsQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNyQyxJQUFJLE1BQU0sR0FBYSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUNyRCxJQUFJLE9BQU8sTUFBTSxLQUFLLFdBQVcsRUFBRTtnQkFDL0IsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUN0QjtTQUNGO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0lBQUEsQ0FBQztJQTBNRixNQUFNLENBQUMsSUFBVSxFQUFFLE1BQWtEO1FBQ25FLElBQUksTUFBTSxHQUFRLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUMvQixJQUFJLEtBQUssR0FBb0IsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ2hELEtBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFDO1lBQ25DLElBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLEtBQUssRUFBRTtnQkFDdEMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUN6QjtTQUNGO1FBQ0QsT0FBTyxNQUFNLENBQUM7SUFDaEIsQ0FBQztDQW1IRjtBQXBiRCwwQ0FvYkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBwYWNrYWdlRG9jdW1lbnRhdGlvblxuICogQG1vZHVsZSBDb21tb24tVVRYT3NcbiAqL1xuaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSAnYnVmZmVyLyc7XG5pbXBvcnQgQmluVG9vbHMgZnJvbSAnLi4vdXRpbHMvYmludG9vbHMnO1xuaW1wb3J0IEJOIGZyb20gXCJibi5qc1wiO1xuaW1wb3J0IHsgT3V0cHV0LCBTdGFuZGFyZEFtb3VudE91dHB1dCB9IGZyb20gJy4vb3V0cHV0JztcbmltcG9ydCB7IFVuaXhOb3cgfSBmcm9tICcuLi91dGlscy9oZWxwZXJmdW5jdGlvbnMnO1xuaW1wb3J0IHsgTWVyZ2VSdWxlIH0gZnJvbSAnLi4vdXRpbHMvY29uc3RhbnRzJztcbmltcG9ydCB7IFNlcmlhbGl6YWJsZSwgU2VyaWFsaXphdGlvbiwgU2VyaWFsaXplZEVuY29kaW5nIH0gZnJvbSAnLi4vdXRpbHMvc2VyaWFsaXphdGlvbic7XG5cbi8qKlxuICogQGlnbm9yZVxuICovXG5jb25zdCBiaW50b29scyA9IEJpblRvb2xzLmdldEluc3RhbmNlKCk7XG5jb25zdCBzZXJpYWxpemVyID0gU2VyaWFsaXphdGlvbi5nZXRJbnN0YW5jZSgpO1xuXG4vKipcbiAqIENsYXNzIGZvciByZXByZXNlbnRpbmcgYSBzaW5nbGUgU3RhbmRhcmRVVFhPLlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgU3RhbmRhcmRVVFhPIGV4dGVuZHMgU2VyaWFsaXphYmxle1xuICBwcm90ZWN0ZWQgX3R5cGVOYW1lID0gXCJTdGFuZGFyZFVUWE9cIjtcbiAgcHJvdGVjdGVkIF90eXBlSUQgPSB1bmRlZmluZWQ7XG5cbiAgc2VyaWFsaXplKGVuY29kaW5nOlNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpOm9iamVjdCB7XG4gICAgbGV0IGZpZWxkczpvYmplY3QgPSBzdXBlci5zZXJpYWxpemUoZW5jb2RpbmcpO1xuICAgIHJldHVybiB7XG4gICAgICAuLi5maWVsZHMsXG4gICAgICBcImNvZGVjaWRcIjogc2VyaWFsaXplci5lbmNvZGVyKHRoaXMuY29kZWNpZCwgZW5jb2RpbmcsIFwiQnVmZmVyXCIsIFwiZGVjaW1hbFN0cmluZ1wiKSxcbiAgICAgIFwidHhpZFwiOiBzZXJpYWxpemVyLmVuY29kZXIodGhpcy50eGlkLCBlbmNvZGluZywgXCJCdWZmZXJcIiwgXCJjYjU4XCIpLFxuICAgICAgXCJvdXRwdXRpZHhcIjogc2VyaWFsaXplci5lbmNvZGVyKHRoaXMub3V0cHV0aWR4LCBlbmNvZGluZywgXCJCdWZmZXJcIiwgXCJkZWNpbWFsU3RyaW5nXCIpLFxuICAgICAgXCJhc3NldGlkXCI6IHNlcmlhbGl6ZXIuZW5jb2Rlcih0aGlzLmFzc2V0aWQsIGVuY29kaW5nLCBcIkJ1ZmZlclwiLCBcImNiNThcIiksXG4gICAgICBcIm91dHB1dFwiOiB0aGlzLm91dHB1dC5zZXJpYWxpemUoZW5jb2RpbmcpXG4gICAgfVxuICB9O1xuICBkZXNlcmlhbGl6ZShmaWVsZHM6b2JqZWN0LCBlbmNvZGluZzpTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKSB7XG4gICAgc3VwZXIuZGVzZXJpYWxpemUoZmllbGRzLCBlbmNvZGluZyk7XG4gICAgdGhpcy5jb2RlY2lkID0gc2VyaWFsaXplci5kZWNvZGVyKGZpZWxkc1tcImNvZGVjaWRcIl0sIGVuY29kaW5nLCBcImRlY2ltYWxTdHJpbmdcIiwgXCJCdWZmZXJcIiwgMik7XG4gICAgdGhpcy50eGlkID0gc2VyaWFsaXplci5kZWNvZGVyKGZpZWxkc1tcInR4aWRcIl0sIGVuY29kaW5nLCBcImNiNThcIiwgXCJCdWZmZXJcIiwgMzIpO1xuICAgIHRoaXMub3V0cHV0aWR4ID0gc2VyaWFsaXplci5kZWNvZGVyKGZpZWxkc1tcIm91dHB1dGlkeFwiXSwgZW5jb2RpbmcsIFwiZGVjaW1hbFN0cmluZ1wiLCBcIkJ1ZmZlclwiLCA0KTtcbiAgICB0aGlzLmFzc2V0aWQgPSBzZXJpYWxpemVyLmRlY29kZXIoZmllbGRzW1wiYXNzZXRpZFwiXSwgZW5jb2RpbmcsIFwiY2I1OFwiLCBcIkJ1ZmZlclwiLCAzMik7XG4gIH1cblxuICBwcm90ZWN0ZWQgY29kZWNpZDpCdWZmZXIgPSBCdWZmZXIuYWxsb2MoMik7XG4gIHByb3RlY3RlZCB0eGlkOkJ1ZmZlciA9IEJ1ZmZlci5hbGxvYygzMik7XG4gIHByb3RlY3RlZCBvdXRwdXRpZHg6QnVmZmVyID0gQnVmZmVyLmFsbG9jKDQpO1xuICBwcm90ZWN0ZWQgYXNzZXRpZDpCdWZmZXIgPSBCdWZmZXIuYWxsb2MoMzIpO1xuICBwcm90ZWN0ZWQgb3V0cHV0Ok91dHB1dCA9IHVuZGVmaW5lZDtcblxuICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBudW1lcmljIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBDb2RlY0lELlxuICAgICAqL1xuICBnZXRDb2RlY0lEID0gKClcbiAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgOm51bWJlciA9PiB0aGlzLmNvZGVjaWQucmVhZFVJbnQ4KDApO1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSByZXByZXNlbnRhdGlvbiBvZiB0aGUgQ29kZWNJRFxuICAgICovXG4gIGdldENvZGVjSURCdWZmZXIgPSAoKTpCdWZmZXIgPT4gdGhpcy5jb2RlY2lkO1xuXG4gIC8qKlxuICAgICAqIFJldHVybnMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBvZiB0aGUgVHhJRC5cbiAgICAgKi9cbiAgZ2V0VHhJRCA9ICgpXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gIDpCdWZmZXIgPT4gdGhpcy50eGlkO1xuXG4gIC8qKlxuICAgICAqIFJldHVybnMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSAgb2YgdGhlIE91dHB1dElkeC5cbiAgICAgKi9cbiAgZ2V0T3V0cHV0SWR4ID0gKClcbiAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgOkJ1ZmZlciA9PiB0aGlzLm91dHB1dGlkeDtcblxuICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBhc3NldElEIGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0uXG4gICAgICovXG4gIGdldEFzc2V0SUQgPSAoKTpCdWZmZXIgPT4gdGhpcy5hc3NldGlkO1xuXG4gIC8qKlxuICAgICAqIFJldHVybnMgdGhlIFVUWE9JRCBhcyBhIGJhc2UtNTggc3RyaW5nIChVVFhPSUQgaXMgYSBzdHJpbmcgKVxuICAgICAqL1xuICBnZXRVVFhPSUQgPSAoKVxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICA6c3RyaW5nID0+IGJpbnRvb2xzLmJ1ZmZlclRvQjU4KEJ1ZmZlci5jb25jYXQoW3RoaXMuZ2V0VHhJRCgpLCB0aGlzLmdldE91dHB1dElkeCgpXSkpO1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgcmVmZXJlbmNlIHRvIHRoZSBvdXRwdXQ7XG4gICovXG4gIGdldE91dHB1dCA9ICgpOk91dHB1dCA9PiB0aGlzLm91dHB1dDtcblxuICAvKipcbiAgICogVGFrZXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBjb250YWluaW5nIGFuIFtbU3RhbmRhcmRVVFhPXV0sIHBhcnNlcyBpdCwgcG9wdWxhdGVzIHRoZSBjbGFzcywgYW5kIHJldHVybnMgdGhlIGxlbmd0aCBvZiB0aGUgU3RhbmRhcmRVVFhPIGluIGJ5dGVzLlxuICAgKlxuICAgKiBAcGFyYW0gYnl0ZXMgQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBjb250YWluaW5nIGEgcmF3IFtbU3RhbmRhcmRVVFhPXV1cbiAgICovXG4gIGFic3RyYWN0IGZyb21CdWZmZXIoYnl0ZXM6QnVmZmVyLCBvZmZzZXQ/Om51bWJlcik6bnVtYmVyO1xuXG4gIC8qKlxuICAgICAqIFJldHVybnMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSByZXByZXNlbnRhdGlvbiBvZiB0aGUgW1tTdGFuZGFyZFVUWE9dXS5cbiAgICAgKi9cbiAgdG9CdWZmZXIoKTpCdWZmZXIge1xuICAgIGNvbnN0IG91dGJ1ZmY6QnVmZmVyID0gdGhpcy5vdXRwdXQudG9CdWZmZXIoKTtcbiAgICBjb25zdCBvdXRwdXRpZGJ1ZmZlcjpCdWZmZXIgPSBCdWZmZXIuYWxsb2MoNCk7XG4gICAgb3V0cHV0aWRidWZmZXIud3JpdGVVSW50MzJCRSh0aGlzLm91dHB1dC5nZXRPdXRwdXRJRCgpLCAwKTtcbiAgICBjb25zdCBiYXJyOkFycmF5PEJ1ZmZlcj4gPSBbdGhpcy5jb2RlY2lkLCB0aGlzLnR4aWQsIHRoaXMub3V0cHV0aWR4LCB0aGlzLmFzc2V0aWQsIG91dHB1dGlkYnVmZmVyLCBvdXRidWZmXTtcbiAgICByZXR1cm4gQnVmZmVyLmNvbmNhdChiYXJyLCBcbiAgICAgIHRoaXMuY29kZWNpZC5sZW5ndGggKyB0aGlzLnR4aWQubGVuZ3RoIFxuICAgICAgKyB0aGlzLm91dHB1dGlkeC5sZW5ndGggKyB0aGlzLmFzc2V0aWQubGVuZ3RoXG4gICAgICArIG91dHB1dGlkYnVmZmVyLmxlbmd0aCArIG91dGJ1ZmYubGVuZ3RoKTtcbiAgfVxuXG4gIGFic3RyYWN0IGZyb21TdHJpbmcoc2VyaWFsaXplZDpzdHJpbmcpOm51bWJlcjtcblxuICBhYnN0cmFjdCB0b1N0cmluZygpOnN0cmluZztcblxuICBhYnN0cmFjdCBjbG9uZSgpOnRoaXM7XG5cbiAgYWJzdHJhY3QgY3JlYXRlKGNvZGVjSUQ/Om51bWJlciwgdHhpZD86QnVmZmVyLFxuICAgIG91dHB1dGlkeD86QnVmZmVyIHwgbnVtYmVyLFxuICAgIGFzc2V0aWQ/OkJ1ZmZlcixcbiAgICBvdXRwdXQ/Ok91dHB1dCk6dGhpcztcblxuICAvKipcbiAgICAgKiBDbGFzcyBmb3IgcmVwcmVzZW50aW5nIGEgc2luZ2xlIFN0YW5kYXJkVVRYTy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBjb2RlY0lEIE9wdGlvbmFsIG51bWJlciB3aGljaCBzcGVjaWZpZXMgdGhlIGNvZGVJRCBvZiB0aGUgVVRYTy4gRGVmYXVsdCAxXG4gICAgICogQHBhcmFtIHR4aWQgT3B0aW9uYWwge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gb2YgdHJhbnNhY3Rpb24gSUQgZm9yIHRoZSBTdGFuZGFyZFVUWE9cbiAgICAgKiBAcGFyYW0gdHhpZHggT3B0aW9uYWwge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gb3IgbnVtYmVyIGZvciB0aGUgaW5kZXggb2YgdGhlIHRyYW5zYWN0aW9uJ3MgW1tPdXRwdXRdXVxuICAgICAqIEBwYXJhbSBhc3NldGlkIE9wdGlvbmFsIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IG9mIHRoZSBhc3NldCBJRCBmb3IgdGhlIFN0YW5kYXJkVVRYT1xuICAgICAqIEBwYXJhbSBvdXRwdXRpZCBPcHRpb25hbCB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBvciBudW1iZXIgb2YgdGhlIG91dHB1dCBJRCBmb3IgdGhlIFN0YW5kYXJkVVRYT1xuICAgICAqL1xuICBjb25zdHJ1Y3Rvcihjb2RlY0lEOm51bWJlciA9IDAsIHR4aWQ6QnVmZmVyID0gdW5kZWZpbmVkLFxuICAgIG91dHB1dGlkeDpCdWZmZXIgfCBudW1iZXIgPSB1bmRlZmluZWQsXG4gICAgYXNzZXRpZDpCdWZmZXIgPSB1bmRlZmluZWQsXG4gICAgb3V0cHV0Ok91dHB1dCA9IHVuZGVmaW5lZCl7XG4gICAgc3VwZXIoKTtcbiAgICBpZiAodHlwZW9mIGNvZGVjSUQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aGlzLmNvZGVjaWQgLndyaXRlVUludDgoY29kZWNJRCwgMCk7XG4gICAgfVxuICAgIGlmKHR5cGVvZiB0eGlkICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhpcy50eGlkID0gdHhpZDtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBvdXRwdXRpZHggPT09ICdudW1iZXInKSB7XG4gICAgICB0aGlzLm91dHB1dGlkeC53cml0ZVVJbnQzMkJFKG91dHB1dGlkeCwgMCk7XG4gICAgfSBlbHNlIGlmIChvdXRwdXRpZHggaW5zdGFuY2VvZiBCdWZmZXIpIHtcbiAgICAgIHRoaXMub3V0cHV0aWR4ID0gb3V0cHV0aWR4O1xuICAgIH0gXG5cbiAgICBpZih0eXBlb2YgYXNzZXRpZCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRoaXMuYXNzZXRpZCA9IGFzc2V0aWQ7XG4gICAgfVxuICAgIGlmKHR5cGVvZiBvdXRwdXQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aGlzLm91dHB1dCA9IG91dHB1dDtcbiAgICB9XG4gICAgICBcbiAgfVxufVxuLyoqXG4gKiBDbGFzcyByZXByZXNlbnRpbmcgYSBzZXQgb2YgW1tTdGFuZGFyZFVUWE9dXXMuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBTdGFuZGFyZFVUWE9TZXQ8VVRYT0NsYXNzIGV4dGVuZHMgU3RhbmRhcmRVVFhPPiBleHRlbmRzIFNlcmlhbGl6YWJsZXtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiU3RhbmRhcmRVVFhPU2V0XCI7XG4gIHByb3RlY3RlZCBfdHlwZUlEID0gdW5kZWZpbmVkO1xuXG4gIHNlcmlhbGl6ZShlbmNvZGluZzpTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKTpvYmplY3Qge1xuICAgIGxldCBmaWVsZHM6b2JqZWN0ID0gc3VwZXIuc2VyaWFsaXplKGVuY29kaW5nKTtcbiAgICBsZXQgdXR4b3MgPSB7fTtcbiAgICBmb3IobGV0IHV0eG9pZCBpbiB0aGlzLnV0eG9zKSB7XG4gICAgICBsZXQgdXR4b2lkQ2xlYW5lZDpzdHJpbmcgPSBzZXJpYWxpemVyLmVuY29kZXIodXR4b2lkLCBlbmNvZGluZywgXCJiYXNlNThcIiwgXCJiYXNlNThcIik7XG4gICAgICB1dHhvc1t1dHhvaWRDbGVhbmVkXSA9IHRoaXMudXR4b3NbdXR4b2lkXS5zZXJpYWxpemUoZW5jb2RpbmcpO1xuICAgIH1cbiAgICBsZXQgYWRkcmVzc1VUWE9zID0ge307XG4gICAgZm9yKGxldCBhZGRyZXNzIGluIHRoaXMuYWRkcmVzc1VUWE9zKSB7XG4gICAgICBsZXQgYWRkcmVzc0NsZWFuZWQ6c3RyaW5nID0gc2VyaWFsaXplci5lbmNvZGVyKGFkZHJlc3MsIGVuY29kaW5nLCBcImhleFwiLCBcImNiNThcIik7XG4gICAgICBsZXQgdXR4b2JhbGFuY2UgPSB7fTtcbiAgICAgIGZvcihsZXQgdXR4b2lkIGluIHRoaXMuYWRkcmVzc1VUWE9zW2FkZHJlc3NdKXtcbiAgICAgICAgbGV0IHV0eG9pZENsZWFuZWQ6c3RyaW5nID0gc2VyaWFsaXplci5lbmNvZGVyKHV0eG9pZCwgZW5jb2RpbmcsIFwiYmFzZTU4XCIsIFwiYmFzZTU4XCIpO1xuICAgICAgICB1dHhvYmFsYW5jZVt1dHhvaWRDbGVhbmVkXSA9IHNlcmlhbGl6ZXIuZW5jb2Rlcih0aGlzLmFkZHJlc3NVVFhPc1thZGRyZXNzXVt1dHhvaWRdLCBlbmNvZGluZywgXCJCTlwiLCBcImRlY2ltYWxTdHJpbmdcIik7XG4gICAgICB9XG4gICAgICBhZGRyZXNzVVRYT3NbYWRkcmVzc0NsZWFuZWRdID0gdXR4b2JhbGFuY2U7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAuLi5maWVsZHMsXG4gICAgICB1dHhvcyxcbiAgICAgIGFkZHJlc3NVVFhPc1xuICAgIH1cbiAgfTtcblxuICBwcm90ZWN0ZWQgdXR4b3M6e1t1dHhvaWQ6IHN0cmluZ106IFVUWE9DbGFzcyB9ID0ge307XG4gIHByb3RlY3RlZCBhZGRyZXNzVVRYT3M6e1thZGRyZXNzOiBzdHJpbmddOiB7W3V0eG9pZDogc3RyaW5nXTogQk59fSA9IHt9OyAvLyBtYXBzIGFkZHJlc3MgdG8gdXR4b2lkczpsb2NrdGltZVxuXG4gIGFic3RyYWN0IHBhcnNlVVRYTyh1dHhvOlVUWE9DbGFzcyB8IHN0cmluZyk6VVRYT0NsYXNzO1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIFtbU3RhbmRhcmRVVFhPXV0gaXMgaW4gdGhlIFN0YW5kYXJkVVRYT1NldC5cbiAgICpcbiAgICogQHBhcmFtIHV0eG8gRWl0aGVyIGEgW1tTdGFuZGFyZFVUWE9dXSBhIGNiNTggc2VyaWFsaXplZCBzdHJpbmcgcmVwcmVzZW50aW5nIGEgU3RhbmRhcmRVVFhPXG4gICAqL1xuICBpbmNsdWRlcyA9ICh1dHhvOlVUWE9DbGFzcyB8IHN0cmluZyk6Ym9vbGVhbiA9PiB7XG4gICAgbGV0IHV0eG9YOlVUWE9DbGFzcyA9IHVuZGVmaW5lZDtcbiAgICBsZXQgdXR4b2lkOnN0cmluZyA9IHVuZGVmaW5lZDtcbiAgICB0cnkge1xuICAgICAgdXR4b1ggPSB0aGlzLnBhcnNlVVRYTyh1dHhvKTtcbiAgICAgIHV0eG9pZCA9IHV0eG9YLmdldFVUWE9JRCgpO1xuICAgIH0gY2F0Y2goZSkge1xuICAgICAgaWYoZSBpbnN0YW5jZW9mIEVycm9yKXtcbiAgICAgICAgY29uc29sZS5sb2coZS5tZXNzYWdlKTtcbiAgICAgIH0gZWxzZXsgXG4gICAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gKHV0eG9pZCBpbiB0aGlzLnV0eG9zKTtcbiAgfTtcblxuICAvKipcbiAgICAgKiBBZGRzIGEgW1tTdGFuZGFyZFVUWE9dXSB0byB0aGUgU3RhbmRhcmRVVFhPU2V0LlxuICAgICAqXG4gICAgICogQHBhcmFtIHV0eG8gRWl0aGVyIGEgW1tTdGFuZGFyZFVUWE9dXSBhbiBjYjU4IHNlcmlhbGl6ZWQgc3RyaW5nIHJlcHJlc2VudGluZyBhIFN0YW5kYXJkVVRYT1xuICAgICAqIEBwYXJhbSBvdmVyd3JpdGUgSWYgdHJ1ZSwgaWYgdGhlIFVUWE9JRCBhbHJlYWR5IGV4aXN0cywgb3ZlcndyaXRlIGl0Li4uIGRlZmF1bHQgZmFsc2VcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIEEgW1tTdGFuZGFyZFVUWE9dXSBpZiBvbmUgd2FzIGFkZGVkIGFuZCB1bmRlZmluZWQgaWYgbm90aGluZyB3YXMgYWRkZWQuXG4gICAgICovXG4gIGFkZCh1dHhvOlVUWE9DbGFzcyB8IHN0cmluZywgb3ZlcndyaXRlOmJvb2xlYW4gPSBmYWxzZSk6VVRYT0NsYXNzIHtcbiAgICBsZXQgdXR4b3ZhcjpVVFhPQ2xhc3MgPSB1bmRlZmluZWQ7XG4gICAgdHJ5IHtcbiAgICAgIHV0eG92YXIgPSB0aGlzLnBhcnNlVVRYTyh1dHhvKTtcbiAgICB9IGNhdGNoKGUpIHtcbiAgICAgIGlmKGUgaW5zdGFuY2VvZiBFcnJvcil7XG4gICAgICAgIGNvbnNvbGUubG9nKGUubWVzc2FnZSk7XG4gICAgICB9IGVsc2V7IFxuICAgICAgICBjb25zb2xlLmxvZyhlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB1bmRlZmluZWQ7IFxuICAgIH1cblxuICAgIGNvbnN0IHV0eG9pZDpzdHJpbmcgPSB1dHhvdmFyLmdldFVUWE9JRCgpO1xuICAgIGlmICghKHV0eG9pZCBpbiB0aGlzLnV0eG9zKSB8fCBvdmVyd3JpdGUgPT09IHRydWUpIHtcbiAgICAgIHRoaXMudXR4b3NbdXR4b2lkXSA9IHV0eG92YXI7XG4gICAgICBjb25zdCBhZGRyZXNzZXM6QXJyYXk8QnVmZmVyPiA9IHV0eG92YXIuZ2V0T3V0cHV0KCkuZ2V0QWRkcmVzc2VzKCk7XG4gICAgICBjb25zdCBsb2NrdGltZTpCTiA9IHV0eG92YXIuZ2V0T3V0cHV0KCkuZ2V0TG9ja3RpbWUoKTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYWRkcmVzc2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGFkZHJlc3M6c3RyaW5nID0gYWRkcmVzc2VzW2ldLnRvU3RyaW5nKCdoZXgnKTtcbiAgICAgICAgaWYgKCEoYWRkcmVzcyBpbiB0aGlzLmFkZHJlc3NVVFhPcykpIHtcbiAgICAgICAgICB0aGlzLmFkZHJlc3NVVFhPc1thZGRyZXNzXSA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYWRkcmVzc1VUWE9zW2FkZHJlc3NdW3V0eG9pZF0gPSBsb2NrdGltZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB1dHhvdmFyO1xuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9O1xuXG4gIC8qKlxuICAgICAqIEFkZHMgYW4gYXJyYXkgb2YgW1tTdGFuZGFyZFVUWE9dXXMgdG8gdGhlIFtbU3RhbmRhcmRVVFhPU2V0XV0uXG4gICAgICpcbiAgICAgKiBAcGFyYW0gdXR4byBFaXRoZXIgYSBbW1N0YW5kYXJkVVRYT11dIGFuIGNiNTggc2VyaWFsaXplZCBzdHJpbmcgcmVwcmVzZW50aW5nIGEgU3RhbmRhcmRVVFhPXG4gICAgICogQHBhcmFtIG92ZXJ3cml0ZSBJZiB0cnVlLCBpZiB0aGUgVVRYT0lEIGFscmVhZHkgZXhpc3RzLCBvdmVyd3JpdGUgaXQuLi4gZGVmYXVsdCBmYWxzZVxuICAgICAqXG4gICAgICogQHJldHVybnMgQW4gYXJyYXkgb2YgU3RhbmRhcmRVVFhPcyB3aGljaCB3ZXJlIGFkZGVkLlxuICAgICAqL1xuICBhZGRBcnJheSh1dHhvczpBcnJheTxzdHJpbmcgfCBVVFhPQ2xhc3M+LCBvdmVyd3JpdGU6Ym9vbGVhbiA9IGZhbHNlKTpBcnJheTxTdGFuZGFyZFVUWE8+IHtcbiAgICBjb25zdCBhZGRlZDpBcnJheTxVVFhPQ2xhc3M+ID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB1dHhvcy5sZW5ndGg7IGkrKykge1xuICAgICAgbGV0IHJlc3VsdDpVVFhPQ2xhc3MgPSB0aGlzLmFkZCh1dHhvc1tpXSwgb3ZlcndyaXRlKTtcbiAgICAgIGlmICh0eXBlb2YgcmVzdWx0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIGFkZGVkLnB1c2gocmVzdWx0KTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGFkZGVkO1xuICB9O1xuXG4gIC8qKlxuICAgICAqIFJlbW92ZXMgYSBbW1N0YW5kYXJkVVRYT11dIGZyb20gdGhlIFtbU3RhbmRhcmRVVFhPU2V0XV0gaWYgaXQgZXhpc3RzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHV0eG8gRWl0aGVyIGEgW1tTdGFuZGFyZFVUWE9dXSBhbiBjYjU4IHNlcmlhbGl6ZWQgc3RyaW5nIHJlcHJlc2VudGluZyBhIFN0YW5kYXJkVVRYT1xuICAgICAqXG4gICAgICogQHJldHVybnMgQSBbW1N0YW5kYXJkVVRYT11dIGlmIGl0IHdhcyByZW1vdmVkIGFuZCB1bmRlZmluZWQgaWYgbm90aGluZyB3YXMgcmVtb3ZlZC5cbiAgICAgKi9cbiAgcmVtb3ZlID0gKHV0eG86VVRYT0NsYXNzIHwgc3RyaW5nKTpVVFhPQ2xhc3MgPT4ge1xuICAgIGxldCB1dHhvdmFyOlVUWE9DbGFzcyA9IHVuZGVmaW5lZDtcbiAgICB0cnkge1xuICAgICAgdXR4b3ZhciA9IHRoaXMucGFyc2VVVFhPKHV0eG8pO1xuICAgIH0gY2F0Y2goZSkge1xuICAgICAgaWYoZSBpbnN0YW5jZW9mIEVycm9yKXtcbiAgICAgICAgY29uc29sZS5sb2coZS5tZXNzYWdlKTtcbiAgICAgIH0gZWxzZXsgXG4gICAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHVuZGVmaW5lZDsgXG4gICAgfVxuXG4gICAgY29uc3QgdXR4b2lkOnN0cmluZyA9IHV0eG92YXIuZ2V0VVRYT0lEKCk7XG4gICAgaWYgKCEodXR4b2lkIGluIHRoaXMudXR4b3MpKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBkZWxldGUgdGhpcy51dHhvc1t1dHhvaWRdO1xuICAgIGNvbnN0IGFkZHJlc3NlcyA9IE9iamVjdC5rZXlzKHRoaXMuYWRkcmVzc1VUWE9zKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFkZHJlc3Nlcy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHV0eG9pZCBpbiB0aGlzLmFkZHJlc3NVVFhPc1thZGRyZXNzZXNbaV1dKSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLmFkZHJlc3NVVFhPc1thZGRyZXNzZXNbaV1dW3V0eG9pZF07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB1dHhvdmFyO1xuICB9O1xuXG4gIC8qKlxuICAgICAqIFJlbW92ZXMgYW4gYXJyYXkgb2YgW1tTdGFuZGFyZFVUWE9dXXMgdG8gdGhlIFtbU3RhbmRhcmRVVFhPU2V0XV0uXG4gICAgICpcbiAgICAgKiBAcGFyYW0gdXR4byBFaXRoZXIgYSBbW1N0YW5kYXJkVVRYT11dIGFuIGNiNTggc2VyaWFsaXplZCBzdHJpbmcgcmVwcmVzZW50aW5nIGEgU3RhbmRhcmRVVFhPXG4gICAgICogQHBhcmFtIG92ZXJ3cml0ZSBJZiB0cnVlLCBpZiB0aGUgVVRYT0lEIGFscmVhZHkgZXhpc3RzLCBvdmVyd3JpdGUgaXQuLi4gZGVmYXVsdCBmYWxzZVxuICAgICAqXG4gICAgICogQHJldHVybnMgQW4gYXJyYXkgb2YgVVRYT3Mgd2hpY2ggd2VyZSByZW1vdmVkLlxuICAgICAqL1xuICByZW1vdmVBcnJheSA9ICh1dHhvczpBcnJheTxzdHJpbmcgfCBVVFhPQ2xhc3M+KTpBcnJheTxVVFhPQ2xhc3M+ID0+IHtcbiAgICBjb25zdCByZW1vdmVkOkFycmF5PFVUWE9DbGFzcz4gPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHV0eG9zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCByZXN1bHQ6VVRYT0NsYXNzID0gdGhpcy5yZW1vdmUodXR4b3NbaV0pO1xuICAgICAgaWYgKHR5cGVvZiByZXN1bHQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJlbW92ZWQucHVzaChyZXN1bHQpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVtb3ZlZDtcbiAgfTtcblxuICAvKipcbiAgICAgKiBHZXRzIGEgW1tTdGFuZGFyZFVUWE9dXSBmcm9tIHRoZSBbW1N0YW5kYXJkVVRYT1NldF1dIGJ5IGl0cyBVVFhPSUQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gdXR4b2lkIFN0cmluZyByZXByZXNlbnRpbmcgdGhlIFVUWE9JRFxuICAgICAqXG4gICAgICogQHJldHVybnMgQSBbW1N0YW5kYXJkVVRYT11dIGlmIGl0IGV4aXN0cyBpbiB0aGUgc2V0LlxuICAgICAqL1xuICBnZXRVVFhPID0gKHV0eG9pZDpzdHJpbmcpOlVUWE9DbGFzcyA9PiB0aGlzLnV0eG9zW3V0eG9pZF07XG5cbiAgLyoqXG4gICAgICogR2V0cyBhbGwgdGhlIFtbU3RhbmRhcmRVVFhPXV1zLCBvcHRpb25hbGx5IHRoYXQgbWF0Y2ggd2l0aCBVVFhPSURzIGluIGFuIGFycmF5XG4gICAgICpcbiAgICAgKiBAcGFyYW0gdXR4b2lkcyBBbiBvcHRpb25hbCBhcnJheSBvZiBVVFhPSURzLCByZXR1cm5zIGFsbCBbW1N0YW5kYXJkVVRYT11dcyBpZiBub3QgcHJvdmlkZWRcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIEFuIGFycmF5IG9mIFtbU3RhbmRhcmRVVFhPXV1zLlxuICAgICAqL1xuICBnZXRBbGxVVFhPcyA9ICh1dHhvaWRzOkFycmF5PHN0cmluZz4gPSB1bmRlZmluZWQpOkFycmF5PFVUWE9DbGFzcz4gPT4ge1xuICAgIGxldCByZXN1bHRzOkFycmF5PFVUWE9DbGFzcz4gPSBbXTtcbiAgICBpZiAodHlwZW9mIHV0eG9pZHMgIT09ICd1bmRlZmluZWQnICYmIEFycmF5LmlzQXJyYXkodXR4b2lkcykpIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdXR4b2lkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAodXR4b2lkc1tpXSBpbiB0aGlzLnV0eG9zICYmICEodXR4b2lkc1tpXSBpbiByZXN1bHRzKSkge1xuICAgICAgICAgIHJlc3VsdHMucHVzaCh0aGlzLnV0eG9zW3V0eG9pZHNbaV1dKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHRzID0gT2JqZWN0LnZhbHVlcyh0aGlzLnV0eG9zKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG5cbiAgLyoqXG4gICAgICogR2V0cyBhbGwgdGhlIFtbU3RhbmRhcmRVVFhPXV1zIGFzIHN0cmluZ3MsIG9wdGlvbmFsbHkgdGhhdCBtYXRjaCB3aXRoIFVUWE9JRHMgaW4gYW4gYXJyYXkuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gdXR4b2lkcyBBbiBvcHRpb25hbCBhcnJheSBvZiBVVFhPSURzLCByZXR1cm5zIGFsbCBbW1N0YW5kYXJkVVRYT11dcyBpZiBub3QgcHJvdmlkZWRcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIEFuIGFycmF5IG9mIFtbU3RhbmRhcmRVVFhPXV1zIGFzIGNiNTggc2VyaWFsaXplZCBzdHJpbmdzLlxuICAgICAqL1xuICBnZXRBbGxVVFhPU3RyaW5ncyA9ICh1dHhvaWRzOkFycmF5PHN0cmluZz4gPSB1bmRlZmluZWQpOkFycmF5PHN0cmluZz4gPT4ge1xuICAgIGNvbnN0IHJlc3VsdHM6QXJyYXk8c3RyaW5nPiA9IFtdO1xuICAgIGNvbnN0IHV0eG9zID0gT2JqZWN0LmtleXModGhpcy51dHhvcyk7XG4gICAgaWYgKHR5cGVvZiB1dHhvaWRzICE9PSAndW5kZWZpbmVkJyAmJiBBcnJheS5pc0FycmF5KHV0eG9pZHMpKSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHV0eG9pZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHV0eG9pZHNbaV0gaW4gdGhpcy51dHhvcykge1xuICAgICAgICAgIHJlc3VsdHMucHVzaCh0aGlzLnV0eG9zW3V0eG9pZHNbaV1dLnRvU3RyaW5nKCkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAoY29uc3QgdSBvZiB1dHhvcykge1xuICAgICAgICByZXN1bHRzLnB1c2godGhpcy51dHhvc1t1XS50b1N0cmluZygpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG5cbiAgLyoqXG4gICAgICogR2l2ZW4gYW4gYWRkcmVzcyBvciBhcnJheSBvZiBhZGRyZXNzZXMsIHJldHVybnMgYWxsIHRoZSBVVFhPSURzIGZvciB0aG9zZSBhZGRyZXNzZXNcbiAgICAgKlxuICAgICAqIEBwYXJhbSBhZGRyZXNzIEFuIGFycmF5IG9mIGFkZHJlc3Mge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn1zXG4gICAgICogQHBhcmFtIHNwZW5kYWJsZSBJZiB0cnVlLCBvbmx5IHJldHJpZXZlcyBVVFhPSURzIHdob3NlIGxvY2t0aW1lIGhhcyBwYXNzZWRcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIEFuIGFycmF5IG9mIGFkZHJlc3Nlcy5cbiAgICAgKi9cbiAgZ2V0VVRYT0lEcyA9IChhZGRyZXNzZXM6QXJyYXk8QnVmZmVyPiA9IHVuZGVmaW5lZCwgc3BlbmRhYmxlOmJvb2xlYW4gPSB0cnVlKTpBcnJheTxzdHJpbmc+ID0+IHtcbiAgICBpZiAodHlwZW9mIGFkZHJlc3NlcyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGNvbnN0IHJlc3VsdHM6QXJyYXk8c3RyaW5nPiA9IFtdO1xuICAgICAgY29uc3Qgbm93OkJOID0gVW5peE5vdygpO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhZGRyZXNzZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGFkZHJlc3Nlc1tpXS50b1N0cmluZygnaGV4JykgaW4gdGhpcy5hZGRyZXNzVVRYT3MpIHtcbiAgICAgICAgICBjb25zdCBlbnRyaWVzID0gT2JqZWN0LmVudHJpZXModGhpcy5hZGRyZXNzVVRYT3NbYWRkcmVzc2VzW2ldLnRvU3RyaW5nKCdoZXgnKV0pO1xuICAgICAgICAgIGZvciAoY29uc3QgW3V0eG9pZCwgbG9ja3RpbWVdIG9mIGVudHJpZXMpIHtcbiAgICAgICAgICAgIGlmICgocmVzdWx0cy5pbmRleE9mKHV0eG9pZCkgPT09IC0xXG4gICAgICAgICAgICAmJiAoc3BlbmRhYmxlICYmIGxvY2t0aW1lLmx0ZShub3cpKSlcbiAgICAgICAgICAgIHx8ICFzcGVuZGFibGUpIHtcbiAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHV0eG9pZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMudXR4b3MpO1xuICB9O1xuXG4gIC8qKlxuICAgICAqIEdldHMgdGhlIGFkZHJlc3NlcyBpbiB0aGUgW1tTdGFuZGFyZFVUWE9TZXRdXSBhbmQgcmV0dXJucyBhbiBhcnJheSBvZiB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfS5cbiAgICAgKi9cbiAgZ2V0QWRkcmVzc2VzID0gKCk6QXJyYXk8QnVmZmVyPiA9PiBPYmplY3Qua2V5cyh0aGlzLmFkZHJlc3NVVFhPcylcbiAgICAubWFwKChrKSA9PiBCdWZmZXIuZnJvbShrLCAnaGV4JykpO1xuXG4gIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGJhbGFuY2Ugb2YgYSBzZXQgb2YgYWRkcmVzc2VzIGluIHRoZSBTdGFuZGFyZFVUWE9TZXQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gYWRkcmVzc2VzIEFuIGFycmF5IG9mIGFkZHJlc3Nlc1xuICAgICAqIEBwYXJhbSBhc3NldElEIEVpdGhlciBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IG9yIGFuIGNiNTggc2VyaWFsaXplZCByZXByZXNlbnRhdGlvbiBvZiBhbiBBc3NldElEXG4gICAgICogQHBhcmFtIGFzT2YgVGhlIHRpbWVzdGFtcCB0byB2ZXJpZnkgdGhlIHRyYW5zYWN0aW9uIGFnYWluc3QgYXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfVxuICAgICAqXG4gICAgICogQHJldHVybnMgUmV0dXJucyB0aGUgdG90YWwgYmFsYW5jZSBhcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59LlxuICAgICAqL1xuICBnZXRCYWxhbmNlID0gKGFkZHJlc3NlczpBcnJheTxCdWZmZXI+LCBhc3NldElEOkJ1ZmZlcnxzdHJpbmcsIGFzT2Y6Qk4gPSB1bmRlZmluZWQpOkJOID0+IHtcbiAgICBjb25zdCB1dHhvaWRzOkFycmF5PHN0cmluZz4gPSB0aGlzLmdldFVUWE9JRHMoYWRkcmVzc2VzKTtcbiAgICBjb25zdCB1dHhvczpBcnJheTxTdGFuZGFyZFVUWE8+ID0gdGhpcy5nZXRBbGxVVFhPcyh1dHhvaWRzKTtcbiAgICBsZXQgc3BlbmQ6Qk4gPSBuZXcgQk4oMCk7XG4gICAgbGV0IGFzc2V0OkJ1ZmZlcjtcbiAgICBpZiAodHlwZW9mIGFzc2V0SUQgPT09ICdzdHJpbmcnKSB7XG4gICAgICBhc3NldCA9IGJpbnRvb2xzLmNiNThEZWNvZGUoYXNzZXRJRCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFzc2V0ID0gYXNzZXRJRDtcbiAgICB9XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB1dHhvcy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHV0eG9zW2ldLmdldE91dHB1dCgpIGluc3RhbmNlb2YgU3RhbmRhcmRBbW91bnRPdXRwdXRcbiAgICAgICYmIHV0eG9zW2ldLmdldEFzc2V0SUQoKS50b1N0cmluZygnaGV4JykgPT09IGFzc2V0LnRvU3RyaW5nKCdoZXgnKVxuICAgICAgJiYgdXR4b3NbaV0uZ2V0T3V0cHV0KCkubWVldHNUaHJlc2hvbGQoYWRkcmVzc2VzLCBhc09mKSkge1xuICAgICAgICBzcGVuZCA9IHNwZW5kLmFkZCgodXR4b3NbaV0uZ2V0T3V0cHV0KCkgYXMgU3RhbmRhcmRBbW91bnRPdXRwdXQpLmdldEFtb3VudCgpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHNwZW5kO1xuICB9O1xuXG4gIC8qKlxuICAgICAqIEdldHMgYWxsIHRoZSBBc3NldCBJRHMsIG9wdGlvbmFsbHkgdGhhdCBtYXRjaCB3aXRoIEFzc2V0IElEcyBpbiBhbiBhcnJheVxuICAgICAqXG4gICAgICogQHBhcmFtIHV0eG9pZHMgQW4gb3B0aW9uYWwgYXJyYXkgb2YgQWRkcmVzc2VzIGFzIHN0cmluZyBvciBCdWZmZXIsIHJldHVybnMgYWxsIEFzc2V0IElEcyBpZiBub3QgcHJvdmlkZWRcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIEFuIGFycmF5IG9mIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHJlcHJlc2VudGluZyB0aGUgQXNzZXQgSURzLlxuICAgICAqL1xuICBnZXRBc3NldElEcyA9IChhZGRyZXNzZXM6QXJyYXk8QnVmZmVyPiA9IHVuZGVmaW5lZCk6QXJyYXk8QnVmZmVyPiA9PiB7XG4gICAgY29uc3QgcmVzdWx0czpTZXQ8QnVmZmVyPiA9IG5ldyBTZXQoKTtcbiAgICBsZXQgdXR4b2lkczpBcnJheTxzdHJpbmc+ID0gW107XG4gICAgaWYgKHR5cGVvZiBhZGRyZXNzZXMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB1dHhvaWRzID0gdGhpcy5nZXRVVFhPSURzKGFkZHJlc3Nlcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHV0eG9pZHMgPSB0aGlzLmdldFVUWE9JRHMoKTtcbiAgICB9XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHV0eG9pZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICh1dHhvaWRzW2ldIGluIHRoaXMudXR4b3MgJiYgISh1dHhvaWRzW2ldIGluIHJlc3VsdHMpKSB7XG4gICAgICAgIHJlc3VsdHMuYWRkKHRoaXMudXR4b3NbdXR4b2lkc1tpXV0uZ2V0QXNzZXRJRCgpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gWy4uLnJlc3VsdHNdO1xuICB9O1xuXG4gIGFic3RyYWN0IGNsb25lKCk6dGhpcztcblxuICBhYnN0cmFjdCBjcmVhdGUoLi4uYXJnczphbnlbXSk6dGhpcztcblxuICBmaWx0ZXIoYXJnczphbnlbXSwgbGFtYmRhOih1dHhvOlVUWE9DbGFzcywgLi4ubGFyZ3M6YW55W10pID0+IGJvb2xlYW4pOnRoaXMge1xuICAgIGxldCBuZXdzZXQ6dGhpcyA9IHRoaXMuY2xvbmUoKTtcbiAgICBsZXQgdXR4b3M6QXJyYXk8VVRYT0NsYXNzPiA9IHRoaXMuZ2V0QWxsVVRYT3MoKTtcbiAgICBmb3IobGV0IGkgPSAwOyBpIDwgdXR4b3MubGVuZ3RoOyBpKyspe1xuICAgICAgaWYobGFtYmRhKHV0eG9zW2ldLCAuLi5hcmdzKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgbmV3c2V0LnJlbW92ZSh1dHhvc1tpXSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBuZXdzZXQ7XG4gIH1cblxuICAvKipcbiAgICAgKiBSZXR1cm5zIGEgbmV3IHNldCB3aXRoIGNvcHkgb2YgVVRYT3MgaW4gdGhpcyBhbmQgc2V0IHBhcmFtZXRlci5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB1dHhvc2V0IFRoZSBbW1N0YW5kYXJkVVRYT1NldF1dIHRvIG1lcmdlIHdpdGggdGhpcyBvbmVcbiAgICAgKiBAcGFyYW0gaGFzVVRYT0lEcyBXaWxsIHN1YnNlbGVjdCBhIHNldCBvZiBbW1N0YW5kYXJkVVRYT11dcyB3aGljaCBoYXZlIHRoZSBVVFhPSURzIHByb3ZpZGVkIGluIHRoaXMgYXJyYXksIGRlZnVsdHMgdG8gYWxsIFVUWE9zXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBBIG5ldyBTdGFuZGFyZFVUWE9TZXQgdGhhdCBjb250YWlucyBhbGwgdGhlIGZpbHRlcmVkIGVsZW1lbnRzLlxuICAgICAqL1xuICBtZXJnZSA9ICh1dHhvc2V0OnRoaXMsIGhhc1VUWE9JRHM6QXJyYXk8c3RyaW5nPiA9IHVuZGVmaW5lZCk6dGhpcyA9PiB7XG4gICAgY29uc3QgcmVzdWx0czp0aGlzID0gdGhpcy5jcmVhdGUoKTtcbiAgICBjb25zdCB1dHhvczE6QXJyYXk8VVRYT0NsYXNzPiA9IHRoaXMuZ2V0QWxsVVRYT3MoaGFzVVRYT0lEcyk7XG4gICAgY29uc3QgdXR4b3MyOkFycmF5PFVUWE9DbGFzcz4gPSB1dHhvc2V0LmdldEFsbFVUWE9zKGhhc1VUWE9JRHMpO1xuICAgIGNvbnN0IHByb2Nlc3MgPSAodXR4bzpVVFhPQ2xhc3MpID0+IHtcbiAgICAgIHJlc3VsdHMuYWRkKHV0eG8pO1xuICAgIH07XG4gICAgdXR4b3MxLmZvckVhY2gocHJvY2Vzcyk7XG4gICAgdXR4b3MyLmZvckVhY2gocHJvY2Vzcyk7XG4gICAgcmV0dXJuIHJlc3VsdHMgYXMgdGhpcztcbiAgfTtcblxuICAvKipcbiAgICAgKiBTZXQgaW50ZXJzZXRpb24gYmV0d2VlbiB0aGlzIHNldCBhbmQgYSBwYXJhbWV0ZXIuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gdXR4b3NldCBUaGUgc2V0IHRvIGludGVyc2VjdFxuICAgICAqXG4gICAgICogQHJldHVybnMgQSBuZXcgU3RhbmRhcmRVVFhPU2V0IGNvbnRhaW5pbmcgdGhlIGludGVyc2VjdGlvblxuICAgICAqL1xuICBpbnRlcnNlY3Rpb24gPSAodXR4b3NldDp0aGlzKTp0aGlzID0+IHtcbiAgICBjb25zdCB1czE6QXJyYXk8c3RyaW5nPiA9IHRoaXMuZ2V0VVRYT0lEcygpO1xuICAgIGNvbnN0IHVzMjpBcnJheTxzdHJpbmc+ID0gdXR4b3NldC5nZXRVVFhPSURzKCk7XG4gICAgY29uc3QgcmVzdWx0czpBcnJheTxzdHJpbmc+ID0gdXMxLmZpbHRlcigodXR4b2lkKSA9PiB1czIuaW5jbHVkZXModXR4b2lkKSk7XG4gICAgcmV0dXJuIHRoaXMubWVyZ2UodXR4b3NldCwgcmVzdWx0cykgYXMgdGhpcztcbiAgfTtcblxuICAvKipcbiAgICAgKiBTZXQgZGlmZmVyZW5jZSBiZXR3ZWVuIHRoaXMgc2V0IGFuZCBhIHBhcmFtZXRlci5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB1dHhvc2V0IFRoZSBzZXQgdG8gZGlmZmVyZW5jZVxuICAgICAqXG4gICAgICogQHJldHVybnMgQSBuZXcgU3RhbmRhcmRVVFhPU2V0IGNvbnRhaW5pbmcgdGhlIGRpZmZlcmVuY2VcbiAgICAgKi9cbiAgZGlmZmVyZW5jZSA9ICh1dHhvc2V0OnRoaXMpOnRoaXMgPT4ge1xuICAgIGNvbnN0IHVzMTpBcnJheTxzdHJpbmc+ID0gdGhpcy5nZXRVVFhPSURzKCk7XG4gICAgY29uc3QgdXMyOkFycmF5PHN0cmluZz4gPSB1dHhvc2V0LmdldFVUWE9JRHMoKTtcbiAgICBjb25zdCByZXN1bHRzOkFycmF5PHN0cmluZz4gPSB1czEuZmlsdGVyKCh1dHhvaWQpID0+ICF1czIuaW5jbHVkZXModXR4b2lkKSk7XG4gICAgcmV0dXJuIHRoaXMubWVyZ2UodXR4b3NldCwgcmVzdWx0cykgYXMgdGhpcztcbiAgfTtcblxuICAvKipcbiAgICAgKiBTZXQgc3ltbWV0cmljYWwgZGlmZmVyZW5jZSBiZXR3ZWVuIHRoaXMgc2V0IGFuZCBhIHBhcmFtZXRlci5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB1dHhvc2V0IFRoZSBzZXQgdG8gc3ltbWV0cmljYWwgZGlmZmVyZW5jZVxuICAgICAqXG4gICAgICogQHJldHVybnMgQSBuZXcgU3RhbmRhcmRVVFhPU2V0IGNvbnRhaW5pbmcgdGhlIHN5bW1ldHJpY2FsIGRpZmZlcmVuY2VcbiAgICAgKi9cbiAgc3ltRGlmZmVyZW5jZSA9ICh1dHhvc2V0OnRoaXMpOnRoaXMgPT4ge1xuICAgIGNvbnN0IHVzMTpBcnJheTxzdHJpbmc+ID0gdGhpcy5nZXRVVFhPSURzKCk7XG4gICAgY29uc3QgdXMyOkFycmF5PHN0cmluZz4gPSB1dHhvc2V0LmdldFVUWE9JRHMoKTtcbiAgICBjb25zdCByZXN1bHRzOkFycmF5PHN0cmluZz4gPSB1czEuZmlsdGVyKCh1dHhvaWQpID0+ICF1czIuaW5jbHVkZXModXR4b2lkKSlcbiAgICAgIC5jb25jYXQodXMyLmZpbHRlcigodXR4b2lkKSA9PiAhdXMxLmluY2x1ZGVzKHV0eG9pZCkpKTtcbiAgICByZXR1cm4gdGhpcy5tZXJnZSh1dHhvc2V0LCByZXN1bHRzKSBhcyB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgICAqIFNldCB1bmlvbiBiZXR3ZWVuIHRoaXMgc2V0IGFuZCBhIHBhcmFtZXRlci5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB1dHhvc2V0IFRoZSBzZXQgdG8gdW5pb25cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIEEgbmV3IFN0YW5kYXJkVVRYT1NldCBjb250YWluaW5nIHRoZSB1bmlvblxuICAgICAqL1xuICB1bmlvbiA9ICh1dHhvc2V0OnRoaXMpOnRoaXMgPT4gdGhpcy5tZXJnZSh1dHhvc2V0KSBhcyB0aGlzO1xuXG4gIC8qKlxuICAgICAqIE1lcmdlcyBhIHNldCBieSB0aGUgcnVsZSBwcm92aWRlZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB1dHhvc2V0IFRoZSBzZXQgdG8gbWVyZ2UgYnkgdGhlIE1lcmdlUnVsZVxuICAgICAqIEBwYXJhbSBtZXJnZVJ1bGUgVGhlIFtbTWVyZ2VSdWxlXV0gdG8gYXBwbHlcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIEEgbmV3IFN0YW5kYXJkVVRYT1NldCBjb250YWluaW5nIHRoZSBtZXJnZWQgZGF0YVxuICAgICAqXG4gICAgICogQHJlbWFya3NcbiAgICAgKiBUaGUgbWVyZ2UgcnVsZXMgYXJlIGFzIGZvbGxvd3M6XG4gICAgICogICAqIFwiaW50ZXJzZWN0aW9uXCIgLSB0aGUgaW50ZXJzZWN0aW9uIG9mIHRoZSBzZXRcbiAgICAgKiAgICogXCJkaWZmZXJlbmNlU2VsZlwiIC0gdGhlIGRpZmZlcmVuY2UgYmV0d2VlbiB0aGUgZXhpc3RpbmcgZGF0YSBhbmQgbmV3IHNldFxuICAgICAqICAgKiBcImRpZmZlcmVuY2VOZXdcIiAtIHRoZSBkaWZmZXJlbmNlIGJldHdlZW4gdGhlIG5ldyBkYXRhIGFuZCB0aGUgZXhpc3Rpbmcgc2V0XG4gICAgICogICAqIFwic3ltRGlmZmVyZW5jZVwiIC0gdGhlIHVuaW9uIG9mIHRoZSBkaWZmZXJlbmNlcyBiZXR3ZWVuIGJvdGggc2V0cyBvZiBkYXRhXG4gICAgICogICAqIFwidW5pb25cIiAtIHRoZSB1bmlxdWUgc2V0IG9mIGFsbCBlbGVtZW50cyBjb250YWluZWQgaW4gYm90aCBzZXRzXG4gICAgICogICAqIFwidW5pb25NaW51c05ld1wiIC0gdGhlIHVuaXF1ZSBzZXQgb2YgYWxsIGVsZW1lbnRzIGNvbnRhaW5lZCBpbiBib3RoIHNldHMsIGV4Y2x1ZGluZyB2YWx1ZXMgb25seSBmb3VuZCBpbiB0aGUgbmV3IHNldFxuICAgICAqICAgKiBcInVuaW9uTWludXNTZWxmXCIgLSB0aGUgdW5pcXVlIHNldCBvZiBhbGwgZWxlbWVudHMgY29udGFpbmVkIGluIGJvdGggc2V0cywgZXhjbHVkaW5nIHZhbHVlcyBvbmx5IGZvdW5kIGluIHRoZSBleGlzdGluZyBzZXRcbiAgICAgKi9cbiAgbWVyZ2VCeVJ1bGUgPSAodXR4b3NldDp0aGlzLCBtZXJnZVJ1bGU6TWVyZ2VSdWxlKTp0aGlzID0+IHtcbiAgICBsZXQgdVNldDp0aGlzO1xuICAgIHN3aXRjaCAobWVyZ2VSdWxlKSB7XG4gICAgICBjYXNlICdpbnRlcnNlY3Rpb24nOlxuICAgICAgICByZXR1cm4gdGhpcy5pbnRlcnNlY3Rpb24odXR4b3NldCk7XG4gICAgICBjYXNlICdkaWZmZXJlbmNlU2VsZic6XG4gICAgICAgIHJldHVybiB0aGlzLmRpZmZlcmVuY2UodXR4b3NldCk7XG4gICAgICBjYXNlICdkaWZmZXJlbmNlTmV3JzpcbiAgICAgICAgcmV0dXJuIHV0eG9zZXQuZGlmZmVyZW5jZSh0aGlzKSBhcyB0aGlzO1xuICAgICAgY2FzZSAnc3ltRGlmZmVyZW5jZSc6XG4gICAgICAgIHJldHVybiB0aGlzLnN5bURpZmZlcmVuY2UodXR4b3NldCk7XG4gICAgICBjYXNlICd1bmlvbic6XG4gICAgICAgIHJldHVybiB0aGlzLnVuaW9uKHV0eG9zZXQpO1xuICAgICAgY2FzZSAndW5pb25NaW51c05ldyc6XG4gICAgICAgIHVTZXQgPSB0aGlzLnVuaW9uKHV0eG9zZXQpO1xuICAgICAgICByZXR1cm4gdVNldC5kaWZmZXJlbmNlKHV0eG9zZXQpIGFzIHRoaXM7XG4gICAgICBjYXNlICd1bmlvbk1pbnVzU2VsZic6XG4gICAgICAgIHVTZXQgPSB0aGlzLnVuaW9uKHV0eG9zZXQpO1xuICAgICAgICByZXR1cm4gdVNldC5kaWZmZXJlbmNlKHRoaXMpIGFzIHRoaXM7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEVycm9yIC0gU3RhbmRhcmRVVFhPU2V0Lm1lcmdlQnlSdWxlOiBiYWQgTWVyZ2VSdWxlIC0gJHttZXJnZVJ1bGV9YCk7XG4gICAgfVxuICB9O1xufVxuIl19