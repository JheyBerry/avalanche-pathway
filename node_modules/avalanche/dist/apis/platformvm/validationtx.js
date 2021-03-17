"use strict";
/**
 * @packageDocumentation
 * @module API-PlatformVM-ValidationTx
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddValidatorTx = exports.AddDelegatorTx = exports.WeightedValidatorTx = exports.ValidatorTx = void 0;
const bn_js_1 = __importDefault(require("bn.js"));
const bintools_1 = __importDefault(require("../../utils/bintools"));
const basetx_1 = require("./basetx");
const outputs_1 = require("../platformvm/outputs");
const buffer_1 = require("buffer/");
const constants_1 = require("./constants");
const constants_2 = require("../../utils/constants");
const helperfunctions_1 = require("../../utils/helperfunctions");
const outputs_2 = require("./outputs");
const serialization_1 = require("../../utils/serialization");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
const serializer = serialization_1.Serialization.getInstance();
/**
 * Abstract class representing an transactions with validation information.
 */
class ValidatorTx extends basetx_1.BaseTx {
    constructor(networkid, blockchainid, outs, ins, memo, nodeID, startTime, endTime) {
        super(networkid, blockchainid, outs, ins, memo);
        this._typeName = "ValidatorTx";
        this._typeID = undefined;
        this.nodeID = buffer_1.Buffer.alloc(20);
        this.startTime = buffer_1.Buffer.alloc(8);
        this.endTime = buffer_1.Buffer.alloc(8);
        this.nodeID = nodeID;
        this.startTime = bintools.fromBNToBuffer(startTime, 8);
        this.endTime = bintools.fromBNToBuffer(endTime, 8);
    }
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { "nodeID": serializer.encoder(this.nodeID, encoding, "Buffer", "nodeID"), "startTime": serializer.encoder(this.startTime, encoding, "Buffer", "decimalString"), "endTime": serializer.encoder(this.endTime, encoding, "Buffer", "decimalString") });
    }
    ;
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.nodeID = serializer.decoder(fields["nodeID"], encoding, "nodeID", "Buffer", 20);
        this.startTime = serializer.decoder(fields["startTime"], encoding, "decimalString", "Buffer", 8);
        this.endTime = serializer.decoder(fields["endTime"], encoding, "decimalString", "Buffer", 8);
    }
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} for the stake amount.
     */
    getNodeID() {
        return this.nodeID;
    }
    /**
     * Returns a string for the nodeID amount.
     */
    getNodeIDString() {
        return helperfunctions_1.bufferToNodeIDString(this.nodeID);
    }
    /**
     * Returns a {@link https://github.com/indutny/bn.js/|BN} for the stake amount.
     */
    getStartTime() {
        return bintools.fromBufferToBN(this.startTime);
    }
    /**
     * Returns a {@link https://github.com/indutny/bn.js/|BN} for the stake amount.
     */
    getEndTime() {
        return bintools.fromBufferToBN(this.endTime);
    }
    fromBuffer(bytes, offset = 0) {
        offset = super.fromBuffer(bytes, offset);
        this.nodeID = bintools.copyFrom(bytes, offset, offset + 20);
        offset += 20;
        this.startTime = bintools.copyFrom(bytes, offset, offset + 8);
        offset += 8;
        this.endTime = bintools.copyFrom(bytes, offset, offset + 8);
        offset += 8;
        return offset;
    }
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[ValidatorTx]].
     */
    toBuffer() {
        const superbuff = super.toBuffer();
        const bsize = superbuff.length + this.nodeID.length + this.startTime.length + this.endTime.length;
        return buffer_1.Buffer.concat([
            superbuff,
            this.nodeID,
            this.startTime,
            this.endTime
        ], bsize);
    }
}
exports.ValidatorTx = ValidatorTx;
class WeightedValidatorTx extends ValidatorTx {
    /**
     * Class representing an unsigned AddSubnetValidatorTx transaction.
     *
     * @param networkid Optional. Networkid, [[DefaultNetworkID]]
     * @param blockchainid Optional. Blockchainid, default Buffer.alloc(32, 16)
     * @param outs Optional. Array of the [[TransferableOutput]]s
     * @param ins Optional. Array of the [[TransferableInput]]s
     * @param memo Optional. {@link https://github.com/feross/buffer|Buffer} for the memo field
     * @param nodeID Optional. The node ID of the validator being added.
     * @param startTime Optional. The Unix time when the validator starts validating the Primary Network.
     * @param endTime Optional. The Unix time when the validator stops validating the Primary Network (and staked AVAX is returned).
     * @param weight Optional. The amount of nAVAX the validator is staking.
     */
    constructor(networkid = constants_2.DefaultNetworkID, blockchainid = buffer_1.Buffer.alloc(32, 16), outs = undefined, ins = undefined, memo = undefined, nodeID = undefined, startTime = undefined, endTime = undefined, weight = undefined) {
        super(networkid, blockchainid, outs, ins, memo, nodeID, startTime, endTime);
        this._typeName = "WeightedValidatorTx";
        this._typeID = undefined;
        this.weight = buffer_1.Buffer.alloc(8);
        if (typeof weight !== undefined) {
            this.weight = bintools.fromBNToBuffer(weight, 8);
        }
    }
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { "weight": serializer.encoder(this.weight, encoding, "Buffer", "decimalString") });
    }
    ;
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.weight = serializer.decoder(fields["weight"], encoding, "decimalString", "Buffer", 8);
    }
    /**
     * Returns a {@link https://github.com/indutny/bn.js/|BN} for the stake amount.
     */
    getWeight() {
        return bintools.fromBufferToBN(this.weight);
    }
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} for the stake amount.
     */
    getWeightBuffer() {
        return this.weight;
    }
    fromBuffer(bytes, offset = 0) {
        offset = super.fromBuffer(bytes, offset);
        this.weight = bintools.copyFrom(bytes, offset, offset + 8);
        offset += 8;
        return offset;
    }
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[AddSubnetValidatorTx]].
     */
    toBuffer() {
        const superbuff = super.toBuffer();
        return buffer_1.Buffer.concat([superbuff, this.weight]);
    }
}
exports.WeightedValidatorTx = WeightedValidatorTx;
/* Must implement later, the signing process isn't friendly to AvalancheJS

export class AddSubnetValidatorTx extends WeightedValidatorTx {
    protected subnetID:Buffer = Buffer.alloc(32);
    protected subnetAddrs:Array<Buffer> = [];
    protected subnetAuthIdxs:Array<Buffer> = [];


    getTxType = ():number => {
        return PlatformVMConstants.ADDSUBNETVALIDATORTX;
    }


    getSubnetID = ():Buffer => {
        return this.subnetID;
    }


    getSubnetIDString = ():string => {
        return bintools.cb58Encode(this.subnetID);
    }


    getSubnetAuthAddresses = ():Array<Buffer> => {
        return this.subnetAddrs;
    }


    setSubnetAuthAddresses = (addrs:Array<Buffer>):void => {
        this.subnetAddrs = addrs;
    }

    calcSubnetAuthIdxs = (addrs:Array<Buffer>):Array<Buffer> => {
        let idxs:Array<Buffer> = [];
        addrs = addrs.sort();
        for(let i = 0; i < addrs.length; i++){
            let idx:Buffer = Buffer.alloc(4);
            idx.writeUInt32BE(i,0);
            idxs.push(idx);
        }
    }


    getSubnetAuthIdxs = ():Array<Buffer> => {
        return this.subnetAddrs;
    }

    fromBuffer(bytes:Buffer, offset:number = 0):number {
        offset = super.fromBuffer(bytes, offset);
        this.subnetID = bintools.copyFrom(bytes, offset, offset + 32);
        offset += 32;
        let sublenbuff:Buffer = bintools.copyFrom(bytes, offset, offset + 4);
        offset += 4;
        let sublen:number = sublenbuff.readUInt32BE(0);
        for(let i = 0; i < sublen; i++){

        }
        offset = this.subnetAuth.fromBuffer(bytes, offset);
        return offset;
    }


    toBuffer():Buffer {
        const superbuff:Buffer = super.toBuffer();

        return Buffer.concat([superbuff, this.subnetID, subAuth], superbuff.length + this.subnetID.length + subAuth.length);
    }


    sign(msg:Buffer, kc:KeyChain):Array<Credential> {
        let creds:Array<SECPCredential> = super.sign(msg, kc);
        const cred:SECPCredential = SelectCredentialClass(PlatformVMConstants.SECPCREDENTIAL) as SECPCredential;
        for(let i = 0; i  < this.subnetAuth.length ; i++) {
            if(!kc.hasKey(this.subnetAuth[i])) {
                throw new Error("AddSubnetValidatorTx.sign -- specified address in subnetAuth not existent in provided keychain.");
            }
            
            let kp:KeyPair = kc.getKey(this.subnetAuth[i]);
            const signval:Buffer = kp.sign(msg);
            const sig:Signature = new Signature();
            sig.fromBuffer(signval);
            cred.addSignature(sig);
        }
        creds.push(cred);
        return creds;
    }


    constructor(
        networkid:number = DefaultNetworkID,
        blockchainid:Buffer = Buffer.alloc(32, 16),
        outs:Array<TransferableOutput> = undefined,
        ins:Array<TransferableInput> = undefined,
        memo:Buffer = undefined,
        nodeID:Buffer = undefined,
        startTime:BN = undefined,
        endTime:BN = undefined,
        weight:BN = undefined,
        subnetID:Buffer = undefined,
        subnetAuth:Array<Buffer> = undefined
    ) {
        super(networkid, blockchainid, outs, ins, memo, nodeID, startTime, endTime, weight);
        if(typeof subnetID !== undefined){
            this.subnetID = subnetID;
        }
        if(typeof subnetAuth !== undefined) {
            this.subnetAuth = subnetAuth;
        }
    }

}
*/
/**
 * Class representing an unsigned AddDelegatorTx transaction.
 */
class AddDelegatorTx extends WeightedValidatorTx {
    /**
     * Class representing an unsigned AddDelegatorTx transaction.
     *
     * @param networkid Optional. Networkid, [[DefaultNetworkID]]
     * @param blockchainid Optional. Blockchainid, default Buffer.alloc(32, 16)
     * @param outs Optional. Array of the [[TransferableOutput]]s
     * @param ins Optional. Array of the [[TransferableInput]]s
     * @param memo Optional. {@link https://github.com/feross/buffer|Buffer} for the memo field
     * @param nodeID Optional. The node ID of the validator being added.
     * @param startTime Optional. The Unix time when the validator starts validating the Primary Network.
     * @param endTime Optional. The Unix time when the validator stops validating the Primary Network (and staked AVAX is returned).
     * @param stakeAmount Optional. The amount of nAVAX the validator is staking.
     * @param stakeOuts Optional. The outputs used in paying the stake.
     * @param rewardOwners Optional. The [[ParseableOutput]] containing a [[SECPOwnerOutput]] for the rewards.
     */
    constructor(networkid = constants_2.DefaultNetworkID, blockchainid = buffer_1.Buffer.alloc(32, 16), outs = undefined, ins = undefined, memo = undefined, nodeID = undefined, startTime = undefined, endTime = undefined, stakeAmount = undefined, stakeOuts = undefined, rewardOwners = undefined) {
        super(networkid, blockchainid, outs, ins, memo, nodeID, startTime, endTime, stakeAmount);
        this._typeName = "AddDelegatorTx";
        this._typeID = constants_1.PlatformVMConstants.ADDDELEGATORTX;
        this.stakeOuts = [];
        this.rewardOwners = undefined;
        /**
           * Returns the id of the [[AddDelegatorTx]]
           */
        this.getTxType = () => {
            return this._typeID;
        };
        if (typeof stakeOuts !== undefined) {
            this.stakeOuts = stakeOuts;
        }
        this.rewardOwners = rewardOwners;
    }
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { "stakeOuts": this.stakeOuts.map((s) => s.serialize(encoding)), "rewardOwners": this.rewardOwners.serialize(encoding) });
    }
    ;
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.stakeOuts = fields["stakeOuts"].map((s) => {
            let xferout = new outputs_1.TransferableOutput();
            xferout.deserialize(s, encoding);
            return xferout;
        });
        this.rewardOwners = new outputs_2.ParseableOutput();
        this.rewardOwners.deserialize(fields["rewardOwners"], encoding);
    }
    /**
     * Returns a {@link https://github.com/indutny/bn.js/|BN} for the stake amount.
     */
    getStakeAmount() {
        return this.getWeight();
    }
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} for the stake amount.
     */
    getStakeAmountBuffer() {
        return this.weight;
    }
    /**
     * Returns the array of outputs being staked.
     */
    getStakeOuts() {
        return this.stakeOuts;
    }
    /**
     * Should match stakeAmount. Used in sanity checking.
     */
    getStakeOutsTotal() {
        let val = new bn_js_1.default(0);
        for (let i = 0; i < this.stakeOuts.length; i++) {
            val = val.add(this.stakeOuts[i].getOutput().getAmount());
        }
        return val;
    }
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} for the reward address.
     */
    getRewardOwners() {
        return this.rewardOwners;
    }
    getTotalOuts() {
        return [...this.getOuts(), ...this.getStakeOuts()];
    }
    fromBuffer(bytes, offset = 0) {
        offset = super.fromBuffer(bytes, offset);
        const numstakeouts = bintools.copyFrom(bytes, offset, offset + 4);
        offset += 4;
        const outcount = numstakeouts.readUInt32BE(0);
        this.stakeOuts = [];
        for (let i = 0; i < outcount; i++) {
            const xferout = new outputs_1.TransferableOutput();
            offset = xferout.fromBuffer(bytes, offset);
            this.stakeOuts.push(xferout);
        }
        this.rewardOwners = new outputs_2.ParseableOutput();
        offset = this.rewardOwners.fromBuffer(bytes, offset);
        return offset;
    }
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[AddDelegatorTx]].
     */
    toBuffer() {
        const superbuff = super.toBuffer();
        let bsize = superbuff.length;
        const numouts = buffer_1.Buffer.alloc(4);
        numouts.writeUInt32BE(this.stakeOuts.length, 0);
        let barr = [super.toBuffer(), numouts];
        bsize += numouts.length;
        this.stakeOuts = this.stakeOuts.sort(outputs_1.TransferableOutput.comparator());
        for (let i = 0; i < this.stakeOuts.length; i++) {
            let out = this.stakeOuts[i].toBuffer();
            barr.push(out);
            bsize += out.length;
        }
        let ro = this.rewardOwners.toBuffer();
        barr.push(ro);
        bsize += ro.length;
        return buffer_1.Buffer.concat(barr, bsize);
    }
    clone() {
        let newbase = new AddDelegatorTx();
        newbase.fromBuffer(this.toBuffer());
        return newbase;
    }
    create(...args) {
        return new AddDelegatorTx(...args);
    }
}
exports.AddDelegatorTx = AddDelegatorTx;
class AddValidatorTx extends AddDelegatorTx {
    /**
     * Class representing an unsigned AddValidatorTx transaction.
     *
     * @param networkid Optional. Networkid, [[DefaultNetworkID]]
     * @param blockchainid Optional. Blockchainid, default Buffer.alloc(32, 16)
     * @param outs Optional. Array of the [[TransferableOutput]]s
     * @param ins Optional. Array of the [[TransferableInput]]s
     * @param memo Optional. {@link https://github.com/feross/buffer|Buffer} for the memo field
     * @param nodeID Optional. The node ID of the validator being added.
     * @param startTime Optional. The Unix time when the validator starts validating the Primary Network.
     * @param endTime Optional. The Unix time when the validator stops validating the Primary Network (and staked AVAX is returned).
     * @param stakeAmount Optional. The amount of nAVAX the validator is staking.
     * @param stakeOuts Optional. The outputs used in paying the stake.
     * @param rewardOwners Optional. The [[ParseableOutput]] containing the [[SECPOwnerOutput]] for the rewards.
     * @param delegationFee Optional. The percent fee this validator charges when others delegate stake to them.
     * Up to 4 decimal places allowed; additional decimal places are ignored. Must be between 0 and 100, inclusive.
     * For example, if delegationFeeRate is 1.2345 and someone delegates to this validator, then when the delegation
     * period is over, 1.2345% of the reward goes to the validator and the rest goes to the delegator.
     */
    constructor(networkid = constants_2.DefaultNetworkID, blockchainid = buffer_1.Buffer.alloc(32, 16), outs = undefined, ins = undefined, memo = undefined, nodeID = undefined, startTime = undefined, endTime = undefined, stakeAmount = undefined, stakeOuts = undefined, rewardOwners = undefined, delegationFee = undefined) {
        super(networkid, blockchainid, outs, ins, memo, nodeID, startTime, endTime, stakeAmount, stakeOuts, rewardOwners);
        this._typeName = "AddValidatorTx";
        this._typeID = constants_1.PlatformVMConstants.ADDVALIDATORTX;
        this.delegationFee = 0;
        /**
           * Returns the id of the [[AddValidatorTx]]
           */
        this.getTxType = () => {
            return this._typeID;
        };
        if (typeof delegationFee === "number") {
            if (delegationFee >= 0 && delegationFee <= 100) {
                this.delegationFee = parseFloat(delegationFee.toFixed(4));
            }
            else {
                throw new Error("AddValidatorTx.constructor -- delegationFee must be in the range of 0 and 100, inclusively.");
            }
        }
    }
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { "delegationFee": serializer.encoder(this.getDelegationFeeBuffer(), encoding, "Buffer", "decimalString", 4) });
    }
    ;
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        let dbuff = serializer.decoder(fields["delegationFee"], encoding, "decimalString", "Buffer", 4);
        this.delegationFee = dbuff.readUInt32BE(0) / AddValidatorTx.delegatorMultiplier;
    }
    /**
     * Returns the delegation fee (represents a percentage from 0 to 100);
     */
    getDelegationFee() {
        return this.delegationFee;
    }
    /**
     * Returns the binary representation of the delegation fee as a {@link https://github.com/feross/buffer|Buffer}.
     */
    getDelegationFeeBuffer() {
        let dBuff = buffer_1.Buffer.alloc(4);
        let buffnum = parseFloat(this.delegationFee.toFixed(4)) * AddValidatorTx.delegatorMultiplier;
        dBuff.writeUInt32BE(buffnum, 0);
        return dBuff;
    }
    fromBuffer(bytes, offset = 0) {
        offset = super.fromBuffer(bytes, offset);
        let dbuff = bintools.copyFrom(bytes, offset, offset + 4);
        offset += 4;
        this.delegationFee = dbuff.readUInt32BE(0) / AddValidatorTx.delegatorMultiplier;
        return offset;
    }
    toBuffer() {
        let superBuff = super.toBuffer();
        let feeBuff = this.getDelegationFeeBuffer();
        return buffer_1.Buffer.concat([superBuff, feeBuff]);
    }
}
exports.AddValidatorTx = AddValidatorTx;
AddValidatorTx.delegatorMultiplier = 10000;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGlvbnR4LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2FwaXMvcGxhdGZvcm12bS92YWxpZGF0aW9udHgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7R0FHRzs7Ozs7O0FBRUgsa0RBQXVCO0FBQ3ZCLG9FQUE0QztBQUM1QyxxQ0FBa0M7QUFDbEMsbURBQTJEO0FBRTNELG9DQUFpQztBQUNqQywyQ0FBa0Q7QUFDbEQscURBQXlEO0FBQ3pELGlFQUFtRTtBQUNuRSx1Q0FBMEQ7QUFDMUQsNkRBQThFO0FBRTlFOztHQUVHO0FBQ0gsTUFBTSxRQUFRLEdBQUcsa0JBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUN4QyxNQUFNLFVBQVUsR0FBRyw2QkFBYSxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBRS9DOztHQUVHO0FBQ0gsTUFBc0IsV0FBWSxTQUFRLGVBQU07SUE0RTVDLFlBQ0ksU0FBZ0IsRUFDaEIsWUFBbUIsRUFDbkIsSUFBOEIsRUFDOUIsR0FBNEIsRUFDNUIsSUFBWSxFQUNaLE1BQWMsRUFDZCxTQUFhLEVBQ2IsT0FBVztRQUVYLEtBQUssQ0FBQyxTQUFTLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFyRjFDLGNBQVMsR0FBRyxhQUFhLENBQUM7UUFDMUIsWUFBTyxHQUFHLFNBQVMsQ0FBQztRQWtCcEIsV0FBTSxHQUFVLGVBQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDakMsY0FBUyxHQUFVLGVBQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkMsWUFBTyxHQUFVLGVBQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFpRXZDLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxD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LCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBwYWNrYWdlRG9jdW1lbnRhdGlvblxuICogQG1vZHVsZSBBUEktUGxhdGZvcm1WTS1WYWxpZGF0aW9uVHhcbiAqL1xuXG5pbXBvcnQgQk4gZnJvbSAnYm4uanMnO1xuaW1wb3J0IEJpblRvb2xzIGZyb20gJy4uLy4uL3V0aWxzL2JpbnRvb2xzJztcbmltcG9ydCB7IEJhc2VUeCB9IGZyb20gJy4vYmFzZXR4JztcbmltcG9ydCB7IFRyYW5zZmVyYWJsZU91dHB1dCB9IGZyb20gJy4uL3BsYXRmb3Jtdm0vb3V0cHV0cyc7XG5pbXBvcnQgeyBUcmFuc2ZlcmFibGVJbnB1dCB9IGZyb20gJy4uL3BsYXRmb3Jtdm0vaW5wdXRzJztcbmltcG9ydCB7IEJ1ZmZlciB9IGZyb20gJ2J1ZmZlci8nO1xuaW1wb3J0IHsgUGxhdGZvcm1WTUNvbnN0YW50cyB9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7IERlZmF1bHROZXR3b3JrSUQgfSBmcm9tICcuLi8uLi91dGlscy9jb25zdGFudHMnO1xuaW1wb3J0IHsgYnVmZmVyVG9Ob2RlSURTdHJpbmcgfSBmcm9tICcuLi8uLi91dGlscy9oZWxwZXJmdW5jdGlvbnMnO1xuaW1wb3J0IHsgQW1vdW50T3V0cHV0LCBQYXJzZWFibGVPdXRwdXQgfSBmcm9tICcuL291dHB1dHMnO1xuaW1wb3J0IHsgU2VyaWFsaXphdGlvbiwgU2VyaWFsaXplZEVuY29kaW5nIH0gZnJvbSAnLi4vLi4vdXRpbHMvc2VyaWFsaXphdGlvbic7XG5cbi8qKlxuICogQGlnbm9yZVxuICovXG5jb25zdCBiaW50b29scyA9IEJpblRvb2xzLmdldEluc3RhbmNlKCk7XG5jb25zdCBzZXJpYWxpemVyID0gU2VyaWFsaXphdGlvbi5nZXRJbnN0YW5jZSgpO1xuXG4vKipcbiAqIEFic3RyYWN0IGNsYXNzIHJlcHJlc2VudGluZyBhbiB0cmFuc2FjdGlvbnMgd2l0aCB2YWxpZGF0aW9uIGluZm9ybWF0aW9uLlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgVmFsaWRhdG9yVHggZXh0ZW5kcyBCYXNlVHgge1xuICAgIHByb3RlY3RlZCBfdHlwZU5hbWUgPSBcIlZhbGlkYXRvclR4XCI7XG4gICAgcHJvdGVjdGVkIF90eXBlSUQgPSB1bmRlZmluZWQ7XG5cbiAgICBzZXJpYWxpemUoZW5jb2Rpbmc6U2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIik6b2JqZWN0IHtcbiAgICAgICAgbGV0IGZpZWxkczpvYmplY3QgPSBzdXBlci5zZXJpYWxpemUoZW5jb2RpbmcpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgLi4uZmllbGRzLFxuICAgICAgICAgICAgXCJub2RlSURcIjpzZXJpYWxpemVyLmVuY29kZXIodGhpcy5ub2RlSUQsIGVuY29kaW5nLCBcIkJ1ZmZlclwiLCBcIm5vZGVJRFwiKSxcbiAgICAgICAgICAgIFwic3RhcnRUaW1lXCI6c2VyaWFsaXplci5lbmNvZGVyKHRoaXMuc3RhcnRUaW1lLCBlbmNvZGluZywgXCJCdWZmZXJcIiwgXCJkZWNpbWFsU3RyaW5nXCIpLFxuICAgICAgICAgICAgXCJlbmRUaW1lXCI6c2VyaWFsaXplci5lbmNvZGVyKHRoaXMuZW5kVGltZSwgZW5jb2RpbmcsIFwiQnVmZmVyXCIsIFwiZGVjaW1hbFN0cmluZ1wiKVxuICAgICAgICB9XG4gICAgfTtcbiAgICBkZXNlcmlhbGl6ZShmaWVsZHM6b2JqZWN0LCBlbmNvZGluZzpTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKSB7XG4gICAgICAgIHN1cGVyLmRlc2VyaWFsaXplKGZpZWxkcywgZW5jb2RpbmcpO1xuICAgICAgICB0aGlzLm5vZGVJRCA9IHNlcmlhbGl6ZXIuZGVjb2RlcihmaWVsZHNbXCJub2RlSURcIl0sIGVuY29kaW5nLCBcIm5vZGVJRFwiLCBcIkJ1ZmZlclwiLCAyMCk7XG4gICAgICAgIHRoaXMuc3RhcnRUaW1lID0gc2VyaWFsaXplci5kZWNvZGVyKGZpZWxkc1tcInN0YXJ0VGltZVwiXSwgZW5jb2RpbmcsIFwiZGVjaW1hbFN0cmluZ1wiLCBcIkJ1ZmZlclwiLCA4KTtcbiAgICAgICAgdGhpcy5lbmRUaW1lID0gc2VyaWFsaXplci5kZWNvZGVyKGZpZWxkc1tcImVuZFRpbWVcIl0sIGVuY29kaW5nLCBcImRlY2ltYWxTdHJpbmdcIiwgXCJCdWZmZXJcIiwgOCk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIG5vZGVJRDpCdWZmZXIgPSBCdWZmZXIuYWxsb2MoMjApO1xuICAgIHByb3RlY3RlZCBzdGFydFRpbWU6QnVmZmVyID0gQnVmZmVyLmFsbG9jKDgpO1xuICAgIHByb3RlY3RlZCBlbmRUaW1lOkJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyg4KTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBmb3IgdGhlIHN0YWtlIGFtb3VudC5cbiAgICAgKi9cbiAgICBnZXROb2RlSUQoKTpCdWZmZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5ub2RlSUQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIHN0cmluZyBmb3IgdGhlIG5vZGVJRCBhbW91bnQuXG4gICAgICovXG4gICAgZ2V0Tm9kZUlEU3RyaW5nKCk6c3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGJ1ZmZlclRvTm9kZUlEU3RyaW5nKHRoaXMubm9kZUlEKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59IGZvciB0aGUgc3Rha2UgYW1vdW50LlxuICAgICAqL1xuICAgIGdldFN0YXJ0VGltZSgpe1xuICAgICAgICByZXR1cm4gYmludG9vbHMuZnJvbUJ1ZmZlclRvQk4odGhpcy5zdGFydFRpbWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfSBmb3IgdGhlIHN0YWtlIGFtb3VudC5cbiAgICAgKi9cbiAgICBnZXRFbmRUaW1lKCkge1xuICAgICAgICByZXR1cm4gYmludG9vbHMuZnJvbUJ1ZmZlclRvQk4odGhpcy5lbmRUaW1lKTtcbiAgICB9XG5cbiAgICBmcm9tQnVmZmVyKGJ5dGVzOkJ1ZmZlciwgb2Zmc2V0Om51bWJlciA9IDApOm51bWJlciB7XG4gICAgICAgIG9mZnNldCA9IHN1cGVyLmZyb21CdWZmZXIoYnl0ZXMsIG9mZnNldCk7XG4gICAgICAgIHRoaXMubm9kZUlEID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgMjApO1xuICAgICAgICBvZmZzZXQgKz0gMjA7XG4gICAgICAgIHRoaXMuc3RhcnRUaW1lID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgOCk7XG4gICAgICAgIG9mZnNldCArPSA4O1xuICAgICAgICB0aGlzLmVuZFRpbWUgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyA4KTtcbiAgICAgICAgb2Zmc2V0ICs9IDg7XG4gICAgICAgIHJldHVybiBvZmZzZXQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBbW1ZhbGlkYXRvclR4XV0uXG4gICAgICovXG4gICAgdG9CdWZmZXIoKTpCdWZmZXIge1xuICAgICAgICBjb25zdCBzdXBlcmJ1ZmY6QnVmZmVyID0gc3VwZXIudG9CdWZmZXIoKTtcbiAgICAgICAgY29uc3QgYnNpemU6bnVtYmVyID0gc3VwZXJidWZmLmxlbmd0aCArIHRoaXMubm9kZUlELmxlbmd0aCArIHRoaXMuc3RhcnRUaW1lLmxlbmd0aCArIHRoaXMuZW5kVGltZS5sZW5ndGg7XG4gICAgICAgIHJldHVybiBCdWZmZXIuY29uY2F0KFtcbiAgICAgICAgICAgIHN1cGVyYnVmZixcbiAgICAgICAgICAgIHRoaXMubm9kZUlELFxuICAgICAgICAgICAgdGhpcy5zdGFydFRpbWUsXG4gICAgICAgICAgICB0aGlzLmVuZFRpbWVcbiAgICAgICAgXSwgYnNpemUpO1xuICAgIH1cbiAgICBcbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgbmV0d29ya2lkOm51bWJlciwgXG4gICAgICAgIGJsb2NrY2hhaW5pZDpCdWZmZXIsIFxuICAgICAgICBvdXRzOkFycmF5PFRyYW5zZmVyYWJsZU91dHB1dD4sIFxuICAgICAgICBpbnM6QXJyYXk8VHJhbnNmZXJhYmxlSW5wdXQ+LCBcbiAgICAgICAgbWVtbz86QnVmZmVyLCBcbiAgICAgICAgbm9kZUlEPzpCdWZmZXIsIFxuICAgICAgICBzdGFydFRpbWU/OkJOLCBcbiAgICAgICAgZW5kVGltZT86Qk5cbiAgICApIHtcbiAgICAgICAgc3VwZXIobmV0d29ya2lkLCBibG9ja2NoYWluaWQsIG91dHMsIGlucywgbWVtbyk7XG4gICAgICAgIHRoaXMubm9kZUlEID0gbm9kZUlEO1xuICAgICAgICB0aGlzLnN0YXJ0VGltZSA9IGJpbnRvb2xzLmZyb21CTlRvQnVmZmVyKHN0YXJ0VGltZSwgOCk7XG4gICAgICAgIHRoaXMuZW5kVGltZSA9IGJpbnRvb2xzLmZyb21CTlRvQnVmZmVyKGVuZFRpbWUsIDgpO1xuICAgIH1cblxufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgV2VpZ2h0ZWRWYWxpZGF0b3JUeCBleHRlbmRzIFZhbGlkYXRvclR4IHtcbiAgICBwcm90ZWN0ZWQgX3R5cGVOYW1lID0gXCJXZWlnaHRlZFZhbGlkYXRvclR4XCI7XG4gICAgcHJvdGVjdGVkIF90eXBlSUQgPSB1bmRlZmluZWQ7XG5cbiAgICBzZXJpYWxpemUoZW5jb2Rpbmc6U2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIik6b2JqZWN0IHtcbiAgICAgICAgbGV0IGZpZWxkczpvYmplY3QgPSBzdXBlci5zZXJpYWxpemUoZW5jb2RpbmcpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgLi4uZmllbGRzLFxuICAgICAgICAgICAgXCJ3ZWlnaHRcIjogc2VyaWFsaXplci5lbmNvZGVyKHRoaXMud2VpZ2h0LCBlbmNvZGluZywgXCJCdWZmZXJcIiwgXCJkZWNpbWFsU3RyaW5nXCIpXG4gICAgICAgIH1cbiAgICB9O1xuICAgIGRlc2VyaWFsaXplKGZpZWxkczpvYmplY3QsIGVuY29kaW5nOlNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpIHtcbiAgICAgICAgc3VwZXIuZGVzZXJpYWxpemUoZmllbGRzLCBlbmNvZGluZyk7XG4gICAgICAgIHRoaXMud2VpZ2h0ID0gc2VyaWFsaXplci5kZWNvZGVyKGZpZWxkc1tcIndlaWdodFwiXSwgZW5jb2RpbmcsIFwiZGVjaW1hbFN0cmluZ1wiLCBcIkJ1ZmZlclwiLCA4KTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgd2VpZ2h0OkJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyg4KTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfSBmb3IgdGhlIHN0YWtlIGFtb3VudC5cbiAgICAgKi9cbiAgICBnZXRXZWlnaHQoKTpCTiB7XG4gICAgICAgIHJldHVybiBiaW50b29scy5mcm9tQnVmZmVyVG9CTih0aGlzLndlaWdodCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IGZvciB0aGUgc3Rha2UgYW1vdW50LlxuICAgICAqL1xuICAgIGdldFdlaWdodEJ1ZmZlcigpOkJ1ZmZlciB7XG4gICAgICAgIHJldHVybiB0aGlzLndlaWdodDtcbiAgICB9XG5cbiAgICBmcm9tQnVmZmVyKGJ5dGVzOkJ1ZmZlciwgb2Zmc2V0Om51bWJlciA9IDApOm51bWJlciB7XG4gICAgICAgIG9mZnNldCA9IHN1cGVyLmZyb21CdWZmZXIoYnl0ZXMsIG9mZnNldCk7XG4gICAgICAgIHRoaXMud2VpZ2h0ID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgOCk7XG4gICAgICAgIG9mZnNldCArPSA4O1xuICAgICAgICByZXR1cm4gb2Zmc2V0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSByZXByZXNlbnRhdGlvbiBvZiB0aGUgW1tBZGRTdWJuZXRWYWxpZGF0b3JUeF1dLlxuICAgICAqL1xuICAgIHRvQnVmZmVyKCk6QnVmZmVyIHtcbiAgICAgICAgY29uc3Qgc3VwZXJidWZmOkJ1ZmZlciA9IHN1cGVyLnRvQnVmZmVyKCk7XG4gICAgICAgIHJldHVybiBCdWZmZXIuY29uY2F0KFtzdXBlcmJ1ZmYsIHRoaXMud2VpZ2h0XSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2xhc3MgcmVwcmVzZW50aW5nIGFuIHVuc2lnbmVkIEFkZFN1Ym5ldFZhbGlkYXRvclR4IHRyYW5zYWN0aW9uLlxuICAgICAqXG4gICAgICogQHBhcmFtIG5ldHdvcmtpZCBPcHRpb25hbC4gTmV0d29ya2lkLCBbW0RlZmF1bHROZXR3b3JrSURdXVxuICAgICAqIEBwYXJhbSBibG9ja2NoYWluaWQgT3B0aW9uYWwuIEJsb2NrY2hhaW5pZCwgZGVmYXVsdCBCdWZmZXIuYWxsb2MoMzIsIDE2KVxuICAgICAqIEBwYXJhbSBvdXRzIE9wdGlvbmFsLiBBcnJheSBvZiB0aGUgW1tUcmFuc2ZlcmFibGVPdXRwdXRdXXNcbiAgICAgKiBAcGFyYW0gaW5zIE9wdGlvbmFsLiBBcnJheSBvZiB0aGUgW1tUcmFuc2ZlcmFibGVJbnB1dF1dc1xuICAgICAqIEBwYXJhbSBtZW1vIE9wdGlvbmFsLiB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBmb3IgdGhlIG1lbW8gZmllbGRcbiAgICAgKiBAcGFyYW0gbm9kZUlEIE9wdGlvbmFsLiBUaGUgbm9kZSBJRCBvZiB0aGUgdmFsaWRhdG9yIGJlaW5nIGFkZGVkLlxuICAgICAqIEBwYXJhbSBzdGFydFRpbWUgT3B0aW9uYWwuIFRoZSBVbml4IHRpbWUgd2hlbiB0aGUgdmFsaWRhdG9yIHN0YXJ0cyB2YWxpZGF0aW5nIHRoZSBQcmltYXJ5IE5ldHdvcmsuXG4gICAgICogQHBhcmFtIGVuZFRpbWUgT3B0aW9uYWwuIFRoZSBVbml4IHRpbWUgd2hlbiB0aGUgdmFsaWRhdG9yIHN0b3BzIHZhbGlkYXRpbmcgdGhlIFByaW1hcnkgTmV0d29yayAoYW5kIHN0YWtlZCBBVkFYIGlzIHJldHVybmVkKS5cbiAgICAgKiBAcGFyYW0gd2VpZ2h0IE9wdGlvbmFsLiBUaGUgYW1vdW50IG9mIG5BVkFYIHRoZSB2YWxpZGF0b3IgaXMgc3Rha2luZy5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgbmV0d29ya2lkOm51bWJlciA9IERlZmF1bHROZXR3b3JrSUQsIFxuICAgICAgICBibG9ja2NoYWluaWQ6QnVmZmVyID0gQnVmZmVyLmFsbG9jKDMyLCAxNiksIFxuICAgICAgICBvdXRzOkFycmF5PFRyYW5zZmVyYWJsZU91dHB1dD4gPSB1bmRlZmluZWQsIFxuICAgICAgICBpbnM6QXJyYXk8VHJhbnNmZXJhYmxlSW5wdXQ+ID0gdW5kZWZpbmVkLCBcbiAgICAgICAgbWVtbzpCdWZmZXIgPSB1bmRlZmluZWQsIFxuICAgICAgICBub2RlSUQ6QnVmZmVyID0gdW5kZWZpbmVkLCBcbiAgICAgICAgc3RhcnRUaW1lOkJOID0gdW5kZWZpbmVkLCBcbiAgICAgICAgZW5kVGltZTpCTiA9IHVuZGVmaW5lZCxcbiAgICAgICAgd2VpZ2h0OkJOID0gdW5kZWZpbmVkLFxuICAgICkge1xuICAgICAgICBzdXBlcihuZXR3b3JraWQsIGJsb2NrY2hhaW5pZCwgb3V0cywgaW5zLCBtZW1vLCBub2RlSUQsIHN0YXJ0VGltZSwgZW5kVGltZSk7XG4gICAgICAgIGlmKHR5cGVvZiB3ZWlnaHQgIT09IHVuZGVmaW5lZCl7XG4gICAgICAgICAgICB0aGlzLndlaWdodCA9IGJpbnRvb2xzLmZyb21CTlRvQnVmZmVyKHdlaWdodCwgOCk7XG4gICAgICAgIH1cbiAgICB9XG5cbn1cbi8qIE11c3QgaW1wbGVtZW50IGxhdGVyLCB0aGUgc2lnbmluZyBwcm9jZXNzIGlzbid0IGZyaWVuZGx5IHRvIEF2YWxhbmNoZUpTXG5cbmV4cG9ydCBjbGFzcyBBZGRTdWJuZXRWYWxpZGF0b3JUeCBleHRlbmRzIFdlaWdodGVkVmFsaWRhdG9yVHgge1xuICAgIHByb3RlY3RlZCBzdWJuZXRJRDpCdWZmZXIgPSBCdWZmZXIuYWxsb2MoMzIpO1xuICAgIHByb3RlY3RlZCBzdWJuZXRBZGRyczpBcnJheTxCdWZmZXI+ID0gW107XG4gICAgcHJvdGVjdGVkIHN1Ym5ldEF1dGhJZHhzOkFycmF5PEJ1ZmZlcj4gPSBbXTtcblxuXG4gICAgZ2V0VHhUeXBlID0gKCk6bnVtYmVyID0+IHtcbiAgICAgICAgcmV0dXJuIFBsYXRmb3JtVk1Db25zdGFudHMuQUREU1VCTkVUVkFMSURBVE9SVFg7XG4gICAgfVxuXG5cbiAgICBnZXRTdWJuZXRJRCA9ICgpOkJ1ZmZlciA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLnN1Ym5ldElEO1xuICAgIH1cblxuXG4gICAgZ2V0U3VibmV0SURTdHJpbmcgPSAoKTpzdHJpbmcgPT4ge1xuICAgICAgICByZXR1cm4gYmludG9vbHMuY2I1OEVuY29kZSh0aGlzLnN1Ym5ldElEKTtcbiAgICB9XG5cblxuICAgIGdldFN1Ym5ldEF1dGhBZGRyZXNzZXMgPSAoKTpBcnJheTxCdWZmZXI+ID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3VibmV0QWRkcnM7XG4gICAgfVxuXG5cbiAgICBzZXRTdWJuZXRBdXRoQWRkcmVzc2VzID0gKGFkZHJzOkFycmF5PEJ1ZmZlcj4pOnZvaWQgPT4ge1xuICAgICAgICB0aGlzLnN1Ym5ldEFkZHJzID0gYWRkcnM7XG4gICAgfVxuXG4gICAgY2FsY1N1Ym5ldEF1dGhJZHhzID0gKGFkZHJzOkFycmF5PEJ1ZmZlcj4pOkFycmF5PEJ1ZmZlcj4gPT4ge1xuICAgICAgICBsZXQgaWR4czpBcnJheTxCdWZmZXI+ID0gW107XG4gICAgICAgIGFkZHJzID0gYWRkcnMuc29ydCgpO1xuICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgYWRkcnMubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgbGV0IGlkeDpCdWZmZXIgPSBCdWZmZXIuYWxsb2MoNCk7XG4gICAgICAgICAgICBpZHgud3JpdGVVSW50MzJCRShpLDApO1xuICAgICAgICAgICAgaWR4cy5wdXNoKGlkeCk7XG4gICAgICAgIH1cbiAgICB9XG5cblxuICAgIGdldFN1Ym5ldEF1dGhJZHhzID0gKCk6QXJyYXk8QnVmZmVyPiA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLnN1Ym5ldEFkZHJzO1xuICAgIH1cblxuICAgIGZyb21CdWZmZXIoYnl0ZXM6QnVmZmVyLCBvZmZzZXQ6bnVtYmVyID0gMCk6bnVtYmVyIHtcbiAgICAgICAgb2Zmc2V0ID0gc3VwZXIuZnJvbUJ1ZmZlcihieXRlcywgb2Zmc2V0KTtcbiAgICAgICAgdGhpcy5zdWJuZXRJRCA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDMyKTtcbiAgICAgICAgb2Zmc2V0ICs9IDMyO1xuICAgICAgICBsZXQgc3VibGVuYnVmZjpCdWZmZXIgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyA0KTtcbiAgICAgICAgb2Zmc2V0ICs9IDQ7XG4gICAgICAgIGxldCBzdWJsZW46bnVtYmVyID0gc3VibGVuYnVmZi5yZWFkVUludDMyQkUoMCk7XG4gICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBzdWJsZW47IGkrKyl7XG5cbiAgICAgICAgfVxuICAgICAgICBvZmZzZXQgPSB0aGlzLnN1Ym5ldEF1dGguZnJvbUJ1ZmZlcihieXRlcywgb2Zmc2V0KTtcbiAgICAgICAgcmV0dXJuIG9mZnNldDtcbiAgICB9XG5cblxuICAgIHRvQnVmZmVyKCk6QnVmZmVyIHtcbiAgICAgICAgY29uc3Qgc3VwZXJidWZmOkJ1ZmZlciA9IHN1cGVyLnRvQnVmZmVyKCk7XG5cbiAgICAgICAgcmV0dXJuIEJ1ZmZlci5jb25jYXQoW3N1cGVyYnVmZiwgdGhpcy5zdWJuZXRJRCwgc3ViQXV0aF0sIHN1cGVyYnVmZi5sZW5ndGggKyB0aGlzLnN1Ym5ldElELmxlbmd0aCArIHN1YkF1dGgubGVuZ3RoKTtcbiAgICB9XG5cblxuICAgIHNpZ24obXNnOkJ1ZmZlciwga2M6S2V5Q2hhaW4pOkFycmF5PENyZWRlbnRpYWw+IHtcbiAgICAgICAgbGV0IGNyZWRzOkFycmF5PFNFQ1BDcmVkZW50aWFsPiA9IHN1cGVyLnNpZ24obXNnLCBrYyk7XG4gICAgICAgIGNvbnN0IGNyZWQ6U0VDUENyZWRlbnRpYWwgPSBTZWxlY3RDcmVkZW50aWFsQ2xhc3MoUGxhdGZvcm1WTUNvbnN0YW50cy5TRUNQQ1JFREVOVElBTCkgYXMgU0VDUENyZWRlbnRpYWw7XG4gICAgICAgIGZvcihsZXQgaSA9IDA7IGkgIDwgdGhpcy5zdWJuZXRBdXRoLmxlbmd0aCA7IGkrKykge1xuICAgICAgICAgICAgaWYoIWtjLmhhc0tleSh0aGlzLnN1Ym5ldEF1dGhbaV0pKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQWRkU3VibmV0VmFsaWRhdG9yVHguc2lnbiAtLSBzcGVjaWZpZWQgYWRkcmVzcyBpbiBzdWJuZXRBdXRoIG5vdCBleGlzdGVudCBpbiBwcm92aWRlZCBrZXljaGFpbi5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGxldCBrcDpLZXlQYWlyID0ga2MuZ2V0S2V5KHRoaXMuc3VibmV0QXV0aFtpXSk7XG4gICAgICAgICAgICBjb25zdCBzaWdudmFsOkJ1ZmZlciA9IGtwLnNpZ24obXNnKTtcbiAgICAgICAgICAgIGNvbnN0IHNpZzpTaWduYXR1cmUgPSBuZXcgU2lnbmF0dXJlKCk7XG4gICAgICAgICAgICBzaWcuZnJvbUJ1ZmZlcihzaWdudmFsKTtcbiAgICAgICAgICAgIGNyZWQuYWRkU2lnbmF0dXJlKHNpZyk7XG4gICAgICAgIH1cbiAgICAgICAgY3JlZHMucHVzaChjcmVkKTtcbiAgICAgICAgcmV0dXJuIGNyZWRzO1xuICAgIH1cblxuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIG5ldHdvcmtpZDpudW1iZXIgPSBEZWZhdWx0TmV0d29ya0lELCBcbiAgICAgICAgYmxvY2tjaGFpbmlkOkJ1ZmZlciA9IEJ1ZmZlci5hbGxvYygzMiwgMTYpLCBcbiAgICAgICAgb3V0czpBcnJheTxUcmFuc2ZlcmFibGVPdXRwdXQ+ID0gdW5kZWZpbmVkLCBcbiAgICAgICAgaW5zOkFycmF5PFRyYW5zZmVyYWJsZUlucHV0PiA9IHVuZGVmaW5lZCwgXG4gICAgICAgIG1lbW86QnVmZmVyID0gdW5kZWZpbmVkLCBcbiAgICAgICAgbm9kZUlEOkJ1ZmZlciA9IHVuZGVmaW5lZCwgXG4gICAgICAgIHN0YXJ0VGltZTpCTiA9IHVuZGVmaW5lZCwgXG4gICAgICAgIGVuZFRpbWU6Qk4gPSB1bmRlZmluZWQsXG4gICAgICAgIHdlaWdodDpCTiA9IHVuZGVmaW5lZCxcbiAgICAgICAgc3VibmV0SUQ6QnVmZmVyID0gdW5kZWZpbmVkLFxuICAgICAgICBzdWJuZXRBdXRoOkFycmF5PEJ1ZmZlcj4gPSB1bmRlZmluZWRcbiAgICApIHtcbiAgICAgICAgc3VwZXIobmV0d29ya2lkLCBibG9ja2NoYWluaWQsIG91dHMsIGlucywgbWVtbywgbm9kZUlELCBzdGFydFRpbWUsIGVuZFRpbWUsIHdlaWdodCk7XG4gICAgICAgIGlmKHR5cGVvZiBzdWJuZXRJRCAhPT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICAgIHRoaXMuc3VibmV0SUQgPSBzdWJuZXRJRDtcbiAgICAgICAgfVxuICAgICAgICBpZih0eXBlb2Ygc3VibmV0QXV0aCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLnN1Ym5ldEF1dGggPSBzdWJuZXRBdXRoO1xuICAgICAgICB9XG4gICAgfVxuXG59XG4qL1xuXG4vKipcbiAqIENsYXNzIHJlcHJlc2VudGluZyBhbiB1bnNpZ25lZCBBZGREZWxlZ2F0b3JUeCB0cmFuc2FjdGlvbi5cbiAqL1xuZXhwb3J0IGNsYXNzIEFkZERlbGVnYXRvclR4IGV4dGVuZHMgV2VpZ2h0ZWRWYWxpZGF0b3JUeCB7XG4gICAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiQWRkRGVsZWdhdG9yVHhcIjtcbiAgICBwcm90ZWN0ZWQgX3R5cGVJRCA9IFBsYXRmb3JtVk1Db25zdGFudHMuQUREREVMRUdBVE9SVFg7XG5cbiAgICBzZXJpYWxpemUoZW5jb2Rpbmc6U2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIik6b2JqZWN0IHtcbiAgICAgICAgbGV0IGZpZWxkczpvYmplY3QgPSBzdXBlci5zZXJpYWxpemUoZW5jb2RpbmcpO1xuICAgICAgICByZXR1cm4gIHtcbiAgICAgICAgICAgIC4uLmZpZWxkcyxcbiAgICAgICAgICAgIFwic3Rha2VPdXRzXCI6IHRoaXMuc3Rha2VPdXRzLm1hcCgocykgPT4gcy5zZXJpYWxpemUoZW5jb2RpbmcpKSxcbiAgICAgICAgICAgIFwicmV3YXJkT3duZXJzXCI6IHRoaXMucmV3YXJkT3duZXJzLnNlcmlhbGl6ZShlbmNvZGluZylcbiAgICAgICAgfVxuICAgIH07XG4gICAgZGVzZXJpYWxpemUoZmllbGRzOm9iamVjdCwgZW5jb2Rpbmc6U2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIikge1xuICAgICAgICBzdXBlci5kZXNlcmlhbGl6ZShmaWVsZHMsIGVuY29kaW5nKTtcbiAgICAgICAgdGhpcy5zdGFrZU91dHMgPSBmaWVsZHNbXCJzdGFrZU91dHNcIl0ubWFwKChzOm9iamVjdCkgPT4ge1xuICAgICAgICAgICAgbGV0IHhmZXJvdXQ6VHJhbnNmZXJhYmxlT3V0cHV0ID0gbmV3IFRyYW5zZmVyYWJsZU91dHB1dCgpO1xuICAgICAgICAgICAgeGZlcm91dC5kZXNlcmlhbGl6ZShzLCBlbmNvZGluZyk7XG4gICAgICAgICAgICByZXR1cm4geGZlcm91dDtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMucmV3YXJkT3duZXJzID0gbmV3IFBhcnNlYWJsZU91dHB1dCgpO1xuICAgICAgICB0aGlzLnJld2FyZE93bmVycy5kZXNlcmlhbGl6ZShmaWVsZHNbXCJyZXdhcmRPd25lcnNcIl0sIGVuY29kaW5nKTtcbiAgICB9XG4gICAgXG4gICAgcHJvdGVjdGVkIHN0YWtlT3V0czpBcnJheTxUcmFuc2ZlcmFibGVPdXRwdXQ+ID0gW107XG4gICAgcHJvdGVjdGVkIHJld2FyZE93bmVyczpQYXJzZWFibGVPdXRwdXQgPSB1bmRlZmluZWQ7XG4gIFxuICAgIC8qKlxuICAgICAgICogUmV0dXJucyB0aGUgaWQgb2YgdGhlIFtbQWRkRGVsZWdhdG9yVHhdXVxuICAgICAgICovXG4gICAgZ2V0VHhUeXBlID0gKCk6bnVtYmVyID0+IHtcbiAgICAgIHJldHVybiB0aGlzLl90eXBlSUQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59IGZvciB0aGUgc3Rha2UgYW1vdW50LlxuICAgICAqL1xuICAgIGdldFN0YWtlQW1vdW50KCk6Qk4ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRXZWlnaHQoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gZm9yIHRoZSBzdGFrZSBhbW91bnQuXG4gICAgICovXG4gICAgZ2V0U3Rha2VBbW91bnRCdWZmZXIoKTpCdWZmZXIge1xuICAgICAgICByZXR1cm4gdGhpcy53ZWlnaHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgYXJyYXkgb2Ygb3V0cHV0cyBiZWluZyBzdGFrZWQuXG4gICAgICovXG4gICAgZ2V0U3Rha2VPdXRzKCk6QXJyYXk8VHJhbnNmZXJhYmxlT3V0cHV0PiB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YWtlT3V0cztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTaG91bGQgbWF0Y2ggc3Rha2VBbW91bnQuIFVzZWQgaW4gc2FuaXR5IGNoZWNraW5nLlxuICAgICAqL1xuICAgIGdldFN0YWtlT3V0c1RvdGFsKCk6Qk4ge1xuICAgICAgICBsZXQgdmFsOkJOID0gbmV3IEJOKDApO1xuICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgdGhpcy5zdGFrZU91dHMubGVuZ3RoOyBpKyspe1xuICAgICAgICAgIHZhbCA9IHZhbC5hZGQoKHRoaXMuc3Rha2VPdXRzW2ldLmdldE91dHB1dCgpIGFzIEFtb3VudE91dHB1dCkuZ2V0QW1vdW50KCkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2YWw7XG4gICAgfVxuICAgIFxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBmb3IgdGhlIHJld2FyZCBhZGRyZXNzLlxuICAgICAqL1xuICAgIGdldFJld2FyZE93bmVycygpOlBhcnNlYWJsZU91dHB1dCB7XG4gICAgICAgIHJldHVybiB0aGlzLnJld2FyZE93bmVycztcbiAgICB9XG4gICAgXG4gICAgZ2V0VG90YWxPdXRzKCk6QXJyYXk8VHJhbnNmZXJhYmxlT3V0cHV0PiB7XG4gICAgICAgIHJldHVybiBbLi4udGhpcy5nZXRPdXRzKCkgYXMgQXJyYXk8VHJhbnNmZXJhYmxlT3V0cHV0PiwgLi4udGhpcy5nZXRTdGFrZU91dHMoKV07XG4gICAgfVxuXG4gICAgZnJvbUJ1ZmZlcihieXRlczpCdWZmZXIsIG9mZnNldDpudW1iZXIgPSAwKTpudW1iZXIge1xuICAgICAgICBvZmZzZXQgPSBzdXBlci5mcm9tQnVmZmVyKGJ5dGVzLCBvZmZzZXQpO1xuICAgICAgICBjb25zdCBudW1zdGFrZW91dHMgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyA0KTtcbiAgICAgICAgb2Zmc2V0ICs9IDQ7XG4gICAgICAgIGNvbnN0IG91dGNvdW50Om51bWJlciA9IG51bXN0YWtlb3V0cy5yZWFkVUludDMyQkUoMCk7XG4gICAgICAgIHRoaXMuc3Rha2VPdXRzID0gW107XG4gICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBvdXRjb3VudDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCB4ZmVyb3V0OlRyYW5zZmVyYWJsZU91dHB1dCA9IG5ldyBUcmFuc2ZlcmFibGVPdXRwdXQoKTtcbiAgICAgICAgICAgIG9mZnNldCA9IHhmZXJvdXQuZnJvbUJ1ZmZlcihieXRlcywgb2Zmc2V0KTtcbiAgICAgICAgICAgIHRoaXMuc3Rha2VPdXRzLnB1c2goeGZlcm91dCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yZXdhcmRPd25lcnMgPSBuZXcgUGFyc2VhYmxlT3V0cHV0KCk7XG4gICAgICAgIG9mZnNldCA9IHRoaXMucmV3YXJkT3duZXJzLmZyb21CdWZmZXIoYnl0ZXMsIG9mZnNldCk7XG4gICAgICAgIHJldHVybiBvZmZzZXQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBbW0FkZERlbGVnYXRvclR4XV0uXG4gICAgICovXG4gICAgdG9CdWZmZXIoKTpCdWZmZXIge1xuICAgICAgICBjb25zdCBzdXBlcmJ1ZmY6QnVmZmVyID0gc3VwZXIudG9CdWZmZXIoKTtcbiAgICAgICAgbGV0IGJzaXplOm51bWJlciA9IHN1cGVyYnVmZi5sZW5ndGg7XG4gICAgICAgIGNvbnN0IG51bW91dHM6QnVmZmVyID0gQnVmZmVyLmFsbG9jKDQpO1xuICAgICAgICBudW1vdXRzLndyaXRlVUludDMyQkUodGhpcy5zdGFrZU91dHMubGVuZ3RoLCAwKTtcbiAgICAgICAgbGV0IGJhcnI6QXJyYXk8QnVmZmVyPiA9IFtzdXBlci50b0J1ZmZlcigpLCBudW1vdXRzXTtcbiAgICAgICAgYnNpemUgKz0gbnVtb3V0cy5sZW5ndGg7XG4gICAgICAgIHRoaXMuc3Rha2VPdXRzID0gdGhpcy5zdGFrZU91dHMuc29ydChUcmFuc2ZlcmFibGVPdXRwdXQuY29tcGFyYXRvcigpKTtcbiAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IHRoaXMuc3Rha2VPdXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBsZXQgb3V0OkJ1ZmZlciA9IHRoaXMuc3Rha2VPdXRzW2ldLnRvQnVmZmVyKCk7XG4gICAgICAgICAgICBiYXJyLnB1c2gob3V0KTtcbiAgICAgICAgICAgIGJzaXplICs9IG91dC5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHJvOkJ1ZmZlciA9IHRoaXMucmV3YXJkT3duZXJzLnRvQnVmZmVyKCk7XG4gICAgICAgIGJhcnIucHVzaChybyk7XG4gICAgICAgIGJzaXplICs9IHJvLmxlbmd0aDtcbiAgICAgICAgcmV0dXJuIEJ1ZmZlci5jb25jYXQoYmFyciwgYnNpemUpO1xuICAgIH1cblxuICAgIGNsb25lKCk6dGhpcyB7XG4gICAgICAgIGxldCBuZXdiYXNlOkFkZERlbGVnYXRvclR4ID0gbmV3IEFkZERlbGVnYXRvclR4KCk7XG4gICAgICAgIG5ld2Jhc2UuZnJvbUJ1ZmZlcih0aGlzLnRvQnVmZmVyKCkpO1xuICAgICAgICByZXR1cm4gbmV3YmFzZSBhcyB0aGlzO1xuICAgIH1cblxuICAgIGNyZWF0ZSguLi5hcmdzOmFueVtdKTp0aGlzIHtcbiAgICAgICAgcmV0dXJuIG5ldyBBZGREZWxlZ2F0b3JUeCguLi5hcmdzKSBhcyB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENsYXNzIHJlcHJlc2VudGluZyBhbiB1bnNpZ25lZCBBZGREZWxlZ2F0b3JUeCB0cmFuc2FjdGlvbi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBuZXR3b3JraWQgT3B0aW9uYWwuIE5ldHdvcmtpZCwgW1tEZWZhdWx0TmV0d29ya0lEXV1cbiAgICAgKiBAcGFyYW0gYmxvY2tjaGFpbmlkIE9wdGlvbmFsLiBCbG9ja2NoYWluaWQsIGRlZmF1bHQgQnVmZmVyLmFsbG9jKDMyLCAxNilcbiAgICAgKiBAcGFyYW0gb3V0cyBPcHRpb25hbC4gQXJyYXkgb2YgdGhlIFtbVHJhbnNmZXJhYmxlT3V0cHV0XV1zXG4gICAgICogQHBhcmFtIGlucyBPcHRpb25hbC4gQXJyYXkgb2YgdGhlIFtbVHJhbnNmZXJhYmxlSW5wdXRdXXNcbiAgICAgKiBAcGFyYW0gbWVtbyBPcHRpb25hbC4ge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gZm9yIHRoZSBtZW1vIGZpZWxkXG4gICAgICogQHBhcmFtIG5vZGVJRCBPcHRpb25hbC4gVGhlIG5vZGUgSUQgb2YgdGhlIHZhbGlkYXRvciBiZWluZyBhZGRlZC5cbiAgICAgKiBAcGFyYW0gc3RhcnRUaW1lIE9wdGlvbmFsLiBUaGUgVW5peCB0aW1lIHdoZW4gdGhlIHZhbGlkYXRvciBzdGFydHMgdmFsaWRhdGluZyB0aGUgUHJpbWFyeSBOZXR3b3JrLlxuICAgICAqIEBwYXJhbSBlbmRUaW1lIE9wdGlvbmFsLiBUaGUgVW5peCB0aW1lIHdoZW4gdGhlIHZhbGlkYXRvciBzdG9wcyB2YWxpZGF0aW5nIHRoZSBQcmltYXJ5IE5ldHdvcmsgKGFuZCBzdGFrZWQgQVZBWCBpcyByZXR1cm5lZCkuXG4gICAgICogQHBhcmFtIHN0YWtlQW1vdW50IE9wdGlvbmFsLiBUaGUgYW1vdW50IG9mIG5BVkFYIHRoZSB2YWxpZGF0b3IgaXMgc3Rha2luZy5cbiAgICAgKiBAcGFyYW0gc3Rha2VPdXRzIE9wdGlvbmFsLiBUaGUgb3V0cHV0cyB1c2VkIGluIHBheWluZyB0aGUgc3Rha2UuXG4gICAgICogQHBhcmFtIHJld2FyZE93bmVycyBPcHRpb25hbC4gVGhlIFtbUGFyc2VhYmxlT3V0cHV0XV0gY29udGFpbmluZyBhIFtbU0VDUE93bmVyT3V0cHV0XV0gZm9yIHRoZSByZXdhcmRzLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBuZXR3b3JraWQ6bnVtYmVyID0gRGVmYXVsdE5ldHdvcmtJRCwgXG4gICAgICAgIGJsb2NrY2hhaW5pZDpCdWZmZXIgPSBCdWZmZXIuYWxsb2MoMzIsIDE2KSwgXG4gICAgICAgIG91dHM6QXJyYXk8VHJhbnNmZXJhYmxlT3V0cHV0PiA9IHVuZGVmaW5lZCwgXG4gICAgICAgIGluczpBcnJheTxUcmFuc2ZlcmFibGVJbnB1dD4gPSB1bmRlZmluZWQsIFxuICAgICAgICBtZW1vOkJ1ZmZlciA9IHVuZGVmaW5lZCwgXG4gICAgICAgIG5vZGVJRDpCdWZmZXIgPSB1bmRlZmluZWQsIFxuICAgICAgICBzdGFydFRpbWU6Qk4gPSB1bmRlZmluZWQsIFxuICAgICAgICBlbmRUaW1lOkJOID0gdW5kZWZpbmVkLFxuICAgICAgICBzdGFrZUFtb3VudDpCTiA9IHVuZGVmaW5lZCxcbiAgICAgICAgc3Rha2VPdXRzOkFycmF5PFRyYW5zZmVyYWJsZU91dHB1dD4gPSB1bmRlZmluZWQsXG4gICAgICAgIHJld2FyZE93bmVyczpQYXJzZWFibGVPdXRwdXQgPSB1bmRlZmluZWRcbiAgICApIHtcbiAgICAgICAgc3VwZXIobmV0d29ya2lkLCBibG9ja2NoYWluaWQsIG91dHMsIGlucywgbWVtbywgbm9kZUlELCBzdGFydFRpbWUsIGVuZFRpbWUsIHN0YWtlQW1vdW50KTtcbiAgICAgICAgaWYodHlwZW9mIHN0YWtlT3V0cyAhPT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICAgIHRoaXMuc3Rha2VPdXRzID0gc3Rha2VPdXRzXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yZXdhcmRPd25lcnMgPSByZXdhcmRPd25lcnM7XG4gICAgfVxuICB9XG5cbmV4cG9ydCBjbGFzcyBBZGRWYWxpZGF0b3JUeCBleHRlbmRzIEFkZERlbGVnYXRvclR4IHtcbiAgICBwcm90ZWN0ZWQgX3R5cGVOYW1lID0gXCJBZGRWYWxpZGF0b3JUeFwiO1xuICAgIHByb3RlY3RlZCBfdHlwZUlEID0gUGxhdGZvcm1WTUNvbnN0YW50cy5BRERWQUxJREFUT1JUWDtcblxuICAgIHNlcmlhbGl6ZShlbmNvZGluZzpTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKTpvYmplY3Qge1xuICAgICAgICBsZXQgZmllbGRzOm9iamVjdCA9IHN1cGVyLnNlcmlhbGl6ZShlbmNvZGluZyk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAuLi5maWVsZHMsXG4gICAgICAgICAgICBcImRlbGVnYXRpb25GZWVcIjogc2VyaWFsaXplci5lbmNvZGVyKHRoaXMuZ2V0RGVsZWdhdGlvbkZlZUJ1ZmZlcigpLCBlbmNvZGluZywgXCJCdWZmZXJcIiwgXCJkZWNpbWFsU3RyaW5nXCIsIDQpXG4gICAgICAgIH1cbiAgICB9O1xuICAgIGRlc2VyaWFsaXplKGZpZWxkczpvYmplY3QsIGVuY29kaW5nOlNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpIHtcbiAgICAgICAgc3VwZXIuZGVzZXJpYWxpemUoZmllbGRzLCBlbmNvZGluZyk7XG4gICAgICAgIGxldCBkYnVmZjpCdWZmZXIgPSBzZXJpYWxpemVyLmRlY29kZXIoZmllbGRzW1wiZGVsZWdhdGlvbkZlZVwiXSwgZW5jb2RpbmcsIFwiZGVjaW1hbFN0cmluZ1wiLCBcIkJ1ZmZlclwiLCA0KTtcbiAgICAgICAgdGhpcy5kZWxlZ2F0aW9uRmVlID0gZGJ1ZmYucmVhZFVJbnQzMkJFKDApIC8gQWRkVmFsaWRhdG9yVHguZGVsZWdhdG9yTXVsdGlwbGllcjtcbiAgICB9XG4gIFxuXG5cbiAgICBwcm90ZWN0ZWQgZGVsZWdhdGlvbkZlZTpudW1iZXIgPSAwO1xuICAgIHByaXZhdGUgc3RhdGljIGRlbGVnYXRvck11bHRpcGxpZXI6bnVtYmVyID0gMTAwMDA7XG5cbiAgICAvKipcbiAgICAgICAqIFJldHVybnMgdGhlIGlkIG9mIHRoZSBbW0FkZFZhbGlkYXRvclR4XV1cbiAgICAgICAqL1xuICAgIGdldFR4VHlwZSA9ICgpOm51bWJlciA9PiB7XG4gICAgcmV0dXJuIHRoaXMuX3R5cGVJRDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBkZWxlZ2F0aW9uIGZlZSAocmVwcmVzZW50cyBhIHBlcmNlbnRhZ2UgZnJvbSAwIHRvIDEwMCk7XG4gICAgICovXG4gICAgZ2V0RGVsZWdhdGlvbkZlZSgpOm51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLmRlbGVnYXRpb25GZWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgYmluYXJ5IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBkZWxlZ2F0aW9uIGZlZSBhcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9LlxuICAgICAqL1xuICAgIGdldERlbGVnYXRpb25GZWVCdWZmZXIoKTpCdWZmZXIge1xuICAgICAgICBsZXQgZEJ1ZmY6QnVmZmVyID0gQnVmZmVyLmFsbG9jKDQpO1xuICAgICAgICBsZXQgYnVmZm51bTpudW1iZXIgPSBwYXJzZUZsb2F0KHRoaXMuZGVsZWdhdGlvbkZlZS50b0ZpeGVkKDQpKSAqIEFkZFZhbGlkYXRvclR4LmRlbGVnYXRvck11bHRpcGxpZXI7XG4gICAgICAgIGRCdWZmLndyaXRlVUludDMyQkUoYnVmZm51bSwgMCk7XG4gICAgICAgIHJldHVybiBkQnVmZjtcbiAgICB9XG5cbiAgICBmcm9tQnVmZmVyKGJ5dGVzOkJ1ZmZlciwgb2Zmc2V0Om51bWJlciA9IDApOm51bWJlciB7XG4gICAgICAgIG9mZnNldCA9IHN1cGVyLmZyb21CdWZmZXIoYnl0ZXMsIG9mZnNldCk7XG4gICAgICAgIGxldCBkYnVmZjpCdWZmZXIgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyA0KTtcbiAgICAgICAgb2Zmc2V0ICs9IDQ7XG4gICAgICAgIHRoaXMuZGVsZWdhdGlvbkZlZSA9IGRidWZmLnJlYWRVSW50MzJCRSgwKSAvIEFkZFZhbGlkYXRvclR4LmRlbGVnYXRvck11bHRpcGxpZXI7XG4gICAgICAgIHJldHVybiBvZmZzZXQ7XG4gICAgfVxuXG4gICAgdG9CdWZmZXIoKTpCdWZmZXIge1xuICAgICAgICBsZXQgc3VwZXJCdWZmOkJ1ZmZlciA9IHN1cGVyLnRvQnVmZmVyKCk7XG4gICAgICAgIGxldCBmZWVCdWZmOkJ1ZmZlciA9IHRoaXMuZ2V0RGVsZWdhdGlvbkZlZUJ1ZmZlcigpO1xuICAgICAgICByZXR1cm4gQnVmZmVyLmNvbmNhdChbc3VwZXJCdWZmLCBmZWVCdWZmXSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2xhc3MgcmVwcmVzZW50aW5nIGFuIHVuc2lnbmVkIEFkZFZhbGlkYXRvclR4IHRyYW5zYWN0aW9uLlxuICAgICAqXG4gICAgICogQHBhcmFtIG5ldHdvcmtpZCBPcHRpb25hbC4gTmV0d29ya2lkLCBbW0RlZmF1bHROZXR3b3JrSURdXVxuICAgICAqIEBwYXJhbSBibG9ja2NoYWluaWQgT3B0aW9uYWwuIEJsb2NrY2hhaW5pZCwgZGVmYXVsdCBCdWZmZXIuYWxsb2MoMzIsIDE2KVxuICAgICAqIEBwYXJhbSBvdXRzIE9wdGlvbmFsLiBBcnJheSBvZiB0aGUgW1tUcmFuc2ZlcmFibGVPdXRwdXRdXXNcbiAgICAgKiBAcGFyYW0gaW5zIE9wdGlvbmFsLiBBcnJheSBvZiB0aGUgW1tUcmFuc2ZlcmFibGVJbnB1dF1dc1xuICAgICAqIEBwYXJhbSBtZW1vIE9wdGlvbmFsLiB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBmb3IgdGhlIG1lbW8gZmllbGRcbiAgICAgKiBAcGFyYW0gbm9kZUlEIE9wdGlvbmFsLiBUaGUgbm9kZSBJRCBvZiB0aGUgdmFsaWRhdG9yIGJlaW5nIGFkZGVkLlxuICAgICAqIEBwYXJhbSBzdGFydFRpbWUgT3B0aW9uYWwuIFRoZSBVbml4IHRpbWUgd2hlbiB0aGUgdmFsaWRhdG9yIHN0YXJ0cyB2YWxpZGF0aW5nIHRoZSBQcmltYXJ5IE5ldHdvcmsuXG4gICAgICogQHBhcmFtIGVuZFRpbWUgT3B0aW9uYWwuIFRoZSBVbml4IHRpbWUgd2hlbiB0aGUgdmFsaWRhdG9yIHN0b3BzIHZhbGlkYXRpbmcgdGhlIFByaW1hcnkgTmV0d29yayAoYW5kIHN0YWtlZCBBVkFYIGlzIHJldHVybmVkKS5cbiAgICAgKiBAcGFyYW0gc3Rha2VBbW91bnQgT3B0aW9uYWwuIFRoZSBhbW91bnQgb2YgbkFWQVggdGhlIHZhbGlkYXRvciBpcyBzdGFraW5nLlxuICAgICAqIEBwYXJhbSBzdGFrZU91dHMgT3B0aW9uYWwuIFRoZSBvdXRwdXRzIHVzZWQgaW4gcGF5aW5nIHRoZSBzdGFrZS5cbiAgICAgKiBAcGFyYW0gcmV3YXJkT3duZXJzIE9wdGlvbmFsLiBUaGUgW1tQYXJzZWFibGVPdXRwdXRdXSBjb250YWluaW5nIHRoZSBbW1NFQ1BPd25lck91dHB1dF1dIGZvciB0aGUgcmV3YXJkcy5cbiAgICAgKiBAcGFyYW0gZGVsZWdhdGlvbkZlZSBPcHRpb25hbC4gVGhlIHBlcmNlbnQgZmVlIHRoaXMgdmFsaWRhdG9yIGNoYXJnZXMgd2hlbiBvdGhlcnMgZGVsZWdhdGUgc3Rha2UgdG8gdGhlbS4gXG4gICAgICogVXAgdG8gNCBkZWNpbWFsIHBsYWNlcyBhbGxvd2VkOyBhZGRpdGlvbmFsIGRlY2ltYWwgcGxhY2VzIGFyZSBpZ25vcmVkLiBNdXN0IGJlIGJldHdlZW4gMCBhbmQgMTAwLCBpbmNsdXNpdmUuIFxuICAgICAqIEZvciBleGFtcGxlLCBpZiBkZWxlZ2F0aW9uRmVlUmF0ZSBpcyAxLjIzNDUgYW5kIHNvbWVvbmUgZGVsZWdhdGVzIHRvIHRoaXMgdmFsaWRhdG9yLCB0aGVuIHdoZW4gdGhlIGRlbGVnYXRpb24gXG4gICAgICogcGVyaW9kIGlzIG92ZXIsIDEuMjM0NSUgb2YgdGhlIHJld2FyZCBnb2VzIHRvIHRoZSB2YWxpZGF0b3IgYW5kIHRoZSByZXN0IGdvZXMgdG8gdGhlIGRlbGVnYXRvci5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgbmV0d29ya2lkOm51bWJlciA9IERlZmF1bHROZXR3b3JrSUQsIFxuICAgICAgICBibG9ja2NoYWluaWQ6QnVmZmVyID0gQnVmZmVyLmFsbG9jKDMyLCAxNiksIFxuICAgICAgICBvdXRzOkFycmF5PFRyYW5zZmVyYWJsZU91dHB1dD4gPSB1bmRlZmluZWQsIFxuICAgICAgICBpbnM6QXJyYXk8VHJhbnNmZXJhYmxlSW5wdXQ+ID0gdW5kZWZpbmVkLCBcbiAgICAgICAgbWVtbzpCdWZmZXIgPSB1bmRlZmluZWQsIFxuICAgICAgICBub2RlSUQ6QnVmZmVyID0gdW5kZWZpbmVkLCBcbiAgICAgICAgc3RhcnRUaW1lOkJOID0gdW5kZWZpbmVkLCBcbiAgICAgICAgZW5kVGltZTpCTiA9IHVuZGVmaW5lZCxcbiAgICAgICAgc3Rha2VBbW91bnQ6Qk4gPSB1bmRlZmluZWQsXG4gICAgICAgIHN0YWtlT3V0czpBcnJheTxUcmFuc2ZlcmFibGVPdXRwdXQ+ID0gdW5kZWZpbmVkLFxuICAgICAgICByZXdhcmRPd25lcnM6UGFyc2VhYmxlT3V0cHV0ID0gdW5kZWZpbmVkLFxuICAgICAgICBkZWxlZ2F0aW9uRmVlOm51bWJlciA9IHVuZGVmaW5lZFxuICAgICkge1xuICAgICAgICBzdXBlcihcbiAgICAgICAgICAgIG5ldHdvcmtpZCwgXG4gICAgICAgICAgICBibG9ja2NoYWluaWQsIFxuICAgICAgICAgICAgb3V0cywgXG4gICAgICAgICAgICBpbnMsIFxuICAgICAgICAgICAgbWVtbywgXG4gICAgICAgICAgICBub2RlSUQsIFxuICAgICAgICAgICAgc3RhcnRUaW1lLCBcbiAgICAgICAgICAgIGVuZFRpbWUsXG4gICAgICAgICAgICBzdGFrZUFtb3VudCxcbiAgICAgICAgICAgIHN0YWtlT3V0cyxcbiAgICAgICAgICAgIHJld2FyZE93bmVyc1xuICAgICAgICApO1xuICAgICAgICBpZih0eXBlb2YgZGVsZWdhdGlvbkZlZSA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICAgICAgaWYoZGVsZWdhdGlvbkZlZSA+PSAwICYmIGRlbGVnYXRpb25GZWUgPD0gMTAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kZWxlZ2F0aW9uRmVlID0gcGFyc2VGbG9hdChkZWxlZ2F0aW9uRmVlLnRvRml4ZWQoNCkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBZGRWYWxpZGF0b3JUeC5jb25zdHJ1Y3RvciAtLSBkZWxlZ2F0aW9uRmVlIG11c3QgYmUgaW4gdGhlIHJhbmdlIG9mIDAgYW5kIDEwMCwgaW5jbHVzaXZlbHkuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufSJdfQ==