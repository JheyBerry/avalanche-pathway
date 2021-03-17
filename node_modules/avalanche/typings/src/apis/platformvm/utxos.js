"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UTXOSet = exports.AssetAmountDestination = exports.UTXO = void 0;
/**
 * @packageDocumentation
 * @module API-PlatformVM-UTXOs
 */
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("../../utils/bintools"));
const bn_js_1 = __importDefault(require("bn.js"));
const outputs_1 = require("./outputs");
const inputs_1 = require("./inputs");
const helperfunctions_1 = require("../../utils/helperfunctions");
const utxos_1 = require("../../common/utxos");
const constants_1 = require("./constants");
const tx_1 = require("./tx");
const exporttx_1 = require("../platformvm/exporttx");
const constants_2 = require("../../utils/constants");
const importtx_1 = require("../platformvm/importtx");
const basetx_1 = require("../platformvm/basetx");
const assetamount_1 = require("../../common/assetamount");
const validationtx_1 = require("./validationtx");
const createsubnettx_1 = require("./createsubnettx");
const serialization_1 = require("../../utils/serialization");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
const serializer = serialization_1.Serialization.getInstance();
/**
 * Class for representing a single UTXO.
 */
class UTXO extends utxos_1.StandardUTXO {
    constructor() {
        super(...arguments);
        this._typeName = "UTXO";
        this._typeID = undefined;
    }
    //serialize is inherited
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.output = outputs_1.SelectOutputClass(fields["output"]["_typeID"]);
        this.output.deserialize(fields["output"], encoding);
    }
    fromBuffer(bytes, offset = 0) {
        this.codecid = bintools.copyFrom(bytes, offset, offset + 2);
        offset += 2;
        this.txid = bintools.copyFrom(bytes, offset, offset + 32);
        offset += 32;
        this.outputidx = bintools.copyFrom(bytes, offset, offset + 4);
        offset += 4;
        this.assetid = bintools.copyFrom(bytes, offset, offset + 32);
        offset += 32;
        const outputid = bintools.copyFrom(bytes, offset, offset + 4).readUInt32BE(0);
        offset += 4;
        this.output = outputs_1.SelectOutputClass(outputid);
        return this.output.fromBuffer(bytes, offset);
    }
    /**
     * Takes a base-58 string containing a [[UTXO]], parses it, populates the class, and returns the length of the StandardUTXO in bytes.
     *
     * @param serialized A base-58 string containing a raw [[UTXO]]
     *
     * @returns The length of the raw [[UTXO]]
     *
     * @remarks
     * unlike most fromStrings, it expects the string to be serialized in cb58 format
     */
    fromString(serialized) {
        /* istanbul ignore next */
        return this.fromBuffer(bintools.cb58Decode(serialized));
    }
    /**
     * Returns a base-58 representation of the [[UTXO]].
     *
     * @remarks
     * unlike most toStrings, this returns in cb58 serialization format
     */
    toString() {
        /* istanbul ignore next */
        return bintools.cb58Encode(this.toBuffer());
    }
    clone() {
        const utxo = new UTXO();
        utxo.fromBuffer(this.toBuffer());
        return utxo;
    }
    create(codecID = constants_1.PlatformVMConstants.LATESTCODEC, txid = undefined, outputidx = undefined, assetid = undefined, output = undefined) {
        return new UTXO(codecID, txid, outputidx, assetid, output);
    }
}
exports.UTXO = UTXO;
class AssetAmountDestination extends assetamount_1.StandardAssetAmountDestination {
}
exports.AssetAmountDestination = AssetAmountDestination;
/**
 * Class representing a set of [[UTXO]]s.
 */
class UTXOSet extends utxos_1.StandardUTXOSet {
    constructor() {
        super(...arguments);
        this._typeName = "UTXOSet";
        this._typeID = undefined;
        this.getConsumableUXTO = (asOf = helperfunctions_1.UnixNow(), stakeable = false) => {
            return this.getAllUTXOs().filter((utxo) => {
                if (stakeable) {
                    // stakeable transactions can consume any UTXO.
                    return true;
                }
                const output = utxo.getOutput();
                if (!(output instanceof outputs_1.StakeableLockOut)) {
                    // non-stakeable transactions can consume any UTXO that isn't locked.
                    return true;
                }
                const stakeableOutput = output;
                if (stakeableOutput.getStakeableLocktime().lt(asOf)) {
                    // If the stakeable outputs locktime has ended, then this UTXO can still
                    // be consumed by a non-stakeable transaction.
                    return true;
                }
                // This output is locked and can't be consumed by a non-stakeable
                // transaction.
                return false;
            });
        };
        this.getMinimumSpendable = (aad, asOf = helperfunctions_1.UnixNow(), locktime = new bn_js_1.default(0), threshold = 1, stakeable = false) => {
            let utxoArray = this.getConsumableUXTO(asOf, stakeable);
            let tmpUTXOArray = [];
            if (stakeable) {
                // If this is a stakeable transaction then have StakeableLockOut come before SECPTransferOutput
                // so that users first stake locked tokens before staking unlocked tokens
                utxoArray.forEach((utxo) => {
                    // StakeableLockOuts
                    if (utxo.getOutput().getTypeID() === 22) {
                        tmpUTXOArray.push(utxo);
                    }
                });
                // Sort the StakeableLockOuts by StakeableLocktime so that the greatest StakeableLocktime are spent first
                tmpUTXOArray.sort((a, b) => {
                    let stakeableLockOut1 = a.getOutput();
                    let stakeableLockOut2 = b.getOutput();
                    return stakeableLockOut2.getStakeableLocktime().toNumber() - stakeableLockOut1.getStakeableLocktime().toNumber();
                });
                utxoArray.forEach((utxo) => {
                    // SECPTransferOutputs
                    if (utxo.getOutput().getTypeID() === 7) {
                        tmpUTXOArray.push(utxo);
                    }
                });
                utxoArray = tmpUTXOArray;
            }
            // outs is a map from assetID to a tuple of (lockedStakeable, unlocked)
            // which are arrays of outputs.
            const outs = {};
            // We only need to iterate over UTXOs until we have spent sufficient funds
            // to met the requested amounts.
            utxoArray.forEach((utxo, index) => {
                const assetID = utxo.getAssetID();
                const assetKey = assetID.toString("hex");
                const fromAddresses = aad.getSenders();
                const output = utxo.getOutput();
                if (!(output instanceof outputs_1.AmountOutput) || !aad.assetExists(assetKey) || !output.meetsThreshold(fromAddresses, asOf)) {
                    // We should only try to spend fungible assets.
                    // We should only spend {{ assetKey }}.
                    // We need to be able to spend the output.
                    return;
                }
                const assetAmount = aad.getAssetAmount(assetKey);
                if (assetAmount.isFinished()) {
                    // We've already spent the needed UTXOs for this assetID.
                    return;
                }
                if (!(assetKey in outs)) {
                    // If this is the first time spending this assetID, we need to
                    // initialize the outs object correctly.
                    outs[assetKey] = {
                        lockedStakeable: [],
                        unlocked: [],
                    };
                }
                const amountOutput = output;
                // amount is the amount of funds available from this UTXO.
                const amount = amountOutput.getAmount();
                // Set up the SECP input with the same amount as the output.
                let input = new inputs_1.SECPTransferInput(amount);
                let locked = false;
                if (amountOutput instanceof outputs_1.StakeableLockOut) {
                    const stakeableOutput = amountOutput;
                    const stakeableLocktime = stakeableOutput.getStakeableLocktime();
                    if (stakeableLocktime.gt(asOf)) {
                        // Add a new input and mark it as being locked.
                        input = new inputs_1.StakeableLockIn(amount, stakeableLocktime, new inputs_1.ParseableInput(input));
                        // Mark this UTXO as having been re-locked.
                        locked = true;
                    }
                }
                assetAmount.spendAmount(amount, locked);
                if (locked) {
                    // Track the UTXO as locked.
                    outs[assetKey].lockedStakeable.push(amountOutput);
                }
                else {
                    // Track the UTXO as unlocked.
                    outs[assetKey].unlocked.push(amountOutput);
                }
                // Get the indices of the outputs that should be used to authorize the
                // spending of this input.
                // TODO: getSpenders should return an array of indices rather than an
                // array of addresses.
                const spenders = amountOutput.getSpenders(fromAddresses, asOf);
                spenders.forEach((spender) => {
                    const idx = amountOutput.getAddressIdx(spender);
                    if (idx === -1) {
                        // This should never happen, which is why the error is thrown rather
                        // than being returned. If this were to ever happen this would be an
                        // error in the internal logic rather having called this function with
                        // invalid arguments.
                        /* istanbul ignore next */
                        throw new Error('Error - UTXOSet.getMinimumSpendable: no such '
                            + `address in output: ${spender}`);
                    }
                    input.addSignatureIdx(idx, spender);
                });
                const txID = utxo.getTxID();
                const outputIdx = utxo.getOutputIdx();
                const transferInput = new inputs_1.TransferableInput(txID, outputIdx, assetID, input);
                aad.addInput(transferInput);
            });
            if (!aad.canComplete()) {
                // After running through all the UTXOs, we still weren't able to get all
                // the necessary funds, so this transaction can't be made.
                return new Error('Error - UTXOSet.getMinimumSpendable: insufficient '
                    + 'funds to create the transaction');
            }
            // TODO: We should separate the above functionality into a single function
            // that just selects the UTXOs to consume.
            const zero = new bn_js_1.default(0);
            // assetAmounts is an array of asset descriptions and how much is left to
            // spend for them.
            const assetAmounts = aad.getAmounts();
            assetAmounts.forEach((assetAmount) => {
                // change is the amount that should be returned back to the source of the
                // funds.
                const change = assetAmount.getChange();
                // isStakeableLockChange is if the change is locked or not.
                const isStakeableLockChange = assetAmount.getStakeableLockChange();
                // lockedChange is the amount of locked change that should be returned to
                // the sender
                const lockedChange = isStakeableLockChange ? change : zero.clone();
                const assetID = assetAmount.getAssetID();
                const assetKey = assetAmount.getAssetIDString();
                const lockedOutputs = outs[assetKey].lockedStakeable;
                lockedOutputs.forEach((lockedOutput, i) => {
                    const stakeableLocktime = lockedOutput.getStakeableLocktime();
                    const parseableOutput = lockedOutput.getTransferableOutput();
                    // We know that parseableOutput contains an AmountOutput because the
                    // first loop filters for fungible assets.
                    const output = parseableOutput.getOutput();
                    let outputAmountRemaining = output.getAmount();
                    // The only output that could generate change is the last output.
                    // Otherwise, any further UTXOs wouldn't have needed to be spent.
                    if (i == lockedOutputs.length - 1 && lockedChange.gt(zero)) {
                        // update outputAmountRemaining to no longer hold the change that we
                        // are returning.
                        outputAmountRemaining = outputAmountRemaining.sub(lockedChange);
                        // Create the inner output.
                        const newChangeOutput = outputs_1.SelectOutputClass(output.getOutputID(), lockedChange, output.getAddresses(), output.getLocktime(), output.getThreshold());
                        // Wrap the inner output in the StakeableLockOut wrapper.
                        let newLockedChangeOutput = outputs_1.SelectOutputClass(lockedOutput.getOutputID(), lockedChange, output.getAddresses(), output.getLocktime(), output.getThreshold(), stakeableLocktime, new outputs_1.ParseableOutput(newChangeOutput));
                        const transferOutput = new outputs_1.TransferableOutput(assetID, newLockedChangeOutput);
                        aad.addChange(transferOutput);
                    }
                    // We know that outputAmountRemaining > 0. Otherwise, we would never
                    // have consumed this UTXO, as it would be only change.
                    // Create the inner output.
                    const newOutput = outputs_1.SelectOutputClass(output.getOutputID(), outputAmountRemaining, output.getAddresses(), output.getLocktime(), output.getThreshold());
                    // Wrap the inner output in the StakeableLockOut wrapper.
                    const newLockedOutput = outputs_1.SelectOutputClass(lockedOutput.getOutputID(), outputAmountRemaining, output.getAddresses(), output.getLocktime(), output.getThreshold(), stakeableLocktime, new outputs_1.ParseableOutput(newOutput));
                    const transferOutput = new outputs_1.TransferableOutput(assetID, newLockedOutput);
                    aad.addOutput(transferOutput);
                });
                // unlockedChange is the amount of unlocked change that should be returned
                // to the sender
                const unlockedChange = isStakeableLockChange ? zero.clone() : change;
                if (unlockedChange.gt(zero)) {
                    const newChangeOutput = new outputs_1.SECPTransferOutput(unlockedChange, aad.getChangeAddresses(), zero.clone(), // make sure that we don't lock the change output.
                    1);
                    const transferOutput = new outputs_1.TransferableOutput(assetID, newChangeOutput);
                    aad.addChange(transferOutput);
                }
                // totalAmountSpent is the total amount of tokens consumed.
                const totalAmountSpent = assetAmount.getSpent();
                // stakeableLockedAmount is the total amount of locked tokens consumed.
                const stakeableLockedAmount = assetAmount.getStakeableLockSpent();
                // totalUnlockedSpent is the total amount of unlocked tokens consumed.
                const totalUnlockedSpent = totalAmountSpent.sub(stakeableLockedAmount);
                // amountBurnt is the amount of unlocked tokens that must be burn.
                const amountBurnt = assetAmount.getBurn();
                // totalUnlockedAvailable is the total amount of unlocked tokens available
                // to be produced.
                const totalUnlockedAvailable = totalUnlockedSpent.sub(amountBurnt);
                // unlockedAmount is the amount of unlocked tokens that should be sent.
                const unlockedAmount = totalUnlockedAvailable.sub(unlockedChange);
                if (unlockedAmount.gt(zero)) {
                    const newOutput = new outputs_1.SECPTransferOutput(unlockedAmount, aad.getDestinations(), locktime, threshold);
                    const transferOutput = new outputs_1.TransferableOutput(assetID, newOutput);
                    aad.addOutput(transferOutput);
                }
            });
            return undefined;
        };
        /**
         * Creates an [[UnsignedTx]] wrapping a [[BaseTx]]. For more granular control, you may create your own
         * [[UnsignedTx]] wrapping a [[BaseTx]] manually (with their corresponding [[TransferableInput]]s and [[TransferableOutput]]s).
         *
         * @param networkid The number representing NetworkID of the node
         * @param blockchainid The {@link https://github.com/feross/buffer|Buffer} representing the BlockchainID for the transaction
         * @param amount The amount of the asset to be spent in its smallest denomination, represented as {@link https://github.com/indutny/bn.js/|BN}.
         * @param assetID {@link https://github.com/feross/buffer|Buffer} of the asset ID for the UTXO
         * @param toAddresses The addresses to send the funds
         * @param fromAddresses The addresses being used to send the funds from the UTXOs {@link https://github.com/feross/buffer|Buffer}
         * @param changeAddresses Optional. The addresses that can spend the change remaining from the spent UTXOs. Default: toAddresses
         * @param fee Optional. The amount of fees to burn in its smallest denomination, represented as {@link https://github.com/indutny/bn.js/|BN}
         * @param feeAssetID Optional. The assetID of the fees being burned. Default: assetID
         * @param memo Optional. Contains arbitrary data, up to 256 bytes
         * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
         * @param locktime Optional. The locktime field created in the resulting outputs
         * @param threshold Optional. The number of signatures required to spend the funds in the resultant UTXO
         *
         * @returns An unsigned transaction created from the passed in parameters.
         *
         */
        this.buildBaseTx = (networkid, blockchainid, amount, assetID, toAddresses, fromAddresses, changeAddresses = undefined, fee = undefined, feeAssetID = undefined, memo = undefined, asOf = helperfunctions_1.UnixNow(), locktime = new bn_js_1.default(0), threshold = 1) => {
            if (threshold > toAddresses.length) {
                /* istanbul ignore next */
                throw new Error(`Error - UTXOSet.buildBaseTx: threshold is greater than number of addresses`);
            }
            if (typeof changeAddresses === "undefined") {
                changeAddresses = toAddresses;
            }
            if (typeof feeAssetID === "undefined") {
                feeAssetID = assetID;
            }
            const zero = new bn_js_1.default(0);
            if (amount.eq(zero)) {
                return undefined;
            }
            const aad = new AssetAmountDestination(toAddresses, fromAddresses, changeAddresses);
            if (assetID.toString("hex") === feeAssetID.toString("hex")) {
                aad.addAssetAmount(assetID, amount, fee);
            }
            else {
                aad.addAssetAmount(assetID, amount, zero);
                if (this._feeCheck(fee, feeAssetID)) {
                    aad.addAssetAmount(feeAssetID, zero, fee);
                }
            }
            let ins = [];
            let outs = [];
            const minSpendableErr = this.getMinimumSpendable(aad, asOf, locktime, threshold);
            if (typeof minSpendableErr === "undefined") {
                ins = aad.getInputs();
                outs = aad.getAllOutputs();
            }
            else {
                throw minSpendableErr;
            }
            const baseTx = new basetx_1.BaseTx(networkid, blockchainid, outs, ins, memo);
            return new tx_1.UnsignedTx(baseTx);
        };
        /**
          * Creates an unsigned ImportTx transaction.
          *
          * @param networkid The number representing NetworkID of the node
          * @param blockchainid The {@link https://github.com/feross/buffer|Buffer} representing the BlockchainID for the transaction
          * @param toAddresses The addresses to send the funds
          * @param fromAddresses The addresses being used to send the funds from the UTXOs {@link https://github.com/feross/buffer|Buffer}
          * @param changeAddresses Optional. The addresses that can spend the change remaining from the spent UTXOs. Default: toAddresses
          * @param importIns An array of [[TransferableInput]]s being imported
          * @param sourceChain A {@link https://github.com/feross/buffer|Buffer} for the chainid where the imports are coming from.
          * @param fee Optional. The amount of fees to burn in its smallest denomination, represented as {@link https://github.com/indutny/bn.js/|BN}. Fee will come from the inputs first, if they can.
          * @param feeAssetID Optional. The assetID of the fees being burned.
          * @param memo Optional contains arbitrary bytes, up to 256 bytes
          * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
          * @param locktime Optional. The locktime field created in the resulting outputs
          * @param threshold Optional. The number of signatures required to spend the funds in the resultant UTXO
          * @returns An unsigned transaction created from the passed in parameters.
          *
          */
        this.buildImportTx = (networkid, blockchainid, toAddresses, fromAddresses, changeAddresses, atomics, sourceChain = undefined, fee = undefined, feeAssetID = undefined, memo = undefined, asOf = helperfunctions_1.UnixNow(), locktime = new bn_js_1.default(0), threshold = 1) => {
            const zero = new bn_js_1.default(0);
            let ins = [];
            let outs = [];
            if (typeof fee === "undefined") {
                fee = zero.clone();
            }
            const importIns = [];
            let feepaid = new bn_js_1.default(0);
            let feeAssetStr = feeAssetID.toString("hex");
            for (let i = 0; i < atomics.length; i++) {
                const utxo = atomics[i];
                const assetID = utxo.getAssetID();
                const output = utxo.getOutput();
                let amt = output.getAmount().clone();
                let infeeamount = amt.clone();
                let assetStr = assetID.toString("hex");
                if (typeof feeAssetID !== "undefined" &&
                    fee.gt(zero) &&
                    feepaid.lt(fee) &&
                    assetStr === feeAssetStr) {
                    feepaid = feepaid.add(infeeamount);
                    if (feepaid.gte(fee)) {
                        infeeamount = feepaid.sub(fee);
                        feepaid = fee.clone();
                    }
                    else {
                        infeeamount = zero.clone();
                    }
                }
                const txid = utxo.getTxID();
                const outputidx = utxo.getOutputIdx();
                const input = new inputs_1.SECPTransferInput(amt);
                const xferin = new inputs_1.TransferableInput(txid, outputidx, assetID, input);
                const from = output.getAddresses();
                const spenders = output.getSpenders(from, asOf);
                for (let j = 0; j < spenders.length; j++) {
                    const idx = output.getAddressIdx(spenders[j]);
                    if (idx === -1) {
                        /* istanbul ignore next */
                        throw new Error('Error - UTXOSet.buildImportTx: no such '
                            + `address in output: ${spenders[j]}`);
                    }
                    xferin.getInput().addSignatureIdx(idx, spenders[j]);
                }
                importIns.push(xferin);
                //add extra outputs for each amount (calculated from the imported inputs), minus fees
                if (infeeamount.gt(zero)) {
                    const spendout = outputs_1.SelectOutputClass(output.getOutputID(), infeeamount, toAddresses, locktime, threshold);
                    const xferout = new outputs_1.TransferableOutput(assetID, spendout);
                    outs.push(xferout);
                }
            }
            // get remaining fees from the provided addresses
            let feeRemaining = fee.sub(feepaid);
            if (feeRemaining.gt(zero) && this._feeCheck(feeRemaining, feeAssetID)) {
                const aad = new AssetAmountDestination(toAddresses, fromAddresses, changeAddresses);
                aad.addAssetAmount(feeAssetID, zero, feeRemaining);
                const minSpendableErr = this.getMinimumSpendable(aad, asOf, locktime, threshold);
                if (typeof minSpendableErr === "undefined") {
                    ins = aad.getInputs();
                    outs = aad.getAllOutputs();
                }
                else {
                    throw minSpendableErr;
                }
            }
            const importTx = new importtx_1.ImportTx(networkid, blockchainid, outs, ins, memo, sourceChain, importIns);
            return new tx_1.UnsignedTx(importTx);
        };
        /**
          * Creates an unsigned ExportTx transaction.
          *
          * @param networkid The number representing NetworkID of the node
          * @param blockchainid The {@link https://github.com/feross/buffer|Buffer} representing the BlockchainID for the transaction
          * @param amount The amount being exported as a {@link https://github.com/indutny/bn.js/|BN}
          * @param avaxAssetID {@link https://github.com/feross/buffer|Buffer} of the asset ID for AVAX
          * @param toAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} who recieves the AVAX
          * @param fromAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} who owns the AVAX
          * @param changeAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} who gets the change leftover of the AVAX
          * @param destinationChain Optional. A {@link https://github.com/feross/buffer|Buffer} for the chainid where to send the asset.
          * @param fee Optional. The amount of fees to burn in its smallest denomination, represented as {@link https://github.com/indutny/bn.js/|BN}
          * @param feeAssetID Optional. The assetID of the fees being burned.
          * @param memo Optional contains arbitrary bytes, up to 256 bytes
          * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
          * @param locktime Optional. The locktime field created in the resulting outputs
          * @param threshold Optional. The number of signatures required to spend the funds in the resultant UTXO
          *
          * @returns An unsigned transaction created from the passed in parameters.
          *
          */
        this.buildExportTx = (networkid, blockchainid, amount, avaxAssetID, // TODO: rename this to amountAssetID
        toAddresses, fromAddresses, changeAddresses = undefined, destinationChain = undefined, fee = undefined, feeAssetID = undefined, memo = undefined, asOf = helperfunctions_1.UnixNow(), locktime = new bn_js_1.default(0), threshold = 1) => {
            let ins = [];
            let outs = [];
            let exportouts = [];
            if (typeof changeAddresses === "undefined") {
                changeAddresses = toAddresses;
            }
            const zero = new bn_js_1.default(0);
            if (amount.eq(zero)) {
                return undefined;
            }
            if (typeof feeAssetID === "undefined") {
                feeAssetID = avaxAssetID;
            }
            else if (feeAssetID.toString("hex") !== avaxAssetID.toString("hex")) {
                /* istanbul ignore next */
                throw new Error('Error - UTXOSet.buildExportTx: '
                    + `feeAssetID must match avaxAssetID`);
            }
            if (typeof destinationChain === "undefined") {
                destinationChain = bintools.cb58Decode(constants_2.Defaults.network[networkid].X["blockchainID"]);
            }
            const aad = new AssetAmountDestination(toAddresses, fromAddresses, changeAddresses);
            if (avaxAssetID.toString("hex") === feeAssetID.toString("hex")) {
                aad.addAssetAmount(avaxAssetID, amount, fee);
            }
            else {
                aad.addAssetAmount(avaxAssetID, amount, zero);
                if (this._feeCheck(fee, feeAssetID)) {
                    aad.addAssetAmount(feeAssetID, zero, fee);
                }
            }
            const minSpendableErr = this.getMinimumSpendable(aad, asOf, locktime, threshold);
            if (typeof minSpendableErr === "undefined") {
                ins = aad.getInputs();
                outs = aad.getChangeOutputs();
                exportouts = aad.getOutputs();
            }
            else {
                throw minSpendableErr;
            }
            const exportTx = new exporttx_1.ExportTx(networkid, blockchainid, outs, ins, memo, destinationChain, exportouts);
            return new tx_1.UnsignedTx(exportTx);
        };
        /**
        * Class representing an unsigned [[AddSubnetValidatorTx]] transaction.
        *
        * @param networkid Networkid, [[DefaultNetworkID]]
        * @param blockchainid Blockchainid, default undefined
        * @param fromAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} who pays the fees in AVAX
        * @param changeAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} who gets the change leftover from the fee payment
        * @param nodeID The node ID of the validator being added.
        * @param startTime The Unix time when the validator starts validating the Primary Network.
        * @param endTime The Unix time when the validator stops validating the Primary Network (and staked AVAX is returned).
        * @param weight The amount of weight for this subnet validator.
        * @param fee Optional. The amount of fees to burn in its smallest denomination, represented as {@link https://github.com/indutny/bn.js/|BN}
        * @param feeAssetID Optional. The assetID of the fees being burned.
        * @param memo Optional contains arbitrary bytes, up to 256 bytes
        * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
        * @param locktime Optional. The locktime field created in the resulting outputs
        * @param threshold Optional. The number of signatures required to spend the funds in the resultant UTXO
        *
        * @returns An unsigned transaction created from the passed in parameters.
        */
        /* must implement later once the transaction format signing process is clearer
        buildAddSubnetValidatorTx = (
          networkid:number = DefaultNetworkID,
          blockchainid:Buffer,
          fromAddresses:Array<Buffer>,
          changeAddresses:Array<Buffer>,
          nodeID:Buffer,
          startTime:BN,
          endTime:BN,
          weight:BN,
          fee:BN = undefined,
          feeAssetID:Buffer = undefined,
          memo:Buffer = undefined,
          asOf:BN = UnixNow()
        ):UnsignedTx => {
          let ins:Array<TransferableInput> = [];
          let outs:Array<TransferableOutput> = [];
          //let stakeOuts:Array<TransferableOutput> = [];
          
          const zero:BN = new BN(0);
          const now:BN = UnixNow();
          if (startTime.lt(now) || endTime.lte(startTime)) {
            throw new Error("UTXOSet.buildAddSubnetValidatorTx -- startTime must be in the future and endTime must come after startTime");
          }
         
          // Not implemented: Fees can be paid from importIns
          if(this._feeCheck(fee, feeAssetID)) {
            const aad:AssetAmountDestination = new AssetAmountDestination(fromAddresses, fromAddresses, changeAddresses);
            aad.addAssetAmount(feeAssetID, zero, fee);
            const success:Error = this.getMinimumSpendable(aad, asOf);
            if(typeof success === "undefined") {
              ins = aad.getInputs();
              outs = aad.getAllOutputs();
            } else {
              throw success;
            }
          }
         
          const UTx:AddSubnetValidatorTx = new AddSubnetValidatorTx(networkid, blockchainid, outs, ins, memo, nodeID, startTime, endTime, weight);
          return new UnsignedTx(UTx);
        }
        */
        /**
        * Class representing an unsigned [[AddDelegatorTx]] transaction.
        *
        * @param networkid Networkid, [[DefaultNetworkID]]
        * @param blockchainid Blockchainid, default undefined
        * @param avaxAssetID {@link https://github.com/feross/buffer|Buffer} of the asset ID for AVAX
        * @param toAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} recieves the stake at the end of the staking period
        * @param fromAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} who pays the fees and the stake
        * @param changeAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} who gets the change leftover from the staking payment
        * @param nodeID The node ID of the validator being added.
        * @param startTime The Unix time when the validator starts validating the Primary Network.
        * @param endTime The Unix time when the validator stops validating the Primary Network (and staked AVAX is returned).
        * @param stakeAmount A {@link https://github.com/indutny/bn.js/|BN} for the amount of stake to be delegated in nAVAX.
        * @param rewardLocktime The locktime field created in the resulting reward outputs
        * @param rewardThreshold The number of signatures required to spend the funds in the resultant reward UTXO
        * @param rewardAddresses The addresses the validator reward goes.
        * @param fee Optional. The amount of fees to burn in its smallest denomination, represented as {@link https://github.com/indutny/bn.js/|BN}
        * @param feeAssetID Optional. The assetID of the fees being burned.
        * @param memo Optional contains arbitrary bytes, up to 256 bytes
        * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
        *
        * @returns An unsigned transaction created from the passed in parameters.
        */
        this.buildAddDelegatorTx = (networkid = constants_2.DefaultNetworkID, blockchainid, avaxAssetID, toAddresses, fromAddresses, changeAddresses, nodeID, startTime, endTime, stakeAmount, rewardLocktime, rewardThreshold, rewardAddresses, fee = undefined, feeAssetID = undefined, memo = undefined, asOf = helperfunctions_1.UnixNow()) => {
            let ins = [];
            let outs = [];
            let stakeOuts = [];
            const zero = new bn_js_1.default(0);
            const now = helperfunctions_1.UnixNow();
            if (startTime.lt(now) || endTime.lte(startTime)) {
                throw new Error("UTXOSet.buildAddDelegatorTx -- startTime must be in the future and endTime must come after startTime");
            }
            const aad = new AssetAmountDestination(toAddresses, fromAddresses, changeAddresses);
            if (avaxAssetID.toString("hex") === feeAssetID.toString("hex")) {
                aad.addAssetAmount(avaxAssetID, stakeAmount, fee);
            }
            else {
                aad.addAssetAmount(avaxAssetID, stakeAmount, zero);
                if (this._feeCheck(fee, feeAssetID)) {
                    aad.addAssetAmount(feeAssetID, zero, fee);
                }
            }
            const minSpendableErr = this.getMinimumSpendable(aad, asOf, undefined, undefined, true);
            if (typeof minSpendableErr === "undefined") {
                ins = aad.getInputs();
                outs = aad.getChangeOutputs();
                stakeOuts = aad.getOutputs();
            }
            else {
                throw minSpendableErr;
            }
            const rewardOutputOwners = new outputs_1.SECPOwnerOutput(rewardAddresses, rewardLocktime, rewardThreshold);
            const UTx = new validationtx_1.AddDelegatorTx(networkid, blockchainid, outs, ins, memo, nodeID, startTime, endTime, stakeAmount, stakeOuts, new outputs_1.ParseableOutput(rewardOutputOwners));
            return new tx_1.UnsignedTx(UTx);
        };
        /**
          * Class representing an unsigned [[AddValidatorTx]] transaction.
          *
          * @param networkid Networkid, [[DefaultNetworkID]]
          * @param blockchainid Blockchainid, default undefined
          * @param avaxAssetID {@link https://github.com/feross/buffer|Buffer} of the asset ID for AVAX
          * @param toAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} recieves the stake at the end of the staking period
          * @param fromAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} who pays the fees and the stake
          * @param changeAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} who gets the change leftover from the staking payment
          * @param nodeID The node ID of the validator being added.
          * @param startTime The Unix time when the validator starts validating the Primary Network.
          * @param endTime The Unix time when the validator stops validating the Primary Network (and staked AVAX is returned).
          * @param stakeAmount A {@link https://github.com/indutny/bn.js/|BN} for the amount of stake to be delegated in nAVAX.
          * @param rewardLocktime The locktime field created in the resulting reward outputs
          * @param rewardThreshold The number of signatures required to spend the funds in the resultant reward UTXO
          * @param rewardAddresses The addresses the validator reward goes.
          * @param delegationFee A number for the percentage of reward to be given to the validator when someone delegates to them. Must be between 0 and 100.
          * @param minStake A {@link https://github.com/indutny/bn.js/|BN} representing the minimum stake required to validate on this network.
          * @param fee Optional. The amount of fees to burn in its smallest denomination, represented as {@link https://github.com/indutny/bn.js/|BN}
          * @param feeAssetID Optional. The assetID of the fees being burned.
          * @param memo Optional contains arbitrary bytes, up to 256 bytes
          * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
          *
          * @returns An unsigned transaction created from the passed in parameters.
          */
        this.buildAddValidatorTx = (networkid = constants_2.DefaultNetworkID, blockchainid, avaxAssetID, toAddresses, fromAddresses, changeAddresses, nodeID, startTime, endTime, stakeAmount, rewardLocktime, rewardThreshold, rewardAddresses, delegationFee, fee = undefined, feeAssetID = undefined, memo = undefined, asOf = helperfunctions_1.UnixNow()) => {
            let ins = [];
            let outs = [];
            let stakeOuts = [];
            const zero = new bn_js_1.default(0);
            const now = helperfunctions_1.UnixNow();
            if (startTime.lt(now) || endTime.lte(startTime)) {
                throw new Error("UTXOSet.buildAddValidatorTx -- startTime must be in the future and endTime must come after startTime");
            }
            if (delegationFee > 100 || delegationFee < 0) {
                throw new Error("UTXOSet.buildAddValidatorTx -- startTime must be in the range of 0 to 100, inclusively");
            }
            const aad = new AssetAmountDestination(toAddresses, fromAddresses, changeAddresses);
            if (avaxAssetID.toString("hex") === feeAssetID.toString("hex")) {
                aad.addAssetAmount(avaxAssetID, stakeAmount, fee);
            }
            else {
                aad.addAssetAmount(avaxAssetID, stakeAmount, zero);
                if (this._feeCheck(fee, feeAssetID)) {
                    aad.addAssetAmount(feeAssetID, zero, fee);
                }
            }
            const minSpendableErr = this.getMinimumSpendable(aad, asOf, undefined, undefined, true);
            if (typeof minSpendableErr === "undefined") {
                ins = aad.getInputs();
                outs = aad.getChangeOutputs();
                stakeOuts = aad.getOutputs();
            }
            else {
                throw minSpendableErr;
            }
            const rewardOutputOwners = new outputs_1.SECPOwnerOutput(rewardAddresses, rewardLocktime, rewardThreshold);
            const UTx = new validationtx_1.AddValidatorTx(networkid, blockchainid, outs, ins, memo, nodeID, startTime, endTime, stakeAmount, stakeOuts, new outputs_1.ParseableOutput(rewardOutputOwners), delegationFee);
            return new tx_1.UnsignedTx(UTx);
        };
        /**
          * Class representing an unsigned [[CreateSubnetTx]] transaction.
          *
          * @param networkid Networkid, [[DefaultNetworkID]]
          * @param blockchainid Blockchainid, default undefined
          * @param fromAddresses The addresses being used to send the funds from the UTXOs {@link https://github.com/feross/buffer|Buffer}
          * @param changeAddresses The addresses that can spend the change remaining from the spent UTXOs.
          * @param subnetOwnerAddresses An array of {@link https://github.com/feross/buffer|Buffer} for the addresses to add to a subnet
          * @param subnetOwnerThreshold The number of owners's signatures required to add a validator to the network
          * @param fee Optional. The amount of fees to burn in its smallest denomination, represented as {@link https://github.com/indutny/bn.js/|BN}
          * @param feeAssetID Optional. The assetID of the fees being burned
          * @param memo Optional contains arbitrary bytes, up to 256 bytes
          * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
          *
          * @returns An unsigned transaction created from the passed in parameters.
          */
        this.buildCreateSubnetTx = (networkid = constants_2.DefaultNetworkID, blockchainid, fromAddresses, changeAddresses, subnetOwnerAddresses, subnetOwnerThreshold, fee = undefined, feeAssetID = undefined, memo = undefined, asOf = helperfunctions_1.UnixNow()) => {
            const zero = new bn_js_1.default(0);
            let ins = [];
            let outs = [];
            if (this._feeCheck(fee, feeAssetID)) {
                const aad = new AssetAmountDestination(fromAddresses, fromAddresses, changeAddresses);
                aad.addAssetAmount(feeAssetID, zero, fee);
                const minSpendableErr = this.getMinimumSpendable(aad, asOf, undefined, undefined);
                if (typeof minSpendableErr === "undefined") {
                    ins = aad.getInputs();
                    outs = aad.getAllOutputs();
                }
                else {
                    throw minSpendableErr;
                }
            }
            const locktime = new bn_js_1.default(0);
            const UTx = new createsubnettx_1.CreateSubnetTx(networkid, blockchainid, outs, ins, memo, new outputs_1.SECPOwnerOutput(subnetOwnerAddresses, locktime, subnetOwnerThreshold));
            return new tx_1.UnsignedTx(UTx);
        };
    }
    //serialize is inherited
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        let utxos = {};
        for (let utxoid in fields["utxos"]) {
            let utxoidCleaned = serializer.decoder(utxoid, encoding, "base58", "base58");
            utxos[utxoidCleaned] = new UTXO();
            utxos[utxoidCleaned].deserialize(fields["utxos"][utxoid], encoding);
        }
        let addressUTXOs = {};
        for (let address in fields["addressUTXOs"]) {
            let addressCleaned = serializer.decoder(address, encoding, "cb58", "hex");
            let utxobalance = {};
            for (let utxoid in fields["addressUTXOs"][address]) {
                let utxoidCleaned = serializer.decoder(utxoid, encoding, "base58", "base58");
                utxobalance[utxoidCleaned] = serializer.decoder(fields["addressUTXOs"][address][utxoid], encoding, "decimalString", "BN");
            }
            addressUTXOs[addressCleaned] = utxobalance;
        }
        this.utxos = utxos;
        this.addressUTXOs = addressUTXOs;
    }
    parseUTXO(utxo) {
        const utxovar = new UTXO();
        // force a copy
        if (typeof utxo === 'string') {
            utxovar.fromBuffer(bintools.cb58Decode(utxo));
        }
        else if (utxo instanceof utxos_1.StandardUTXO) {
            utxovar.fromBuffer(utxo.toBuffer()); // forces a copy
        }
        else {
            /* istanbul ignore next */
            throw new Error(`Error - UTXO.parseUTXO: utxo parameter is not a UTXO or string: ${utxo}`);
        }
        return utxovar;
    }
    create(...args) {
        return new UTXOSet();
    }
    clone() {
        const newset = this.create();
        const allUTXOs = this.getAllUTXOs();
        newset.addArray(allUTXOs);
        return newset;
    }
    _feeCheck(fee, feeAssetID) {
        return (typeof fee !== "undefined" &&
            typeof feeAssetID !== "undefined" &&
            fee.gt(new bn_js_1.default(0)) && feeAssetID instanceof buffer_1.Buffer);
    }
}
exports.UTXOSet = UTXOSet;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXR4b3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvYXBpcy9wbGF0Zm9ybXZtL3V0eG9zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7R0FHRztBQUNILG9DQUFpQztBQUNqQyxvRUFBNEM7QUFDNUMsa0RBQXVCO0FBQ3ZCLHVDQUF3SjtBQUN4SixxQ0FBOEc7QUFDOUcsaUVBQXNEO0FBQ3RELDhDQUFtRTtBQUNuRSwyQ0FBa0Q7QUFDbEQsNkJBQWtDO0FBQ2xDLHFEQUFrRDtBQUNsRCxxREFBbUU7QUFDbkUscURBQWtEO0FBQ2xELGlEQUE4QztBQUM5QywwREFBdUY7QUFFdkYsaURBQWdFO0FBQ2hFLHFEQUFrRDtBQUNsRCw2REFBOEU7QUFFOUU7O0dBRUc7QUFDSCxNQUFNLFFBQVEsR0FBRyxrQkFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQ3hDLE1BQU0sVUFBVSxHQUFHLDZCQUFhLENBQUMsV0FBVyxFQUFFLENBQUM7QUFFL0M7O0dBRUc7QUFDSCxNQUFhLElBQUssU0FBUSxvQkFBWTtJQUF0Qzs7UUFDWSxjQUFTLEdBQUcsTUFBTSxDQUFDO1FBQ25CLFlBQU8sR0FBRyxTQUFTLENBQUM7SUFrRWhDLENBQUM7SUFoRUMsd0JBQXdCO0lBRXhCLFdBQVcsQ0FBQyxNQUFjLEVBQUUsV0FBK0IsS0FBSztRQUM5RCxLQUFLLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztRQUNwQyxJQUFJLENBQUMsTUFBTSxHQUFHLDJCQUFpQixDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBQzdELElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBRUQsVUFBVSxDQUFDLEtBQWEsRUFBRSxTQUFpQixDQUFDO1FBQzFDLElBQUksQ0FBQyxP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QUM7SUFDSixDQUFDO0NBNDBCRjtBQXQ0QkQsMEJBczRCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQHBhY2thZ2VEb2N1bWVudGF0aW9uXG4gKiBAbW9kdWxlIEFQSS1QbGF0Zm9ybVZNLVVUWE9zXG4gKi9cbmltcG9ydCB7IEJ1ZmZlciB9IGZyb20gJ2J1ZmZlci8nO1xuaW1wb3J0IEJpblRvb2xzIGZyb20gJy4uLy4uL3V0aWxzL2JpbnRvb2xzJztcbmltcG9ydCBCTiBmcm9tIFwiYm4uanNcIjtcbmltcG9ydCB7IEFtb3VudE91dHB1dCwgU2VsZWN0T3V0cHV0Q2xhc3MsIFRyYW5zZmVyYWJsZU91dHB1dCwgU0VDUE93bmVyT3V0cHV0LCBQYXJzZWFibGVPdXRwdXQsIFN0YWtlYWJsZUxvY2tPdXQsIFNFQ1BUcmFuc2Zlck91dHB1dCB9IGZyb20gJy4vb3V0cHV0cyc7XG5pbXBvcnQgeyBBbW91bnRJbnB1dCwgU0VDUFRyYW5zZmVySW5wdXQsIFN0YWtlYWJsZUxvY2tJbiwgVHJhbnNmZXJhYmxlSW5wdXQsIFBhcnNlYWJsZUlucHV0IH0gZnJvbSAnLi9pbnB1dHMnO1xuaW1wb3J0IHsgVW5peE5vdyB9IGZyb20gJy4uLy4uL3V0aWxzL2hlbHBlcmZ1bmN0aW9ucyc7XG5pbXBvcnQgeyBTdGFuZGFyZFVUWE8sIFN0YW5kYXJkVVRYT1NldCB9IGZyb20gJy4uLy4uL2NvbW1vbi91dHhvcyc7XG5pbXBvcnQgeyBQbGF0Zm9ybVZNQ29uc3RhbnRzIH0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHsgVW5zaWduZWRUeCB9IGZyb20gJy4vdHgnO1xuaW1wb3J0IHsgRXhwb3J0VHggfSBmcm9tICcuLi9wbGF0Zm9ybXZtL2V4cG9ydHR4JztcbmltcG9ydCB7IERlZmF1bHROZXR3b3JrSUQsIERlZmF1bHRzIH0gZnJvbSAnLi4vLi4vdXRpbHMvY29uc3RhbnRzJztcbmltcG9ydCB7IEltcG9ydFR4IH0gZnJvbSAnLi4vcGxhdGZvcm12bS9pbXBvcnR0eCc7XG5pbXBvcnQgeyBCYXNlVHggfSBmcm9tICcuLi9wbGF0Zm9ybXZtL2Jhc2V0eCc7XG5pbXBvcnQgeyBTdGFuZGFyZEFzc2V0QW1vdW50RGVzdGluYXRpb24sIEFzc2V0QW1vdW50IH0gZnJvbSAnLi4vLi4vY29tbW9uL2Fzc2V0YW1vdW50JztcbmltcG9ydCB7IE91dHB1dCB9IGZyb20gJy4uLy4uL2NvbW1vbi9vdXRwdXQnO1xuaW1wb3J0IHsgQWRkRGVsZWdhdG9yVHgsIEFkZFZhbGlkYXRvclR4IH0gZnJvbSAnLi92YWxpZGF0aW9udHgnO1xuaW1wb3J0IHsgQ3JlYXRlU3VibmV0VHggfSBmcm9tICcuL2NyZWF0ZXN1Ym5ldHR4JztcbmltcG9ydCB7IFNlcmlhbGl6YXRpb24sIFNlcmlhbGl6ZWRFbmNvZGluZyB9IGZyb20gJy4uLy4uL3V0aWxzL3NlcmlhbGl6YXRpb24nO1xuXG4vKipcbiAqIEBpZ25vcmVcbiAqL1xuY29uc3QgYmludG9vbHMgPSBCaW5Ub29scy5nZXRJbnN0YW5jZSgpO1xuY29uc3Qgc2VyaWFsaXplciA9IFNlcmlhbGl6YXRpb24uZ2V0SW5zdGFuY2UoKTtcblxuLyoqXG4gKiBDbGFzcyBmb3IgcmVwcmVzZW50aW5nIGEgc2luZ2xlIFVUWE8uXG4gKi9cbmV4cG9ydCBjbGFzcyBVVFhPIGV4dGVuZHMgU3RhbmRhcmRVVFhPIHtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiVVRYT1wiO1xuICBwcm90ZWN0ZWQgX3R5cGVJRCA9IHVuZGVmaW5lZDtcblxuICAvL3NlcmlhbGl6ZSBpcyBpbmhlcml0ZWRcblxuICBkZXNlcmlhbGl6ZShmaWVsZHM6IG9iamVjdCwgZW5jb2Rpbmc6IFNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpIHtcbiAgICBzdXBlci5kZXNlcmlhbGl6ZShmaWVsZHMsIGVuY29kaW5nKTtcbiAgICB0aGlzLm91dHB1dCA9IFNlbGVjdE91dHB1dENsYXNzKGZpZWxkc1tcIm91dHB1dFwiXVtcIl90eXBlSURcIl0pO1xuICAgIHRoaXMub3V0cHV0LmRlc2VyaWFsaXplKGZpZWxkc1tcIm91dHB1dFwiXSwgZW5jb2RpbmcpO1xuICB9XG5cbiAgZnJvbUJ1ZmZlcihieXRlczogQnVmZmVyLCBvZmZzZXQ6IG51bWJlciA9IDApOiBudW1iZXIge1xuICAgIHRoaXMuY29kZWNpZCA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDIpO1xuICAgIG9mZnNldCArPSAyO1xuICAgIHRoaXMudHhpZCA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDMyKTtcbiAgICBvZmZzZXQgKz0gMzI7XG4gICAgdGhpcy5vdXRwdXRpZHggPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyA0KTtcbiAgICBvZmZzZXQgKz0gNDtcbiAgICB0aGlzLmFzc2V0aWQgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyAzMik7XG4gICAgb2Zmc2V0ICs9IDMyO1xuICAgIGNvbnN0IG91dHB1dGlkOiBudW1iZXIgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyA0KS5yZWFkVUludDMyQkUoMCk7XG4gICAgb2Zmc2V0ICs9IDQ7XG4gICAgdGhpcy5vdXRwdXQgPSBTZWxlY3RPdXRwdXRDbGFzcyhvdXRwdXRpZCk7XG4gICAgcmV0dXJuIHRoaXMub3V0cHV0LmZyb21CdWZmZXIoYnl0ZXMsIG9mZnNldCk7XG4gIH1cblxuICAvKipcbiAgICogVGFrZXMgYSBiYXNlLTU4IHN0cmluZyBjb250YWluaW5nIGEgW1tVVFhPXV0sIHBhcnNlcyBpdCwgcG9wdWxhdGVzIHRoZSBjbGFzcywgYW5kIHJldHVybnMgdGhlIGxlbmd0aCBvZiB0aGUgU3RhbmRhcmRVVFhPIGluIGJ5dGVzLlxuICAgKlxuICAgKiBAcGFyYW0gc2VyaWFsaXplZCBBIGJhc2UtNTggc3RyaW5nIGNvbnRhaW5pbmcgYSByYXcgW1tVVFhPXV1cbiAgICpcbiAgICogQHJldHVybnMgVGhlIGxlbmd0aCBvZiB0aGUgcmF3IFtbVVRYT11dXG4gICAqXG4gICAqIEByZW1hcmtzXG4gICAqIHVubGlrZSBtb3N0IGZyb21TdHJpbmdzLCBpdCBleHBlY3RzIHRoZSBzdHJpbmcgdG8gYmUgc2VyaWFsaXplZCBpbiBjYjU4IGZvcm1hdFxuICAgKi9cbiAgZnJvbVN0cmluZyhzZXJpYWxpemVkOiBzdHJpbmcpOiBudW1iZXIge1xuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgcmV0dXJuIHRoaXMuZnJvbUJ1ZmZlcihiaW50b29scy5jYjU4RGVjb2RlKHNlcmlhbGl6ZWQpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgYmFzZS01OCByZXByZXNlbnRhdGlvbiBvZiB0aGUgW1tVVFhPXV0uXG4gICAqXG4gICAqIEByZW1hcmtzXG4gICAqIHVubGlrZSBtb3N0IHRvU3RyaW5ncywgdGhpcyByZXR1cm5zIGluIGNiNTggc2VyaWFsaXphdGlvbiBmb3JtYXRcbiAgICovXG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICByZXR1cm4gYmludG9vbHMuY2I1OEVuY29kZSh0aGlzLnRvQnVmZmVyKCkpO1xuICB9XG5cbiAgY2xvbmUoKTogdGhpcyB7XG4gICAgY29uc3QgdXR4bzogVVRYTyA9IG5ldyBVVFhPKCk7XG4gICAgdXR4by5mcm9tQnVmZmVyKHRoaXMudG9CdWZmZXIoKSk7XG4gICAgcmV0dXJuIHV0eG8gYXMgdGhpcztcbiAgfVxuXG4gIGNyZWF0ZShcbiAgICBjb2RlY0lEOiBudW1iZXIgPSBQbGF0Zm9ybVZNQ29uc3RhbnRzLkxBVEVTVENPREVDLFxuICAgIHR4aWQ6IEJ1ZmZlciA9IHVuZGVmaW5lZCxcbiAgICBvdXRwdXRpZHg6IEJ1ZmZlciB8IG51bWJlciA9IHVuZGVmaW5lZCxcbiAgICBhc3NldGlkOiBCdWZmZXIgPSB1bmRlZmluZWQsXG4gICAgb3V0cHV0OiBPdXRwdXQgPSB1bmRlZmluZWQpOiB0aGlzIHtcbiAgICByZXR1cm4gbmV3IFVUWE8oY29kZWNJRCwgdHhpZCwgb3V0cHV0aWR4LCBhc3NldGlkLCBvdXRwdXQpIGFzIHRoaXM7XG4gIH1cblxufVxuXG5leHBvcnQgY2xhc3MgQXNzZXRBbW91bnREZXN0aW5hdGlvbiBleHRlbmRzIFN0YW5kYXJkQXNzZXRBbW91bnREZXN0aW5hdGlvbjxUcmFuc2ZlcmFibGVPdXRwdXQsIFRyYW5zZmVyYWJsZUlucHV0PiB7IH1cblxuLyoqXG4gKiBDbGFzcyByZXByZXNlbnRpbmcgYSBzZXQgb2YgW1tVVFhPXV1zLlxuICovXG5leHBvcnQgY2xhc3MgVVRYT1NldCBleHRlbmRzIFN0YW5kYXJkVVRYT1NldDxVVFhPPntcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiVVRYT1NldFwiO1xuICBwcm90ZWN0ZWQgX3R5cGVJRCA9IHVuZGVmaW5lZDtcblxuICAvL3NlcmlhbGl6ZSBpcyBpbmhlcml0ZWRcblxuICBkZXNlcmlhbGl6ZShmaWVsZHM6IG9iamVjdCwgZW5jb2Rpbmc6IFNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpIHtcbiAgICBzdXBlci5kZXNlcmlhbGl6ZShmaWVsZHMsIGVuY29kaW5nKTtcbiAgICBsZXQgdXR4b3MgPSB7fTtcbiAgICBmb3IgKGxldCB1dHhvaWQgaW4gZmllbGRzW1widXR4b3NcIl0pIHtcbiAgICAgIGxldCB1dHhvaWRDbGVhbmVkOiBzdHJpbmcgPSBzZXJpYWxpemVyLmRlY29kZXIodXR4b2lkLCBlbmNvZGluZywgXCJiYXNlNThcIiwgXCJiYXNlNThcIik7XG4gICAgICB1dHhvc1t1dHhvaWRDbGVhbmVkXSA9IG5ldyBVVFhPKCk7XG4gICAgICB1dHhvc1t1dHhvaWRDbGVhbmVkXS5kZXNlcmlhbGl6ZShmaWVsZHNbXCJ1dHhvc1wiXVt1dHhvaWRdLCBlbmNvZGluZyk7XG4gICAgfVxuICAgIGxldCBhZGRyZXNzVVRYT3MgPSB7fTtcbiAgICBmb3IgKGxldCBhZGRyZXNzIGluIGZpZWxkc1tcImFkZHJlc3NVVFhPc1wiXSkge1xuICAgICAgbGV0IGFkZHJlc3NDbGVhbmVkOiBzdHJpbmcgPSBzZXJpYWxpemVyLmRlY29kZXIoYWRkcmVzcywgZW5jb2RpbmcsIFwiY2I1OFwiLCBcImhleFwiKTtcbiAgICAgIGxldCB1dHhvYmFsYW5jZSA9IHt9O1xuICAgICAgZm9yIChsZXQgdXR4b2lkIGluIGZpZWxkc1tcImFkZHJlc3NVVFhPc1wiXVthZGRyZXNzXSkge1xuICAgICAgICBsZXQgdXR4b2lkQ2xlYW5lZDogc3RyaW5nID0gc2VyaWFsaXplci5kZWNvZGVyKHV0eG9pZCwgZW5jb2RpbmcsIFwiYmFzZTU4XCIsIFwiYmFzZTU4XCIpO1xuICAgICAgICB1dHhvYmFsYW5jZVt1dHhvaWRDbGVhbmVkXSA9IHNlcmlhbGl6ZXIuZGVjb2RlcihmaWVsZHNbXCJhZGRyZXNzVVRYT3NcIl1bYWRkcmVzc11bdXR4b2lkXSwgZW5jb2RpbmcsIFwiZGVjaW1hbFN0cmluZ1wiLCBcIkJOXCIpO1xuICAgICAgfVxuICAgICAgYWRkcmVzc1VUWE9zW2FkZHJlc3NDbGVhbmVkXSA9IHV0eG9iYWxhbmNlO1xuICAgIH1cbiAgICB0aGlzLnV0eG9zID0gdXR4b3M7XG4gICAgdGhpcy5hZGRyZXNzVVRYT3MgPSBhZGRyZXNzVVRYT3M7XG4gIH1cblxuICBwYXJzZVVUWE8odXR4bzogVVRYTyB8IHN0cmluZyk6IFVUWE8ge1xuICAgIGNvbnN0IHV0eG92YXI6IFVUWE8gPSBuZXcgVVRYTygpO1xuICAgIC8vIGZvcmNlIGEgY29weVxuICAgIGlmICh0eXBlb2YgdXR4byA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHV0eG92YXIuZnJvbUJ1ZmZlcihiaW50b29scy5jYjU4RGVjb2RlKHV0eG8pKTtcbiAgICB9IGVsc2UgaWYgKHV0eG8gaW5zdGFuY2VvZiBTdGFuZGFyZFVUWE8pIHtcbiAgICAgIHV0eG92YXIuZnJvbUJ1ZmZlcih1dHhvLnRvQnVmZmVyKCkpOyAvLyBmb3JjZXMgYSBjb3B5XG4gICAgfSBlbHNlIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEVycm9yIC0gVVRYTy5wYXJzZVVUWE86IHV0eG8gcGFyYW1ldGVyIGlzIG5vdCBhIFVUWE8gb3Igc3RyaW5nOiAke3V0eG99YCk7XG4gICAgfVxuICAgIHJldHVybiB1dHhvdmFyXG4gIH1cblxuICBjcmVhdGUoLi4uYXJnczogYW55W10pOiB0aGlzIHtcbiAgICByZXR1cm4gbmV3IFVUWE9TZXQoKSBhcyB0aGlzO1xuICB9XG5cbiAgY2xvbmUoKTogdGhpcyB7XG4gICAgY29uc3QgbmV3c2V0OiBVVFhPU2V0ID0gdGhpcy5jcmVhdGUoKTtcbiAgICBjb25zdCBhbGxVVFhPczogQXJyYXk8VVRYTz4gPSB0aGlzLmdldEFsbFVUWE9zKCk7XG4gICAgbmV3c2V0LmFkZEFycmF5KGFsbFVUWE9zKVxuICAgIHJldHVybiBuZXdzZXQgYXMgdGhpcztcbiAgfVxuXG4gIF9mZWVDaGVjayhmZWU6IEJOLCBmZWVBc3NldElEOiBCdWZmZXIpOiBib29sZWFuIHtcbiAgICByZXR1cm4gKHR5cGVvZiBmZWUgIT09IFwidW5kZWZpbmVkXCIgJiZcbiAgICAgIHR5cGVvZiBmZWVBc3NldElEICE9PSBcInVuZGVmaW5lZFwiICYmXG4gICAgICBmZWUuZ3QobmV3IEJOKDApKSAmJiBmZWVBc3NldElEIGluc3RhbmNlb2YgQnVmZmVyXG4gICAgKTtcbiAgfVxuXG4gIGdldENvbnN1bWFibGVVWFRPID0gKGFzT2Y6IEJOID0gVW5peE5vdygpLCBzdGFrZWFibGU6IGJvb2xlYW4gPSBmYWxzZSk6IFVUWE9bXSA9PiB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0QWxsVVRYT3MoKS5maWx0ZXIoKHV0eG86IFVUWE8pID0+IHtcbiAgICAgIGlmIChzdGFrZWFibGUpIHtcbiAgICAgICAgLy8gc3Rha2VhYmxlIHRyYW5zYWN0aW9ucyBjYW4gY29uc3VtZSBhbnkgVVRYTy5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICBjb25zdCBvdXRwdXQ6IE91dHB1dCA9IHV0eG8uZ2V0T3V0cHV0KCk7XG4gICAgICBpZiAoIShvdXRwdXQgaW5zdGFuY2VvZiBTdGFrZWFibGVMb2NrT3V0KSkge1xuICAgICAgICAvLyBub24tc3Rha2VhYmxlIHRyYW5zYWN0aW9ucyBjYW4gY29uc3VtZSBhbnkgVVRYTyB0aGF0IGlzbid0IGxvY2tlZC5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICBjb25zdCBzdGFrZWFibGVPdXRwdXQ6IFN0YWtlYWJsZUxvY2tPdXQgPSBvdXRwdXQgYXMgU3Rha2VhYmxlTG9ja091dDtcbiAgICAgIGlmIChzdGFrZWFibGVPdXRwdXQuZ2V0U3Rha2VhYmxlTG9ja3RpbWUoKS5sdChhc09mKSkge1xuICAgICAgICAvLyBJZiB0aGUgc3Rha2VhYmxlIG91dHB1dHMgbG9ja3RpbWUgaGFzIGVuZGVkLCB0aGVuIHRoaXMgVVRYTyBjYW4gc3RpbGxcbiAgICAgICAgLy8gYmUgY29uc3VtZWQgYnkgYSBub24tc3Rha2VhYmxlIHRyYW5zYWN0aW9uLlxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIC8vIFRoaXMgb3V0cHV0IGlzIGxvY2tlZCBhbmQgY2FuJ3QgYmUgY29uc3VtZWQgYnkgYSBub24tc3Rha2VhYmxlXG4gICAgICAvLyB0cmFuc2FjdGlvbi5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9KTtcbiAgfVxuXG4gIGdldE1pbmltdW1TcGVuZGFibGUgPSAoXG4gICAgYWFkOiBBc3NldEFtb3VudERlc3RpbmF0aW9uLFxuICAgIGFzT2Y6IEJOID0gVW5peE5vdygpLFxuICAgIGxvY2t0aW1lOiBCTiA9IG5ldyBCTigwKSxcbiAgICB0aHJlc2hvbGQ6IG51bWJlciA9IDEsXG4gICAgc3Rha2VhYmxlOiBib29sZWFuID0gZmFsc2UsXG4gICk6IEVycm9yID0+IHtcbiAgICBsZXQgdXR4b0FycmF5OiBVVFhPW10gPSB0aGlzLmdldENvbnN1bWFibGVVWFRPKGFzT2YsIHN0YWtlYWJsZSk7XG4gICAgbGV0IHRtcFVUWE9BcnJheTogVVRYT1tdID0gW107XG4gICAgaWYoc3Rha2VhYmxlKSB7XG4gICAgICAvLyBJZiB0aGlzIGlzIGEgc3Rha2VhYmxlIHRyYW5zYWN0aW9uIHRoZW4gaGF2ZSBTdGFrZWFibGVMb2NrT3V0IGNvbWUgYmVmb3JlIFNFQ1BUcmFuc2Zlck91dHB1dFxuICAgICAgLy8gc28gdGhhdCB1c2VycyBmaXJzdCBzdGFrZSBsb2NrZWQgdG9rZW5zIGJlZm9yZSBzdGFraW5nIHVubG9ja2VkIHRva2Vuc1xuICAgICAgdXR4b0FycmF5LmZvckVhY2goKHV0eG86IFVUWE8pID0+IHtcbiAgICAgICAgLy8gU3Rha2VhYmxlTG9ja091dHNcbiAgICAgICAgaWYodXR4by5nZXRPdXRwdXQoKS5nZXRUeXBlSUQoKSA9PT0gMjIpIHtcbiAgICAgICAgICB0bXBVVFhPQXJyYXkucHVzaCh1dHhvKTtcbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgLy8gU29ydCB0aGUgU3Rha2VhYmxlTG9ja091dHMgYnkgU3Rha2VhYmxlTG9ja3RpbWUgc28gdGhhdCB0aGUgZ3JlYXRlc3QgU3Rha2VhYmxlTG9ja3RpbWUgYXJlIHNwZW50IGZpcnN0XG4gICAgICB0bXBVVFhPQXJyYXkuc29ydCgoYTogVVRYTywgYjogVVRYTykgPT4ge1xuICAgICAgICBsZXQgc3Rha2VhYmxlTG9ja091dDEgPSBhLmdldE91dHB1dCgpIGFzIFN0YWtlYWJsZUxvY2tPdXQ7XG4gICAgICAgIGxldCBzdGFrZWFibGVMb2NrT3V0MiA9IGIuZ2V0T3V0cHV0KCkgYXMgU3Rha2VhYmxlTG9ja091dDtcbiAgICAgICAgcmV0dXJuIHN0YWtlYWJsZUxvY2tPdXQyLmdldFN0YWtlYWJsZUxvY2t0aW1lKCkudG9OdW1iZXIoKSAtIHN0YWtlYWJsZUxvY2tPdXQxLmdldFN0YWtlYWJsZUxvY2t0aW1lKCkudG9OdW1iZXIoKVxuICAgICAgfSlcblxuICAgICAgdXR4b0FycmF5LmZvckVhY2goKHV0eG86IFVUWE8pID0+IHtcbiAgICAgICAgLy8gU0VDUFRyYW5zZmVyT3V0cHV0c1xuICAgICAgICBpZih1dHhvLmdldE91dHB1dCgpLmdldFR5cGVJRCgpID09PSA3KSB7XG4gICAgICAgICAgdG1wVVRYT0FycmF5LnB1c2godXR4byk7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICB1dHhvQXJyYXkgPSB0bXBVVFhPQXJyYXk7XG4gICAgfVxuXG4gICAgLy8gb3V0cyBpcyBhIG1hcCBmcm9tIGFzc2V0SUQgdG8gYSB0dXBsZSBvZiAobG9ja2VkU3Rha2VhYmxlLCB1bmxvY2tlZClcbiAgICAvLyB3aGljaCBhcmUgYXJyYXlzIG9mIG91dHB1dHMuXG4gICAgY29uc3Qgb3V0czogb2JqZWN0ID0ge307XG5cbiAgICAvLyBXZSBvbmx5IG5lZWQgdG8gaXRlcmF0ZSBvdmVyIFVUWE9zIHVudGlsIHdlIGhhdmUgc3BlbnQgc3VmZmljaWVudCBmdW5kc1xuICAgIC8vIHRvIG1ldCB0aGUgcmVxdWVzdGVkIGFtb3VudHMuXG4gICAgdXR4b0FycmF5LmZvckVhY2goKHV0eG86IFVUWE8sIGluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgIGNvbnN0IGFzc2V0SUQ6IEJ1ZmZlciA9IHV0eG8uZ2V0QXNzZXRJRCgpO1xuICAgICAgY29uc3QgYXNzZXRLZXk6IHN0cmluZyA9IGFzc2V0SUQudG9TdHJpbmcoXCJoZXhcIik7XG4gICAgICBjb25zdCBmcm9tQWRkcmVzc2VzOiBCdWZmZXJbXSA9IGFhZC5nZXRTZW5kZXJzKCk7XG4gICAgICBjb25zdCBvdXRwdXQ6IE91dHB1dCA9IHV0eG8uZ2V0T3V0cHV0KCk7XG4gICAgICBpZiAoIShvdXRwdXQgaW5zdGFuY2VvZiBBbW91bnRPdXRwdXQpIHx8ICFhYWQuYXNzZXRFeGlzdHMoYXNzZXRLZXkpIHx8ICFvdXRwdXQubWVldHNUaHJlc2hvbGQoZnJvbUFkZHJlc3NlcywgYXNPZikpIHtcbiAgICAgICAgLy8gV2Ugc2hvdWxkIG9ubHkgdHJ5IHRvIHNwZW5kIGZ1bmdpYmxlIGFzc2V0cy5cbiAgICAgICAgLy8gV2Ugc2hvdWxkIG9ubHkgc3BlbmQge3sgYXNzZXRLZXkgfX0uXG4gICAgICAgIC8vIFdlIG5lZWQgdG8gYmUgYWJsZSB0byBzcGVuZCB0aGUgb3V0cHV0LlxuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGFzc2V0QW1vdW50OiBBc3NldEFtb3VudCA9IGFhZC5nZXRBc3NldEFtb3VudChhc3NldEtleSk7XG4gICAgICBpZiAoYXNzZXRBbW91bnQuaXNGaW5pc2hlZCgpKSB7XG4gICAgICAgIC8vIFdlJ3ZlIGFscmVhZHkgc3BlbnQgdGhlIG5lZWRlZCBVVFhPcyBmb3IgdGhpcyBhc3NldElELlxuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICghKGFzc2V0S2V5IGluIG91dHMpKSB7XG4gICAgICAgIC8vIElmIHRoaXMgaXMgdGhlIGZpcnN0IHRpbWUgc3BlbmRpbmcgdGhpcyBhc3NldElELCB3ZSBuZWVkIHRvXG4gICAgICAgIC8vIGluaXRpYWxpemUgdGhlIG91dHMgb2JqZWN0IGNvcnJlY3RseS5cbiAgICAgICAgb3V0c1thc3NldEtleV0gPSB7XG4gICAgICAgICAgbG9ja2VkU3Rha2VhYmxlOiBbXSxcbiAgICAgICAgICB1bmxvY2tlZDogW10sXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGFtb3VudE91dHB1dDogQW1vdW50T3V0cHV0ID0gb3V0cHV0IGFzIEFtb3VudE91dHB1dDtcbiAgICAgIC8vIGFtb3VudCBpcyB0aGUgYW1vdW50IG9mIGZ1bmRzIGF2YWlsYWJsZSBmcm9tIHRoaXMgVVRYTy5cbiAgICAgIGNvbnN0IGFtb3VudCA9IGFtb3VudE91dHB1dC5nZXRBbW91bnQoKTtcblxuICAgICAgLy8gU2V0IHVwIHRoZSBTRUNQIGlucHV0IHdpdGggdGhlIHNhbWUgYW1vdW50IGFzIHRoZSBvdXRwdXQuXG4gICAgICBsZXQgaW5wdXQ6IEFtb3VudElucHV0ID0gbmV3IFNFQ1BUcmFuc2ZlcklucHV0KGFtb3VudCk7XG5cbiAgICAgIGxldCBsb2NrZWQ6IGJvb2xlYW4gPSBmYWxzZTtcbiAgICAgIGlmIChhbW91bnRPdXRwdXQgaW5zdGFuY2VvZiBTdGFrZWFibGVMb2NrT3V0KSB7XG4gICAgICAgIGNvbnN0IHN0YWtlYWJsZU91dHB1dDogU3Rha2VhYmxlTG9ja091dCA9IGFtb3VudE91dHB1dCBhcyBTdGFrZWFibGVMb2NrT3V0O1xuICAgICAgICBjb25zdCBzdGFrZWFibGVMb2NrdGltZTogQk4gPSBzdGFrZWFibGVPdXRwdXQuZ2V0U3Rha2VhYmxlTG9ja3RpbWUoKTtcblxuICAgICAgICBpZiAoc3Rha2VhYmxlTG9ja3RpbWUuZ3QoYXNPZikpIHtcbiAgICAgICAgICAvLyBBZGQgYSBuZXcgaW5wdXQgYW5kIG1hcmsgaXQgYXMgYmVpbmcgbG9ja2VkLlxuICAgICAgICAgIGlucHV0ID0gbmV3IFN0YWtlYWJsZUxvY2tJbihcbiAgICAgICAgICAgIGFtb3VudCxcbiAgICAgICAgICAgIHN0YWtlYWJsZUxvY2t0aW1lLFxuICAgICAgICAgICAgbmV3IFBhcnNlYWJsZUlucHV0KGlucHV0KSxcbiAgICAgICAgICApO1xuXG4gICAgICAgICAgLy8gTWFyayB0aGlzIFVUWE8gYXMgaGF2aW5nIGJlZW4gcmUtbG9ja2VkLlxuICAgICAgICAgIGxvY2tlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgYXNzZXRBbW91bnQuc3BlbmRBbW91bnQoYW1vdW50LCBsb2NrZWQpO1xuICAgICAgaWYgKGxvY2tlZCkge1xuICAgICAgICAvLyBUcmFjayB0aGUgVVRYTyBhcyBsb2NrZWQuXG4gICAgICAgIG91dHNbYXNzZXRLZXldLmxvY2tlZFN0YWtlYWJsZS5wdXNoKGFtb3VudE91dHB1dCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBUcmFjayB0aGUgVVRYTyBhcyB1bmxvY2tlZC5cbiAgICAgICAgb3V0c1thc3NldEtleV0udW5sb2NrZWQucHVzaChhbW91bnRPdXRwdXQpO1xuICAgICAgfVxuXG4gICAgICAvLyBHZXQgdGhlIGluZGljZXMgb2YgdGhlIG91dHB1dHMgdGhhdCBzaG91bGQgYmUgdXNlZCB0byBhdXRob3JpemUgdGhlXG4gICAgICAvLyBzcGVuZGluZyBvZiB0aGlzIGlucHV0LlxuXG4gICAgICAvLyBUT0RPOiBnZXRTcGVuZGVycyBzaG91bGQgcmV0dXJuIGFuIGFycmF5IG9mIGluZGljZXMgcmF0aGVyIHRoYW4gYW5cbiAgICAgIC8vIGFycmF5IG9mIGFkZHJlc3Nlcy5cbiAgICAgIGNvbnN0IHNwZW5kZXJzOiBBcnJheTxCdWZmZXI+ID0gYW1vdW50T3V0cHV0LmdldFNwZW5kZXJzKGZyb21BZGRyZXNzZXMsIGFzT2YpO1xuICAgICAgc3BlbmRlcnMuZm9yRWFjaCgoc3BlbmRlcjogQnVmZmVyKSA9PiB7XG4gICAgICAgIGNvbnN0IGlkeDogbnVtYmVyID0gYW1vdW50T3V0cHV0LmdldEFkZHJlc3NJZHgoc3BlbmRlcik7XG4gICAgICAgIGlmIChpZHggPT09IC0xKSB7XG4gICAgICAgICAgLy8gVGhpcyBzaG91bGQgbmV2ZXIgaGFwcGVuLCB3aGljaCBpcyB3aHkgdGhlIGVycm9yIGlzIHRocm93biByYXRoZXJcbiAgICAgICAgICAvLyB0aGFuIGJlaW5nIHJldHVybmVkLiBJZiB0aGlzIHdlcmUgdG8gZXZlciBoYXBwZW4gdGhpcyB3b3VsZCBiZSBhblxuICAgICAgICAgIC8vIGVycm9yIGluIHRoZSBpbnRlcm5hbCBsb2dpYyByYXRoZXIgaGF2aW5nIGNhbGxlZCB0aGlzIGZ1bmN0aW9uIHdpdGhcbiAgICAgICAgICAvLyBpbnZhbGlkIGFyZ3VtZW50cy5cblxuICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFcnJvciAtIFVUWE9TZXQuZ2V0TWluaW11bVNwZW5kYWJsZTogbm8gc3VjaCAnXG4gICAgICAgICAgICArIGBhZGRyZXNzIGluIG91dHB1dDogJHtzcGVuZGVyfWApO1xuICAgICAgICB9XG4gICAgICAgIGlucHV0LmFkZFNpZ25hdHVyZUlkeChpZHgsIHNwZW5kZXIpO1xuICAgICAgfSlcblxuICAgICAgY29uc3QgdHhJRDogQnVmZmVyID0gdXR4by5nZXRUeElEKCk7XG4gICAgICBjb25zdCBvdXRwdXRJZHg6IEJ1ZmZlciA9IHV0eG8uZ2V0T3V0cHV0SWR4KCk7XG4gICAgICBjb25zdCB0cmFuc2ZlcklucHV0OiBUcmFuc2ZlcmFibGVJbnB1dCA9IG5ldyBUcmFuc2ZlcmFibGVJbnB1dChcbiAgICAgICAgdHhJRCxcbiAgICAgICAgb3V0cHV0SWR4LFxuICAgICAgICBhc3NldElELFxuICAgICAgICBpbnB1dCxcbiAgICAgICk7XG4gICAgICBhYWQuYWRkSW5wdXQodHJhbnNmZXJJbnB1dCk7XG4gICAgfSk7XG5cbiAgICBpZiAoIWFhZC5jYW5Db21wbGV0ZSgpKSB7XG4gICAgICAvLyBBZnRlciBydW5uaW5nIHRocm91Z2ggYWxsIHRoZSBVVFhPcywgd2Ugc3RpbGwgd2VyZW4ndCBhYmxlIHRvIGdldCBhbGxcbiAgICAgIC8vIHRoZSBuZWNlc3NhcnkgZnVuZHMsIHNvIHRoaXMgdHJhbnNhY3Rpb24gY2FuJ3QgYmUgbWFkZS5cbiAgICAgIHJldHVybiBuZXcgRXJyb3IoJ0Vycm9yIC0gVVRYT1NldC5nZXRNaW5pbXVtU3BlbmRhYmxlOiBpbnN1ZmZpY2llbnQgJ1xuICAgICAgICArICdmdW5kcyB0byBjcmVhdGUgdGhlIHRyYW5zYWN0aW9uJyk7XG4gICAgfVxuXG4gICAgLy8gVE9ETzogV2Ugc2hvdWxkIHNlcGFyYXRlIHRoZSBhYm92ZSBmdW5jdGlvbmFsaXR5IGludG8gYSBzaW5nbGUgZnVuY3Rpb25cbiAgICAvLyB0aGF0IGp1c3Qgc2VsZWN0cyB0aGUgVVRYT3MgdG8gY29uc3VtZS5cblxuICAgIGNvbnN0IHplcm86IEJOID0gbmV3IEJOKDApO1xuXG4gICAgLy8gYXNzZXRBbW91bnRzIGlzIGFuIGFycmF5IG9mIGFzc2V0IGRlc2NyaXB0aW9ucyBhbmQgaG93IG11Y2ggaXMgbGVmdCB0b1xuICAgIC8vIHNwZW5kIGZvciB0aGVtLlxuICAgIGNvbnN0IGFzc2V0QW1vdW50czogQXJyYXk8QXNzZXRBbW91bnQ+ID0gYWFkLmdldEFtb3VudHMoKTtcbiAgICBhc3NldEFtb3VudHMuZm9yRWFjaCgoYXNzZXRBbW91bnQ6IEFzc2V0QW1vdW50KSA9PiB7XG4gICAgICAvLyBjaGFuZ2UgaXMgdGhlIGFtb3VudCB0aGF0IHNob3VsZCBiZSByZXR1cm5lZCBiYWNrIHRvIHRoZSBzb3VyY2Ugb2YgdGhlXG4gICAgICAvLyBmdW5kcy5cbiAgICAgIGNvbnN0IGNoYW5nZTogQk4gPSBhc3NldEFtb3VudC5nZXRDaGFuZ2UoKTtcbiAgICAgIC8vIGlzU3Rha2VhYmxlTG9ja0NoYW5nZSBpcyBpZiB0aGUgY2hhbmdlIGlzIGxvY2tlZCBvciBub3QuXG4gICAgICBjb25zdCBpc1N0YWtlYWJsZUxvY2tDaGFuZ2U6IGJvb2xlYW4gPSBhc3NldEFtb3VudC5nZXRTdGFrZWFibGVMb2NrQ2hhbmdlKCk7XG4gICAgICAvLyBsb2NrZWRDaGFuZ2UgaXMgdGhlIGFtb3VudCBvZiBsb2NrZWQgY2hhbmdlIHRoYXQgc2hvdWxkIGJlIHJldHVybmVkIHRvXG4gICAgICAvLyB0aGUgc2VuZGVyXG4gICAgICBjb25zdCBsb2NrZWRDaGFuZ2U6IEJOID0gaXNTdGFrZWFibGVMb2NrQ2hhbmdlID8gY2hhbmdlIDogemVyby5jbG9uZSgpO1xuXG4gICAgICBjb25zdCBhc3NldElEOiBCdWZmZXIgPSBhc3NldEFtb3VudC5nZXRBc3NldElEKCk7XG4gICAgICBjb25zdCBhc3NldEtleTogc3RyaW5nID0gYXNzZXRBbW91bnQuZ2V0QXNzZXRJRFN0cmluZygpO1xuICAgICAgY29uc3QgbG9ja2VkT3V0cHV0czogQXJyYXk8U3Rha2VhYmxlTG9ja091dD4gPSBvdXRzW2Fzc2V0S2V5XS5sb2NrZWRTdGFrZWFibGU7XG4gICAgICBsb2NrZWRPdXRwdXRzLmZvckVhY2goKGxvY2tlZE91dHB1dDogU3Rha2VhYmxlTG9ja091dCwgaTogbnVtYmVyKSA9PiB7XG4gICAgICAgIGNvbnN0IHN0YWtlYWJsZUxvY2t0aW1lOiBCTiA9IGxvY2tlZE91dHB1dC5nZXRTdGFrZWFibGVMb2NrdGltZSgpO1xuICAgICAgICBjb25zdCBwYXJzZWFibGVPdXRwdXQ6IFBhcnNlYWJsZU91dHB1dCA9IGxvY2tlZE91dHB1dC5nZXRUcmFuc2ZlcmFibGVPdXRwdXQoKTtcblxuICAgICAgICAvLyBXZSBrbm93IHRoYXQgcGFyc2VhYmxlT3V0cHV0IGNvbnRhaW5zIGFuIEFtb3VudE91dHB1dCBiZWNhdXNlIHRoZVxuICAgICAgICAvLyBmaXJzdCBsb29wIGZpbHRlcnMgZm9yIGZ1bmdpYmxlIGFzc2V0cy5cbiAgICAgICAgY29uc3Qgb3V0cHV0OiBBbW91bnRPdXRwdXQgPSBwYXJzZWFibGVPdXRwdXQuZ2V0T3V0cHV0KCkgYXMgQW1vdW50T3V0cHV0O1xuXG4gICAgICAgIGxldCBvdXRwdXRBbW91bnRSZW1haW5pbmc6IEJOID0gb3V0cHV0LmdldEFtb3VudCgpO1xuICAgICAgICAvLyBUaGUgb25seSBvdXRwdXQgdGhhdCBjb3VsZCBnZW5lcmF0ZSBjaGFuZ2UgaXMgdGhlIGxhc3Qgb3V0cHV0LlxuICAgICAgICAvLyBPdGhlcndpc2UsIGFueSBmdXJ0aGVyIFVUWE9zIHdvdWxkbid0IGhhdmUgbmVlZGVkIHRvIGJlIHNwZW50LlxuICAgICAgICBpZiAoaSA9PSBsb2NrZWRPdXRwdXRzLmxlbmd0aCAtIDEgJiYgbG9ja2VkQ2hhbmdlLmd0KHplcm8pKSB7XG4gICAgICAgICAgLy8gdXBkYXRlIG91dHB1dEFtb3VudFJlbWFpbmluZyB0byBubyBsb25nZXIgaG9sZCB0aGUgY2hhbmdlIHRoYXQgd2VcbiAgICAgICAgICAvLyBhcmUgcmV0dXJuaW5nLlxuICAgICAgICAgIG91dHB1dEFtb3VudFJlbWFpbmluZyA9IG91dHB1dEFtb3VudFJlbWFpbmluZy5zdWIobG9ja2VkQ2hhbmdlKTtcbiAgICAgICAgICAvLyBDcmVhdGUgdGhlIGlubmVyIG91dHB1dC5cbiAgICAgICAgICBjb25zdCBuZXdDaGFuZ2VPdXRwdXQ6IEFtb3VudE91dHB1dCA9IFNlbGVjdE91dHB1dENsYXNzKFxuICAgICAgICAgICAgb3V0cHV0LmdldE91dHB1dElEKCksXG4gICAgICAgICAgICBsb2NrZWRDaGFuZ2UsXG4gICAgICAgICAgICBvdXRwdXQuZ2V0QWRkcmVzc2VzKCksXG4gICAgICAgICAgICBvdXRwdXQuZ2V0TG9ja3RpbWUoKSxcbiAgICAgICAgICAgIG91dHB1dC5nZXRUaHJlc2hvbGQoKSxcbiAgICAgICAgICApIGFzIEFtb3VudE91dHB1dDtcbiAgICAgICAgICAvLyBXcmFwIHRoZSBpbm5lciBvdXRwdXQgaW4gdGhlIFN0YWtlYWJsZUxvY2tPdXQgd3JhcHBlci5cbiAgICAgICAgICBsZXQgbmV3TG9ja2VkQ2hhbmdlT3V0cHV0OiBTdGFrZWFibGVMb2NrT3V0ID0gU2VsZWN0T3V0cHV0Q2xhc3MoXG4gICAgICAgICAgICBsb2NrZWRPdXRwdXQuZ2V0T3V0cHV0SUQoKSxcbiAgICAgICAgICAgIGxvY2tlZENoYW5nZSxcbiAgICAgICAgICAgIG91dHB1dC5nZXRBZGRyZXNzZXMoKSxcbiAgICAgICAgICAgIG91dHB1dC5nZXRMb2NrdGltZSgpLFxuICAgICAgICAgICAgb3V0cHV0LmdldFRocmVzaG9sZCgpLFxuICAgICAgICAgICAgc3Rha2VhYmxlTG9ja3RpbWUsXG4gICAgICAgICAgICBuZXcgUGFyc2VhYmxlT3V0cHV0KG5ld0NoYW5nZU91dHB1dCksXG4gICAgICAgICAgKSBhcyBTdGFrZWFibGVMb2NrT3V0O1xuICAgICAgICAgIGNvbnN0IHRyYW5zZmVyT3V0cHV0OiBUcmFuc2ZlcmFibGVPdXRwdXQgPSBuZXcgVHJhbnNmZXJhYmxlT3V0cHV0KGFzc2V0SUQsIG5ld0xvY2tlZENoYW5nZU91dHB1dCk7XG4gICAgICAgICAgYWFkLmFkZENoYW5nZSh0cmFuc2Zlck91dHB1dCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBXZSBrbm93IHRoYXQgb3V0cHV0QW1vdW50UmVtYWluaW5nID4gMC4gT3RoZXJ3aXNlLCB3ZSB3b3VsZCBuZXZlclxuICAgICAgICAvLyBoYXZlIGNvbnN1bWVkIHRoaXMgVVRYTywgYXMgaXQgd291bGQgYmUgb25seSBjaGFuZ2UuXG5cbiAgICAgICAgLy8gQ3JlYXRlIHRoZSBpbm5lciBvdXRwdXQuXG4gICAgICAgIGNvbnN0IG5ld091dHB1dDogQW1vdW50T3V0cHV0ID0gU2VsZWN0T3V0cHV0Q2xhc3MoXG4gICAgICAgICAgb3V0cHV0LmdldE91dHB1dElEKCksXG4gICAgICAgICAgb3V0cHV0QW1vdW50UmVtYWluaW5nLFxuICAgICAgICAgIG91dHB1dC5nZXRBZGRyZXNzZXMoKSxcbiAgICAgICAgICBvdXRwdXQuZ2V0TG9ja3RpbWUoKSxcbiAgICAgICAgICBvdXRwdXQuZ2V0VGhyZXNob2xkKCksXG4gICAgICAgICkgYXMgQW1vdW50T3V0cHV0O1xuICAgICAgICAvLyBXcmFwIHRoZSBpbm5lciBvdXRwdXQgaW4gdGhlIFN0YWtlYWJsZUxvY2tPdXQgd3JhcHBlci5cbiAgICAgICAgY29uc3QgbmV3TG9ja2VkT3V0cHV0OiBTdGFrZWFibGVMb2NrT3V0ID0gU2VsZWN0T3V0cHV0Q2xhc3MoXG4gICAgICAgICAgbG9ja2VkT3V0cHV0LmdldE91dHB1dElEKCksXG4gICAgICAgICAgb3V0cHV0QW1vdW50UmVtYWluaW5nLFxuICAgICAgICAgIG91dHB1dC5nZXRBZGRyZXNzZXMoKSxcbiAgICAgICAgICBvdXRwdXQuZ2V0TG9ja3RpbWUoKSxcbiAgICAgICAgICBvdXRwdXQuZ2V0VGhyZXNob2xkKCksXG4gICAgICAgICAgc3Rha2VhYmxlTG9ja3RpbWUsXG4gICAgICAgICAgbmV3IFBhcnNlYWJsZU91dHB1dChuZXdPdXRwdXQpLFxuICAgICAgICApIGFzIFN0YWtlYWJsZUxvY2tPdXQ7XG4gICAgICAgIGNvbnN0IHRyYW5zZmVyT3V0cHV0OiBUcmFuc2ZlcmFibGVPdXRwdXQgPSBuZXcgVHJhbnNmZXJhYmxlT3V0cHV0KGFzc2V0SUQsIG5ld0xvY2tlZE91dHB1dCk7XG4gICAgICAgIGFhZC5hZGRPdXRwdXQodHJhbnNmZXJPdXRwdXQpO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIHVubG9ja2VkQ2hhbmdlIGlzIHRoZSBhbW91bnQgb2YgdW5sb2NrZWQgY2hhbmdlIHRoYXQgc2hvdWxkIGJlIHJldHVybmVkXG4gICAgICAvLyB0byB0aGUgc2VuZGVyXG4gICAgICBjb25zdCB1bmxvY2tlZENoYW5nZTogQk4gPSBpc1N0YWtlYWJsZUxvY2tDaGFuZ2UgPyB6ZXJvLmNsb25lKCkgOiBjaGFuZ2U7XG4gICAgICBpZiAodW5sb2NrZWRDaGFuZ2UuZ3QoemVybykpIHtcbiAgICAgICAgY29uc3QgbmV3Q2hhbmdlT3V0cHV0OiBBbW91bnRPdXRwdXQgPSBuZXcgU0VDUFRyYW5zZmVyT3V0cHV0KFxuICAgICAgICAgIHVubG9ja2VkQ2hhbmdlLFxuICAgICAgICAgIGFhZC5nZXRDaGFuZ2VBZGRyZXNzZXMoKSxcbiAgICAgICAgICB6ZXJvLmNsb25lKCksIC8vIG1ha2Ugc3VyZSB0aGF0IHdlIGRvbid0IGxvY2sgdGhlIGNoYW5nZSBvdXRwdXQuXG4gICAgICAgICAgMSwgLy8gb25seSByZXF1aXJlIG9uZSBvZiB0aGUgY2hhbmdlcyBhZGRyZXNzZXMgdG8gc3BlbmQgdGhpcyBvdXRwdXQuXG4gICAgICAgICkgYXMgQW1vdW50T3V0cHV0O1xuICAgICAgICBjb25zdCB0cmFuc2Zlck91dHB1dDogVHJhbnNmZXJhYmxlT3V0cHV0ID0gbmV3IFRyYW5zZmVyYWJsZU91dHB1dChhc3NldElELCBuZXdDaGFuZ2VPdXRwdXQpO1xuICAgICAgICBhYWQuYWRkQ2hhbmdlKHRyYW5zZmVyT3V0cHV0KTtcbiAgICAgIH1cblxuICAgICAgLy8gdG90YWxBbW91bnRTcGVudCBpcyB0aGUgdG90YWwgYW1vdW50IG9mIHRva2VucyBjb25zdW1lZC5cbiAgICAgIGNvbnN0IHRvdGFsQW1vdW50U3BlbnQ6IEJOID0gYXNzZXRBbW91bnQuZ2V0U3BlbnQoKTtcbiAgICAgIC8vIHN0YWtlYWJsZUxvY2tlZEFtb3VudCBpcyB0aGUgdG90YWwgYW1vdW50IG9mIGxvY2tlZCB0b2tlbnMgY29uc3VtZWQuXG4gICAgICBjb25zdCBzdGFrZWFibGVMb2NrZWRBbW91bnQ6IEJOID0gYXNzZXRBbW91bnQuZ2V0U3Rha2VhYmxlTG9ja1NwZW50KCk7XG4gICAgICAvLyB0b3RhbFVubG9ja2VkU3BlbnQgaXMgdGhlIHRvdGFsIGFtb3VudCBvZiB1bmxvY2tlZCB0b2tlbnMgY29uc3VtZWQuXG4gICAgICBjb25zdCB0b3RhbFVubG9ja2VkU3BlbnQ6IEJOID0gdG90YWxBbW91bnRTcGVudC5zdWIoc3Rha2VhYmxlTG9ja2VkQW1vdW50KTtcbiAgICAgIC8vIGFtb3VudEJ1cm50IGlzIHRoZSBhbW91bnQgb2YgdW5sb2NrZWQgdG9rZW5zIHRoYXQgbXVzdCBiZSBidXJuLlxuICAgICAgY29uc3QgYW1vdW50QnVybnQ6IEJOID0gYXNzZXRBbW91bnQuZ2V0QnVybigpO1xuICAgICAgLy8gdG90YWxVbmxvY2tlZEF2YWlsYWJsZSBpcyB0aGUgdG90YWwgYW1vdW50IG9mIHVubG9ja2VkIHRva2VucyBhdmFpbGFibGVcbiAgICAgIC8vIHRvIGJlIHByb2R1Y2VkLlxuICAgICAgY29uc3QgdG90YWxVbmxvY2tlZEF2YWlsYWJsZTogQk4gPSB0b3RhbFVubG9ja2VkU3BlbnQuc3ViKGFtb3VudEJ1cm50KTtcbiAgICAgIC8vIHVubG9ja2VkQW1vdW50IGlzIHRoZSBhbW91bnQgb2YgdW5sb2NrZWQgdG9rZW5zIHRoYXQgc2hvdWxkIGJlIHNlbnQuXG4gICAgICBjb25zdCB1bmxvY2tlZEFtb3VudDogQk4gPSB0b3RhbFVubG9ja2VkQXZhaWxhYmxlLnN1Yih1bmxvY2tlZENoYW5nZSk7XG4gICAgICBpZiAodW5sb2NrZWRBbW91bnQuZ3QoemVybykpIHtcbiAgICAgICAgY29uc3QgbmV3T3V0cHV0OiBBbW91bnRPdXRwdXQgPSBuZXcgU0VDUFRyYW5zZmVyT3V0cHV0KFxuICAgICAgICAgIHVubG9ja2VkQW1vdW50LFxuICAgICAgICAgIGFhZC5nZXREZXN0aW5hdGlvbnMoKSxcbiAgICAgICAgICBsb2NrdGltZSxcbiAgICAgICAgICB0aHJlc2hvbGQsXG4gICAgICAgICkgYXMgQW1vdW50T3V0cHV0O1xuICAgICAgICBjb25zdCB0cmFuc2Zlck91dHB1dDogVHJhbnNmZXJhYmxlT3V0cHV0ID0gbmV3IFRyYW5zZmVyYWJsZU91dHB1dChhc3NldElELCBuZXdPdXRwdXQpO1xuICAgICAgICBhYWQuYWRkT3V0cHV0KHRyYW5zZmVyT3V0cHV0KTtcbiAgICAgIH1cbiAgICB9KVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhbiBbW1Vuc2lnbmVkVHhdXSB3cmFwcGluZyBhIFtbQmFzZVR4XV0uIEZvciBtb3JlIGdyYW51bGFyIGNvbnRyb2wsIHlvdSBtYXkgY3JlYXRlIHlvdXIgb3duXG4gICAqIFtbVW5zaWduZWRUeF1dIHdyYXBwaW5nIGEgW1tCYXNlVHhdXSBtYW51YWxseSAod2l0aCB0aGVpciBjb3JyZXNwb25kaW5nIFtbVHJhbnNmZXJhYmxlSW5wdXRdXXMgYW5kIFtbVHJhbnNmZXJhYmxlT3V0cHV0XV1zKS5cbiAgICpcbiAgICogQHBhcmFtIG5ldHdvcmtpZCBUaGUgbnVtYmVyIHJlcHJlc2VudGluZyBOZXR3b3JrSUQgb2YgdGhlIG5vZGVcbiAgICogQHBhcmFtIGJsb2NrY2hhaW5pZCBUaGUge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gcmVwcmVzZW50aW5nIHRoZSBCbG9ja2NoYWluSUQgZm9yIHRoZSB0cmFuc2FjdGlvblxuICAgKiBAcGFyYW0gYW1vdW50IFRoZSBhbW91bnQgb2YgdGhlIGFzc2V0IHRvIGJlIHNwZW50IGluIGl0cyBzbWFsbGVzdCBkZW5vbWluYXRpb24sIHJlcHJlc2VudGVkIGFzIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59LlxuICAgKiBAcGFyYW0gYXNzZXRJRCB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBvZiB0aGUgYXNzZXQgSUQgZm9yIHRoZSBVVFhPXG4gICAqIEBwYXJhbSB0b0FkZHJlc3NlcyBUaGUgYWRkcmVzc2VzIHRvIHNlbmQgdGhlIGZ1bmRzXG4gICAqIEBwYXJhbSBmcm9tQWRkcmVzc2VzIFRoZSBhZGRyZXNzZXMgYmVpbmcgdXNlZCB0byBzZW5kIHRoZSBmdW5kcyBmcm9tIHRoZSBVVFhPcyB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfVxuICAgKiBAcGFyYW0gY2hhbmdlQWRkcmVzc2VzIE9wdGlvbmFsLiBUaGUgYWRkcmVzc2VzIHRoYXQgY2FuIHNwZW5kIHRoZSBjaGFuZ2UgcmVtYWluaW5nIGZyb20gdGhlIHNwZW50IFVUWE9zLiBEZWZhdWx0OiB0b0FkZHJlc3Nlc1xuICAgKiBAcGFyYW0gZmVlIE9wdGlvbmFsLiBUaGUgYW1vdW50IG9mIGZlZXMgdG8gYnVybiBpbiBpdHMgc21hbGxlc3QgZGVub21pbmF0aW9uLCByZXByZXNlbnRlZCBhcyB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfVxuICAgKiBAcGFyYW0gZmVlQXNzZXRJRCBPcHRpb25hbC4gVGhlIGFzc2V0SUQgb2YgdGhlIGZlZXMgYmVpbmcgYnVybmVkLiBEZWZhdWx0OiBhc3NldElEXG4gICAqIEBwYXJhbSBtZW1vIE9wdGlvbmFsLiBDb250YWlucyBhcmJpdHJhcnkgZGF0YSwgdXAgdG8gMjU2IGJ5dGVzXG4gICAqIEBwYXJhbSBhc09mIE9wdGlvbmFsLiBUaGUgdGltZXN0YW1wIHRvIHZlcmlmeSB0aGUgdHJhbnNhY3Rpb24gYWdhaW5zdCBhcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59XG4gICAqIEBwYXJhbSBsb2NrdGltZSBPcHRpb25hbC4gVGhlIGxvY2t0aW1lIGZpZWxkIGNyZWF0ZWQgaW4gdGhlIHJlc3VsdGluZyBvdXRwdXRzXG4gICAqIEBwYXJhbSB0aHJlc2hvbGQgT3B0aW9uYWwuIFRoZSBudW1iZXIgb2Ygc2lnbmF0dXJlcyByZXF1aXJlZCB0byBzcGVuZCB0aGUgZnVuZHMgaW4gdGhlIHJlc3VsdGFudCBVVFhPXG4gICAqIFxuICAgKiBAcmV0dXJucyBBbiB1bnNpZ25lZCB0cmFuc2FjdGlvbiBjcmVhdGVkIGZyb20gdGhlIHBhc3NlZCBpbiBwYXJhbWV0ZXJzLlxuICAgKlxuICAgKi9cbiAgYnVpbGRCYXNlVHggPSAoXG4gICAgbmV0d29ya2lkOiBudW1iZXIsXG4gICAgYmxvY2tjaGFpbmlkOiBCdWZmZXIsXG4gICAgYW1vdW50OiBCTixcbiAgICBhc3NldElEOiBCdWZmZXIsXG4gICAgdG9BZGRyZXNzZXM6IEFycmF5PEJ1ZmZlcj4sXG4gICAgZnJvbUFkZHJlc3NlczogQXJyYXk8QnVmZmVyPixcbiAgICBjaGFuZ2VBZGRyZXNzZXM6IEFycmF5PEJ1ZmZlcj4gPSB1bmRlZmluZWQsXG4gICAgZmVlOiBCTiA9IHVuZGVmaW5lZCxcbiAgICBmZWVBc3NldElEOiBCdWZmZXIgPSB1bmRlZmluZWQsXG4gICAgbWVtbzogQnVmZmVyID0gdW5kZWZpbmVkLFxuICAgIGFzT2Y6IEJOID0gVW5peE5vdygpLFxuICAgIGxvY2t0aW1lOiBCTiA9IG5ldyBCTigwKSxcbiAgICB0aHJlc2hvbGQ6IG51bWJlciA9IDFcbiAgKTogVW5zaWduZWRUeCA9PiB7XG5cbiAgICBpZiAodGhyZXNob2xkID4gdG9BZGRyZXNzZXMubGVuZ3RoKSB7XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBFcnJvciAtIFVUWE9TZXQuYnVpbGRCYXNlVHg6IHRocmVzaG9sZCBpcyBncmVhdGVyIHRoYW4gbnVtYmVyIG9mIGFkZHJlc3Nlc2ApO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgY2hhbmdlQWRkcmVzc2VzID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBjaGFuZ2VBZGRyZXNzZXMgPSB0b0FkZHJlc3NlcztcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGZlZUFzc2V0SUQgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIGZlZUFzc2V0SUQgPSBhc3NldElEO1xuICAgIH1cblxuICAgIGNvbnN0IHplcm86IEJOID0gbmV3IEJOKDApO1xuXG4gICAgaWYgKGFtb3VudC5lcSh6ZXJvKSkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBjb25zdCBhYWQ6IEFzc2V0QW1vdW50RGVzdGluYXRpb24gPSBuZXcgQXNzZXRBbW91bnREZXN0aW5hdGlvbih0b0FkZHJlc3NlcywgZnJvbUFkZHJlc3NlcywgY2hhbmdlQWRkcmVzc2VzKTtcbiAgICBpZiAoYXNzZXRJRC50b1N0cmluZyhcImhleFwiKSA9PT0gZmVlQXNzZXRJRC50b1N0cmluZyhcImhleFwiKSkge1xuICAgICAgYWFkLmFkZEFzc2V0QW1vdW50KGFzc2V0SUQsIGFtb3VudCwgZmVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYWFkLmFkZEFzc2V0QW1vdW50KGFzc2V0SUQsIGFtb3VudCwgemVybyk7XG4gICAgICBpZiAodGhpcy5fZmVlQ2hlY2soZmVlLCBmZWVBc3NldElEKSkge1xuICAgICAgICBhYWQuYWRkQXNzZXRBbW91bnQoZmVlQXNzZXRJRCwgemVybywgZmVlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgaW5zOiBBcnJheTxUcmFuc2ZlcmFibGVJbnB1dD4gPSBbXTtcbiAgICBsZXQgb3V0czogQXJyYXk8VHJhbnNmZXJhYmxlT3V0cHV0PiA9IFtdO1xuXG4gICAgY29uc3QgbWluU3BlbmRhYmxlRXJyOiBFcnJvciA9IHRoaXMuZ2V0TWluaW11bVNwZW5kYWJsZShhYWQsIGFzT2YsIGxvY2t0aW1lLCB0aHJlc2hvbGQpO1xuICAgIGlmICh0eXBlb2YgbWluU3BlbmRhYmxlRXJyID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBpbnMgPSBhYWQuZ2V0SW5wdXRzKCk7XG4gICAgICBvdXRzID0gYWFkLmdldEFsbE91dHB1dHMoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbWluU3BlbmRhYmxlRXJyO1xuICAgIH1cblxuICAgIGNvbnN0IGJhc2VUeDogQmFzZVR4ID0gbmV3IEJhc2VUeChuZXR3b3JraWQsIGJsb2NrY2hhaW5pZCwgb3V0cywgaW5zLCBtZW1vKTtcbiAgICByZXR1cm4gbmV3IFVuc2lnbmVkVHgoYmFzZVR4KTtcblxuICB9O1xuXG4gIC8qKlxuICAgICogQ3JlYXRlcyBhbiB1bnNpZ25lZCBJbXBvcnRUeCB0cmFuc2FjdGlvbi5cbiAgICAqXG4gICAgKiBAcGFyYW0gbmV0d29ya2lkIFRoZSBudW1iZXIgcmVwcmVzZW50aW5nIE5ldHdvcmtJRCBvZiB0aGUgbm9kZVxuICAgICogQHBhcmFtIGJsb2NrY2hhaW5pZCBUaGUge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gcmVwcmVzZW50aW5nIHRoZSBCbG9ja2NoYWluSUQgZm9yIHRoZSB0cmFuc2FjdGlvblxuICAgICogQHBhcmFtIHRvQWRkcmVzc2VzIFRoZSBhZGRyZXNzZXMgdG8gc2VuZCB0aGUgZnVuZHNcbiAgICAqIEBwYXJhbSBmcm9tQWRkcmVzc2VzIFRoZSBhZGRyZXNzZXMgYmVpbmcgdXNlZCB0byBzZW5kIHRoZSBmdW5kcyBmcm9tIHRoZSBVVFhPcyB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfVxuICAgICogQHBhcmFtIGNoYW5nZUFkZHJlc3NlcyBPcHRpb25hbC4gVGhlIGFkZHJlc3NlcyB0aGF0IGNhbiBzcGVuZCB0aGUgY2hhbmdlIHJlbWFpbmluZyBmcm9tIHRoZSBzcGVudCBVVFhPcy4gRGVmYXVsdDogdG9BZGRyZXNzZXNcbiAgICAqIEBwYXJhbSBpbXBvcnRJbnMgQW4gYXJyYXkgb2YgW1tUcmFuc2ZlcmFibGVJbnB1dF1dcyBiZWluZyBpbXBvcnRlZFxuICAgICogQHBhcmFtIHNvdXJjZUNoYWluIEEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gZm9yIHRoZSBjaGFpbmlkIHdoZXJlIHRoZSBpbXBvcnRzIGFyZSBjb21pbmcgZnJvbS5cbiAgICAqIEBwYXJhbSBmZWUgT3B0aW9uYWwuIFRoZSBhbW91bnQgb2YgZmVlcyB0byBidXJuIGluIGl0cyBzbWFsbGVzdCBkZW5vbWluYXRpb24sIHJlcHJlc2VudGVkIGFzIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59LiBGZWUgd2lsbCBjb21lIGZyb20gdGhlIGlucHV0cyBmaXJzdCwgaWYgdGhleSBjYW4uXG4gICAgKiBAcGFyYW0gZmVlQXNzZXRJRCBPcHRpb25hbC4gVGhlIGFzc2V0SUQgb2YgdGhlIGZlZXMgYmVpbmcgYnVybmVkLiBcbiAgICAqIEBwYXJhbSBtZW1vIE9wdGlvbmFsIGNvbnRhaW5zIGFyYml0cmFyeSBieXRlcywgdXAgdG8gMjU2IGJ5dGVzXG4gICAgKiBAcGFyYW0gYXNPZiBPcHRpb25hbC4gVGhlIHRpbWVzdGFtcCB0byB2ZXJpZnkgdGhlIHRyYW5zYWN0aW9uIGFnYWluc3QgYXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfVxuICAgICogQHBhcmFtIGxvY2t0aW1lIE9wdGlvbmFsLiBUaGUgbG9ja3RpbWUgZmllbGQgY3JlYXRlZCBpbiB0aGUgcmVzdWx0aW5nIG91dHB1dHNcbiAgICAqIEBwYXJhbSB0aHJlc2hvbGQgT3B0aW9uYWwuIFRoZSBudW1iZXIgb2Ygc2lnbmF0dXJlcyByZXF1aXJlZCB0byBzcGVuZCB0aGUgZnVuZHMgaW4gdGhlIHJlc3VsdGFudCBVVFhPXG4gICAgKiBAcmV0dXJucyBBbiB1bnNpZ25lZCB0cmFuc2FjdGlvbiBjcmVhdGVkIGZyb20gdGhlIHBhc3NlZCBpbiBwYXJhbWV0ZXJzLlxuICAgICpcbiAgICAqL1xuICBidWlsZEltcG9ydFR4ID0gKFxuICAgIG5ldHdvcmtpZDogbnVtYmVyLFxuICAgIGJsb2NrY2hhaW5pZDogQnVmZmVyLFxuICAgIHRvQWRkcmVzc2VzOiBBcnJheTxCdWZmZXI+LFxuICAgIGZyb21BZGRyZXNzZXM6IEFycmF5PEJ1ZmZlcj4sXG4gICAgY2hhbmdlQWRkcmVzc2VzOiBBcnJheTxCdWZmZXI+LFxuICAgIGF0b21pY3M6IEFycmF5PFVUWE8+LFxuICAgIHNvdXJjZUNoYWluOiBCdWZmZXIgPSB1bmRlZmluZWQsXG4gICAgZmVlOiBCTiA9IHVuZGVmaW5lZCxcbiAgICBmZWVBc3NldElEOiBCdWZmZXIgPSB1bmRlZmluZWQsXG4gICAgbWVtbzogQnVmZmVyID0gdW5kZWZpbmVkLFxuICAgIGFzT2Y6IEJOID0gVW5peE5vdygpLFxuICAgIGxvY2t0aW1lOiBCTiA9IG5ldyBCTigwKSxcbiAgICB0aHJlc2hvbGQ6IG51bWJlciA9IDFcbiAgKTogVW5zaWduZWRUeCA9PiB7XG4gICAgY29uc3QgemVybzogQk4gPSBuZXcgQk4oMCk7XG4gICAgbGV0IGluczogQXJyYXk8VHJhbnNmZXJhYmxlSW5wdXQ+ID0gW107XG4gICAgbGV0IG91dHM6IEFycmF5PFRyYW5zZmVyYWJsZU91dHB1dD4gPSBbXTtcbiAgICBpZiAodHlwZW9mIGZlZSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgZmVlID0gemVyby5jbG9uZSgpO1xuICAgIH1cblxuICAgIGNvbnN0IGltcG9ydEluczogQXJyYXk8VHJhbnNmZXJhYmxlSW5wdXQ+ID0gW107XG4gICAgbGV0IGZlZXBhaWQ6IEJOID0gbmV3IEJOKDApO1xuICAgIGxldCBmZWVBc3NldFN0cjogc3RyaW5nID0gZmVlQXNzZXRJRC50b1N0cmluZyhcImhleFwiKTtcbiAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgYXRvbWljcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgdXR4bzogVVRYTyA9IGF0b21pY3NbaV07XG4gICAgICBjb25zdCBhc3NldElEOiBCdWZmZXIgPSB1dHhvLmdldEFzc2V0SUQoKTtcbiAgICAgIGNvbnN0IG91dHB1dDogQW1vdW50T3V0cHV0ID0gdXR4by5nZXRPdXRwdXQoKSBhcyBBbW91bnRPdXRwdXQ7XG4gICAgICBsZXQgYW10OiBCTiA9IG91dHB1dC5nZXRBbW91bnQoKS5jbG9uZSgpO1xuXG4gICAgICBsZXQgaW5mZWVhbW91bnQgPSBhbXQuY2xvbmUoKTtcbiAgICAgIGxldCBhc3NldFN0cjogc3RyaW5nID0gYXNzZXRJRC50b1N0cmluZyhcImhleFwiKTtcbiAgICAgIGlmIChcbiAgICAgICAgdHlwZW9mIGZlZUFzc2V0SUQgIT09IFwidW5kZWZpbmVkXCIgJiZcbiAgICAgICAgZmVlLmd0KHplcm8pICYmXG4gICAgICAgIGZlZXBhaWQubHQoZmVlKSAmJlxuICAgICAgICBhc3NldFN0ciA9PT0gZmVlQXNzZXRTdHJcbiAgICAgICkge1xuICAgICAgICBmZWVwYWlkID0gZmVlcGFpZC5hZGQoaW5mZWVhbW91bnQpO1xuICAgICAgICBpZiAoZmVlcGFpZC5ndGUoZmVlKSkge1xuICAgICAgICAgIGluZmVlYW1vdW50ID0gZmVlcGFpZC5zdWIoZmVlKTtcbiAgICAgICAgICBmZWVwYWlkID0gZmVlLmNsb25lKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaW5mZWVhbW91bnQgPSB6ZXJvLmNsb25lKCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY29uc3QgdHhpZDogQnVmZmVyID0gdXR4by5nZXRUeElEKCk7XG4gICAgICBjb25zdCBvdXRwdXRpZHg6IEJ1ZmZlciA9IHV0eG8uZ2V0T3V0cHV0SWR4KCk7XG4gICAgICBjb25zdCBpbnB1dDogU0VDUFRyYW5zZmVySW5wdXQgPSBuZXcgU0VDUFRyYW5zZmVySW5wdXQoYW10KTtcbiAgICAgIGNvbnN0IHhmZXJpbjogVHJhbnNmZXJhYmxlSW5wdXQgPSBuZXcgVHJhbnNmZXJhYmxlSW5wdXQodHhpZCwgb3V0cHV0aWR4LCBhc3NldElELCBpbnB1dCk7XG4gICAgICBjb25zdCBmcm9tOiBBcnJheTxCdWZmZXI+ID0gb3V0cHV0LmdldEFkZHJlc3NlcygpO1xuICAgICAgY29uc3Qgc3BlbmRlcnM6IEFycmF5PEJ1ZmZlcj4gPSBvdXRwdXQuZ2V0U3BlbmRlcnMoZnJvbSwgYXNPZik7XG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHNwZW5kZXJzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIGNvbnN0IGlkeDogbnVtYmVyID0gb3V0cHV0LmdldEFkZHJlc3NJZHgoc3BlbmRlcnNbal0pO1xuICAgICAgICBpZiAoaWR4ID09PSAtMSkge1xuICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFcnJvciAtIFVUWE9TZXQuYnVpbGRJbXBvcnRUeDogbm8gc3VjaCAnXG4gICAgICAgICAgICArIGBhZGRyZXNzIGluIG91dHB1dDogJHtzcGVuZGVyc1tqXX1gKTtcbiAgICAgICAgfVxuICAgICAgICB4ZmVyaW4uZ2V0SW5wdXQoKS5hZGRTaWduYXR1cmVJZHgoaWR4LCBzcGVuZGVyc1tqXSk7XG4gICAgICB9XG4gICAgICBpbXBvcnRJbnMucHVzaCh4ZmVyaW4pO1xuICAgICAgLy9hZGQgZXh0cmEgb3V0cHV0cyBmb3IgZWFjaCBhbW91bnQgKGNhbGN1bGF0ZWQgZnJvbSB0aGUgaW1wb3J0ZWQgaW5wdXRzKSwgbWludXMgZmVlc1xuICAgICAgaWYgKGluZmVlYW1vdW50Lmd0KHplcm8pKSB7XG4gICAgICAgIGNvbnN0IHNwZW5kb3V0OiBBbW91bnRPdXRwdXQgPSBTZWxlY3RPdXRwdXRDbGFzcyhvdXRwdXQuZ2V0T3V0cHV0SUQoKSxcbiAgICAgICAgICBpbmZlZWFtb3VudCwgdG9BZGRyZXNzZXMsIGxvY2t0aW1lLCB0aHJlc2hvbGQpIGFzIEFtb3VudE91dHB1dDtcbiAgICAgICAgY29uc3QgeGZlcm91dDogVHJhbnNmZXJhYmxlT3V0cHV0ID0gbmV3IFRyYW5zZmVyYWJsZU91dHB1dChhc3NldElELCBzcGVuZG91dCk7XG4gICAgICAgIG91dHMucHVzaCh4ZmVyb3V0KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBnZXQgcmVtYWluaW5nIGZlZXMgZnJvbSB0aGUgcHJvdmlkZWQgYWRkcmVzc2VzXG4gICAgbGV0IGZlZVJlbWFpbmluZzogQk4gPSBmZWUuc3ViKGZlZXBhaWQpO1xuICAgIGlmIChmZWVSZW1haW5pbmcuZ3QoemVybykgJiYgdGhpcy5fZmVlQ2hlY2soZmVlUmVtYWluaW5nLCBmZWVBc3NldElEKSkge1xuICAgICAgY29uc3QgYWFkOiBBc3NldEFtb3VudERlc3RpbmF0aW9uID0gbmV3IEFzc2V0QW1vdW50RGVzdGluYXRpb24odG9BZGRyZXNzZXMsIGZyb21BZGRyZXNzZXMsIGNoYW5nZUFkZHJlc3Nlcyk7XG4gICAgICBhYWQuYWRkQXNzZXRBbW91bnQoZmVlQXNzZXRJRCwgemVybywgZmVlUmVtYWluaW5nKTtcbiAgICAgIGNvbnN0IG1pblNwZW5kYWJsZUVycjogRXJyb3IgPSB0aGlzLmdldE1pbmltdW1TcGVuZGFibGUoYWFkLCBhc09mLCBsb2NrdGltZSwgdGhyZXNob2xkKTtcbiAgICAgIGlmICh0eXBlb2YgbWluU3BlbmRhYmxlRXJyID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIGlucyA9IGFhZC5nZXRJbnB1dHMoKTtcbiAgICAgICAgb3V0cyA9IGFhZC5nZXRBbGxPdXRwdXRzKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBtaW5TcGVuZGFibGVFcnI7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgaW1wb3J0VHg6IEltcG9ydFR4ID0gbmV3IEltcG9ydFR4KG5ldHdvcmtpZCwgYmxvY2tjaGFpbmlkLCBvdXRzLCBpbnMsIG1lbW8sIHNvdXJjZUNoYWluLCBpbXBvcnRJbnMpO1xuICAgIHJldHVybiBuZXcgVW5zaWduZWRUeChpbXBvcnRUeCk7XG4gIH07XG5cbiAgLyoqXG4gICAgKiBDcmVhdGVzIGFuIHVuc2lnbmVkIEV4cG9ydFR4IHRyYW5zYWN0aW9uLiBcbiAgICAqXG4gICAgKiBAcGFyYW0gbmV0d29ya2lkIFRoZSBudW1iZXIgcmVwcmVzZW50aW5nIE5ldHdvcmtJRCBvZiB0aGUgbm9kZVxuICAgICogQHBhcmFtIGJsb2NrY2hhaW5pZCBUaGUge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gcmVwcmVzZW50aW5nIHRoZSBCbG9ja2NoYWluSUQgZm9yIHRoZSB0cmFuc2FjdGlvblxuICAgICogQHBhcmFtIGFtb3VudCBUaGUgYW1vdW50IGJlaW5nIGV4cG9ydGVkIGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgICAqIEBwYXJhbSBhdmF4QXNzZXRJRCB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBvZiB0aGUgYXNzZXQgSUQgZm9yIEFWQVhcbiAgICAqIEBwYXJhbSB0b0FkZHJlc3NlcyBBbiBhcnJheSBvZiBhZGRyZXNzZXMgYXMge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gd2hvIHJlY2lldmVzIHRoZSBBVkFYXG4gICAgKiBAcGFyYW0gZnJvbUFkZHJlc3NlcyBBbiBhcnJheSBvZiBhZGRyZXNzZXMgYXMge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gd2hvIG93bnMgdGhlIEFWQVhcbiAgICAqIEBwYXJhbSBjaGFuZ2VBZGRyZXNzZXMgQW4gYXJyYXkgb2YgYWRkcmVzc2VzIGFzIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHdobyBnZXRzIHRoZSBjaGFuZ2UgbGVmdG92ZXIgb2YgdGhlIEFWQVhcbiAgICAqIEBwYXJhbSBkZXN0aW5hdGlvbkNoYWluIE9wdGlvbmFsLiBBIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IGZvciB0aGUgY2hhaW5pZCB3aGVyZSB0byBzZW5kIHRoZSBhc3NldC5cbiAgICAqIEBwYXJhbSBmZWUgT3B0aW9uYWwuIFRoZSBhbW91bnQgb2YgZmVlcyB0byBidXJuIGluIGl0cyBzbWFsbGVzdCBkZW5vbWluYXRpb24sIHJlcHJlc2VudGVkIGFzIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59XG4gICAgKiBAcGFyYW0gZmVlQXNzZXRJRCBPcHRpb25hbC4gVGhlIGFzc2V0SUQgb2YgdGhlIGZlZXMgYmVpbmcgYnVybmVkLiBcbiAgICAqIEBwYXJhbSBtZW1vIE9wdGlvbmFsIGNvbnRhaW5zIGFyYml0cmFyeSBieXRlcywgdXAgdG8gMjU2IGJ5dGVzXG4gICAgKiBAcGFyYW0gYXNPZiBPcHRpb25hbC4gVGhlIHRpbWVzdGFtcCB0byB2ZXJpZnkgdGhlIHRyYW5zYWN0aW9uIGFnYWluc3QgYXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfVxuICAgICogQHBhcmFtIGxvY2t0aW1lIE9wdGlvbmFsLiBUaGUgbG9ja3RpbWUgZmllbGQgY3JlYXRlZCBpbiB0aGUgcmVzdWx0aW5nIG91dHB1dHNcbiAgICAqIEBwYXJhbSB0aHJlc2hvbGQgT3B0aW9uYWwuIFRoZSBudW1iZXIgb2Ygc2lnbmF0dXJlcyByZXF1aXJlZCB0byBzcGVuZCB0aGUgZnVuZHMgaW4gdGhlIHJlc3VsdGFudCBVVFhPXG4gICAgKiBcbiAgICAqIEByZXR1cm5zIEFuIHVuc2lnbmVkIHRyYW5zYWN0aW9uIGNyZWF0ZWQgZnJvbSB0aGUgcGFzc2VkIGluIHBhcmFtZXRlcnMuXG4gICAgKlxuICAgICovXG4gIGJ1aWxkRXhwb3J0VHggPSAoXG4gICAgbmV0d29ya2lkOiBudW1iZXIsXG4gICAgYmxvY2tjaGFpbmlkOiBCdWZmZXIsXG4gICAgYW1vdW50OiBCTixcbiAgICBhdmF4QXNzZXRJRDogQnVmZmVyLCAvLyBUT0RPOiByZW5hbWUgdGhpcyB0byBhbW91bnRBc3NldElEXG4gICAgdG9BZGRyZXNzZXM6IEFycmF5PEJ1ZmZlcj4sXG4gICAgZnJvbUFkZHJlc3NlczogQXJyYXk8QnVmZmVyPixcbiAgICBjaGFuZ2VBZGRyZXNzZXM6IEFycmF5PEJ1ZmZlcj4gPSB1bmRlZmluZWQsXG4gICAgZGVzdGluYXRpb25DaGFpbjogQnVmZmVyID0gdW5kZWZpbmVkLFxuICAgIGZlZTogQk4gPSB1bmRlZmluZWQsXG4gICAgZmVlQXNzZXRJRDogQnVmZmVyID0gdW5kZWZpbmVkLFxuICAgIG1lbW86IEJ1ZmZlciA9IHVuZGVmaW5lZCxcbiAgICBhc09mOiBCTiA9IFVuaXhOb3coKSxcbiAgICBsb2NrdGltZTogQk4gPSBuZXcgQk4oMCksXG4gICAgdGhyZXNob2xkOiBudW1iZXIgPSAxLFxuICApOiBVbnNpZ25lZFR4ID0+IHtcbiAgICBsZXQgaW5zOiBBcnJheTxUcmFuc2ZlcmFibGVJbnB1dD4gPSBbXTtcbiAgICBsZXQgb3V0czogQXJyYXk8VHJhbnNmZXJhYmxlT3V0cHV0PiA9IFtdO1xuICAgIGxldCBleHBvcnRvdXRzOiBBcnJheTxUcmFuc2ZlcmFibGVPdXRwdXQ+ID0gW107XG5cbiAgICBpZiAodHlwZW9mIGNoYW5nZUFkZHJlc3NlcyA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgY2hhbmdlQWRkcmVzc2VzID0gdG9BZGRyZXNzZXM7XG4gICAgfVxuXG4gICAgY29uc3QgemVybzogQk4gPSBuZXcgQk4oMCk7XG5cbiAgICBpZiAoYW1vdW50LmVxKHplcm8pKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgZmVlQXNzZXRJRCA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgZmVlQXNzZXRJRCA9IGF2YXhBc3NldElEO1xuICAgIH0gZWxzZSBpZiAoZmVlQXNzZXRJRC50b1N0cmluZyhcImhleFwiKSAhPT0gYXZheEFzc2V0SUQudG9TdHJpbmcoXCJoZXhcIikpIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Vycm9yIC0gVVRYT1NldC5idWlsZEV4cG9ydFR4OiAnXG4gICAgICAgICsgYGZlZUFzc2V0SUQgbXVzdCBtYXRjaCBhdmF4QXNzZXRJRGApO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgZGVzdGluYXRpb25DaGFpbiA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgZGVzdGluYXRpb25DaGFpbiA9IGJpbnRvb2xzLmNiNThEZWNvZGUoRGVmYXVsdHMubmV0d29ya1tuZXR3b3JraWRdLlhbXCJibG9ja2NoYWluSURcIl0pO1xuICAgIH1cblxuICAgIGNvbnN0IGFhZDogQXNzZXRBbW91bnREZXN0aW5hdGlvbiA9IG5ldyBBc3NldEFtb3VudERlc3RpbmF0aW9uKHRvQWRkcmVzc2VzLCBmcm9tQWRkcmVzc2VzLCBjaGFuZ2VBZGRyZXNzZXMpO1xuICAgIGlmIChhdmF4QXNzZXRJRC50b1N0cmluZyhcImhleFwiKSA9PT0gZmVlQXNzZXRJRC50b1N0cmluZyhcImhleFwiKSkge1xuICAgICAgYWFkLmFkZEFzc2V0QW1vdW50KGF2YXhBc3NldElELCBhbW91bnQsIGZlZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFhZC5hZGRBc3NldEFtb3VudChhdmF4QXNzZXRJRCwgYW1vdW50LCB6ZXJvKTtcbiAgICAgIGlmICh0aGlzLl9mZWVDaGVjayhmZWUsIGZlZUFzc2V0SUQpKSB7XG4gICAgICAgIGFhZC5hZGRBc3NldEFtb3VudChmZWVBc3NldElELCB6ZXJvLCBmZWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IG1pblNwZW5kYWJsZUVycjogRXJyb3IgPSB0aGlzLmdldE1pbmltdW1TcGVuZGFibGUoYWFkLCBhc09mLCBsb2NrdGltZSwgdGhyZXNob2xkKTtcbiAgICBpZiAodHlwZW9mIG1pblNwZW5kYWJsZUVyciA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgaW5zID0gYWFkLmdldElucHV0cygpO1xuICAgICAgb3V0cyA9IGFhZC5nZXRDaGFuZ2VPdXRwdXRzKCk7XG4gICAgICBleHBvcnRvdXRzID0gYWFkLmdldE91dHB1dHMoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbWluU3BlbmRhYmxlRXJyO1xuICAgIH1cblxuICAgIGNvbnN0IGV4cG9ydFR4OiBFeHBvcnRUeCA9IG5ldyBFeHBvcnRUeChuZXR3b3JraWQsIGJsb2NrY2hhaW5pZCwgb3V0cywgaW5zLCBtZW1vLCBkZXN0aW5hdGlvbkNoYWluLCBleHBvcnRvdXRzKTtcblxuICAgIHJldHVybiBuZXcgVW5zaWduZWRUeChleHBvcnRUeCk7XG4gIH07XG5cblxuICAvKipcbiAgKiBDbGFzcyByZXByZXNlbnRpbmcgYW4gdW5zaWduZWQgW1tBZGRTdWJuZXRWYWxpZGF0b3JUeF1dIHRyYW5zYWN0aW9uLlxuICAqXG4gICogQHBhcmFtIG5ldHdvcmtpZCBOZXR3b3JraWQsIFtbRGVmYXVsdE5ldHdvcmtJRF1dXG4gICogQHBhcmFtIGJsb2NrY2hhaW5pZCBCbG9ja2NoYWluaWQsIGRlZmF1bHQgdW5kZWZpbmVkXG4gICogQHBhcmFtIGZyb21BZGRyZXNzZXMgQW4gYXJyYXkgb2YgYWRkcmVzc2VzIGFzIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHdobyBwYXlzIHRoZSBmZWVzIGluIEFWQVhcbiAgKiBAcGFyYW0gY2hhbmdlQWRkcmVzc2VzIEFuIGFycmF5IG9mIGFkZHJlc3NlcyBhcyB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSB3aG8gZ2V0cyB0aGUgY2hhbmdlIGxlZnRvdmVyIGZyb20gdGhlIGZlZSBwYXltZW50XG4gICogQHBhcmFtIG5vZGVJRCBUaGUgbm9kZSBJRCBvZiB0aGUgdmFsaWRhdG9yIGJlaW5nIGFkZGVkLlxuICAqIEBwYXJhbSBzdGFydFRpbWUgVGhlIFVuaXggdGltZSB3aGVuIHRoZSB2YWxpZGF0b3Igc3RhcnRzIHZhbGlkYXRpbmcgdGhlIFByaW1hcnkgTmV0d29yay5cbiAgKiBAcGFyYW0gZW5kVGltZSBUaGUgVW5peCB0aW1lIHdoZW4gdGhlIHZhbGlkYXRvciBzdG9wcyB2YWxpZGF0aW5nIHRoZSBQcmltYXJ5IE5ldHdvcmsgKGFuZCBzdGFrZWQgQVZBWCBpcyByZXR1cm5lZCkuXG4gICogQHBhcmFtIHdlaWdodCBUaGUgYW1vdW50IG9mIHdlaWdodCBmb3IgdGhpcyBzdWJuZXQgdmFsaWRhdG9yLlxuICAqIEBwYXJhbSBmZWUgT3B0aW9uYWwuIFRoZSBhbW91bnQgb2YgZmVlcyB0byBidXJuIGluIGl0cyBzbWFsbGVzdCBkZW5vbWluYXRpb24sIHJlcHJlc2VudGVkIGFzIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59XG4gICogQHBhcmFtIGZlZUFzc2V0SUQgT3B0aW9uYWwuIFRoZSBhc3NldElEIG9mIHRoZSBmZWVzIGJlaW5nIGJ1cm5lZC4gXG4gICogQHBhcmFtIG1lbW8gT3B0aW9uYWwgY29udGFpbnMgYXJiaXRyYXJ5IGJ5dGVzLCB1cCB0byAyNTYgYnl0ZXNcbiAgKiBAcGFyYW0gYXNPZiBPcHRpb25hbC4gVGhlIHRpbWVzdGFtcCB0byB2ZXJpZnkgdGhlIHRyYW5zYWN0aW9uIGFnYWluc3QgYXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfVxuICAqIEBwYXJhbSBsb2NrdGltZSBPcHRpb25hbC4gVGhlIGxvY2t0aW1lIGZpZWxkIGNyZWF0ZWQgaW4gdGhlIHJlc3VsdGluZyBvdXRwdXRzXG4gICogQHBhcmFtIHRocmVzaG9sZCBPcHRpb25hbC4gVGhlIG51bWJlciBvZiBzaWduYXR1cmVzIHJlcXVpcmVkIHRvIHNwZW5kIHRoZSBmdW5kcyBpbiB0aGUgcmVzdWx0YW50IFVUWE9cbiAgKiBcbiAgKiBAcmV0dXJucyBBbiB1bnNpZ25lZCB0cmFuc2FjdGlvbiBjcmVhdGVkIGZyb20gdGhlIHBhc3NlZCBpbiBwYXJhbWV0ZXJzLlxuICAqL1xuXG4gIC8qIG11c3QgaW1wbGVtZW50IGxhdGVyIG9uY2UgdGhlIHRyYW5zYWN0aW9uIGZvcm1hdCBzaWduaW5nIHByb2Nlc3MgaXMgY2xlYXJlclxuICBidWlsZEFkZFN1Ym5ldFZhbGlkYXRvclR4ID0gKFxuICAgIG5ldHdvcmtpZDpudW1iZXIgPSBEZWZhdWx0TmV0d29ya0lELCBcbiAgICBibG9ja2NoYWluaWQ6QnVmZmVyLFxuICAgIGZyb21BZGRyZXNzZXM6QXJyYXk8QnVmZmVyPixcbiAgICBjaGFuZ2VBZGRyZXNzZXM6QXJyYXk8QnVmZmVyPixcbiAgICBub2RlSUQ6QnVmZmVyLCBcbiAgICBzdGFydFRpbWU6Qk4sIFxuICAgIGVuZFRpbWU6Qk4sXG4gICAgd2VpZ2h0OkJOLFxuICAgIGZlZTpCTiA9IHVuZGVmaW5lZCxcbiAgICBmZWVBc3NldElEOkJ1ZmZlciA9IHVuZGVmaW5lZCwgXG4gICAgbWVtbzpCdWZmZXIgPSB1bmRlZmluZWQsIFxuICAgIGFzT2Y6Qk4gPSBVbml4Tm93KClcbiAgKTpVbnNpZ25lZFR4ID0+IHtcbiAgICBsZXQgaW5zOkFycmF5PFRyYW5zZmVyYWJsZUlucHV0PiA9IFtdO1xuICAgIGxldCBvdXRzOkFycmF5PFRyYW5zZmVyYWJsZU91dHB1dD4gPSBbXTtcbiAgICAvL2xldCBzdGFrZU91dHM6QXJyYXk8VHJhbnNmZXJhYmxlT3V0cHV0PiA9IFtdO1xuICAgIFxuICAgIGNvbnN0IHplcm86Qk4gPSBuZXcgQk4oMCk7XG4gICAgY29uc3Qgbm93OkJOID0gVW5peE5vdygpO1xuICAgIGlmIChzdGFydFRpbWUubHQobm93KSB8fCBlbmRUaW1lLmx0ZShzdGFydFRpbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVVFhPU2V0LmJ1aWxkQWRkU3VibmV0VmFsaWRhdG9yVHggLS0gc3RhcnRUaW1lIG11c3QgYmUgaW4gdGhlIGZ1dHVyZSBhbmQgZW5kVGltZSBtdXN0IGNvbWUgYWZ0ZXIgc3RhcnRUaW1lXCIpO1xuICAgIH1cbiAgIFxuICAgIC8vIE5vdCBpbXBsZW1lbnRlZDogRmVlcyBjYW4gYmUgcGFpZCBmcm9tIGltcG9ydEluc1xuICAgIGlmKHRoaXMuX2ZlZUNoZWNrKGZlZSwgZmVlQXNzZXRJRCkpIHtcbiAgICAgIGNvbnN0IGFhZDpBc3NldEFtb3VudERlc3RpbmF0aW9uID0gbmV3IEFzc2V0QW1vdW50RGVzdGluYXRpb24oZnJvbUFkZHJlc3NlcywgZnJvbUFkZHJlc3NlcywgY2hhbmdlQWRkcmVzc2VzKTtcbiAgICAgIGFhZC5hZGRBc3NldEFtb3VudChmZWVBc3NldElELCB6ZXJvLCBmZWUpO1xuICAgICAgY29uc3Qgc3VjY2VzczpFcnJvciA9IHRoaXMuZ2V0TWluaW11bVNwZW5kYWJsZShhYWQsIGFzT2YpO1xuICAgICAgaWYodHlwZW9mIHN1Y2Nlc3MgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgaW5zID0gYWFkLmdldElucHV0cygpO1xuICAgICAgICBvdXRzID0gYWFkLmdldEFsbE91dHB1dHMoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IHN1Y2Nlc3M7XG4gICAgICB9XG4gICAgfVxuICAgXG4gICAgY29uc3QgVVR4OkFkZFN1Ym5ldFZhbGlkYXRvclR4ID0gbmV3IEFkZFN1Ym5ldFZhbGlkYXRvclR4KG5ldHdvcmtpZCwgYmxvY2tjaGFpbmlkLCBvdXRzLCBpbnMsIG1lbW8sIG5vZGVJRCwgc3RhcnRUaW1lLCBlbmRUaW1lLCB3ZWlnaHQpO1xuICAgIHJldHVybiBuZXcgVW5zaWduZWRUeChVVHgpO1xuICB9XG4gICovXG5cbiAgLyoqXG4gICogQ2xhc3MgcmVwcmVzZW50aW5nIGFuIHVuc2lnbmVkIFtbQWRkRGVsZWdhdG9yVHhdXSB0cmFuc2FjdGlvbi5cbiAgKlxuICAqIEBwYXJhbSBuZXR3b3JraWQgTmV0d29ya2lkLCBbW0RlZmF1bHROZXR3b3JrSURdXVxuICAqIEBwYXJhbSBibG9ja2NoYWluaWQgQmxvY2tjaGFpbmlkLCBkZWZhdWx0IHVuZGVmaW5lZFxuICAqIEBwYXJhbSBhdmF4QXNzZXRJRCB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBvZiB0aGUgYXNzZXQgSUQgZm9yIEFWQVhcbiAgKiBAcGFyYW0gdG9BZGRyZXNzZXMgQW4gYXJyYXkgb2YgYWRkcmVzc2VzIGFzIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHJlY2lldmVzIHRoZSBzdGFrZSBhdCB0aGUgZW5kIG9mIHRoZSBzdGFraW5nIHBlcmlvZFxuICAqIEBwYXJhbSBmcm9tQWRkcmVzc2VzIEFuIGFycmF5IG9mIGFkZHJlc3NlcyBhcyB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSB3aG8gcGF5cyB0aGUgZmVlcyBhbmQgdGhlIHN0YWtlXG4gICogQHBhcmFtIGNoYW5nZUFkZHJlc3NlcyBBbiBhcnJheSBvZiBhZGRyZXNzZXMgYXMge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gd2hvIGdldHMgdGhlIGNoYW5nZSBsZWZ0b3ZlciBmcm9tIHRoZSBzdGFraW5nIHBheW1lbnRcbiAgKiBAcGFyYW0gbm9kZUlEIFRoZSBub2RlIElEIG9mIHRoZSB2YWxpZGF0b3IgYmVpbmcgYWRkZWQuXG4gICogQHBhcmFtIHN0YXJ0VGltZSBUaGUgVW5peCB0aW1lIHdoZW4gdGhlIHZhbGlkYXRvciBzdGFydHMgdmFsaWRhdGluZyB0aGUgUHJpbWFyeSBOZXR3b3JrLlxuICAqIEBwYXJhbSBlbmRUaW1lIFRoZSBVbml4IHRpbWUgd2hlbiB0aGUgdmFsaWRhdG9yIHN0b3BzIHZhbGlkYXRpbmcgdGhlIFByaW1hcnkgTmV0d29yayAoYW5kIHN0YWtlZCBBVkFYIGlzIHJldHVybmVkKS5cbiAgKiBAcGFyYW0gc3Rha2VBbW91bnQgQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfSBmb3IgdGhlIGFtb3VudCBvZiBzdGFrZSB0byBiZSBkZWxlZ2F0ZWQgaW4gbkFWQVguXG4gICogQHBhcmFtIHJld2FyZExvY2t0aW1lIFRoZSBsb2NrdGltZSBmaWVsZCBjcmVhdGVkIGluIHRoZSByZXN1bHRpbmcgcmV3YXJkIG91dHB1dHNcbiAgKiBAcGFyYW0gcmV3YXJkVGhyZXNob2xkIFRoZSBudW1iZXIgb2Ygc2lnbmF0dXJlcyByZXF1aXJlZCB0byBzcGVuZCB0aGUgZnVuZHMgaW4gdGhlIHJlc3VsdGFudCByZXdhcmQgVVRYT1xuICAqIEBwYXJhbSByZXdhcmRBZGRyZXNzZXMgVGhlIGFkZHJlc3NlcyB0aGUgdmFsaWRhdG9yIHJld2FyZCBnb2VzLlxuICAqIEBwYXJhbSBmZWUgT3B0aW9uYWwuIFRoZSBhbW91bnQgb2YgZmVlcyB0byBidXJuIGluIGl0cyBzbWFsbGVzdCBkZW5vbWluYXRpb24sIHJlcHJlc2VudGVkIGFzIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59XG4gICogQHBhcmFtIGZlZUFzc2V0SUQgT3B0aW9uYWwuIFRoZSBhc3NldElEIG9mIHRoZSBmZWVzIGJlaW5nIGJ1cm5lZC4gXG4gICogQHBhcmFtIG1lbW8gT3B0aW9uYWwgY29udGFpbnMgYXJiaXRyYXJ5IGJ5dGVzLCB1cCB0byAyNTYgYnl0ZXNcbiAgKiBAcGFyYW0gYXNPZiBPcHRpb25hbC4gVGhlIHRpbWVzdGFtcCB0byB2ZXJpZnkgdGhlIHRyYW5zYWN0aW9uIGFnYWluc3QgYXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfVxuICAqIFxuICAqIEByZXR1cm5zIEFuIHVuc2lnbmVkIHRyYW5zYWN0aW9uIGNyZWF0ZWQgZnJvbSB0aGUgcGFzc2VkIGluIHBhcmFtZXRlcnMuXG4gICovXG4gIGJ1aWxkQWRkRGVsZWdhdG9yVHggPSAoXG4gICAgbmV0d29ya2lkOiBudW1iZXIgPSBEZWZhdWx0TmV0d29ya0lELFxuICAgIGJsb2NrY2hhaW5pZDogQnVmZmVyLFxuICAgIGF2YXhBc3NldElEOiBCdWZmZXIsXG4gICAgdG9BZGRyZXNzZXM6IEFycmF5PEJ1ZmZlcj4sXG4gICAgZnJvbUFkZHJlc3NlczogQXJyYXk8QnVmZmVyPixcbiAgICBjaGFuZ2VBZGRyZXNzZXM6IEFycmF5PEJ1ZmZlcj4sXG4gICAgbm9kZUlEOiBCdWZmZXIsXG4gICAgc3RhcnRUaW1lOiBCTixcbiAgICBlbmRUaW1lOiBCTixcbiAgICBzdGFrZUFtb3VudDogQk4sXG4gICAgcmV3YXJkTG9ja3RpbWU6IEJOLFxuICAgIHJld2FyZFRocmVzaG9sZDogbnVtYmVyLFxuICAgIHJld2FyZEFkZHJlc3NlczogQXJyYXk8QnVmZmVyPixcbiAgICBmZWU6IEJOID0gdW5kZWZpbmVkLFxuICAgIGZlZUFzc2V0SUQ6IEJ1ZmZlciA9IHVuZGVmaW5lZCxcbiAgICBtZW1vOiBCdWZmZXIgPSB1bmRlZmluZWQsXG4gICAgYXNPZjogQk4gPSBVbml4Tm93KCksXG4gICk6IFVuc2lnbmVkVHggPT4ge1xuICAgIGxldCBpbnM6IEFycmF5PFRyYW5zZmVyYWJsZUlucHV0PiA9IFtdO1xuICAgIGxldCBvdXRzOiBBcnJheTxUcmFuc2ZlcmFibGVPdXRwdXQ+ID0gW107XG4gICAgbGV0IHN0YWtlT3V0czogQXJyYXk8VHJhbnNmZXJhYmxlT3V0cHV0PiA9IFtdO1xuXG4gICAgY29uc3QgemVybzogQk4gPSBuZXcgQk4oMCk7XG4gICAgY29uc3Qgbm93OiBCTiA9IFVuaXhOb3coKTtcbiAgICBpZiAoc3RhcnRUaW1lLmx0KG5vdykgfHwgZW5kVGltZS5sdGUoc3RhcnRUaW1lKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVVRYT1NldC5idWlsZEFkZERlbGVnYXRvclR4IC0tIHN0YXJ0VGltZSBtdXN0IGJlIGluIHRoZSBmdXR1cmUgYW5kIGVuZFRpbWUgbXVzdCBjb21lIGFmdGVyIHN0YXJ0VGltZVwiKTtcbiAgICB9XG5cbiAgICBjb25zdCBhYWQ6IEFzc2V0QW1vdW50RGVzdGluYXRpb24gPSBuZXcgQXNzZXRBbW91bnREZXN0aW5hdGlvbih0b0FkZHJlc3NlcywgZnJvbUFkZHJlc3NlcywgY2hhbmdlQWRkcmVzc2VzKTtcbiAgICBpZiAoYXZheEFzc2V0SUQudG9TdHJpbmcoXCJoZXhcIikgPT09IGZlZUFzc2V0SUQudG9TdHJpbmcoXCJoZXhcIikpIHtcbiAgICAgIGFhZC5hZGRBc3NldEFtb3VudChhdmF4QXNzZXRJRCwgc3Rha2VBbW91bnQsIGZlZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFhZC5hZGRBc3NldEFtb3VudChhdmF4QXNzZXRJRCwgc3Rha2VBbW91bnQsIHplcm8pO1xuICAgICAgaWYgKHRoaXMuX2ZlZUNoZWNrKGZlZSwgZmVlQXNzZXRJRCkpIHtcbiAgICAgICAgYWFkLmFkZEFzc2V0QW1vdW50KGZlZUFzc2V0SUQsIHplcm8sIGZlZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgbWluU3BlbmRhYmxlRXJyOiBFcnJvciA9IHRoaXMuZ2V0TWluaW11bVNwZW5kYWJsZShhYWQsIGFzT2YsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB0cnVlKTtcbiAgICBpZiAodHlwZW9mIG1pblNwZW5kYWJsZUVyciA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgaW5zID0gYWFkLmdldElucHV0cygpO1xuICAgICAgb3V0cyA9IGFhZC5nZXRDaGFuZ2VPdXRwdXRzKCk7XG4gICAgICBzdGFrZU91dHMgPSBhYWQuZ2V0T3V0cHV0cygpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBtaW5TcGVuZGFibGVFcnI7XG4gICAgfVxuXG4gICAgY29uc3QgcmV3YXJkT3V0cHV0T3duZXJzOiBTRUNQT3duZXJPdXRwdXQgPSBuZXcgU0VDUE93bmVyT3V0cHV0KHJld2FyZEFkZHJlc3NlcywgcmV3YXJkTG9ja3RpbWUsIHJld2FyZFRocmVzaG9sZCk7XG5cbiAgICBjb25zdCBVVHg6IEFkZERlbGVnYXRvclR4ID0gbmV3IEFkZERlbGVnYXRvclR4KG5ldHdvcmtpZCwgYmxvY2tjaGFpbmlkLCBvdXRzLCBpbnMsIG1lbW8sIG5vZGVJRCwgc3RhcnRUaW1lLCBlbmRUaW1lLCBzdGFrZUFtb3VudCwgc3Rha2VPdXRzLCBuZXcgUGFyc2VhYmxlT3V0cHV0KHJld2FyZE91dHB1dE93bmVycykpO1xuICAgIHJldHVybiBuZXcgVW5zaWduZWRUeChVVHgpO1xuICB9XG5cbiAgLyoqXG4gICAgKiBDbGFzcyByZXByZXNlbnRpbmcgYW4gdW5zaWduZWQgW1tBZGRWYWxpZGF0b3JUeF1dIHRyYW5zYWN0aW9uLlxuICAgICpcbiAgICAqIEBwYXJhbSBuZXR3b3JraWQgTmV0d29ya2lkLCBbW0RlZmF1bHROZXR3b3JrSURdXVxuICAgICogQHBhcmFtIGJsb2NrY2hhaW5pZCBCbG9ja2NoYWluaWQsIGRlZmF1bHQgdW5kZWZpbmVkXG4gICAgKiBAcGFyYW0gYXZheEFzc2V0SUQge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gb2YgdGhlIGFzc2V0IElEIGZvciBBVkFYXG4gICAgKiBAcGFyYW0gdG9BZGRyZXNzZXMgQW4gYXJyYXkgb2YgYWRkcmVzc2VzIGFzIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHJlY2lldmVzIHRoZSBzdGFrZSBhdCB0aGUgZW5kIG9mIHRoZSBzdGFraW5nIHBlcmlvZFxuICAgICogQHBhcmFtIGZyb21BZGRyZXNzZXMgQW4gYXJyYXkgb2YgYWRkcmVzc2VzIGFzIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHdobyBwYXlzIHRoZSBmZWVzIGFuZCB0aGUgc3Rha2VcbiAgICAqIEBwYXJhbSBjaGFuZ2VBZGRyZXNzZXMgQW4gYXJyYXkgb2YgYWRkcmVzc2VzIGFzIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHdobyBnZXRzIHRoZSBjaGFuZ2UgbGVmdG92ZXIgZnJvbSB0aGUgc3Rha2luZyBwYXltZW50XG4gICAgKiBAcGFyYW0gbm9kZUlEIFRoZSBub2RlIElEIG9mIHRoZSB2YWxpZGF0b3IgYmVpbmcgYWRkZWQuXG4gICAgKiBAcGFyYW0gc3RhcnRUaW1lIFRoZSBVbml4IHRpbWUgd2hlbiB0aGUgdmFsaWRhdG9yIHN0YXJ0cyB2YWxpZGF0aW5nIHRoZSBQcmltYXJ5IE5ldHdvcmsuXG4gICAgKiBAcGFyYW0gZW5kVGltZSBUaGUgVW5peCB0aW1lIHdoZW4gdGhlIHZhbGlkYXRvciBzdG9wcyB2YWxpZGF0aW5nIHRoZSBQcmltYXJ5IE5ldHdvcmsgKGFuZCBzdGFrZWQgQVZBWCBpcyByZXR1cm5lZCkuXG4gICAgKiBAcGFyYW0gc3Rha2VBbW91bnQgQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfSBmb3IgdGhlIGFtb3VudCBvZiBzdGFrZSB0byBiZSBkZWxlZ2F0ZWQgaW4gbkFWQVguXG4gICAgKiBAcGFyYW0gcmV3YXJkTG9ja3RpbWUgVGhlIGxvY2t0aW1lIGZpZWxkIGNyZWF0ZWQgaW4gdGhlIHJlc3VsdGluZyByZXdhcmQgb3V0cHV0c1xuICAgICogQHBhcmFtIHJld2FyZFRocmVzaG9sZCBUaGUgbnVtYmVyIG9mIHNpZ25hdHVyZXMgcmVxdWlyZWQgdG8gc3BlbmQgdGhlIGZ1bmRzIGluIHRoZSByZXN1bHRhbnQgcmV3YXJkIFVUWE9cbiAgICAqIEBwYXJhbSByZXdhcmRBZGRyZXNzZXMgVGhlIGFkZHJlc3NlcyB0aGUgdmFsaWRhdG9yIHJld2FyZCBnb2VzLlxuICAgICogQHBhcmFtIGRlbGVnYXRpb25GZWUgQSBudW1iZXIgZm9yIHRoZSBwZXJjZW50YWdlIG9mIHJld2FyZCB0byBiZSBnaXZlbiB0byB0aGUgdmFsaWRhdG9yIHdoZW4gc29tZW9uZSBkZWxlZ2F0ZXMgdG8gdGhlbS4gTXVzdCBiZSBiZXR3ZWVuIDAgYW5kIDEwMC4gXG4gICAgKiBAcGFyYW0gbWluU3Rha2UgQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfSByZXByZXNlbnRpbmcgdGhlIG1pbmltdW0gc3Rha2UgcmVxdWlyZWQgdG8gdmFsaWRhdGUgb24gdGhpcyBuZXR3b3JrLlxuICAgICogQHBhcmFtIGZlZSBPcHRpb25hbC4gVGhlIGFtb3VudCBvZiBmZWVzIHRvIGJ1cm4gaW4gaXRzIHNtYWxsZXN0IGRlbm9taW5hdGlvbiwgcmVwcmVzZW50ZWQgYXMge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgICAqIEBwYXJhbSBmZWVBc3NldElEIE9wdGlvbmFsLiBUaGUgYXNzZXRJRCBvZiB0aGUgZmVlcyBiZWluZyBidXJuZWQuIFxuICAgICogQHBhcmFtIG1lbW8gT3B0aW9uYWwgY29udGFpbnMgYXJiaXRyYXJ5IGJ5dGVzLCB1cCB0byAyNTYgYnl0ZXNcbiAgICAqIEBwYXJhbSBhc09mIE9wdGlvbmFsLiBUaGUgdGltZXN0YW1wIHRvIHZlcmlmeSB0aGUgdHJhbnNhY3Rpb24gYWdhaW5zdCBhcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59XG4gICAgKiBcbiAgICAqIEByZXR1cm5zIEFuIHVuc2lnbmVkIHRyYW5zYWN0aW9uIGNyZWF0ZWQgZnJvbSB0aGUgcGFzc2VkIGluIHBhcmFtZXRlcnMuXG4gICAgKi9cbiAgYnVpbGRBZGRWYWxpZGF0b3JUeCA9IChcbiAgICBuZXR3b3JraWQ6IG51bWJlciA9IERlZmF1bHROZXR3b3JrSUQsXG4gICAgYmxvY2tjaGFpbmlkOiBCdWZmZXIsXG4gICAgYXZheEFzc2V0SUQ6IEJ1ZmZlcixcbiAgICB0b0FkZHJlc3NlczogQXJyYXk8QnVmZmVyPixcbiAgICBmcm9tQWRkcmVzc2VzOiBBcnJheTxCdWZmZXI+LFxuICAgIGNoYW5nZUFkZHJlc3NlczogQXJyYXk8QnVmZmVyPixcbiAgICBub2RlSUQ6IEJ1ZmZlcixcbiAgICBzdGFydFRpbWU6IEJOLFxuICAgIGVuZFRpbWU6IEJOLFxuICAgIHN0YWtlQW1vdW50OiBCTixcbiAgICByZXdhcmRMb2NrdGltZTogQk4sXG4gICAgcmV3YXJkVGhyZXNob2xkOiBudW1iZXIsXG4gICAgcmV3YXJkQWRkcmVzc2VzOiBBcnJheTxCdWZmZXI+LFxuICAgIGRlbGVnYXRpb25GZWU6IG51bWJlcixcbiAgICBmZWU6IEJOID0gdW5kZWZpbmVkLFxuICAgIGZlZUFzc2V0SUQ6IEJ1ZmZlciA9IHVuZGVmaW5lZCxcbiAgICBtZW1vOiBCdWZmZXIgPSB1bmRlZmluZWQsXG4gICAgYXNPZjogQk4gPSBVbml4Tm93KCksXG4gICk6IFVuc2lnbmVkVHggPT4ge1xuICAgIGxldCBpbnM6IEFycmF5PFRyYW5zZmVyYWJsZUlucHV0PiA9IFtdO1xuICAgIGxldCBvdXRzOiBBcnJheTxUcmFuc2ZlcmFibGVPdXRwdXQ+ID0gW107XG4gICAgbGV0IHN0YWtlT3V0czogQXJyYXk8VHJhbnNmZXJhYmxlT3V0cHV0PiA9IFtdO1xuXG4gICAgY29uc3QgemVybzogQk4gPSBuZXcgQk4oMCk7XG4gICAgY29uc3Qgbm93OiBCTiA9IFVuaXhOb3coKTtcbiAgICBpZiAoc3RhcnRUaW1lLmx0KG5vdykgfHwgZW5kVGltZS5sdGUoc3RhcnRUaW1lKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVVRYT1NldC5idWlsZEFkZFZhbGlkYXRvclR4IC0tIHN0YXJ0VGltZSBtdXN0IGJlIGluIHRoZSBmdXR1cmUgYW5kIGVuZFRpbWUgbXVzdCBjb21lIGFmdGVyIHN0YXJ0VGltZVwiKTtcbiAgICB9XG5cbiAgICBpZiAoZGVsZWdhdGlvbkZlZSA+IDEwMCB8fCBkZWxlZ2F0aW9uRmVlIDwgMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVVRYT1NldC5idWlsZEFkZFZhbGlkYXRvclR4IC0tIHN0YXJ0VGltZSBtdXN0IGJlIGluIHRoZSByYW5nZSBvZiAwIHRvIDEwMCwgaW5jbHVzaXZlbHlcIik7XG4gICAgfVxuXG4gICAgY29uc3QgYWFkOiBBc3NldEFtb3VudERlc3RpbmF0aW9uID0gbmV3IEFzc2V0QW1vdW50RGVzdGluYXRpb24odG9BZGRyZXNzZXMsIGZyb21BZGRyZXNzZXMsIGNoYW5nZUFkZHJlc3Nlcyk7XG4gICAgaWYgKGF2YXhBc3NldElELnRvU3RyaW5nKFwiaGV4XCIpID09PSBmZWVBc3NldElELnRvU3RyaW5nKFwiaGV4XCIpKSB7XG4gICAgICBhYWQuYWRkQXNzZXRBbW91bnQoYXZheEFzc2V0SUQsIHN0YWtlQW1vdW50LCBmZWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhYWQuYWRkQXNzZXRBbW91bnQoYXZheEFzc2V0SUQsIHN0YWtlQW1vdW50LCB6ZXJvKTtcbiAgICAgIGlmICh0aGlzLl9mZWVDaGVjayhmZWUsIGZlZUFzc2V0SUQpKSB7XG4gICAgICAgIGFhZC5hZGRBc3NldEFtb3VudChmZWVBc3NldElELCB6ZXJvLCBmZWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IG1pblNwZW5kYWJsZUVycjogRXJyb3IgPSB0aGlzLmdldE1pbmltdW1TcGVuZGFibGUoYWFkLCBhc09mLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgdHJ1ZSk7XG4gICAgaWYgKHR5cGVvZiBtaW5TcGVuZGFibGVFcnIgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIGlucyA9IGFhZC5nZXRJbnB1dHMoKTtcbiAgICAgIG91dHMgPSBhYWQuZ2V0Q2hhbmdlT3V0cHV0cygpO1xuICAgICAgc3Rha2VPdXRzID0gYWFkLmdldE91dHB1dHMoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbWluU3BlbmRhYmxlRXJyO1xuICAgIH1cblxuICAgIGNvbnN0IHJld2FyZE91dHB1dE93bmVyczogU0VDUE93bmVyT3V0cHV0ID0gbmV3IFNFQ1BPd25lck91dHB1dChyZXdhcmRBZGRyZXNzZXMsIHJld2FyZExvY2t0aW1lLCByZXdhcmRUaHJlc2hvbGQpO1xuXG4gICAgY29uc3QgVVR4OiBBZGRWYWxpZGF0b3JUeCA9IG5ldyBBZGRWYWxpZGF0b3JUeChuZXR3b3JraWQsIGJsb2NrY2hhaW5pZCwgb3V0cywgaW5zLCBtZW1vLCBub2RlSUQsIHN0YXJ0VGltZSwgZW5kVGltZSwgc3Rha2VBbW91bnQsIHN0YWtlT3V0cywgbmV3IFBhcnNlYWJsZU91dHB1dChyZXdhcmRPdXRwdXRPd25lcnMpLCBkZWxlZ2F0aW9uRmVlKTtcbiAgICByZXR1cm4gbmV3IFVuc2lnbmVkVHgoVVR4KTtcbiAgfVxuXG4gIC8qKlxuICAgICogQ2xhc3MgcmVwcmVzZW50aW5nIGFuIHVuc2lnbmVkIFtbQ3JlYXRlU3VibmV0VHhdXSB0cmFuc2FjdGlvbi5cbiAgICAqXG4gICAgKiBAcGFyYW0gbmV0d29ya2lkIE5ldHdvcmtpZCwgW1tEZWZhdWx0TmV0d29ya0lEXV1cbiAgICAqIEBwYXJhbSBibG9ja2NoYWluaWQgQmxvY2tjaGFpbmlkLCBkZWZhdWx0IHVuZGVmaW5lZFxuICAgICogQHBhcmFtIGZyb21BZGRyZXNzZXMgVGhlIGFkZHJlc3NlcyBiZWluZyB1c2VkIHRvIHNlbmQgdGhlIGZ1bmRzIGZyb20gdGhlIFVUWE9zIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9XG4gICAgKiBAcGFyYW0gY2hhbmdlQWRkcmVzc2VzIFRoZSBhZGRyZXNzZXMgdGhhdCBjYW4gc3BlbmQgdGhlIGNoYW5nZSByZW1haW5pbmcgZnJvbSB0aGUgc3BlbnQgVVRYT3MuXG4gICAgKiBAcGFyYW0gc3VibmV0T3duZXJBZGRyZXNzZXMgQW4gYXJyYXkgb2Yge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gZm9yIHRoZSBhZGRyZXNzZXMgdG8gYWRkIHRvIGEgc3VibmV0XG4gICAgKiBAcGFyYW0gc3VibmV0T3duZXJUaHJlc2hvbGQgVGhlIG51bWJlciBvZiBvd25lcnMncyBzaWduYXR1cmVzIHJlcXVpcmVkIHRvIGFkZCBhIHZhbGlkYXRvciB0byB0aGUgbmV0d29ya1xuICAgICogQHBhcmFtIGZlZSBPcHRpb25hbC4gVGhlIGFtb3VudCBvZiBmZWVzIHRvIGJ1cm4gaW4gaXRzIHNtYWxsZXN0IGRlbm9taW5hdGlvbiwgcmVwcmVzZW50ZWQgYXMge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgICAqIEBwYXJhbSBmZWVBc3NldElEIE9wdGlvbmFsLiBUaGUgYXNzZXRJRCBvZiB0aGUgZmVlcyBiZWluZyBidXJuZWRcbiAgICAqIEBwYXJhbSBtZW1vIE9wdGlvbmFsIGNvbnRhaW5zIGFyYml0cmFyeSBieXRlcywgdXAgdG8gMjU2IGJ5dGVzXG4gICAgKiBAcGFyYW0gYXNPZiBPcHRpb25hbC4gVGhlIHRpbWVzdGFtcCB0byB2ZXJpZnkgdGhlIHRyYW5zYWN0aW9uIGFnYWluc3QgYXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfVxuICAgICogXG4gICAgKiBAcmV0dXJucyBBbiB1bnNpZ25lZCB0cmFuc2FjdGlvbiBjcmVhdGVkIGZyb20gdGhlIHBhc3NlZCBpbiBwYXJhbWV0ZXJzLlxuICAgICovXG4gIGJ1aWxkQ3JlYXRlU3VibmV0VHggPSAoXG4gICAgbmV0d29ya2lkOiBudW1iZXIgPSBEZWZhdWx0TmV0d29ya0lELFxuICAgIGJsb2NrY2hhaW5pZDogQnVmZmVyLFxuICAgIGZyb21BZGRyZXNzZXM6IEFycmF5PEJ1ZmZlcj4sXG4gICAgY2hhbmdlQWRkcmVzc2VzOiBBcnJheTxCdWZmZXI+LFxuICAgIHN1Ym5ldE93bmVyQWRkcmVzc2VzOiBBcnJheTxCdWZmZXI+LFxuICAgIHN1Ym5ldE93bmVyVGhyZXNob2xkOiBudW1iZXIsXG4gICAgZmVlOiBCTiA9IHVuZGVmaW5lZCxcbiAgICBmZWVBc3NldElEOiBCdWZmZXIgPSB1bmRlZmluZWQsXG4gICAgbWVtbzogQnVmZmVyID0gdW5kZWZpbmVkLFxuICAgIGFzT2Y6IEJOID0gVW5peE5vdygpLFxuICApOiBVbnNpZ25lZFR4ID0+IHtcbiAgICBjb25zdCB6ZXJvOiBCTiA9IG5ldyBCTigwKTtcbiAgICBsZXQgaW5zOiBBcnJheTxUcmFuc2ZlcmFibGVJbnB1dD4gPSBbXTtcbiAgICBsZXQgb3V0czogQXJyYXk8VHJhbnNmZXJhYmxlT3V0cHV0PiA9IFtdO1xuXG4gICAgaWYgKHRoaXMuX2ZlZUNoZWNrKGZlZSwgZmVlQXNzZXRJRCkpIHtcbiAgICAgIGNvbnN0IGFhZDogQXNzZXRBbW91bnREZXN0aW5hdGlvbiA9IG5ldyBBc3NldEFtb3VudERlc3RpbmF0aW9uKGZyb21BZGRyZXNzZXMsIGZyb21BZGRyZXNzZXMsIGNoYW5nZUFkZHJlc3Nlcyk7XG4gICAgICBhYWQuYWRkQXNzZXRBbW91bnQoZmVlQXNzZXRJRCwgemVybywgZmVlKTtcbiAgICAgIGNvbnN0IG1pblNwZW5kYWJsZUVycjogRXJyb3IgPSB0aGlzLmdldE1pbmltdW1TcGVuZGFibGUoYWFkLCBhc09mLCB1bmRlZmluZWQsIHVuZGVmaW5lZCk7XG4gICAgICBpZiAodHlwZW9mIG1pblNwZW5kYWJsZUVyciA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBpbnMgPSBhYWQuZ2V0SW5wdXRzKCk7XG4gICAgICAgIG91dHMgPSBhYWQuZ2V0QWxsT3V0cHV0cygpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbWluU3BlbmRhYmxlRXJyO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGxvY2t0aW1lOiBCTiA9IG5ldyBCTigwKVxuICAgIGNvbnN0IFVUeDogQ3JlYXRlU3VibmV0VHggPSBuZXcgQ3JlYXRlU3VibmV0VHgobmV0d29ya2lkLCBibG9ja2NoYWluaWQsIG91dHMsIGlucywgbWVtbywgbmV3IFNFQ1BPd25lck91dHB1dChzdWJuZXRPd25lckFkZHJlc3NlcywgbG9ja3RpbWUsIHN1Ym5ldE93bmVyVGhyZXNob2xkKSk7XG4gICAgcmV0dXJuIG5ldyBVbnNpZ25lZFR4KFVUeCk7XG4gIH1cblxufVxuIl19