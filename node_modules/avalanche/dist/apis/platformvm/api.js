"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformVMAPI = void 0;
/**
 * @packageDocumentation
 * @module API-PlatformVM
 */
const buffer_1 = require("buffer/");
const bn_js_1 = __importDefault(require("bn.js"));
const jrpcapi_1 = require("../../common/jrpcapi");
const bintools_1 = __importDefault(require("../../utils/bintools"));
const keychain_1 = require("./keychain");
const constants_1 = require("../../utils/constants");
const constants_2 = require("./constants");
const tx_1 = require("./tx");
const payload_1 = require("../../utils/payload");
const helperfunctions_1 = require("../../utils/helperfunctions");
const utxos_1 = require("../platformvm/utxos");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
/**
 * Class for interacting with a node's PlatformVMAPI
 *
 * @category RPCAPIs
 *
 * @remarks This extends the [[JRPCAPI]] class. This class should not be directly called. Instead, use the [[Avalanche.addAPI]] function to register this interface with Avalanche.
 */
class PlatformVMAPI extends jrpcapi_1.JRPCAPI {
    /**
     * This class should not be instantiated directly.
     * Instead use the [[Avalanche.addAPI]] method.
     *
     * @param core A reference to the Avalanche class
     * @param baseurl Defaults to the string "/ext/P" as the path to blockchain's baseurl
     */
    constructor(core, baseurl = '/ext/bc/P') {
        super(core, baseurl);
        /**
         * @ignore
         */
        this.keychain = new keychain_1.KeyChain('', '');
        this.blockchainID = constants_1.PlatformChainID;
        this.blockchainAlias = undefined;
        this.AVAXAssetID = undefined;
        this.txFee = undefined;
        this.creationTxFee = undefined;
        this.minValidatorStake = undefined;
        this.minDelegatorStake = undefined;
        /**
         * Gets the alias for the blockchainID if it exists, otherwise returns `undefined`.
         *
         * @returns The alias for the blockchainID
         */
        this.getBlockchainAlias = () => {
            if (typeof this.blockchainAlias === "undefined") {
                const netid = this.core.getNetworkID();
                if (netid in constants_1.Defaults.network && this.blockchainID in constants_1.Defaults.network[netid]) {
                    this.blockchainAlias = constants_1.Defaults.network[netid][this.blockchainID].alias;
                    return this.blockchainAlias;
                }
                else {
                    /* istanbul ignore next */
                    return undefined;
                }
            }
            return this.blockchainAlias;
        };
        /**
         * Sets the alias for the blockchainID.
         *
         * @param alias The alias for the blockchainID.
         *
         */
        this.setBlockchainAlias = (alias) => {
            this.blockchainAlias = alias;
            /* istanbul ignore next */
            return undefined;
        };
        /**
         * Gets the blockchainID and returns it.
         *
         * @returns The blockchainID
         */
        this.getBlockchainID = () => this.blockchainID;
        /**
         * Refresh blockchainID, and if a blockchainID is passed in, use that.
         *
         * @param Optional. BlockchainID to assign, if none, uses the default based on networkID.
         *
         * @returns The blockchainID
         */
        this.refreshBlockchainID = (blockchainID = undefined) => {
            const netid = this.core.getNetworkID();
            if (typeof blockchainID === 'undefined' && typeof constants_1.Defaults.network[netid] !== "undefined") {
                this.blockchainID = constants_1.PlatformChainID; //default to P-Chain
                return true;
            }
            if (typeof blockchainID === 'string') {
                this.blockchainID = blockchainID;
                return true;
            }
            return false;
        };
        /**
         * Takes an address string and returns its {@link https://github.com/feross/buffer|Buffer} representation if valid.
         *
         * @returns A {@link https://github.com/feross/buffer|Buffer} for the address if valid, undefined if not valid.
         */
        this.parseAddress = (addr) => {
            const alias = this.getBlockchainAlias();
            const blockchainID = this.getBlockchainID();
            return bintools.parseAddress(addr, blockchainID, alias, constants_2.PlatformVMConstants.ADDRESSLENGTH);
        };
        this.addressFromBuffer = (address) => {
            const chainid = this.getBlockchainAlias() ? this.getBlockchainAlias() : this.getBlockchainID();
            return bintools.addressToString(this.core.getHRP(), chainid, address);
        };
        /**
         * Fetches the AVAX AssetID and returns it in a Promise.
         *
         * @param refresh This function caches the response. Refresh = true will bust the cache.
         *
         * @returns The the provided string representing the AVAX AssetID
         */
        this.getAVAXAssetID = (refresh = false) => __awaiter(this, void 0, void 0, function* () {
            if (typeof this.AVAXAssetID === 'undefined' || refresh) {
                const assetID = yield this.getStakingAssetID();
                this.AVAXAssetID = bintools.cb58Decode(assetID);
            }
            return this.AVAXAssetID;
        });
        /**
         * Overrides the defaults and sets the cache to a specific AVAX AssetID
         *
         * @param avaxAssetID A cb58 string or Buffer representing the AVAX AssetID
         *
         * @returns The the provided string representing the AVAX AssetID
         */
        this.setAVAXAssetID = (avaxAssetID) => {
            if (typeof avaxAssetID === "string") {
                avaxAssetID = bintools.cb58Decode(avaxAssetID);
            }
            this.AVAXAssetID = avaxAssetID;
        };
        /**
         * Gets the default tx fee for this chain.
         *
         * @returns The default tx fee as a {@link https://github.com/indutny/bn.js/|BN}
         */
        this.getDefaultTxFee = () => {
            return this.core.getNetworkID() in constants_1.Defaults.network ? new bn_js_1.default(constants_1.Defaults.network[this.core.getNetworkID()]["P"]["txFee"]) : new bn_js_1.default(0);
        };
        /**
         * Gets the tx fee for this chain.
         *
         * @returns The tx fee as a {@link https://github.com/indutny/bn.js/|BN}
         */
        this.getTxFee = () => {
            if (typeof this.txFee === "undefined") {
                this.txFee = this.getDefaultTxFee();
            }
            return this.txFee;
        };
        /**
         * Sets the tx fee for this chain.
         *
         * @param fee The tx fee amount to set as {@link https://github.com/indutny/bn.js/|BN}
         */
        this.setTxFee = (fee) => {
            this.txFee = fee;
        };
        /**
         * Gets the default creation fee for this chain.
         *
         * @returns The default creation fee as a {@link https://github.com/indutny/bn.js/|BN}
         */
        this.getDefaultCreationTxFee = () => {
            return this.core.getNetworkID() in constants_1.Defaults.network ? new bn_js_1.default(constants_1.Defaults.network[this.core.getNetworkID()]["P"]["creationTxFee"]) : new bn_js_1.default(0);
        };
        /**
         * Gets the creation fee for this chain.
         *
         * @returns The creation fee as a {@link https://github.com/indutny/bn.js/|BN}
         */
        this.getCreationTxFee = () => {
            if (typeof this.creationTxFee === "undefined") {
                this.creationTxFee = this.getDefaultCreationTxFee();
            }
            return this.creationTxFee;
        };
        /**
         * Sets the creation fee for this chain.
         *
         * @param fee The creation fee amount to set as {@link https://github.com/indutny/bn.js/|BN}
         */
        this.setCreationTxFee = (fee) => {
            this.creationTxFee = fee;
        };
        /**
         * Gets a reference to the keychain for this class.
         *
         * @returns The instance of [[]] for this class
         */
        this.keyChain = () => this.keychain;
        /**
         * @ignore
         */
        this.newKeyChain = () => {
            // warning, overwrites the old keychain
            const alias = this.getBlockchainAlias();
            if (alias) {
                this.keychain = new keychain_1.KeyChain(this.core.getHRP(), alias);
            }
            else {
                this.keychain = new keychain_1.KeyChain(this.core.getHRP(), this.blockchainID);
            }
            return this.keychain;
        };
        /**
         * Helper function which determines if a tx is a goose egg transaction.
         *
         * @param utx An UnsignedTx
         *
         * @returns boolean true if passes goose egg test and false if fails.
         *
         * @remarks
         * A "Goose Egg Transaction" is when the fee far exceeds a reasonable amount
         */
        this.checkGooseEgg = (utx, outTotal = new bn_js_1.default(0)) => __awaiter(this, void 0, void 0, function* () {
            const avaxAssetID = yield this.getAVAXAssetID();
            let outputTotal = outTotal.gt(new bn_js_1.default(0)) ? outTotal : utx.getOutputTotal(avaxAssetID);
            const fee = utx.getBurn(avaxAssetID);
            if (fee.lte(constants_1.ONEAVAX.mul(new bn_js_1.default(10))) || fee.lte(outputTotal)) {
                return true;
            }
            else {
                return false;
            }
        });
        /**
         * Retrieves an assetID for a subnet's staking assset.
         *
         * @returns Returns a Promise<string> with cb58 encoded value of the assetID.
         */
        this.getStakingAssetID = () => __awaiter(this, void 0, void 0, function* () {
            const params = {};
            return this.callMethod('platform.getStakingAssetID', params).then((response) => (response.data.result.assetID));
        });
        /**
         * Creates a new blockchain.
         *
         * @param username The username of the Keystore user that controls the new account
         * @param password The password of the Keystore user that controls the new account
         * @param subnetID Optional. Either a {@link https://github.com/feross/buffer|Buffer} or an cb58 serialized string for the SubnetID or its alias.
         * @param vmID The ID of the Virtual Machine the blockchain runs. Can also be an alias of the Virtual Machine.
         * @param FXIDs The ids of the FXs the VM is running.
         * @param name A human-readable name for the new blockchain
         * @param genesis The base 58 (with checksum) representation of the genesis state of the new blockchain. Virtual Machines should have a static API method named buildGenesis that can be used to generate genesisData.
         *
         * @returns Promise for the unsigned transaction to create this blockchain. Must be signed by a sufficient number of the Subnet’s control keys and by the account paying the transaction fee.
         */
        this.createBlockchain = (username, password, subnetID = undefined, vmID, fxIDs, name, genesis) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                username,
                password,
                fxIDs,
                vmID,
                name,
                genesisData: genesis,
            };
            if (typeof subnetID === 'string') {
                params.subnetID = subnetID;
            }
            else if (typeof subnetID !== 'undefined') {
                params.subnetID = bintools.cb58Encode(subnetID);
            }
            return this.callMethod('platform.createBlockchain', params)
                .then((response) => response.data.result.txID);
        });
        /**
         * Gets the status of a blockchain.
         *
         * @param blockchainID The blockchainID requesting a status update
         *
         * @returns Promise for a string of one of: "Validating", "Created", "Preferred", "Unknown".
         */
        this.getBlockchainStatus = (blockchainID) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                blockchainID,
            };
            return this.callMethod('platform.getBlockchainStatus', params)
                .then((response) => response.data.result.status);
        });
        /**
         * Create an address in the node's keystore.
         *
         * @param username The username of the Keystore user that controls the new account
         * @param password The password of the Keystore user that controls the new account
         *
         * @returns Promise for a string of the newly created account address.
         */
        this.createAddress = (username, password) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                username,
                password,
            };
            return this.callMethod('platform.createAddress', params)
                .then((response) => response.data.result.address);
        });
        /**
         * Gets the balance of a particular asset.
         *
         * @param address The address to pull the asset balance from
         *
         * @returns Promise with the balance as a {@link https://github.com/indutny/bn.js/|BN} on the provided address.
         */
        this.getBalance = (address) => __awaiter(this, void 0, void 0, function* () {
            if (typeof this.parseAddress(address) === 'undefined') {
                /* istanbul ignore next */
                throw new Error(`Error - PlatformVMAPI.getBalance: Invalid address format ${address}`);
            }
            const params = {
                address
            };
            return this.callMethod('platform.getBalance', params).then((response) => response.data.result);
        });
        /**
         * List the addresses controlled by the user.
         *
         * @param username The username of the Keystore user
         * @param password The password of the Keystore user
         *
         * @returns Promise for an array of addresses.
         */
        this.listAddresses = (username, password) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                username,
                password,
            };
            return this.callMethod('platform.listAddresses', params)
                .then((response) => response.data.result.addresses);
        });
        /**
         * Lists the set of current validators.
         *
         * @param subnetID Optional. Either a {@link https://github.com/feross/buffer|Buffer} or an
         * cb58 serialized string for the SubnetID or its alias.
         *
         * @returns Promise for an array of validators that are currently staking, see: {@link https://docs.avax.network/v1.0/en/api/platform/#platformgetcurrentvalidators|platform.getCurrentValidators documentation}.
         *
         */
        this.getCurrentValidators = (subnetID = undefined) => __awaiter(this, void 0, void 0, function* () {
            const params = {};
            if (typeof subnetID === 'string') {
                params.subnetID = subnetID;
            }
            else if (typeof subnetID !== 'undefined') {
                params.subnetID = bintools.cb58Encode(subnetID);
            }
            return this.callMethod('platform.getCurrentValidators', params)
                .then((response) => response.data.result);
        });
        /**
         * Lists the set of pending validators.
         *
         * @param subnetID Optional. Either a {@link https://github.com/feross/buffer|Buffer}
         * or a cb58 serialized string for the SubnetID or its alias.
         *
         * @returns Promise for an array of validators that are pending staking, see: {@link https://docs.avax.network/v1.0/en/api/platform/#platformgetpendingvalidators|platform.getPendingValidators documentation}.
         *
         */
        this.getPendingValidators = (subnetID = undefined) => __awaiter(this, void 0, void 0, function* () {
            const params = {};
            if (typeof subnetID === 'string') {
                params.subnetID = subnetID;
            }
            else if (typeof subnetID !== 'undefined') {
                params.subnetID = bintools.cb58Encode(subnetID);
            }
            return this.callMethod('platform.getPendingValidators', params)
                .then((response) => response.data.result);
        });
        /**
         * Samples `Size` validators from the current validator set.
         *
         * @param sampleSize Of the total universe of validators, select this many at random
         * @param subnetID Optional. Either a {@link https://github.com/feross/buffer|Buffer} or an
         * cb58 serialized string for the SubnetID or its alias.
         *
         * @returns Promise for an array of validator's stakingIDs.
         */
        this.sampleValidators = (sampleSize, subnetID = undefined) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                size: sampleSize.toString(),
            };
            if (typeof subnetID === 'string') {
                params.subnetID = subnetID;
            }
            else if (typeof subnetID !== 'undefined') {
                params.subnetID = bintools.cb58Encode(subnetID);
            }
            return this.callMethod('platform.sampleValidators', params)
                .then((response) => response.data.result.validators);
        });
        /**
         * Add a validator to the Primary Network.
         *
         * @param username The username of the Keystore user
         * @param password The password of the Keystore user
         * @param nodeID The node ID of the validator
         * @param startTime Javascript Date object for the start time to validate
         * @param endTime Javascript Date object for the end time to validate
         * @param stakeAmount The amount of nAVAX the validator is staking as
         * a {@link https://github.com/indutny/bn.js/|BN}
         * @param rewardAddress The address the validator reward will go to, if there is one.
         * @param delegationFeeRate Optional. A {@link https://github.com/indutny/bn.js/|BN} for the percent fee this validator
         * charges when others delegate stake to them. Up to 4 decimal places allowed; additional decimal places are ignored.
         * Must be between 0 and 100, inclusive. For example, if delegationFeeRate is 1.2345 and someone delegates to this
         * validator, then when the delegation period is over, 1.2345% of the reward goes to the validator and the rest goes
         * to the delegator.
         *
         * @returns Promise for a base58 string of the unsigned transaction.
         */
        this.addValidator = (username, password, nodeID, startTime, endTime, stakeAmount, rewardAddress, delegationFeeRate = undefined) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                username,
                password,
                nodeID,
                startTime: startTime.getTime() / 1000,
                endTime: endTime.getTime() / 1000,
                stakeAmount: stakeAmount.toString(10),
                rewardAddress,
            };
            if (typeof delegationFeeRate !== 'undefined') {
                params.delegationFeeRate = delegationFeeRate.toString(10);
            }
            return this.callMethod('platform.addValidator', params)
                .then((response) => response.data.result.txID);
        });
        /**
         * Add a validator to a Subnet other than the Primary Network. The validator must validate the Primary Network for the entire duration they validate this Subnet.
         *
         * @param username The username of the Keystore user
         * @param password The password of the Keystore user
         * @param nodeID The node ID of the validator
         * @param subnetID Either a {@link https://github.com/feross/buffer|Buffer} or a cb58 serialized string for the SubnetID or its alias.
         * @param startTime Javascript Date object for the start time to validate
         * @param endTime Javascript Date object for the end time to validate
         * @param weight The validator’s weight used for sampling
         *
         * @returns Promise for the unsigned transaction. It must be signed (using sign) by the proper number of the Subnet’s control keys and by the key of the account paying the transaction fee before it can be issued.
         */
        this.addSubnetValidator = (username, password, nodeID, subnetID, startTime, endTime, weight) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                username,
                password,
                nodeID,
                startTime: startTime.getTime() / 1000,
                endTime: endTime.getTime() / 1000,
                weight
            };
            if (typeof subnetID === 'string') {
                params.subnetID = subnetID;
            }
            else if (typeof subnetID !== 'undefined') {
                params.subnetID = bintools.cb58Encode(subnetID);
            }
            return this.callMethod('platform.addSubnetValidator', params)
                .then((response) => response.data.result.txID);
        });
        /**
         * Add a delegator to the Primary Network.
         *
         * @param username The username of the Keystore user
         * @param password The password of the Keystore user
         * @param nodeID The node ID of the delegatee
         * @param startTime Javascript Date object for when the delegator starts delegating
         * @param endTime Javascript Date object for when the delegator starts delegating
         * @param stakeAmount The amount of nAVAX the delegator is staking as
         * a {@link https://github.com/indutny/bn.js/|BN}
         * @param rewardAddress The address of the account the staked AVAX and validation reward
         * (if applicable) are sent to at endTime
         *
         * @returns Promise for an array of validator's stakingIDs.
         */
        this.addDelegator = (username, password, nodeID, startTime, endTime, stakeAmount, rewardAddress) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                username,
                password,
                nodeID,
                startTime: startTime.getTime() / 1000,
                endTime: endTime.getTime() / 1000,
                stakeAmount: stakeAmount.toString(10),
                rewardAddress,
            };
            return this.callMethod('platform.addDelegator', params)
                .then((response) => response.data.result.txID);
        });
        /**
         * Create an unsigned transaction to create a new Subnet. The unsigned transaction must be
         * signed with the key of the account paying the transaction fee. The Subnet’s ID is the ID of the transaction that creates it (ie the response from issueTx when issuing the signed transaction).
         *
         * @param username The username of the Keystore user
         * @param password The password of the Keystore user
         * @param controlKeys Array of platform addresses as strings
         * @param threshold To add a validator to this Subnet, a transaction must have threshold
         * signatures, where each signature is from a key whose address is an element of `controlKeys`
         *
         * @returns Promise for a string with the unsigned transaction encoded as base58.
         */
        this.createSubnet = (username, password, controlKeys, threshold) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                username,
                password,
                controlKeys,
                threshold
            };
            return this.callMethod('platform.createSubnet', params)
                .then((response) => response.data.result.txID);
        });
        /**
         * Get the Subnet that validates a given blockchain.
         *
         * @param blockchainID Either a {@link https://github.com/feross/buffer|Buffer} or a cb58
         * encoded string for the blockchainID or its alias.
         *
         * @returns Promise for a string of the subnetID that validates the blockchain.
         */
        this.validatedBy = (blockchainID) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                blockchainID,
            };
            return this.callMethod('platform.validatedBy', params)
                .then((response) => response.data.result.subnetID);
        });
        /**
         * Get the IDs of the blockchains a Subnet validates.
         *
         * @param subnetID Either a {@link https://github.com/feross/buffer|Buffer} or an AVAX
         * serialized string for the SubnetID or its alias.
         *
         * @returns Promise for an array of blockchainIDs the subnet validates.
         */
        this.validates = (subnetID) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                subnetID,
            };
            if (typeof subnetID === 'string') {
                params.subnetID = subnetID;
            }
            else if (typeof subnetID !== 'undefined') {
                params.subnetID = bintools.cb58Encode(subnetID);
            }
            return this.callMethod('platform.validates', params)
                .then((response) => response.data.result.blockchainIDs);
        });
        /**
         * Get all the blockchains that exist (excluding the P-Chain).
         *
         * @returns Promise for an array of objects containing fields "id", "subnetID", and "vmID".
         */
        this.getBlockchains = () => __awaiter(this, void 0, void 0, function* () {
            const params = {};
            return this.callMethod('platform.getBlockchains', params)
                .then((response) => response.data.result.blockchains);
        });
        /**
         * Send AVAX from an account on the P-Chain to an address on the X-Chain. This transaction
         * must be signed with the key of the account that the AVAX is sent from and which pays the
         * transaction fee. After issuing this transaction, you must call the X-Chain’s importAVAX
         * method to complete the transfer.
         *
         * @param username The Keystore user that controls the account specified in `to`
         * @param password The password of the Keystore user
         * @param to The address on the X-Chain to send the AVAX to. Do not include X- in the address
         * @param amount Amount of AVAX to export as a {@link https://github.com/indutny/bn.js/|BN}
         *
         * @returns Promise for an unsigned transaction to be signed by the account the the AVAX is
         * sent from and pays the transaction fee.
         */
        this.exportAVAX = (username, password, amount, to) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                username,
                password,
                to,
                amount: amount.toString(10)
            };
            return this.callMethod('platform.exportAVAX', params)
                .then((response) => response.data.result.txID);
        });
        /**
         * Send AVAX from an account on the P-Chain to an address on the X-Chain. This transaction
         * must be signed with the key of the account that the AVAX is sent from and which pays
         * the transaction fee. After issuing this transaction, you must call the X-Chain’s
         * importAVAX method to complete the transfer.
         *
         * @param username The Keystore user that controls the account specified in `to`
         * @param password The password of the Keystore user
         * @param to The ID of the account the AVAX is sent to. This must be the same as the to
         * argument in the corresponding call to the X-Chain’s exportAVAX
         * @param sourceChain The chainID where the funds are coming from.
         *
         * @returns Promise for a string for the transaction, which should be sent to the network
         * by calling issueTx.
         */
        this.importAVAX = (username, password, to, sourceChain) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                to,
                sourceChain,
                username,
                password,
            };
            return this.callMethod('platform.importAVAX', params)
                .then((response) => response.data.result.txID);
        });
        /**
         * Calls the node's issueTx method from the API and returns the resulting transaction ID as a string.
         *
         * @param tx A string, {@link https://github.com/feross/buffer|Buffer}, or [[Tx]] representing a transaction
         *
         * @returns A Promise<string> representing the transaction ID of the posted transaction.
         */
        this.issueTx = (tx) => __awaiter(this, void 0, void 0, function* () {
            let Transaction = '';
            if (typeof tx === 'string') {
                Transaction = tx;
            }
            else if (tx instanceof buffer_1.Buffer) {
                const txobj = new tx_1.Tx();
                txobj.fromBuffer(tx);
                Transaction = txobj.toString();
            }
            else if (tx instanceof tx_1.Tx) {
                Transaction = tx.toString();
            }
            else {
                /* istanbul ignore next */
                throw new Error('Error - platform.issueTx: provided tx is not expected type of string, Buffer, or Tx');
            }
            const params = {
                tx: Transaction.toString(),
            };
            return this.callMethod('platform.issueTx', params).then((response) => response.data.result.txID);
        });
        /**
         * Returns an upper bound on the amount of tokens that exist. Not monotonically increasing because this number can go down if a staker's reward is denied.
         */
        this.getCurrentSupply = () => __awaiter(this, void 0, void 0, function* () {
            const params = {};
            return this.callMethod('platform.getCurrentSupply', params)
                .then((response) => new bn_js_1.default(response.data.result.supply, 10));
        });
        /**
         * Returns the height of the platform chain.
         */
        this.getHeight = () => __awaiter(this, void 0, void 0, function* () {
            const params = {};
            return this.callMethod('platform.getHeight', params)
                .then((response) => new bn_js_1.default(response.data.result.height, 10));
        });
        /**
         * Gets the minimum staking amount.
         *
         * @param refresh A boolean to bypass the local cached value of Minimum Stake Amount, polling the node instead.
         */
        this.getMinStake = (refresh = false) => __awaiter(this, void 0, void 0, function* () {
            if (refresh !== true && typeof this.minValidatorStake !== "undefined" && typeof this.minDelegatorStake !== "undefined") {
                return {
                    minValidatorStake: this.minValidatorStake,
                    minDelegatorStake: this.minDelegatorStake
                };
            }
            const params = {};
            return this.callMethod('platform.getMinStake', params)
                .then((response) => {
                this.minValidatorStake = new bn_js_1.default(response.data.result.minValidatorStake, 10);
                this.minDelegatorStake = new bn_js_1.default(response.data.result.minDelegatorStake, 10);
                return {
                    minValidatorStake: this.minValidatorStake,
                    minDelegatorStake: this.minDelegatorStake
                };
            });
        });
        /**
         * Sets the minimum stake cached in this class.
         * @param minValidatorStake A {@link https://github.com/indutny/bn.js/|BN} to set the minimum stake amount cached in this class.
         * @param minDelegatorStake A {@link https://github.com/indutny/bn.js/|BN} to set the minimum delegation amount cached in this class.
         */
        this.setMinStake = (minValidatorStake = undefined, minDelegatorStake = undefined) => {
            if (typeof minValidatorStake !== "undefined") {
                this.minValidatorStake = minValidatorStake;
            }
            if (typeof minDelegatorStake !== "undefined") {
                this.minDelegatorStake = minDelegatorStake;
            }
        };
        /**
         * Gets the total amount staked for an array of addresses.
         */
        this.getStake = (addresses) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                addresses
            };
            return this.callMethod('platform.getStake', params)
                .then((response) => new bn_js_1.default(response.data.result.staked, 10));
        });
        /**
         * Get all the subnets that exist.
         *
         * @param ids IDs of the subnets to retrieve information about. If omitted, gets all subnets
         *
         * @returns Promise for an array of objects containing fields "id",
         * "controlKeys", and "threshold".
         */
        this.getSubnets = (ids = undefined) => __awaiter(this, void 0, void 0, function* () {
            const params = {};
            if (typeof ids !== undefined) {
                params.ids = ids;
            }
            return this.callMethod('platform.getSubnets', params)
                .then((response) => response.data.result.subnets);
        });
        /**
         * Exports the private key for an address.
         *
         * @param username The name of the user with the private key
         * @param password The password used to decrypt the private key
         * @param address The address whose private key should be exported
         *
         * @returns Promise with the decrypted private key as store in the database
         */
        this.exportKey = (username, password, address) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                username,
                password,
                address,
            };
            return this.callMethod('platform.exportKey', params)
                .then((response) => response.data.result.privateKey);
        });
        /**
         * Give a user control over an address by providing the private key that controls the address.
         *
         * @param username The name of the user to store the private key
         * @param password The password that unlocks the user
         * @param privateKey A string representing the private key in the vm's format
         *
         * @returns The address for the imported private key.
         */
        this.importKey = (username, password, privateKey) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                username,
                password,
                privateKey,
            };
            return this.callMethod('platform.importKey', params)
                .then((response) => response.data.result.address);
        });
        /**
         * Returns the treansaction data of a provided transaction ID by calling the node's `getTx` method.
         *
         * @param txid The string representation of the transaction ID
         *
         * @returns Returns a Promise<string> containing the bytes retrieved from the node
         */
        this.getTx = (txid) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                txID: txid,
            };
            return this.callMethod('platform.getTx', params).then((response) => response.data.result.tx);
        });
        /**
         * Returns the status of a provided transaction ID by calling the node's `getTxStatus` method.
         *
         * @param txid The string representation of the transaction ID
         * @param includeReason Return the reason tx was dropped, if applicable. Defaults to true
         *
         * @returns Returns a Promise<string> containing the status retrieved from the node and the reason a tx was dropped, if applicable.
         */
        this.getTxStatus = (txid, includeReason = true) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                txID: txid,
                includeReason: includeReason
            };
            return this.callMethod('platform.getTxStatus', params).then((response) => response.data.result);
        });
        /**
         * Retrieves the UTXOs related to the addresses provided from the node's `getUTXOs` method.
         *
         * @param addresses An array of addresses as cb58 strings or addresses as {@link https://github.com/feross/buffer|Buffer}s
         * @param sourceChain A string for the chain to look for the UTXO's. Default is to use this chain, but if exported UTXOs exist from other chains, this can used to pull them instead.
         * @param limit Optional. Returns at most [limit] addresses. If [limit] == 0 or > [maxUTXOsToFetch], fetches up to [maxUTXOsToFetch].
         * @param startIndex Optional. [StartIndex] defines where to start fetching UTXOs (for pagination.)
         * UTXOs fetched are from addresses equal to or greater than [StartIndex.Address]
         * For address [StartIndex.Address], only UTXOs with IDs greater than [StartIndex.Utxo] will be returned.
         * @param persistOpts Options available to persist these UTXOs in local storage
         *
         * @remarks
         * persistOpts is optional and must be of type [[PersistanceOptions]]
         *
         */
        this.getUTXOs = (addresses, sourceChain = undefined, limit = 0, startIndex = undefined, persistOpts = undefined) => __awaiter(this, void 0, void 0, function* () {
            if (typeof addresses === "string") {
                addresses = [addresses];
            }
            const params = {
                addresses: addresses,
                limit
            };
            if (typeof startIndex !== "undefined" && startIndex) {
                params.startIndex = startIndex;
            }
            if (typeof sourceChain !== "undefined") {
                params.sourceChain = sourceChain;
            }
            return this.callMethod('platform.getUTXOs', params).then((response) => {
                const utxos = new utxos_1.UTXOSet();
                let data = response.data.result.utxos;
                if (persistOpts && typeof persistOpts === 'object') {
                    if (this.db.has(persistOpts.getName())) {
                        const selfArray = this.db.get(persistOpts.getName());
                        if (Array.isArray(selfArray)) {
                            utxos.addArray(data);
                            const self = new utxos_1.UTXOSet();
                            self.addArray(selfArray);
                            self.mergeByRule(utxos, persistOpts.getMergeRule());
                            data = self.getAllUTXOStrings();
                        }
                    }
                    this.db.set(persistOpts.getName(), data, persistOpts.getOverwrite());
                }
                utxos.addArray(data, false);
                response.data.result.utxos = utxos;
                return response.data.result;
            });
        });
        /**
         * Helper function which creates an unsigned Import Tx. For more granular control, you may create your own
         * [[UnsignedTx]] manually (with their corresponding [[TransferableInput]]s, [[TransferableOutput]]s, and [[TransferOperation]]s).
         *
         * @param utxoset A set of UTXOs that the transaction is built on
         * @param ownerAddresses The addresses being used to import
         * @param sourceChain The chainid for where the import is coming from.
         * @param toAddresses The addresses to send the funds
         * @param fromAddresses The addresses being used to send the funds from the UTXOs provided
         * @param changeAddresses The addresses that can spend the change remaining from the spent UTXOs
         * @param memo Optional contains arbitrary bytes, up to 256 bytes
         * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
         * @param locktime Optional. The locktime field created in the resulting outputs
         * @param threshold Optional. The number of signatures required to spend the funds in the resultant UTXO
         *
         * @returns An unsigned transaction ([[UnsignedTx]]) which contains a [[ImportTx]].
         *
         * @remarks
         * This helper exists because the endpoint API should be the primary point of entry for most functionality.
         */
        this.buildImportTx = (utxoset, ownerAddresses, sourceChain, toAddresses, fromAddresses, changeAddresses = undefined, memo = undefined, asOf = helperfunctions_1.UnixNow(), locktime = new bn_js_1.default(0), threshold = 1) => __awaiter(this, void 0, void 0, function* () {
            const to = this._cleanAddressArray(toAddresses, 'buildBaseTx').map((a) => bintools.stringToAddress(a));
            const from = this._cleanAddressArray(fromAddresses, 'buildBaseTx').map((a) => bintools.stringToAddress(a));
            const change = this._cleanAddressArray(changeAddresses, 'buildBaseTx').map((a) => bintools.stringToAddress(a));
            let srcChain = undefined;
            if (typeof sourceChain === "undefined") {
                throw new Error("Error - PlatformVMAPI.buildImportTx: Source ChainID is undefined.");
            }
            else if (typeof sourceChain === "string") {
                srcChain = sourceChain;
                sourceChain = bintools.cb58Decode(sourceChain);
            }
            else if (!(sourceChain instanceof buffer_1.Buffer)) {
                srcChain = bintools.cb58Encode(sourceChain);
                throw new Error("Error - PlatformVMAPI.buildImportTx: Invalid destinationChain type: " + (typeof sourceChain));
            }
            const atomicUTXOs = yield (yield this.getUTXOs(ownerAddresses, srcChain, 0, undefined)).utxos;
            const avaxAssetID = yield this.getAVAXAssetID();
            if (memo instanceof payload_1.PayloadBase) {
                memo = memo.getPayload();
            }
            const atomics = atomicUTXOs.getAllUTXOs();
            const builtUnsignedTx = utxoset.buildImportTx(this.core.getNetworkID(), bintools.cb58Decode(this.blockchainID), to, from, change, atomics, sourceChain, this.getTxFee(), avaxAssetID, memo, asOf, locktime, threshold);
            if (!(yield this.checkGooseEgg(builtUnsignedTx))) {
                /* istanbul ignore next */
                throw new Error("Failed Goose Egg Check");
            }
            return builtUnsignedTx;
        });
        /**
         * Helper function which creates an unsigned Export Tx. For more granular control, you may create your own
         * [[UnsignedTx]] manually (with their corresponding [[TransferableInput]]s, [[TransferableOutput]]s, and [[TransferOperation]]s).
         *
         * @param utxoset A set of UTXOs that the transaction is built on
         * @param amount The amount being exported as a {@link https://github.com/indutny/bn.js/|BN}
         * @param destinationChain The chainid for where the assets will be sent.
         * @param toAddresses The addresses to send the funds
         * @param fromAddresses The addresses being used to send the funds from the UTXOs provided
         * @param changeAddresses The addresses that can spend the change remaining from the spent UTXOs
         * @param memo Optional contains arbitrary bytes, up to 256 bytes
         * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
         * @param locktime Optional. The locktime field created in the resulting outputs
         * @param threshold Optional. The number of signatures required to spend the funds in the resultant UTXO
         *
         * @returns An unsigned transaction ([[UnsignedTx]]) which contains an [[ExportTx]].
         */
        this.buildExportTx = (utxoset, amount, destinationChain, toAddresses, fromAddresses, changeAddresses = undefined, memo = undefined, asOf = helperfunctions_1.UnixNow(), locktime = new bn_js_1.default(0), threshold = 1) => __awaiter(this, void 0, void 0, function* () {
            let prefixes = {};
            toAddresses.map((a) => {
                prefixes[a.split("-")[0]] = true;
            });
            if (Object.keys(prefixes).length !== 1) {
                throw new Error("Error - PlatformVMAPI.buildExportTx: To addresses must have the same chainID prefix.");
            }
            if (typeof destinationChain === "undefined") {
                throw new Error("Error - PlatformVMAPI.buildExportTx: Destination ChainID is undefined.");
            }
            else if (typeof destinationChain === "string") {
                destinationChain = bintools.cb58Decode(destinationChain); //
            }
            else if (!(destinationChain instanceof buffer_1.Buffer)) {
                throw new Error("Error - PlatformVMAPI.buildExportTx: Invalid destinationChain type: " + (typeof destinationChain));
            }
            if (destinationChain.length !== 32) {
                throw new Error("Error - PlatformVMAPI.buildExportTx: Destination ChainID must be 32 bytes in length.");
            }
            /*
            if(bintools.cb58Encode(destinationChain) !== Defaults.network[this.core.getNetworkID()].X["blockchainID"]) {
              throw new Error("Error - PlatformVMAPI.buildExportTx: Destination ChainID must The X-Chain ID in the current version of AvalancheJS.");
            }*/
            let to = [];
            toAddresses.map((a) => {
                to.push(bintools.stringToAddress(a));
            });
            const from = this._cleanAddressArray(fromAddresses, 'buildExportTx').map((a) => bintools.stringToAddress(a));
            const change = this._cleanAddressArray(changeAddresses, 'buildExportTx').map((a) => bintools.stringToAddress(a));
            if (memo instanceof payload_1.PayloadBase) {
                memo = memo.getPayload();
            }
            const avaxAssetID = yield this.getAVAXAssetID();
            const builtUnsignedTx = utxoset.buildExportTx(this.core.getNetworkID(), bintools.cb58Decode(this.blockchainID), amount, avaxAssetID, to, from, change, destinationChain, this.getTxFee(), avaxAssetID, memo, asOf, locktime, threshold);
            if (!(yield this.checkGooseEgg(builtUnsignedTx))) {
                /* istanbul ignore next */
                throw new Error("Failed Goose Egg Check");
            }
            return builtUnsignedTx;
        });
        /**
        * Helper function which creates an unsigned [[AddSubnetValidatorTx]]. For more granular control, you may create your own
        * [[UnsignedTx]] manually and import the [[AddSubnetValidatorTx]] class directly.
        *
        * @param utxoset A set of UTXOs that the transaction is built on.
        * @param fromAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} who pays the fees in AVAX
        * @param changeAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} who gets the change leftover from the fee payment
        * @param nodeID The node ID of the validator being added.
        * @param startTime The Unix time when the validator starts validating the Primary Network.
        * @param endTime The Unix time when the validator stops validating the Primary Network (and staked AVAX is returned).
        * @param weight The amount of weight for this subnet validator.
        * @param memo Optional contains arbitrary bytes, up to 256 bytes
        * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
        *
        * @returns An unsigned transaction created from the passed in parameters.
        */
        /* Re-implement when subnetValidator signing process is clearer
        buildAddSubnetValidatorTx = async (
          utxoset:UTXOSet,
          fromAddresses:Array<string>,
          changeAddresses:Array<string>,
          nodeID:string,
          startTime:BN,
          endTime:BN,
          weight:BN,
          memo:PayloadBase|Buffer = undefined,
          asOf:BN = UnixNow()
        ):Promise<UnsignedTx> => {
          const from:Array<Buffer> = this._cleanAddressArray(fromAddresses, 'buildAddSubnetValidatorTx').map((a) => bintools.stringToAddress(a));
          const change:Array<Buffer> = this._cleanAddressArray(changeAddresses, 'buildAddSubnetValidatorTx').map((a) => bintools.stringToAddress(a));
      
          if( memo instanceof PayloadBase) {
            memo = memo.getPayload();
          }
      
          const avaxAssetID:Buffer = await this.getAVAXAssetID();
          
          const now:BN = UnixNow();
          if (startTime.lt(now) || endTime.lte(startTime)) {
            throw new Error("PlatformVMAPI.buildAddSubnetValidatorTx -- startTime must be in the future and endTime must come after startTime");
          }
      
          const builtUnsignedTx:UnsignedTx = utxoset.buildAddSubnetValidatorTx(
            this.core.getNetworkID(),
            bintools.cb58Decode(this.blockchainID),
            from,
            change,
            NodeIDStringToBuffer(nodeID),
            startTime, endTime,
            weight,
            this.getFee(),
            avaxAssetID,
            memo, asOf
          );
      
          if(! await this.checkGooseEgg(builtUnsignedTx)) {
            /* istanbul ignore next */ /*
        throw new Error("Failed Goose Egg Check");
      }
  
      return builtUnsignedTx;
    }
  
    */
        /**
        * Helper function which creates an unsigned [[AddDelegatorTx]]. For more granular control, you may create your own
        * [[UnsignedTx]] manually and import the [[AddDelegatorTx]] class directly.
        *
        * @param utxoset A set of UTXOs that the transaction is built on
        * @param toAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} who recieved the staked tokens at the end of the staking period
        * @param fromAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} who own the staking UTXOs the fees in AVAX
        * @param changeAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} who gets the change leftover from the fee payment
        * @param nodeID The node ID of the validator being added.
        * @param startTime The Unix time when the validator starts validating the Primary Network.
        * @param endTime The Unix time when the validator stops validating the Primary Network (and staked AVAX is returned).
        * @param stakeAmount The amount being delegated as a {@link https://github.com/indutny/bn.js/|BN}
        * @param rewardAddresses The addresses which will recieve the rewards from the delegated stake.
        * @param rewardLocktime Optional. The locktime field created in the resulting reward outputs
        * @param rewardThreshold Opional. The number of signatures required to spend the funds in the resultant reward UTXO. Default 1.
        * @param memo Optional contains arbitrary bytes, up to 256 bytes
        * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
        *
        * @returns An unsigned transaction created from the passed in parameters.
        */
        this.buildAddDelegatorTx = (utxoset, toAddresses, fromAddresses, changeAddresses, nodeID, startTime, endTime, stakeAmount, rewardAddresses, rewardLocktime = new bn_js_1.default(0), rewardThreshold = 1, memo = undefined, asOf = helperfunctions_1.UnixNow()) => __awaiter(this, void 0, void 0, function* () {
            const to = this._cleanAddressArray(toAddresses, 'buildAddDelegatorTx').map((a) => bintools.stringToAddress(a));
            const from = this._cleanAddressArray(fromAddresses, 'buildAddDelegatorTx').map((a) => bintools.stringToAddress(a));
            const change = this._cleanAddressArray(changeAddresses, 'buildAddDelegatorTx').map((a) => bintools.stringToAddress(a));
            const rewards = this._cleanAddressArray(rewardAddresses, 'buildAddValidatorTx').map((a) => bintools.stringToAddress(a));
            if (memo instanceof payload_1.PayloadBase) {
                memo = memo.getPayload();
            }
            const minStake = (yield this.getMinStake())["minDelegatorStake"];
            if (stakeAmount.lt(minStake)) {
                throw new Error("PlatformVMAPI.buildAddDelegatorTx -- stake amount must be at least " + minStake.toString(10));
            }
            const avaxAssetID = yield this.getAVAXAssetID();
            const now = helperfunctions_1.UnixNow();
            if (startTime.lt(now) || endTime.lte(startTime)) {
                throw new Error("PlatformVMAPI.buildAddDelegatorTx -- startTime must be in the future and endTime must come after startTime");
            }
            const builtUnsignedTx = utxoset.buildAddDelegatorTx(this.core.getNetworkID(), bintools.cb58Decode(this.blockchainID), avaxAssetID, to, from, change, helperfunctions_1.NodeIDStringToBuffer(nodeID), startTime, endTime, stakeAmount, rewardLocktime, rewardThreshold, rewards, new bn_js_1.default(0), avaxAssetID, memo, asOf);
            if (!(yield this.checkGooseEgg(builtUnsignedTx))) {
                /* istanbul ignore next */
                throw new Error("Failed Goose Egg Check");
            }
            return builtUnsignedTx;
        });
        /**
        * Helper function which creates an unsigned [[AddValidatorTx]]. For more granular control, you may create your own
        * [[UnsignedTx]] manually and import the [[AddValidatorTx]] class directly.
        *
        * @param utxoset A set of UTXOs that the transaction is built on
        * @param toAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} who recieved the staked tokens at the end of the staking period
        * @param fromAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} who own the staking UTXOs the fees in AVAX
        * @param changeAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} who gets the change leftover from the fee payment
        * @param nodeID The node ID of the validator being added.
        * @param startTime The Unix time when the validator starts validating the Primary Network.
        * @param endTime The Unix time when the validator stops validating the Primary Network (and staked AVAX is returned).
        * @param stakeAmount The amount being delegated as a {@link https://github.com/indutny/bn.js/|BN}
        * @param rewardAddresses The addresses which will recieve the rewards from the delegated stake.
        * @param delegationFee A number for the percentage of reward to be given to the validator when someone delegates to them. Must be between 0 and 100.
        * @param rewardLocktime Optional. The locktime field created in the resulting reward outputs
        * @param rewardThreshold Opional. The number of signatures required to spend the funds in the resultant reward UTXO. Default 1.
        * @param memo Optional contains arbitrary bytes, up to 256 bytes
        * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
        *
        * @returns An unsigned transaction created from the passed in parameters.
        */
        this.buildAddValidatorTx = (utxoset, toAddresses, fromAddresses, changeAddresses, nodeID, startTime, endTime, stakeAmount, rewardAddresses, delegationFee, rewardLocktime = new bn_js_1.default(0), rewardThreshold = 1, memo = undefined, asOf = helperfunctions_1.UnixNow()) => __awaiter(this, void 0, void 0, function* () {
            const to = this._cleanAddressArray(toAddresses, 'buildAddValidatorTx').map((a) => bintools.stringToAddress(a));
            const from = this._cleanAddressArray(fromAddresses, 'buildAddValidatorTx').map((a) => bintools.stringToAddress(a));
            const change = this._cleanAddressArray(changeAddresses, 'buildAddValidatorTx').map((a) => bintools.stringToAddress(a));
            const rewards = this._cleanAddressArray(rewardAddresses, 'buildAddValidatorTx').map((a) => bintools.stringToAddress(a));
            if (memo instanceof payload_1.PayloadBase) {
                memo = memo.getPayload();
            }
            const minStake = (yield this.getMinStake())["minValidatorStake"];
            if (stakeAmount.lt(minStake)) {
                throw new Error("PlatformVMAPI.buildAddValidatorTx -- stake amount must be at least " + minStake.toString(10));
            }
            if (typeof delegationFee !== "number" || delegationFee > 100 || delegationFee < 0) {
                throw new Error("PlatformVMAPI.buildAddValidatorTx -- delegationFee must be a number between 0 and 100");
            }
            const avaxAssetID = yield this.getAVAXAssetID();
            const now = helperfunctions_1.UnixNow();
            if (startTime.lt(now) || endTime.lte(startTime)) {
                throw new Error("PlatformVMAPI.buildAddValidatorTx -- startTime must be in the future and endTime must come after startTime");
            }
            const builtUnsignedTx = utxoset.buildAddValidatorTx(this.core.getNetworkID(), bintools.cb58Decode(this.blockchainID), avaxAssetID, to, from, change, helperfunctions_1.NodeIDStringToBuffer(nodeID), startTime, endTime, stakeAmount, rewardLocktime, rewardThreshold, rewards, delegationFee, new bn_js_1.default(0), avaxAssetID, memo, asOf);
            if (!(yield this.checkGooseEgg(builtUnsignedTx))) {
                /* istanbul ignore next */
                throw new Error("Failed Goose Egg Check");
            }
            return builtUnsignedTx;
        });
        /**
          * Class representing an unsigned [[CreateSubnetTx]] transaction.
          *
          * @param utxoset A set of UTXOs that the transaction is built on
          * @param fromAddresses The addresses being used to send the funds from the UTXOs {@link https://github.com/feross/buffer|Buffer}
          * @param changeAddresses The addresses that can spend the change remaining from the spent UTXOs
          * @param subnetOwnerAddresses An array of addresses for owners of the new subnet
          * @param subnetOwnerThreshold A number indicating the amount of signatures required to add validators to a subnet
          * @param memo Optional contains arbitrary bytes, up to 256 bytes
          * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
          *
          * @returns An unsigned transaction created from the passed in parameters.
          */
        this.buildCreateSubnetTx = (utxoset, fromAddresses, changeAddresses, subnetOwnerAddresses, subnetOwnerThreshold, memo = undefined, asOf = helperfunctions_1.UnixNow()) => __awaiter(this, void 0, void 0, function* () {
            const from = this._cleanAddressArray(fromAddresses, 'buildCreateSubnetTx').map((a) => bintools.stringToAddress(a));
            const change = this._cleanAddressArray(changeAddresses, 'buildCreateSubnetTx').map((a) => bintools.stringToAddress(a));
            const owners = this._cleanAddressArray(subnetOwnerAddresses, 'buildCreateSubnetTx').map((a) => bintools.stringToAddress(a));
            if (memo instanceof payload_1.PayloadBase) {
                memo = memo.getPayload();
            }
            const avaxAssetID = yield this.getAVAXAssetID();
            const builtUnsignedTx = utxoset.buildCreateSubnetTx(this.core.getNetworkID(), bintools.cb58Decode(this.blockchainID), from, change, owners, subnetOwnerThreshold, this.getCreationTxFee(), avaxAssetID, memo, asOf);
            if (!(yield this.checkGooseEgg(builtUnsignedTx, this.getCreationTxFee()))) {
                /* istanbul ignore next */
                throw new Error("Failed Goose Egg Check");
            }
            return builtUnsignedTx;
        });
        this.blockchainID = constants_1.PlatformChainID;
        const netid = core.getNetworkID();
        if (netid in constants_1.Defaults.network && this.blockchainID in constants_1.Defaults.network[netid]) {
            const { alias } = constants_1.Defaults.network[netid][this.blockchainID];
            this.keychain = new keychain_1.KeyChain(this.core.getHRP(), alias);
        }
        else {
            this.keychain = new keychain_1.KeyChain(this.core.getHRP(), this.blockchainID);
        }
    }
    /**
     * @ignore
     */
    _cleanAddressArray(addresses, caller) {
        const addrs = [];
        const chainid = this.getBlockchainAlias() ? this.getBlockchainAlias() : this.getBlockchainID();
        if (addresses && addresses.length > 0) {
            for (let i = 0; i < addresses.length; i++) {
                if (typeof addresses[i] === 'string') {
                    if (typeof this.parseAddress(addresses[i]) === 'undefined') {
                        /* istanbul ignore next */
                        throw new Error(`Error - PlatformVMAPI.${caller}: Invalid address format ${addresses[i]}`);
                    }
                    addrs.push(addresses[i]);
                }
                else {
                    addrs.push(bintools.addressToString(this.core.getHRP(), chainid, addresses[i]));
                }
            }
        }
        return addrs;
    }
}
exports.PlatformVMAPI = PlatformVMAPI;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2FwaXMvcGxhdGZvcm12bS9hcGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7OztHQUdHO0FBQ0gsb0NBQWlDO0FBQ2pDLGtEQUF1QjtBQUV2QixrREFBK0M7QUFFL0Msb0VBQTRDO0FBQzVDLHlDQUFzQztBQUN0QyxxREFBMkU7QUFDM0UsMkNBQWtEO0FBQ2xELDZCQUFzQztBQUN0QyxpREFBa0Q7QUFDbEQsaUVBQTRFO0FBQzVFLCtDQUE4QztBQUc5Qzs7R0FFRztBQUNILE1BQU0sUUFBUSxHQUFZLGtCQUFRLENBQUMsV0FBVyxFQUFFLENBQUM7QUFFakQ7Ozs7OztHQU1HO0FBQ0gsTUFBYSxhQUFjLFNBQVEsaUJBQU87SUEwMkN4Qzs7Ozs7O09BTUc7SUFDSCxZQUFZLElBQWtCLEVBQUUsVUFBaUIsV0FBVztRQUMxRCxLQUFLLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBaDNDdkI7O1dBRUc7UUFDTyxhQUFRLEdBQVksSUFBSSxtQkFBUSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUV6QyxpQkFBWSxHQUFVLDJCQUFlLENBQUM7UUFFdEMsb0JBQWUsR0FBVSxTQUFTLENBQUM7UUFFbkMsZ0JBQVcsR0FBVSxTQUFTLENBQUM7UUFFL0IsVUFBSyxHQUFNLFNBQVMsQ0FBQztRQUVyQixrQkFBYSxHQUFNLFNBQVMsQ0FBQztRQUU3QixzQkFBaUIsR0FBTSxTQUFTLENBQUM7UUFFakMsc0JBQWlCLEdBQU0sU0FBUyxDQUFDO1FBRTNDOzs7O1dBSUc7UUFDSCx1QkFBa0IsR0FBRyxHQUFVLEVBQUU7WUFDL0IsSUFBRyxPQUFPLElBQUksQ0FBQyxlQUFlLEtBQUssV0FBVyxFQUFDO2dCQUM3QyxNQUFNLEtBQUssR0FBVSxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO2dCQUM5QyxJQUFJLEtB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QyxFQUFFLEVBQUU7Z0JBQ3pDLElBQUksT0FBTyxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssUUFBUSxFQUFFO29CQUNwQyxJQUFJLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFXLENBQUMsS0FBSyxXQUFXLEVBQUU7d0JBQ3BFLDBCQUEwQjt3QkFDMUIsTUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsTUFBTSw0QkFBNEIsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztxQkFDNUY7b0JBQ0QsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFXLENBQUMsQ0FBQztpQkFDcEM7cUJBQU07b0JBQ0wsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUUsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQVcsQ0FBQyxDQUFDLENBQUM7aUJBQzNGO2FBQ0Y7U0FDRjtRQUNELE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztDQW9CRjtBQTUzQ0Qsc0NBNDNDQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQHBhY2thZ2VEb2N1bWVudGF0aW9uXG4gKiBAbW9kdWxlIEFQSS1QbGF0Zm9ybVZNXG4gKi9cbmltcG9ydCB7IEJ1ZmZlciB9IGZyb20gJ2J1ZmZlci8nO1xuaW1wb3J0IEJOIGZyb20gJ2JuLmpzJztcbmltcG9ydCBBdmFsYW5jaGVDb3JlIGZyb20gJy4uLy4uL2F2YWxhbmNoZSc7XG5pbXBvcnQgeyBKUlBDQVBJIH0gZnJvbSAnLi4vLi4vY29tbW9uL2pycGNhcGknO1xuaW1wb3J0IHsgUmVxdWVzdFJlc3BvbnNlRGF0YSB9IGZyb20gJy4uLy4uL2NvbW1vbi9hcGliYXNlJztcbmltcG9ydCBCaW5Ub29scyBmcm9tICcuLi8uLi91dGlscy9iaW50b29scyc7XG5pbXBvcnQgeyBLZXlDaGFpbiB9IGZyb20gJy4va2V5Y2hhaW4nO1xuaW1wb3J0IHsgRGVmYXVsdHMsIFBsYXRmb3JtQ2hhaW5JRCwgT05FQVZBWCB9IGZyb20gJy4uLy4uL3V0aWxzL2NvbnN0YW50cyc7XG5pbXBvcnQgeyBQbGF0Zm9ybVZNQ29uc3RhbnRzIH0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHsgVW5zaWduZWRUeCwgVHggfSBmcm9tICcuL3R4JztcbmltcG9ydCB7IFBheWxvYWRCYXNlIH0gZnJvbSAnLi4vLi4vdXRpbHMvcGF5bG9hZCc7XG5pbXBvcnQgeyBVbml4Tm93LCBOb2RlSURTdHJpbmdUb0J1ZmZlciB9IGZyb20gJy4uLy4uL3V0aWxzL2hlbHBlcmZ1bmN0aW9ucyc7XG5pbXBvcnQgeyBVVFhPU2V0IH0gZnJvbSAnLi4vcGxhdGZvcm12bS91dHhvcyc7XG5pbXBvcnQgeyBQZXJzaXN0YW5jZU9wdGlvbnMgfSBmcm9tICcuLi8uLi91dGlscy9wZXJzaXN0ZW5jZW9wdGlvbnMnO1xuXG4vKipcbiAqIEBpZ25vcmVcbiAqL1xuY29uc3QgYmludG9vbHM6QmluVG9vbHMgPSBCaW5Ub29scy5nZXRJbnN0YW5jZSgpO1xuXG4vKipcbiAqIENsYXNzIGZvciBpbnRlcmFjdGluZyB3aXRoIGEgbm9kZSdzIFBsYXRmb3JtVk1BUElcbiAqXG4gKiBAY2F0ZWdvcnkgUlBDQVBJc1xuICpcbiAqIEByZW1hcmtzIFRoaXMgZXh0ZW5kcyB0aGUgW1tKUlBDQVBJXV0gY2xhc3MuIFRoaXMgY2xhc3Mgc2hvdWxkIG5vdCBiZSBkaXJlY3RseSBjYWxsZWQuIEluc3RlYWQsIHVzZSB0aGUgW1tBdmFsYW5jaGUuYWRkQVBJXV0gZnVuY3Rpb24gdG8gcmVnaXN0ZXIgdGhpcyBpbnRlcmZhY2Ugd2l0aCBBdmFsYW5jaGUuXG4gKi9cbmV4cG9ydCBjbGFzcyBQbGF0Zm9ybVZNQVBJIGV4dGVuZHMgSlJQQ0FQSSB7XG5cbiAgLyoqXG4gICAqIEBpZ25vcmVcbiAgICovXG4gIHByb3RlY3RlZCBrZXljaGFpbjpLZXlDaGFpbiA9IG5ldyBLZXlDaGFpbignJywgJycpO1xuXG4gIHByb3RlY3RlZCBibG9ja2NoYWluSUQ6c3RyaW5nID0gUGxhdGZvcm1DaGFpbklEO1xuXG4gIHByb3RlY3RlZCBibG9ja2NoYWluQWxpYXM6c3RyaW5nID0gdW5kZWZpbmVkO1xuXG4gIHByb3RlY3RlZCBBVkFYQXNzZXRJRDpCdWZmZXIgPSB1bmRlZmluZWQ7XG5cbiAgcHJvdGVjdGVkIHR4RmVlOkJOID0gdW5kZWZpbmVkO1xuXG4gIHByb3RlY3RlZCBjcmVhdGlvblR4RmVlOkJOID0gdW5kZWZpbmVkO1xuXG4gIHByb3RlY3RlZCBtaW5WYWxpZGF0b3JTdGFrZTpCTiA9IHVuZGVmaW5lZDtcblxuICBwcm90ZWN0ZWQgbWluRGVsZWdhdG9yU3Rha2U6Qk4gPSB1bmRlZmluZWQ7XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIGFsaWFzIGZvciB0aGUgYmxvY2tjaGFpbklEIGlmIGl0IGV4aXN0cywgb3RoZXJ3aXNlIHJldHVybnMgYHVuZGVmaW5lZGAuXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSBhbGlhcyBmb3IgdGhlIGJsb2NrY2hhaW5JRFxuICAgKi9cbiAgZ2V0QmxvY2tjaGFpbkFsaWFzID0gKCk6c3RyaW5nID0+IHtcbiAgICBpZih0eXBlb2YgdGhpcy5ibG9ja2NoYWluQWxpYXMgPT09IFwidW5kZWZpbmVkXCIpe1xuICAgICAgY29uc3QgbmV0aWQ6bnVtYmVyID0gdGhpcy5jb3JlLmdldE5ldHdvcmtJRCgpO1xuICAgICAgaWYgKG5ldGlkIGluIERlZmF1bHRzLm5ldHdvcmsgJiYgdGhpcy5ibG9ja2NoYWluSUQgaW4gRGVmYXVsdHMubmV0d29ya1tuZXRpZF0pIHtcbiAgICAgICAgdGhpcy5ibG9ja2NoYWluQWxpYXMgPSBEZWZhdWx0cy5uZXR3b3JrW25ldGlkXVt0aGlzLmJsb2NrY2hhaW5JRF0uYWxpYXM7XG4gICAgICAgIHJldHVybiB0aGlzLmJsb2NrY2hhaW5BbGlhcztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgfSBcbiAgICByZXR1cm4gdGhpcy5ibG9ja2NoYWluQWxpYXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGFsaWFzIGZvciB0aGUgYmxvY2tjaGFpbklELlxuICAgKiBcbiAgICogQHBhcmFtIGFsaWFzIFRoZSBhbGlhcyBmb3IgdGhlIGJsb2NrY2hhaW5JRC5cbiAgICogXG4gICAqL1xuICBzZXRCbG9ja2NoYWluQWxpYXMgPSAoYWxpYXM6c3RyaW5nKTpzdHJpbmcgPT4ge1xuICAgIHRoaXMuYmxvY2tjaGFpbkFsaWFzID0gYWxpYXM7XG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9O1xuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBibG9ja2NoYWluSUQgYW5kIHJldHVybnMgaXQuXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSBibG9ja2NoYWluSURcbiAgICovXG4gIGdldEJsb2NrY2hhaW5JRCA9ICgpOnN0cmluZyA9PiB0aGlzLmJsb2NrY2hhaW5JRDtcblxuICAvKipcbiAgICogUmVmcmVzaCBibG9ja2NoYWluSUQsIGFuZCBpZiBhIGJsb2NrY2hhaW5JRCBpcyBwYXNzZWQgaW4sIHVzZSB0aGF0LlxuICAgKlxuICAgKiBAcGFyYW0gT3B0aW9uYWwuIEJsb2NrY2hhaW5JRCB0byBhc3NpZ24sIGlmIG5vbmUsIHVzZXMgdGhlIGRlZmF1bHQgYmFzZWQgb24gbmV0d29ya0lELlxuICAgKlxuICAgKiBAcmV0dXJucyBUaGUgYmxvY2tjaGFpbklEXG4gICAqL1xuICByZWZyZXNoQmxvY2tjaGFpbklEID0gKGJsb2NrY2hhaW5JRDpzdHJpbmcgPSB1bmRlZmluZWQpOmJvb2xlYW4gPT4ge1xuICAgIGNvbnN0IG5ldGlkOm51bWJlciA9IHRoaXMuY29yZS5nZXROZXR3b3JrSUQoKTtcbiAgICBpZiAodHlwZW9mIGJsb2NrY2hhaW5JRCA9PT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIERlZmF1bHRzLm5ldHdvcmtbbmV0aWRdICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICB0aGlzLmJsb2NrY2hhaW5JRCA9IFBsYXRmb3JtQ2hhaW5JRDsgLy9kZWZhdWx0IHRvIFAtQ2hhaW5cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gaWYgKHR5cGVvZiBibG9ja2NoYWluSUQgPT09ICdzdHJpbmcnKSB7XG4gICAgICB0aGlzLmJsb2NrY2hhaW5JRCA9IGJsb2NrY2hhaW5JRDtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH07XG5cbiAgLyoqXG4gICAqIFRha2VzIGFuIGFkZHJlc3Mgc3RyaW5nIGFuZCByZXR1cm5zIGl0cyB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSByZXByZXNlbnRhdGlvbiBpZiB2YWxpZC5cbiAgICpcbiAgICogQHJldHVybnMgQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBmb3IgdGhlIGFkZHJlc3MgaWYgdmFsaWQsIHVuZGVmaW5lZCBpZiBub3QgdmFsaWQuXG4gICAqL1xuICBwYXJzZUFkZHJlc3MgPSAoYWRkcjpzdHJpbmcpOkJ1ZmZlciA9PiB7XG4gICAgY29uc3QgYWxpYXM6c3RyaW5nID0gdGhpcy5nZXRCbG9ja2NoYWluQWxpYXMoKTtcbiAgICBjb25zdCBibG9ja2NoYWluSUQ6c3RyaW5nID0gdGhpcy5nZXRCbG9ja2NoYWluSUQoKTtcbiAgICByZXR1cm4gYmludG9vbHMucGFyc2VBZGRyZXNzKGFkZHIsIGJsb2NrY2hhaW5JRCwgYWxpYXMsIFBsYXRmb3JtVk1Db25zdGFudHMuQUREUkVTU0xFTkdUSCk7XG4gIH07XG5cbiAgYWRkcmVzc0Zyb21CdWZmZXIgPSAoYWRkcmVzczpCdWZmZXIpOnN0cmluZyA9PiB7XG4gICAgY29uc3QgY2hhaW5pZDpzdHJpbmcgPSB0aGlzLmdldEJsb2NrY2hhaW5BbGlhcygpID8gdGhpcy5nZXRCbG9ja2NoYWluQWxpYXMoKSA6IHRoaXMuZ2V0QmxvY2tjaGFpbklEKCk7XG4gICAgcmV0dXJuIGJpbnRvb2xzLmFkZHJlc3NUb1N0cmluZyh0aGlzLmNvcmUuZ2V0SFJQKCksIGNoYWluaWQsIGFkZHJlc3MpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBGZXRjaGVzIHRoZSBBVkFYIEFzc2V0SUQgYW5kIHJldHVybnMgaXQgaW4gYSBQcm9taXNlLlxuICAgKlxuICAgKiBAcGFyYW0gcmVmcmVzaCBUaGlzIGZ1bmN0aW9uIGNhY2hlcyB0aGUgcmVzcG9uc2UuIFJlZnJlc2ggPSB0cnVlIHdpbGwgYnVzdCB0aGUgY2FjaGUuXG4gICAqIFxuICAgKiBAcmV0dXJucyBUaGUgdGhlIHByb3ZpZGVkIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIEFWQVggQXNzZXRJRFxuICAgKi9cbiAgZ2V0QVZBWEFzc2V0SUQgPSBhc3luYyAocmVmcmVzaDpib29sZWFuID0gZmFsc2UpOlByb21pc2U8QnVmZmVyPiA9PiB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLkFWQVhBc3NldElEID09PSAndW5kZWZpbmVkJyB8fCByZWZyZXNoKSB7XG4gICAgICBjb25zdCBhc3NldElEOnN0cmluZyA9IGF3YWl0IHRoaXMuZ2V0U3Rha2luZ0Fzc2V0SUQoKTtcbiAgICAgIHRoaXMuQVZBWEFzc2V0SUQgPSBiaW50b29scy5jYjU4RGVjb2RlKGFzc2V0SUQpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5BVkFYQXNzZXRJRDtcbiAgfTtcbiAgXG4gIC8qKlxuICAgKiBPdmVycmlkZXMgdGhlIGRlZmF1bHRzIGFuZCBzZXRzIHRoZSBjYWNoZSB0byBhIHNwZWNpZmljIEFWQVggQXNzZXRJRFxuICAgKiBcbiAgICogQHBhcmFtIGF2YXhBc3NldElEIEEgY2I1OCBzdHJpbmcgb3IgQnVmZmVyIHJlcHJlc2VudGluZyB0aGUgQVZBWCBBc3NldElEXG4gICAqIFxuICAgKiBAcmV0dXJucyBUaGUgdGhlIHByb3ZpZGVkIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIEFWQVggQXNzZXRJRFxuICAgKi9cbiAgc2V0QVZBWEFzc2V0SUQgPSAoYXZheEFzc2V0SUQ6c3RyaW5nIHwgQnVmZmVyKSA9PiB7XG4gICAgaWYodHlwZW9mIGF2YXhBc3NldElEID09PSBcInN0cmluZ1wiKSB7XG4gICAgICBhdmF4QXNzZXRJRCA9IGJpbnRvb2xzLmNiNThEZWNvZGUoYXZheEFzc2V0SUQpO1xuICAgIH1cbiAgICB0aGlzLkFWQVhBc3NldElEID0gYXZheEFzc2V0SUQ7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgZGVmYXVsdCB0eCBmZWUgZm9yIHRoaXMgY2hhaW4uXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSBkZWZhdWx0IHR4IGZlZSBhcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59XG4gICAqL1xuICBnZXREZWZhdWx0VHhGZWUgPSAgKCk6Qk4gPT4ge1xuICAgIHJldHVybiB0aGlzLmNvcmUuZ2V0TmV0d29ya0lEKCkgaW4gRGVmYXVsdHMubmV0d29yayA/IG5ldyBCTihEZWZhdWx0cy5uZXR3b3JrW3RoaXMuY29yZS5nZXROZXR3b3JrSUQoKV1bXCJQXCJdW1widHhGZWVcIl0pIDogbmV3IEJOKDApO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIHR4IGZlZSBmb3IgdGhpcyBjaGFpbi5cbiAgICpcbiAgICogQHJldHVybnMgVGhlIHR4IGZlZSBhcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59XG4gICAqL1xuICBnZXRUeEZlZSA9ICgpOkJOID0+IHtcbiAgICBpZih0eXBlb2YgdGhpcy50eEZlZSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgdGhpcy50eEZlZSA9IHRoaXMuZ2V0RGVmYXVsdFR4RmVlKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnR4RmVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHR4IGZlZSBmb3IgdGhpcyBjaGFpbi5cbiAgICpcbiAgICogQHBhcmFtIGZlZSBUaGUgdHggZmVlIGFtb3VudCB0byBzZXQgYXMge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgICovXG4gIHNldFR4RmVlID0gKGZlZTpCTikgPT4ge1xuICAgIHRoaXMudHhGZWUgPSBmZWU7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBkZWZhdWx0IGNyZWF0aW9uIGZlZSBmb3IgdGhpcyBjaGFpbi5cbiAgICpcbiAgICogQHJldHVybnMgVGhlIGRlZmF1bHQgY3JlYXRpb24gZmVlIGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgICovXG4gIGdldERlZmF1bHRDcmVhdGlvblR4RmVlID0gICgpOkJOID0+IHtcbiAgICByZXR1cm4gdGhpcy5jb3JlLmdldE5ldHdvcmtJRCgpIGluIERlZmF1bHRzLm5ldHdvcmsgPyBuZXcgQk4oRGVmYXVsdHMubmV0d29ya1t0aGlzLmNvcmUuZ2V0TmV0d29ya0lEKCldW1wiUFwiXVtcImNyZWF0aW9uVHhGZWVcIl0pIDogbmV3IEJOKDApO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIGNyZWF0aW9uIGZlZSBmb3IgdGhpcyBjaGFpbi5cbiAgICpcbiAgICogQHJldHVybnMgVGhlIGNyZWF0aW9uIGZlZSBhcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59XG4gICAqL1xuICBnZXRDcmVhdGlvblR4RmVlID0gKCk6Qk4gPT4ge1xuICAgIGlmKHR5cGVvZiB0aGlzLmNyZWF0aW9uVHhGZWUgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIHRoaXMuY3JlYXRpb25UeEZlZSA9IHRoaXMuZ2V0RGVmYXVsdENyZWF0aW9uVHhGZWUoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY3JlYXRpb25UeEZlZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBjcmVhdGlvbiBmZWUgZm9yIHRoaXMgY2hhaW4uXG4gICAqXG4gICAqIEBwYXJhbSBmZWUgVGhlIGNyZWF0aW9uIGZlZSBhbW91bnQgdG8gc2V0IGFzIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59XG4gICAqL1xuICBzZXRDcmVhdGlvblR4RmVlID0gKGZlZTpCTikgPT4ge1xuICAgIHRoaXMuY3JlYXRpb25UeEZlZSA9IGZlZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIGEgcmVmZXJlbmNlIHRvIHRoZSBrZXljaGFpbiBmb3IgdGhpcyBjbGFzcy5cbiAgICpcbiAgICogQHJldHVybnMgVGhlIGluc3RhbmNlIG9mIFtbXV0gZm9yIHRoaXMgY2xhc3NcbiAgICovXG4gIGtleUNoYWluID0gKCk6S2V5Q2hhaW4gPT4gdGhpcy5rZXljaGFpbjtcblxuICAvKipcbiAgICogQGlnbm9yZVxuICAgKi9cbiAgbmV3S2V5Q2hhaW4gPSAoKTpLZXlDaGFpbiA9PiB7XG4gICAgLy8gd2FybmluZywgb3ZlcndyaXRlcyB0aGUgb2xkIGtleWNoYWluXG4gICAgY29uc3QgYWxpYXMgPSB0aGlzLmdldEJsb2NrY2hhaW5BbGlhcygpO1xuICAgIGlmIChhbGlhcykge1xuICAgICAgdGhpcy5rZXljaGFpbiA9IG5ldyBLZXlDaGFpbih0aGlzLmNvcmUuZ2V0SFJQKCksIGFsaWFzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5rZXljaGFpbiA9IG5ldyBLZXlDaGFpbih0aGlzLmNvcmUuZ2V0SFJQKCksIHRoaXMuYmxvY2tjaGFpbklEKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMua2V5Y2hhaW47XG4gIH07XG5cbiAgLyoqXG4gICAqIEhlbHBlciBmdW5jdGlvbiB3aGljaCBkZXRlcm1pbmVzIGlmIGEgdHggaXMgYSBnb29zZSBlZ2cgdHJhbnNhY3Rpb24uIFxuICAgKlxuICAgKiBAcGFyYW0gdXR4IEFuIFVuc2lnbmVkVHhcbiAgICpcbiAgICogQHJldHVybnMgYm9vbGVhbiB0cnVlIGlmIHBhc3NlcyBnb29zZSBlZ2cgdGVzdCBhbmQgZmFsc2UgaWYgZmFpbHMuXG4gICAqXG4gICAqIEByZW1hcmtzXG4gICAqIEEgXCJHb29zZSBFZ2cgVHJhbnNhY3Rpb25cIiBpcyB3aGVuIHRoZSBmZWUgZmFyIGV4Y2VlZHMgYSByZWFzb25hYmxlIGFtb3VudFxuICAgKi9cbiAgY2hlY2tHb29zZUVnZyA9IGFzeW5jICh1dHg6VW5zaWduZWRUeCwgb3V0VG90YWw6Qk4gPSBuZXcgQk4oMCkpOiBQcm9taXNlPGJvb2xlYW4+ID0+IHtcbiAgICBjb25zdCBhdmF4QXNzZXRJRDpCdWZmZXIgPSBhd2FpdCB0aGlzLmdldEFWQVhBc3NldElEKCk7XG4gICAgbGV0IG91dHB1dFRvdGFsOkJOID0gb3V0VG90YWwuZ3QobmV3IEJOKDApKSA/IG91dFRvdGFsIDogdXR4LmdldE91dHB1dFRvdGFsKGF2YXhBc3NldElEKTtcbiAgICBjb25zdCBmZWU6Qk4gPSB1dHguZ2V0QnVybihhdmF4QXNzZXRJRCk7XG4gICAgaWYoZmVlLmx0ZShPTkVBVkFYLm11bChuZXcgQk4oMTApKSkgfHwgZmVlLmx0ZShvdXRwdXRUb3RhbCkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlcyBhbiBhc3NldElEIGZvciBhIHN1Ym5ldCdzIHN0YWtpbmcgYXNzc2V0LlxuICAgKlxuICAgKiBAcmV0dXJucyBSZXR1cm5zIGEgUHJvbWlzZTxzdHJpbmc+IHdpdGggY2I1OCBlbmNvZGVkIHZhbHVlIG9mIHRoZSBhc3NldElELlxuICAgKi9cbiAgZ2V0U3Rha2luZ0Fzc2V0SUQgPSBhc3luYyAoKTpQcm9taXNlPHN0cmluZz4gPT4ge1xuICAgIGNvbnN0IHBhcmFtczphbnkgPSB7fTtcbiAgICByZXR1cm4gdGhpcy5jYWxsTWV0aG9kKCdwbGF0Zm9ybS5nZXRTdGFraW5nQXNzZXRJRCcsIHBhcmFtcykudGhlbigocmVzcG9uc2U6UmVxdWVzdFJlc3BvbnNlRGF0YSkgPT4gKHJlc3BvbnNlLmRhdGEucmVzdWx0LmFzc2V0SUQpKTtcbiAgfTtcblxuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBibG9ja2NoYWluLlxuICAgKlxuICAgKiBAcGFyYW0gdXNlcm5hbWUgVGhlIHVzZXJuYW1lIG9mIHRoZSBLZXlzdG9yZSB1c2VyIHRoYXQgY29udHJvbHMgdGhlIG5ldyBhY2NvdW50XG4gICAqIEBwYXJhbSBwYXNzd29yZCBUaGUgcGFzc3dvcmQgb2YgdGhlIEtleXN0b3JlIHVzZXIgdGhhdCBjb250cm9scyB0aGUgbmV3IGFjY291bnRcbiAgICogQHBhcmFtIHN1Ym5ldElEIE9wdGlvbmFsLiBFaXRoZXIgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBvciBhbiBjYjU4IHNlcmlhbGl6ZWQgc3RyaW5nIGZvciB0aGUgU3VibmV0SUQgb3IgaXRzIGFsaWFzLlxuICAgKiBAcGFyYW0gdm1JRCBUaGUgSUQgb2YgdGhlIFZpcnR1YWwgTWFjaGluZSB0aGUgYmxvY2tjaGFpbiBydW5zLiBDYW4gYWxzbyBiZSBhbiBhbGlhcyBvZiB0aGUgVmlydHVhbCBNYWNoaW5lLlxuICAgKiBAcGFyYW0gRlhJRHMgVGhlIGlkcyBvZiB0aGUgRlhzIHRoZSBWTSBpcyBydW5uaW5nLlxuICAgKiBAcGFyYW0gbmFtZSBBIGh1bWFuLXJlYWRhYmxlIG5hbWUgZm9yIHRoZSBuZXcgYmxvY2tjaGFpblxuICAgKiBAcGFyYW0gZ2VuZXNpcyBUaGUgYmFzZSA1OCAod2l0aCBjaGVja3N1bSkgcmVwcmVzZW50YXRpb24gb2YgdGhlIGdlbmVzaXMgc3RhdGUgb2YgdGhlIG5ldyBibG9ja2NoYWluLiBWaXJ0dWFsIE1hY2hpbmVzIHNob3VsZCBoYXZlIGEgc3RhdGljIEFQSSBtZXRob2QgbmFtZWQgYnVpbGRHZW5lc2lzIHRoYXQgY2FuIGJlIHVzZWQgdG8gZ2VuZXJhdGUgZ2VuZXNpc0RhdGEuXG4gICAqXG4gICAqIEByZXR1cm5zIFByb21pc2UgZm9yIHRoZSB1bnNpZ25lZCB0cmFuc2FjdGlvbiB0byBjcmVhdGUgdGhpcyBibG9ja2NoYWluLiBNdXN0IGJlIHNpZ25lZCBieSBhIHN1ZmZpY2llbnQgbnVtYmVyIG9mIHRoZSBTdWJuZXTigJlzIGNvbnRyb2wga2V5cyBhbmQgYnkgdGhlIGFjY291bnQgcGF5aW5nIHRoZSB0cmFuc2FjdGlvbiBmZWUuXG4gICAqL1xuICBjcmVhdGVCbG9ja2NoYWluID0gYXN5bmMgKFxuICAgIHVzZXJuYW1lOiBzdHJpbmcsXG4gICAgcGFzc3dvcmQ6c3RyaW5nLFxuICAgIHN1Ym5ldElEOkJ1ZmZlciB8IHN0cmluZyA9IHVuZGVmaW5lZCxcbiAgICB2bUlEOnN0cmluZyxcbiAgICBmeElEczogQXJyYXk8bnVtYmVyPixcbiAgICBuYW1lOnN0cmluZyxcbiAgICBnZW5lc2lzOnN0cmluZyxcbiAgICApXG4gIDpQcm9taXNlPHN0cmluZz4gPT4ge1xuICAgIGNvbnN0IHBhcmFtczphbnkgPSB7XG4gICAgICB1c2VybmFtZSwgXG4gICAgICBwYXNzd29yZCxcbiAgICAgIGZ4SURzLFxuICAgICAgdm1JRCxcbiAgICAgIG5hbWUsXG4gICAgICBnZW5lc2lzRGF0YTogZ2VuZXNpcyxcbiAgICB9O1xuICAgIGlmICh0eXBlb2Ygc3VibmV0SUQgPT09ICdzdHJpbmcnKSB7XG4gICAgICBwYXJhbXMuc3VibmV0SUQgPSBzdWJuZXRJRDtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBzdWJuZXRJRCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHBhcmFtcy5zdWJuZXRJRCA9IGJpbnRvb2xzLmNiNThFbmNvZGUoc3VibmV0SUQpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5jYWxsTWV0aG9kKCdwbGF0Zm9ybS5jcmVhdGVCbG9ja2NoYWluJywgcGFyYW1zKVxuICAgICAgLnRoZW4oKHJlc3BvbnNlOlJlcXVlc3RSZXNwb25zZURhdGEpID0+IHJlc3BvbnNlLmRhdGEucmVzdWx0LnR4SUQpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBzdGF0dXMgb2YgYSBibG9ja2NoYWluLlxuICAgKlxuICAgKiBAcGFyYW0gYmxvY2tjaGFpbklEIFRoZSBibG9ja2NoYWluSUQgcmVxdWVzdGluZyBhIHN0YXR1cyB1cGRhdGVcbiAgICpcbiAgICogQHJldHVybnMgUHJvbWlzZSBmb3IgYSBzdHJpbmcgb2Ygb25lIG9mOiBcIlZhbGlkYXRpbmdcIiwgXCJDcmVhdGVkXCIsIFwiUHJlZmVycmVkXCIsIFwiVW5rbm93blwiLlxuICAgKi9cbiAgZ2V0QmxvY2tjaGFpblN0YXR1cyA9IGFzeW5jIChibG9ja2NoYWluSUQ6IHN0cmluZyk6UHJvbWlzZTxzdHJpbmc+ID0+IHtcbiAgICBjb25zdCBwYXJhbXM6YW55ID0ge1xuICAgICAgYmxvY2tjaGFpbklELFxuICAgIH07XG4gICAgcmV0dXJuIHRoaXMuY2FsbE1ldGhvZCgncGxhdGZvcm0uZ2V0QmxvY2tjaGFpblN0YXR1cycsIHBhcmFtcylcbiAgICAgIC50aGVuKChyZXNwb25zZTpSZXF1ZXN0UmVzcG9uc2VEYXRhKSA9PiByZXNwb25zZS5kYXRhLnJlc3VsdC5zdGF0dXMpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDcmVhdGUgYW4gYWRkcmVzcyBpbiB0aGUgbm9kZSdzIGtleXN0b3JlLlxuICAgKlxuICAgKiBAcGFyYW0gdXNlcm5hbWUgVGhlIHVzZXJuYW1lIG9mIHRoZSBLZXlzdG9yZSB1c2VyIHRoYXQgY29udHJvbHMgdGhlIG5ldyBhY2NvdW50XG4gICAqIEBwYXJhbSBwYXNzd29yZCBUaGUgcGFzc3dvcmQgb2YgdGhlIEtleXN0b3JlIHVzZXIgdGhhdCBjb250cm9scyB0aGUgbmV3IGFjY291bnRcbiAgICpcbiAgICogQHJldHVybnMgUHJvbWlzZSBmb3IgYSBzdHJpbmcgb2YgdGhlIG5ld2x5IGNyZWF0ZWQgYWNjb3VudCBhZGRyZXNzLlxuICAgKi9cbiAgY3JlYXRlQWRkcmVzcyA9IGFzeW5jIChcbiAgICB1c2VybmFtZTogc3RyaW5nLFxuICAgIHBhc3N3b3JkOnN0cmluZ1xuICApXG4gIDpQcm9taXNlPHN0cmluZz4gPT4ge1xuICAgIGNvbnN0IHBhcmFtczphbnkgPSB7XG4gICAgICB1c2VybmFtZSxcbiAgICAgIHBhc3N3b3JkLFxuICAgIH07XG4gICAgcmV0dXJuIHRoaXMuY2FsbE1ldGhvZCgncGxhdGZvcm0uY3JlYXRlQWRkcmVzcycsIHBhcmFtcylcbiAgICAgIC50aGVuKChyZXNwb25zZTpSZXF1ZXN0UmVzcG9uc2VEYXRhKSA9PiByZXNwb25zZS5kYXRhLnJlc3VsdC5hZGRyZXNzKTtcbiAgfTtcblxuICAvKipcbiAgICogR2V0cyB0aGUgYmFsYW5jZSBvZiBhIHBhcnRpY3VsYXIgYXNzZXQuXG4gICAqXG4gICAqIEBwYXJhbSBhZGRyZXNzIFRoZSBhZGRyZXNzIHRvIHB1bGwgdGhlIGFzc2V0IGJhbGFuY2UgZnJvbVxuICAgKlxuICAgKiBAcmV0dXJucyBQcm9taXNlIHdpdGggdGhlIGJhbGFuY2UgYXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfSBvbiB0aGUgcHJvdmlkZWQgYWRkcmVzcy5cbiAgICovXG4gIGdldEJhbGFuY2UgPSBhc3luYyAoYWRkcmVzczpzdHJpbmcpOlByb21pc2U8b2JqZWN0PiA9PiB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLnBhcnNlQWRkcmVzcyhhZGRyZXNzKSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEVycm9yIC0gUGxhdGZvcm1WTUFQSS5nZXRCYWxhbmNlOiBJbnZhbGlkIGFkZHJlc3MgZm9ybWF0ICR7YWRkcmVzc31gKTtcbiAgICB9XG4gICAgY29uc3QgcGFyYW1zOmFueSA9IHtcbiAgICAgIGFkZHJlc3NcbiAgICB9O1xuICAgIHJldHVybiAgdGhpcy5jYWxsTWV0aG9kKCdwbGF0Zm9ybS5nZXRCYWxhbmNlJywgcGFyYW1zKS50aGVuKChyZXNwb25zZTpSZXF1ZXN0UmVzcG9uc2VEYXRhKSA9PiByZXNwb25zZS5kYXRhLnJlc3VsdCk7XG4gIH07XG4gIFxuICAvKipcbiAgICogTGlzdCB0aGUgYWRkcmVzc2VzIGNvbnRyb2xsZWQgYnkgdGhlIHVzZXIuXG4gICAqXG4gICAqIEBwYXJhbSB1c2VybmFtZSBUaGUgdXNlcm5hbWUgb2YgdGhlIEtleXN0b3JlIHVzZXJcbiAgICogQHBhcmFtIHBhc3N3b3JkIFRoZSBwYXNzd29yZCBvZiB0aGUgS2V5c3RvcmUgdXNlclxuICAgKlxuICAgKiBAcmV0dXJucyBQcm9taXNlIGZvciBhbiBhcnJheSBvZiBhZGRyZXNzZXMuXG4gICAqL1xuICBsaXN0QWRkcmVzc2VzID0gYXN5bmMgKHVzZXJuYW1lOiBzdHJpbmcsIHBhc3N3b3JkOnN0cmluZyk6UHJvbWlzZTxBcnJheTxzdHJpbmc+PiA9PiB7XG4gICAgY29uc3QgcGFyYW1zOmFueSA9IHtcbiAgICAgIHVzZXJuYW1lLFxuICAgICAgcGFzc3dvcmQsXG4gICAgfTtcbiAgICByZXR1cm4gdGhpcy5jYWxsTWV0aG9kKCdwbGF0Zm9ybS5saXN0QWRkcmVzc2VzJywgcGFyYW1zKVxuICAgICAgLnRoZW4oKHJlc3BvbnNlOlJlcXVlc3RSZXNwb25zZURhdGEpID0+IHJlc3BvbnNlLmRhdGEucmVzdWx0LmFkZHJlc3Nlcyk7XG4gIH07XG5cbiAgLyoqXG4gICAqIExpc3RzIHRoZSBzZXQgb2YgY3VycmVudCB2YWxpZGF0b3JzLlxuICAgKlxuICAgKiBAcGFyYW0gc3VibmV0SUQgT3B0aW9uYWwuIEVpdGhlciBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IG9yIGFuXG4gICAqIGNiNTggc2VyaWFsaXplZCBzdHJpbmcgZm9yIHRoZSBTdWJuZXRJRCBvciBpdHMgYWxpYXMuXG4gICAqXG4gICAqIEByZXR1cm5zIFByb21pc2UgZm9yIGFuIGFycmF5IG9mIHZhbGlkYXRvcnMgdGhhdCBhcmUgY3VycmVudGx5IHN0YWtpbmcsIHNlZToge0BsaW5rIGh0dHBzOi8vZG9jcy5hdmF4Lm5ldHdvcmsvdjEuMC9lbi9hcGkvcGxhdGZvcm0vI3BsYXRmb3JtZ2V0Y3VycmVudHZhbGlkYXRvcnN8cGxhdGZvcm0uZ2V0Q3VycmVudFZhbGlkYXRvcnMgZG9jdW1lbnRhdGlvbn0uXG4gICAqXG4gICAqL1xuICBnZXRDdXJyZW50VmFsaWRhdG9ycyA9IGFzeW5jIChzdWJuZXRJRDpCdWZmZXIgfCBzdHJpbmcgPSB1bmRlZmluZWQpOlByb21pc2U8b2JqZWN0PiA9PiB7XG4gICAgY29uc3QgcGFyYW1zOmFueSA9IHt9O1xuICAgIGlmICh0eXBlb2Ygc3VibmV0SUQgPT09ICdzdHJpbmcnKSB7XG4gICAgICBwYXJhbXMuc3VibmV0SUQgPSBzdWJuZXRJRDtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBzdWJuZXRJRCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHBhcmFtcy5zdWJuZXRJRCA9IGJpbnRvb2xzLmNiNThFbmNvZGUoc3VibmV0SUQpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5jYWxsTWV0aG9kKCdwbGF0Zm9ybS5nZXRDdXJyZW50VmFsaWRhdG9ycycsIHBhcmFtcylcbiAgICAgIC50aGVuKChyZXNwb25zZTpSZXF1ZXN0UmVzcG9uc2VEYXRhKSA9PiByZXNwb25zZS5kYXRhLnJlc3VsdCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIExpc3RzIHRoZSBzZXQgb2YgcGVuZGluZyB2YWxpZGF0b3JzLlxuICAgKlxuICAgKiBAcGFyYW0gc3VibmV0SUQgT3B0aW9uYWwuIEVpdGhlciBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9XG4gICAqIG9yIGEgY2I1OCBzZXJpYWxpemVkIHN0cmluZyBmb3IgdGhlIFN1Ym5ldElEIG9yIGl0cyBhbGlhcy5cbiAgICpcbiAgICogQHJldHVybnMgUHJvbWlzZSBmb3IgYW4gYXJyYXkgb2YgdmFsaWRhdG9ycyB0aGF0IGFyZSBwZW5kaW5nIHN0YWtpbmcsIHNlZToge0BsaW5rIGh0dHBzOi8vZG9jcy5hdmF4Lm5ldHdvcmsvdjEuMC9lbi9hcGkvcGxhdGZvcm0vI3BsYXRmb3JtZ2V0cGVuZGluZ3ZhbGlkYXRvcnN8cGxhdGZvcm0uZ2V0UGVuZGluZ1ZhbGlkYXRvcnMgZG9jdW1lbnRhdGlvbn0uXG4gICAqXG4gICAqL1xuICBnZXRQZW5kaW5nVmFsaWRhdG9ycyA9IGFzeW5jIChzdWJuZXRJRDpCdWZmZXIgfCBzdHJpbmcgPSB1bmRlZmluZWQpOlByb21pc2U8b2JqZWN0PiA9PiB7XG4gICAgY29uc3QgcGFyYW1zOmFueSA9IHt9O1xuICAgIGlmICh0eXBlb2Ygc3VibmV0SUQgPT09ICdzdHJpbmcnKSB7XG4gICAgICBwYXJhbXMuc3VibmV0SUQgPSBzdWJuZXRJRDtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBzdWJuZXRJRCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHBhcmFtcy5zdWJuZXRJRCA9IGJpbnRvb2xzLmNiNThFbmNvZGUoc3VibmV0SUQpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmNhbGxNZXRob2QoJ3BsYXRmb3JtLmdldFBlbmRpbmdWYWxpZGF0b3JzJywgcGFyYW1zKVxuICAgICAgLnRoZW4oKHJlc3BvbnNlOlJlcXVlc3RSZXNwb25zZURhdGEpID0+IHJlc3BvbnNlLmRhdGEucmVzdWx0KTtcbiAgfTtcblxuICAvKipcbiAgICogU2FtcGxlcyBgU2l6ZWAgdmFsaWRhdG9ycyBmcm9tIHRoZSBjdXJyZW50IHZhbGlkYXRvciBzZXQuXG4gICAqXG4gICAqIEBwYXJhbSBzYW1wbGVTaXplIE9mIHRoZSB0b3RhbCB1bml2ZXJzZSBvZiB2YWxpZGF0b3JzLCBzZWxlY3QgdGhpcyBtYW55IGF0IHJhbmRvbVxuICAgKiBAcGFyYW0gc3VibmV0SUQgT3B0aW9uYWwuIEVpdGhlciBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IG9yIGFuXG4gICAqIGNiNTggc2VyaWFsaXplZCBzdHJpbmcgZm9yIHRoZSBTdWJuZXRJRCBvciBpdHMgYWxpYXMuXG4gICAqXG4gICAqIEByZXR1cm5zIFByb21pc2UgZm9yIGFuIGFycmF5IG9mIHZhbGlkYXRvcidzIHN0YWtpbmdJRHMuXG4gICAqL1xuICBzYW1wbGVWYWxpZGF0b3JzID0gYXN5bmMgKHNhbXBsZVNpemU6bnVtYmVyLFxuICAgIHN1Ym5ldElEOkJ1ZmZlciB8IHN0cmluZyA9IHVuZGVmaW5lZClcbiAgOlByb21pc2U8QXJyYXk8c3RyaW5nPj4gPT4ge1xuICAgIGNvbnN0IHBhcmFtczphbnkgPSB7XG4gICAgICBzaXplOiBzYW1wbGVTaXplLnRvU3RyaW5nKCksXG4gICAgfTtcbiAgICBpZiAodHlwZW9mIHN1Ym5ldElEID09PSAnc3RyaW5nJykge1xuICAgICAgcGFyYW1zLnN1Ym5ldElEID0gc3VibmV0SUQ7XG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygc3VibmV0SUQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBwYXJhbXMuc3VibmV0SUQgPSBiaW50b29scy5jYjU4RW5jb2RlKHN1Ym5ldElEKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY2FsbE1ldGhvZCgncGxhdGZvcm0uc2FtcGxlVmFsaWRhdG9ycycsIHBhcmFtcylcbiAgICAgIC50aGVuKChyZXNwb25zZTpSZXF1ZXN0UmVzcG9uc2VEYXRhKSA9PiByZXNwb25zZS5kYXRhLnJlc3VsdC52YWxpZGF0b3JzKTtcbiAgfTtcblxuICAvKipcbiAgICogQWRkIGEgdmFsaWRhdG9yIHRvIHRoZSBQcmltYXJ5IE5ldHdvcmsuXG4gICAqXG4gICAqIEBwYXJhbSB1c2VybmFtZSBUaGUgdXNlcm5hbWUgb2YgdGhlIEtleXN0b3JlIHVzZXJcbiAgICogQHBhcmFtIHBhc3N3b3JkIFRoZSBwYXNzd29yZCBvZiB0aGUgS2V5c3RvcmUgdXNlclxuICAgKiBAcGFyYW0gbm9kZUlEIFRoZSBub2RlIElEIG9mIHRoZSB2YWxpZGF0b3JcbiAgICogQHBhcmFtIHN0YXJ0VGltZSBKYXZhc2NyaXB0IERhdGUgb2JqZWN0IGZvciB0aGUgc3RhcnQgdGltZSB0byB2YWxpZGF0ZVxuICAgKiBAcGFyYW0gZW5kVGltZSBKYXZhc2NyaXB0IERhdGUgb2JqZWN0IGZvciB0aGUgZW5kIHRpbWUgdG8gdmFsaWRhdGVcbiAgICogQHBhcmFtIHN0YWtlQW1vdW50IFRoZSBhbW91bnQgb2YgbkFWQVggdGhlIHZhbGlkYXRvciBpcyBzdGFraW5nIGFzXG4gICAqIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgICogQHBhcmFtIHJld2FyZEFkZHJlc3MgVGhlIGFkZHJlc3MgdGhlIHZhbGlkYXRvciByZXdhcmQgd2lsbCBnbyB0bywgaWYgdGhlcmUgaXMgb25lLlxuICAgKiBAcGFyYW0gZGVsZWdhdGlvbkZlZVJhdGUgT3B0aW9uYWwuIEEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn0gZm9yIHRoZSBwZXJjZW50IGZlZSB0aGlzIHZhbGlkYXRvciBcbiAgICogY2hhcmdlcyB3aGVuIG90aGVycyBkZWxlZ2F0ZSBzdGFrZSB0byB0aGVtLiBVcCB0byA0IGRlY2ltYWwgcGxhY2VzIGFsbG93ZWQ7IGFkZGl0aW9uYWwgZGVjaW1hbCBwbGFjZXMgYXJlIGlnbm9yZWQuIFxuICAgKiBNdXN0IGJlIGJldHdlZW4gMCBhbmQgMTAwLCBpbmNsdXNpdmUuIEZvciBleGFtcGxlLCBpZiBkZWxlZ2F0aW9uRmVlUmF0ZSBpcyAxLjIzNDUgYW5kIHNvbWVvbmUgZGVsZWdhdGVzIHRvIHRoaXMgXG4gICAqIHZhbGlkYXRvciwgdGhlbiB3aGVuIHRoZSBkZWxlZ2F0aW9uIHBlcmlvZCBpcyBvdmVyLCAxLjIzNDUlIG9mIHRoZSByZXdhcmQgZ29lcyB0byB0aGUgdmFsaWRhdG9yIGFuZCB0aGUgcmVzdCBnb2VzIFxuICAgKiB0byB0aGUgZGVsZWdhdG9yLlxuICAgKlxuICAgKiBAcmV0dXJucyBQcm9taXNlIGZvciBhIGJhc2U1OCBzdHJpbmcgb2YgdGhlIHVuc2lnbmVkIHRyYW5zYWN0aW9uLlxuICAgKi9cbiAgYWRkVmFsaWRhdG9yID0gYXN5bmMgKFxuICAgIHVzZXJuYW1lOnN0cmluZyxcbiAgICBwYXNzd29yZDpzdHJpbmcsXG4gICAgbm9kZUlEOnN0cmluZyxcbiAgICBzdGFydFRpbWU6RGF0ZSxcbiAgICBlbmRUaW1lOkRhdGUsXG4gICAgc3Rha2VBbW91bnQ6Qk4sXG4gICAgcmV3YXJkQWRkcmVzczpzdHJpbmcsXG4gICAgZGVsZWdhdGlvbkZlZVJhdGU6Qk4gPSB1bmRlZmluZWRcbiAgKTpQcm9taXNlPHN0cmluZz4gPT4ge1xuICAgIGNvbnN0IHBhcmFtczphbnkgPSB7XG4gICAgICB1c2VybmFtZSxcbiAgICAgIHBhc3N3b3JkLFxuICAgICAgbm9kZUlELFxuICAgICAgc3RhcnRUaW1lOiBzdGFydFRpbWUuZ2V0VGltZSgpIC8gMTAwMCxcbiAgICAgIGVuZFRpbWU6IGVuZFRpbWUuZ2V0VGltZSgpIC8gMTAwMCxcbiAgICAgIHN0YWtlQW1vdW50OiBzdGFrZUFtb3VudC50b1N0cmluZygxMCksXG4gICAgICByZXdhcmRBZGRyZXNzLFxuICAgIH07XG4gICAgaWYgKHR5cGVvZiBkZWxlZ2F0aW9uRmVlUmF0ZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHBhcmFtcy5kZWxlZ2F0aW9uRmVlUmF0ZSA9IGRlbGVnYXRpb25GZWVSYXRlLnRvU3RyaW5nKDEwKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY2FsbE1ldGhvZCgncGxhdGZvcm0uYWRkVmFsaWRhdG9yJywgcGFyYW1zKVxuICAgICAgLnRoZW4oKHJlc3BvbnNlOlJlcXVlc3RSZXNwb25zZURhdGEpID0+IHJlc3BvbnNlLmRhdGEucmVzdWx0LnR4SUQpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBBZGQgYSB2YWxpZGF0b3IgdG8gYSBTdWJuZXQgb3RoZXIgdGhhbiB0aGUgUHJpbWFyeSBOZXR3b3JrLiBUaGUgdmFsaWRhdG9yIG11c3QgdmFsaWRhdGUgdGhlIFByaW1hcnkgTmV0d29yayBmb3IgdGhlIGVudGlyZSBkdXJhdGlvbiB0aGV5IHZhbGlkYXRlIHRoaXMgU3VibmV0LlxuICAgKlxuICAgKiBAcGFyYW0gdXNlcm5hbWUgVGhlIHVzZXJuYW1lIG9mIHRoZSBLZXlzdG9yZSB1c2VyXG4gICAqIEBwYXJhbSBwYXNzd29yZCBUaGUgcGFzc3dvcmQgb2YgdGhlIEtleXN0b3JlIHVzZXJcbiAgICogQHBhcmFtIG5vZGVJRCBUaGUgbm9kZSBJRCBvZiB0aGUgdmFsaWRhdG9yXG4gICAqIEBwYXJhbSBzdWJuZXRJRCBFaXRoZXIgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBvciBhIGNiNTggc2VyaWFsaXplZCBzdHJpbmcgZm9yIHRoZSBTdWJuZXRJRCBvciBpdHMgYWxpYXMuXG4gICAqIEBwYXJhbSBzdGFydFRpbWUgSmF2YXNjcmlwdCBEYXRlIG9iamVjdCBmb3IgdGhlIHN0YXJ0IHRpbWUgdG8gdmFsaWRhdGVcbiAgICogQHBhcmFtIGVuZFRpbWUgSmF2YXNjcmlwdCBEYXRlIG9iamVjdCBmb3IgdGhlIGVuZCB0aW1lIHRvIHZhbGlkYXRlXG4gICAqIEBwYXJhbSB3ZWlnaHQgVGhlIHZhbGlkYXRvcuKAmXMgd2VpZ2h0IHVzZWQgZm9yIHNhbXBsaW5nXG4gICAqXG4gICAqIEByZXR1cm5zIFByb21pc2UgZm9yIHRoZSB1bnNpZ25lZCB0cmFuc2FjdGlvbi4gSXQgbXVzdCBiZSBzaWduZWQgKHVzaW5nIHNpZ24pIGJ5IHRoZSBwcm9wZXIgbnVtYmVyIG9mIHRoZSBTdWJuZXTigJlzIGNvbnRyb2wga2V5cyBhbmQgYnkgdGhlIGtleSBvZiB0aGUgYWNjb3VudCBwYXlpbmcgdGhlIHRyYW5zYWN0aW9uIGZlZSBiZWZvcmUgaXQgY2FuIGJlIGlzc3VlZC5cbiAgICovXG4gIGFkZFN1Ym5ldFZhbGlkYXRvciA9IGFzeW5jIChcbiAgICB1c2VybmFtZTpzdHJpbmcsXG4gICAgcGFzc3dvcmQ6c3RyaW5nLFxuICAgIG5vZGVJRDpzdHJpbmcsXG4gICAgc3VibmV0SUQ6QnVmZmVyIHwgc3RyaW5nLFxuICAgIHN0YXJ0VGltZTpEYXRlLFxuICAgIGVuZFRpbWU6RGF0ZSxcbiAgICB3ZWlnaHQ6bnVtYmVyXG4gICAgKVxuICA6UHJvbWlzZTxzdHJpbmc+ID0+IHtcbiAgICBjb25zdCBwYXJhbXM6YW55ID0ge1xuICAgICAgdXNlcm5hbWUsXG4gICAgICBwYXNzd29yZCxcbiAgICAgIG5vZGVJRCxcbiAgICAgIHN0YXJ0VGltZTogc3RhcnRUaW1lLmdldFRpbWUoKSAvIDEwMDAsXG4gICAgICBlbmRUaW1lOiBlbmRUaW1lLmdldFRpbWUoKSAvIDEwMDAsXG4gICAgICB3ZWlnaHRcbiAgICB9O1xuICAgIGlmICh0eXBlb2Ygc3VibmV0SUQgPT09ICdzdHJpbmcnKSB7XG4gICAgICBwYXJhbXMuc3VibmV0SUQgPSBzdWJuZXRJRDtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBzdWJuZXRJRCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHBhcmFtcy5zdWJuZXRJRCA9IGJpbnRvb2xzLmNiNThFbmNvZGUoc3VibmV0SUQpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5jYWxsTWV0aG9kKCdwbGF0Zm9ybS5hZGRTdWJuZXRWYWxpZGF0b3InLCBwYXJhbXMpXG4gICAgICAudGhlbigocmVzcG9uc2U6UmVxdWVzdFJlc3BvbnNlRGF0YSkgPT4gcmVzcG9uc2UuZGF0YS5yZXN1bHQudHhJRCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEFkZCBhIGRlbGVnYXRvciB0byB0aGUgUHJpbWFyeSBOZXR3b3JrLlxuICAgKlxuICAgKiBAcGFyYW0gdXNlcm5hbWUgVGhlIHVzZXJuYW1lIG9mIHRoZSBLZXlzdG9yZSB1c2VyXG4gICAqIEBwYXJhbSBwYXNzd29yZCBUaGUgcGFzc3dvcmQgb2YgdGhlIEtleXN0b3JlIHVzZXJcbiAgICogQHBhcmFtIG5vZGVJRCBUaGUgbm9kZSBJRCBvZiB0aGUgZGVsZWdhdGVlXG4gICAqIEBwYXJhbSBzdGFydFRpbWUgSmF2YXNjcmlwdCBEYXRlIG9iamVjdCBmb3Igd2hlbiB0aGUgZGVsZWdhdG9yIHN0YXJ0cyBkZWxlZ2F0aW5nXG4gICAqIEBwYXJhbSBlbmRUaW1lIEphdmFzY3JpcHQgRGF0ZSBvYmplY3QgZm9yIHdoZW4gdGhlIGRlbGVnYXRvciBzdGFydHMgZGVsZWdhdGluZ1xuICAgKiBAcGFyYW0gc3Rha2VBbW91bnQgVGhlIGFtb3VudCBvZiBuQVZBWCB0aGUgZGVsZWdhdG9yIGlzIHN0YWtpbmcgYXNcbiAgICogYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfVxuICAgKiBAcGFyYW0gcmV3YXJkQWRkcmVzcyBUaGUgYWRkcmVzcyBvZiB0aGUgYWNjb3VudCB0aGUgc3Rha2VkIEFWQVggYW5kIHZhbGlkYXRpb24gcmV3YXJkXG4gICAqIChpZiBhcHBsaWNhYmxlKSBhcmUgc2VudCB0byBhdCBlbmRUaW1lXG4gICAqXG4gICAqIEByZXR1cm5zIFByb21pc2UgZm9yIGFuIGFycmF5IG9mIHZhbGlkYXRvcidzIHN0YWtpbmdJRHMuXG4gICAqL1xuICBhZGREZWxlZ2F0b3IgPSBhc3luYyAoXG4gICAgdXNlcm5hbWU6c3RyaW5nLFxuICAgIHBhc3N3b3JkOnN0cmluZyxcbiAgICBub2RlSUQ6c3RyaW5nLFxuICAgIHN0YXJ0VGltZTpEYXRlLFxuICAgIGVuZFRpbWU6RGF0ZSxcbiAgICBzdGFrZUFtb3VudDpCTixcbiAgICByZXdhcmRBZGRyZXNzOnN0cmluZylcbiAgOlByb21pc2U8c3RyaW5nPiA9PiB7XG4gICAgY29uc3QgcGFyYW1zOmFueSA9IHtcbiAgICAgIHVzZXJuYW1lLFxuICAgICAgcGFzc3dvcmQsXG4gICAgICBub2RlSUQsXG4gICAgICBzdGFydFRpbWU6IHN0YXJ0VGltZS5nZXRUaW1lKCkgLyAxMDAwLFxuICAgICAgZW5kVGltZTogZW5kVGltZS5nZXRUaW1lKCkgLyAxMDAwLFxuICAgICAgc3Rha2VBbW91bnQ6IHN0YWtlQW1vdW50LnRvU3RyaW5nKDEwKSxcbiAgICAgIHJld2FyZEFkZHJlc3MsXG4gICAgfTtcbiAgICByZXR1cm4gdGhpcy5jYWxsTWV0aG9kKCdwbGF0Zm9ybS5hZGREZWxlZ2F0b3InLCBwYXJhbXMpXG4gICAgICAudGhlbigocmVzcG9uc2U6UmVxdWVzdFJlc3BvbnNlRGF0YSkgPT4gcmVzcG9uc2UuZGF0YS5yZXN1bHQudHhJRCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhbiB1bnNpZ25lZCB0cmFuc2FjdGlvbiB0byBjcmVhdGUgYSBuZXcgU3VibmV0LiBUaGUgdW5zaWduZWQgdHJhbnNhY3Rpb24gbXVzdCBiZVxuICAgKiBzaWduZWQgd2l0aCB0aGUga2V5IG9mIHRoZSBhY2NvdW50IHBheWluZyB0aGUgdHJhbnNhY3Rpb24gZmVlLiBUaGUgU3VibmV04oCZcyBJRCBpcyB0aGUgSUQgb2YgdGhlIHRyYW5zYWN0aW9uIHRoYXQgY3JlYXRlcyBpdCAoaWUgdGhlIHJlc3BvbnNlIGZyb20gaXNzdWVUeCB3aGVuIGlzc3VpbmcgdGhlIHNpZ25lZCB0cmFuc2FjdGlvbikuXG4gICAqXG4gICAqIEBwYXJhbSB1c2VybmFtZSBUaGUgdXNlcm5hbWUgb2YgdGhlIEtleXN0b3JlIHVzZXJcbiAgICogQHBhcmFtIHBhc3N3b3JkIFRoZSBwYXNzd29yZCBvZiB0aGUgS2V5c3RvcmUgdXNlclxuICAgKiBAcGFyYW0gY29udHJvbEtleXMgQXJyYXkgb2YgcGxhdGZvcm0gYWRkcmVzc2VzIGFzIHN0cmluZ3NcbiAgICogQHBhcmFtIHRocmVzaG9sZCBUbyBhZGQgYSB2YWxpZGF0b3IgdG8gdGhpcyBTdWJuZXQsIGEgdHJhbnNhY3Rpb24gbXVzdCBoYXZlIHRocmVzaG9sZFxuICAgKiBzaWduYXR1cmVzLCB3aGVyZSBlYWNoIHNpZ25hdHVyZSBpcyBmcm9tIGEga2V5IHdob3NlIGFkZHJlc3MgaXMgYW4gZWxlbWVudCBvZiBgY29udHJvbEtleXNgXG4gICAqXG4gICAqIEByZXR1cm5zIFByb21pc2UgZm9yIGEgc3RyaW5nIHdpdGggdGhlIHVuc2lnbmVkIHRyYW5zYWN0aW9uIGVuY29kZWQgYXMgYmFzZTU4LlxuICAgKi9cbiAgY3JlYXRlU3VibmV0ID0gYXN5bmMgKFxuICAgIHVzZXJuYW1lOiBzdHJpbmcsIFxuICAgIHBhc3N3b3JkOnN0cmluZyxcbiAgICBjb250cm9sS2V5czpBcnJheTxzdHJpbmc+LCBcbiAgICB0aHJlc2hvbGQ6bnVtYmVyXG4gIClcbiAgOlByb21pc2U8c3RyaW5nPiA9PiB7XG4gICAgY29uc3QgcGFyYW1zOmFueSA9IHtcbiAgICAgIHVzZXJuYW1lLFxuICAgICAgcGFzc3dvcmQsXG4gICAgICBjb250cm9sS2V5cyxcbiAgICAgIHRocmVzaG9sZFxuICAgIH07XG4gICAgcmV0dXJuIHRoaXMuY2FsbE1ldGhvZCgncGxhdGZvcm0uY3JlYXRlU3VibmV0JywgcGFyYW1zKVxuICAgICAgLnRoZW4oKHJlc3BvbnNlOlJlcXVlc3RSZXNwb25zZURhdGEpID0+IHJlc3BvbnNlLmRhdGEucmVzdWx0LnR4SUQpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBHZXQgdGhlIFN1Ym5ldCB0aGF0IHZhbGlkYXRlcyBhIGdpdmVuIGJsb2NrY2hhaW4uXG4gICAqXG4gICAqIEBwYXJhbSBibG9ja2NoYWluSUQgRWl0aGVyIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gb3IgYSBjYjU4IFxuICAgKiBlbmNvZGVkIHN0cmluZyBmb3IgdGhlIGJsb2NrY2hhaW5JRCBvciBpdHMgYWxpYXMuXG4gICAqXG4gICAqIEByZXR1cm5zIFByb21pc2UgZm9yIGEgc3RyaW5nIG9mIHRoZSBzdWJuZXRJRCB0aGF0IHZhbGlkYXRlcyB0aGUgYmxvY2tjaGFpbi5cbiAgICovXG4gIHZhbGlkYXRlZEJ5ID0gYXN5bmMgKGJsb2NrY2hhaW5JRDpzdHJpbmcpOlByb21pc2U8c3RyaW5nPiA9PiB7XG4gICAgY29uc3QgcGFyYW1zOmFueSA9IHtcbiAgICAgIGJsb2NrY2hhaW5JRCxcbiAgICB9O1xuICAgIHJldHVybiB0aGlzLmNhbGxNZXRob2QoJ3BsYXRmb3JtLnZhbGlkYXRlZEJ5JywgcGFyYW1zKVxuICAgICAgLnRoZW4oKHJlc3BvbnNlOlJlcXVlc3RSZXNwb25zZURhdGEpID0+IHJlc3BvbnNlLmRhdGEucmVzdWx0LnN1Ym5ldElEKTtcbiAgfTtcblxuICAvKipcbiAgICogR2V0IHRoZSBJRHMgb2YgdGhlIGJsb2NrY2hhaW5zIGEgU3VibmV0IHZhbGlkYXRlcy5cbiAgICpcbiAgICogQHBhcmFtIHN1Ym5ldElEIEVpdGhlciBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IG9yIGFuIEFWQVhcbiAgICogc2VyaWFsaXplZCBzdHJpbmcgZm9yIHRoZSBTdWJuZXRJRCBvciBpdHMgYWxpYXMuXG4gICAqXG4gICAqIEByZXR1cm5zIFByb21pc2UgZm9yIGFuIGFycmF5IG9mIGJsb2NrY2hhaW5JRHMgdGhlIHN1Ym5ldCB2YWxpZGF0ZXMuXG4gICAqL1xuICB2YWxpZGF0ZXMgPSBhc3luYyAoc3VibmV0SUQ6QnVmZmVyIHwgc3RyaW5nKTpQcm9taXNlPEFycmF5PHN0cmluZz4+ID0+IHtcbiAgICBjb25zdCBwYXJhbXM6YW55ID0ge1xuICAgICAgc3VibmV0SUQsXG4gICAgfTtcbiAgICBpZiAodHlwZW9mIHN1Ym5ldElEID09PSAnc3RyaW5nJykge1xuICAgICAgcGFyYW1zLnN1Ym5ldElEID0gc3VibmV0SUQ7XG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygc3VibmV0SUQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBwYXJhbXMuc3VibmV0SUQgPSBiaW50b29scy5jYjU4RW5jb2RlKHN1Ym5ldElEKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY2FsbE1ldGhvZCgncGxhdGZvcm0udmFsaWRhdGVzJywgcGFyYW1zKVxuICAgICAgLnRoZW4oKHJlc3BvbnNlOlJlcXVlc3RSZXNwb25zZURhdGEpID0+IHJlc3BvbnNlLmRhdGEucmVzdWx0LmJsb2NrY2hhaW5JRHMpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBHZXQgYWxsIHRoZSBibG9ja2NoYWlucyB0aGF0IGV4aXN0IChleGNsdWRpbmcgdGhlIFAtQ2hhaW4pLlxuICAgKlxuICAgKiBAcmV0dXJucyBQcm9taXNlIGZvciBhbiBhcnJheSBvZiBvYmplY3RzIGNvbnRhaW5pbmcgZmllbGRzIFwiaWRcIiwgXCJzdWJuZXRJRFwiLCBhbmQgXCJ2bUlEXCIuXG4gICAqL1xuICBnZXRCbG9ja2NoYWlucyA9IGFzeW5jICgpOlByb21pc2U8QXJyYXk8b2JqZWN0Pj4gPT4ge1xuICAgIGNvbnN0IHBhcmFtczphbnkgPSB7fTtcbiAgICByZXR1cm4gdGhpcy5jYWxsTWV0aG9kKCdwbGF0Zm9ybS5nZXRCbG9ja2NoYWlucycsIHBhcmFtcylcbiAgICAgIC50aGVuKChyZXNwb25zZTpSZXF1ZXN0UmVzcG9uc2VEYXRhKSA9PiByZXNwb25zZS5kYXRhLnJlc3VsdC5ibG9ja2NoYWlucyk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFNlbmQgQVZBWCBmcm9tIGFuIGFjY291bnQgb24gdGhlIFAtQ2hhaW4gdG8gYW4gYWRkcmVzcyBvbiB0aGUgWC1DaGFpbi4gVGhpcyB0cmFuc2FjdGlvblxuICAgKiBtdXN0IGJlIHNpZ25lZCB3aXRoIHRoZSBrZXkgb2YgdGhlIGFjY291bnQgdGhhdCB0aGUgQVZBWCBpcyBzZW50IGZyb20gYW5kIHdoaWNoIHBheXMgdGhlXG4gICAqIHRyYW5zYWN0aW9uIGZlZS4gQWZ0ZXIgaXNzdWluZyB0aGlzIHRyYW5zYWN0aW9uLCB5b3UgbXVzdCBjYWxsIHRoZSBYLUNoYWlu4oCZcyBpbXBvcnRBVkFYXG4gICAqIG1ldGhvZCB0byBjb21wbGV0ZSB0aGUgdHJhbnNmZXIuXG4gICAqXG4gICAqIEBwYXJhbSB1c2VybmFtZSBUaGUgS2V5c3RvcmUgdXNlciB0aGF0IGNvbnRyb2xzIHRoZSBhY2NvdW50IHNwZWNpZmllZCBpbiBgdG9gXG4gICAqIEBwYXJhbSBwYXNzd29yZCBUaGUgcGFzc3dvcmQgb2YgdGhlIEtleXN0b3JlIHVzZXJcbiAgICogQHBhcmFtIHRvIFRoZSBhZGRyZXNzIG9uIHRoZSBYLUNoYWluIHRvIHNlbmQgdGhlIEFWQVggdG8uIERvIG5vdCBpbmNsdWRlIFgtIGluIHRoZSBhZGRyZXNzXG4gICAqIEBwYXJhbSBhbW91bnQgQW1vdW50IG9mIEFWQVggdG8gZXhwb3J0IGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgICpcbiAgICogQHJldHVybnMgUHJvbWlzZSBmb3IgYW4gdW5zaWduZWQgdHJhbnNhY3Rpb24gdG8gYmUgc2lnbmVkIGJ5IHRoZSBhY2NvdW50IHRoZSB0aGUgQVZBWCBpc1xuICAgKiBzZW50IGZyb20gYW5kIHBheXMgdGhlIHRyYW5zYWN0aW9uIGZlZS5cbiAgICovXG4gIGV4cG9ydEFWQVggPSBhc3luYyAodXNlcm5hbWU6IHN0cmluZywgcGFzc3dvcmQ6c3RyaW5nLCBhbW91bnQ6Qk4sIHRvOnN0cmluZywpOlByb21pc2U8c3RyaW5nPiA9PiB7XG4gICAgY29uc3QgcGFyYW1zOmFueSA9IHtcbiAgICAgIHVzZXJuYW1lLFxuICAgICAgcGFzc3dvcmQsXG4gICAgICB0byxcbiAgICAgIGFtb3VudDogYW1vdW50LnRvU3RyaW5nKDEwKVxuICAgIH07XG4gICAgcmV0dXJuIHRoaXMuY2FsbE1ldGhvZCgncGxhdGZvcm0uZXhwb3J0QVZBWCcsIHBhcmFtcylcbiAgICAgIC50aGVuKChyZXNwb25zZTpSZXF1ZXN0UmVzcG9uc2VEYXRhKSA9PiByZXNwb25zZS5kYXRhLnJlc3VsdC50eElEKTtcbiAgfTtcblxuICAvKipcbiAgICogU2VuZCBBVkFYIGZyb20gYW4gYWNjb3VudCBvbiB0aGUgUC1DaGFpbiB0byBhbiBhZGRyZXNzIG9uIHRoZSBYLUNoYWluLiBUaGlzIHRyYW5zYWN0aW9uXG4gICAqIG11c3QgYmUgc2lnbmVkIHdpdGggdGhlIGtleSBvZiB0aGUgYWNjb3VudCB0aGF0IHRoZSBBVkFYIGlzIHNlbnQgZnJvbSBhbmQgd2hpY2ggcGF5c1xuICAgKiB0aGUgdHJhbnNhY3Rpb24gZmVlLiBBZnRlciBpc3N1aW5nIHRoaXMgdHJhbnNhY3Rpb24sIHlvdSBtdXN0IGNhbGwgdGhlIFgtQ2hhaW7igJlzXG4gICAqIGltcG9ydEFWQVggbWV0aG9kIHRvIGNvbXBsZXRlIHRoZSB0cmFuc2Zlci5cbiAgICpcbiAgICogQHBhcmFtIHVzZXJuYW1lIFRoZSBLZXlzdG9yZSB1c2VyIHRoYXQgY29udHJvbHMgdGhlIGFjY291bnQgc3BlY2lmaWVkIGluIGB0b2BcbiAgICogQHBhcmFtIHBhc3N3b3JkIFRoZSBwYXNzd29yZCBvZiB0aGUgS2V5c3RvcmUgdXNlclxuICAgKiBAcGFyYW0gdG8gVGhlIElEIG9mIHRoZSBhY2NvdW50IHRoZSBBVkFYIGlzIHNlbnQgdG8uIFRoaXMgbXVzdCBiZSB0aGUgc2FtZSBhcyB0aGUgdG9cbiAgICogYXJndW1lbnQgaW4gdGhlIGNvcnJlc3BvbmRpbmcgY2FsbCB0byB0aGUgWC1DaGFpbuKAmXMgZXhwb3J0QVZBWFxuICAgKiBAcGFyYW0gc291cmNlQ2hhaW4gVGhlIGNoYWluSUQgd2hlcmUgdGhlIGZ1bmRzIGFyZSBjb21pbmcgZnJvbS5cbiAgICpcbiAgICogQHJldHVybnMgUHJvbWlzZSBmb3IgYSBzdHJpbmcgZm9yIHRoZSB0cmFuc2FjdGlvbiwgd2hpY2ggc2hvdWxkIGJlIHNlbnQgdG8gdGhlIG5ldHdvcmtcbiAgICogYnkgY2FsbGluZyBpc3N1ZVR4LlxuICAgKi9cbiAgaW1wb3J0QVZBWCA9IGFzeW5jICh1c2VybmFtZTogc3RyaW5nLCBwYXNzd29yZDpzdHJpbmcsIHRvOnN0cmluZywgc291cmNlQ2hhaW46c3RyaW5nKVxuICA6UHJvbWlzZTxzdHJpbmc+ID0+IHtcbiAgICBjb25zdCBwYXJhbXM6YW55ID0ge1xuICAgICAgdG8sXG4gICAgICBzb3VyY2VDaGFpbixcbiAgICAgIHVzZXJuYW1lLFxuICAgICAgcGFzc3dvcmQsXG4gICAgfTtcbiAgICByZXR1cm4gdGhpcy5jYWxsTWV0aG9kKCdwbGF0Zm9ybS5pbXBvcnRBVkFYJywgcGFyYW1zKVxuICAgICAgLnRoZW4oKHJlc3BvbnNlOlJlcXVlc3RSZXNwb25zZURhdGEpID0+IHJlc3BvbnNlLmRhdGEucmVzdWx0LnR4SUQpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDYWxscyB0aGUgbm9kZSdzIGlzc3VlVHggbWV0aG9kIGZyb20gdGhlIEFQSSBhbmQgcmV0dXJucyB0aGUgcmVzdWx0aW5nIHRyYW5zYWN0aW9uIElEIGFzIGEgc3RyaW5nLlxuICAgKlxuICAgKiBAcGFyYW0gdHggQSBzdHJpbmcsIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9LCBvciBbW1R4XV0gcmVwcmVzZW50aW5nIGEgdHJhbnNhY3Rpb25cbiAgICpcbiAgICogQHJldHVybnMgQSBQcm9taXNlPHN0cmluZz4gcmVwcmVzZW50aW5nIHRoZSB0cmFuc2FjdGlvbiBJRCBvZiB0aGUgcG9zdGVkIHRyYW5zYWN0aW9uLlxuICAgKi9cbiAgaXNzdWVUeCA9IGFzeW5jICh0eDpzdHJpbmcgfCBCdWZmZXIgfCBUeCk6UHJvbWlzZTxzdHJpbmc+ID0+IHtcbiAgICBsZXQgVHJhbnNhY3Rpb24gPSAnJztcbiAgICBpZiAodHlwZW9mIHR4ID09PSAnc3RyaW5nJykge1xuICAgICAgVHJhbnNhY3Rpb24gPSB0eDtcbiAgICB9IGVsc2UgaWYgKHR4IGluc3RhbmNlb2YgQnVmZmVyKSB7XG4gICAgICBjb25zdCB0eG9iajpUeCA9IG5ldyBUeCgpO1xuICAgICAgdHhvYmouZnJvbUJ1ZmZlcih0eCk7XG4gICAgICBUcmFuc2FjdGlvbiA9IHR4b2JqLnRvU3RyaW5nKCk7XG4gICAgfSBlbHNlIGlmICh0eCBpbnN0YW5jZW9mIFR4KSB7XG4gICAgICBUcmFuc2FjdGlvbiA9IHR4LnRvU3RyaW5nKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Vycm9yIC0gcGxhdGZvcm0uaXNzdWVUeDogcHJvdmlkZWQgdHggaXMgbm90IGV4cGVjdGVkIHR5cGUgb2Ygc3RyaW5nLCBCdWZmZXIsIG9yIFR4Jyk7XG4gICAgfVxuICAgIGNvbnN0IHBhcmFtczphbnkgPSB7XG4gICAgICB0eDogVHJhbnNhY3Rpb24udG9TdHJpbmcoKSxcbiAgICB9O1xuICAgIHJldHVybiB0aGlzLmNhbGxNZXRob2QoJ3BsYXRmb3JtLmlzc3VlVHgnLCBwYXJhbXMpLnRoZW4oKHJlc3BvbnNlOlJlcXVlc3RSZXNwb25zZURhdGEpID0+IHJlc3BvbnNlLmRhdGEucmVzdWx0LnR4SUQpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIHVwcGVyIGJvdW5kIG9uIHRoZSBhbW91bnQgb2YgdG9rZW5zIHRoYXQgZXhpc3QuIE5vdCBtb25vdG9uaWNhbGx5IGluY3JlYXNpbmcgYmVjYXVzZSB0aGlzIG51bWJlciBjYW4gZ28gZG93biBpZiBhIHN0YWtlcidzIHJld2FyZCBpcyBkZW5pZWQuXG4gICAqL1xuICBnZXRDdXJyZW50U3VwcGx5ID0gYXN5bmMgKCk6UHJvbWlzZTxCTj4gPT4ge1xuICAgIGNvbnN0IHBhcmFtczphbnkgPSB7fTtcbiAgICByZXR1cm4gdGhpcy5jYWxsTWV0aG9kKCdwbGF0Zm9ybS5nZXRDdXJyZW50U3VwcGx5JywgcGFyYW1zKVxuICAgICAgLnRoZW4oKHJlc3BvbnNlOlJlcXVlc3RSZXNwb25zZURhdGEpID0+IG5ldyBCTihyZXNwb25zZS5kYXRhLnJlc3VsdC5zdXBwbHksIDEwKSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgaGVpZ2h0IG9mIHRoZSBwbGF0Zm9ybSBjaGFpbi5cbiAgICovXG4gIGdldEhlaWdodCA9IGFzeW5jICgpOlByb21pc2U8Qk4+ID0+IHtcbiAgICBjb25zdCBwYXJhbXM6YW55ID0ge307XG4gICAgcmV0dXJuIHRoaXMuY2FsbE1ldGhvZCgncGxhdGZvcm0uZ2V0SGVpZ2h0JywgcGFyYW1zKVxuICAgICAgLnRoZW4oKHJlc3BvbnNlOlJlcXVlc3RSZXNwb25zZURhdGEpID0+IG5ldyBCTihyZXNwb25zZS5kYXRhLnJlc3VsdC5oZWlnaHQsIDEwKSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgbWluaW11bSBzdGFraW5nIGFtb3VudC5cbiAgICogXG4gICAqIEBwYXJhbSByZWZyZXNoIEEgYm9vbGVhbiB0byBieXBhc3MgdGhlIGxvY2FsIGNhY2hlZCB2YWx1ZSBvZiBNaW5pbXVtIFN0YWtlIEFtb3VudCwgcG9sbGluZyB0aGUgbm9kZSBpbnN0ZWFkLlxuICAgKi9cbiAgZ2V0TWluU3Rha2UgPSBhc3luYyAocmVmcmVzaDpib29sZWFuID0gZmFsc2UpOlByb21pc2U8e21pblZhbGlkYXRvclN0YWtlOkJOLCBtaW5EZWxlZ2F0b3JTdGFrZTpCTn0+ID0+IHtcbiAgICBpZihyZWZyZXNoICE9PSB0cnVlICYmIHR5cGVvZiB0aGlzLm1pblZhbGlkYXRvclN0YWtlICE9PSBcInVuZGVmaW5lZFwiICYmIHR5cGVvZiB0aGlzLm1pbkRlbGVnYXRvclN0YWtlICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBtaW5WYWxpZGF0b3JTdGFrZTogdGhpcy5taW5WYWxpZGF0b3JTdGFrZSxcbiAgICAgICAgbWluRGVsZWdhdG9yU3Rha2U6IHRoaXMubWluRGVsZWdhdG9yU3Rha2VcbiAgICAgIH07XG4gICAgfVxuICAgIGNvbnN0IHBhcmFtczphbnkgPSB7fTtcbiAgICByZXR1cm4gdGhpcy5jYWxsTWV0aG9kKCdwbGF0Zm9ybS5nZXRNaW5TdGFrZScsIHBhcmFtcylcbiAgICAgIC50aGVuKChyZXNwb25zZTpSZXF1ZXN0UmVzcG9uc2VEYXRhKSA9PiB7XG4gICAgICAgIHRoaXMubWluVmFsaWRhdG9yU3Rha2UgPSBuZXcgQk4ocmVzcG9uc2UuZGF0YS5yZXN1bHQubWluVmFsaWRhdG9yU3Rha2UsIDEwKTtcbiAgICAgICAgdGhpcy5taW5EZWxlZ2F0b3JTdGFrZSA9IG5ldyBCTihyZXNwb25zZS5kYXRhLnJlc3VsdC5taW5EZWxlZ2F0b3JTdGFrZSwgMTApO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIG1pblZhbGlkYXRvclN0YWtlOiB0aGlzLm1pblZhbGlkYXRvclN0YWtlLFxuICAgICAgICAgIG1pbkRlbGVnYXRvclN0YWtlOiB0aGlzLm1pbkRlbGVnYXRvclN0YWtlXG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBtaW5pbXVtIHN0YWtlIGNhY2hlZCBpbiB0aGlzIGNsYXNzLlxuICAgKiBAcGFyYW0gbWluVmFsaWRhdG9yU3Rha2UgQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfSB0byBzZXQgdGhlIG1pbmltdW0gc3Rha2UgYW1vdW50IGNhY2hlZCBpbiB0aGlzIGNsYXNzLlxuICAgKiBAcGFyYW0gbWluRGVsZWdhdG9yU3Rha2UgQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfSB0byBzZXQgdGhlIG1pbmltdW0gZGVsZWdhdGlvbiBhbW91bnQgY2FjaGVkIGluIHRoaXMgY2xhc3MuXG4gICAqL1xuICBzZXRNaW5TdGFrZSA9IChtaW5WYWxpZGF0b3JTdGFrZTpCTiA9IHVuZGVmaW5lZCwgbWluRGVsZWdhdG9yU3Rha2U6Qk4gPSB1bmRlZmluZWQpOnZvaWQgPT4ge1xuICAgIGlmKHR5cGVvZiBtaW5WYWxpZGF0b3JTdGFrZSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgdGhpcy5taW5WYWxpZGF0b3JTdGFrZSA9IG1pblZhbGlkYXRvclN0YWtlO1xuICAgIH1cbiAgICBpZih0eXBlb2YgbWluRGVsZWdhdG9yU3Rha2UgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIHRoaXMubWluRGVsZWdhdG9yU3Rha2UgPSBtaW5EZWxlZ2F0b3JTdGFrZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgdG90YWwgYW1vdW50IHN0YWtlZCBmb3IgYW4gYXJyYXkgb2YgYWRkcmVzc2VzLlxuICAgKi9cbiAgZ2V0U3Rha2UgPSBhc3luYyAoYWRkcmVzc2VzOkFycmF5PHN0cmluZz4pOlByb21pc2U8Qk4+ID0+IHtcbiAgICBjb25zdCBwYXJhbXM6YW55ID0ge1xuICAgICAgYWRkcmVzc2VzXG4gICAgfTtcbiAgICByZXR1cm4gdGhpcy5jYWxsTWV0aG9kKCdwbGF0Zm9ybS5nZXRTdGFrZScsIHBhcmFtcylcbiAgICAgIC50aGVuKChyZXNwb25zZTpSZXF1ZXN0UmVzcG9uc2VEYXRhKSA9PiBuZXcgQk4ocmVzcG9uc2UuZGF0YS5yZXN1bHQuc3Rha2VkLCAxMCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhbGwgdGhlIHN1Ym5ldHMgdGhhdCBleGlzdC5cbiAgICpcbiAgICogQHBhcmFtIGlkcyBJRHMgb2YgdGhlIHN1Ym5ldHMgdG8gcmV0cmlldmUgaW5mb3JtYXRpb24gYWJvdXQuIElmIG9taXR0ZWQsIGdldHMgYWxsIHN1Ym5ldHNcbiAgICogXG4gICAqIEByZXR1cm5zIFByb21pc2UgZm9yIGFuIGFycmF5IG9mIG9iamVjdHMgY29udGFpbmluZyBmaWVsZHMgXCJpZFwiLFxuICAgKiBcImNvbnRyb2xLZXlzXCIsIGFuZCBcInRocmVzaG9sZFwiLlxuICAgKi9cbiAgZ2V0U3VibmV0cyA9IGFzeW5jIChpZHM6QXJyYXk8c3RyaW5nPiA9IHVuZGVmaW5lZCk6UHJvbWlzZTxBcnJheTxvYmplY3Q+PiA9PiB7XG4gICAgY29uc3QgcGFyYW1zOmFueSA9IHt9O1xuICAgIGlmKHR5cGVvZiBpZHMgIT09IHVuZGVmaW5lZCl7XG4gICAgICBwYXJhbXMuaWRzID0gaWRzO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5jYWxsTWV0aG9kKCdwbGF0Zm9ybS5nZXRTdWJuZXRzJywgcGFyYW1zKVxuICAgICAgLnRoZW4oKHJlc3BvbnNlOlJlcXVlc3RSZXNwb25zZURhdGEpID0+IHJlc3BvbnNlLmRhdGEucmVzdWx0LnN1Ym5ldHMpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBFeHBvcnRzIHRoZSBwcml2YXRlIGtleSBmb3IgYW4gYWRkcmVzcy5cbiAgICpcbiAgICogQHBhcmFtIHVzZXJuYW1lIFRoZSBuYW1lIG9mIHRoZSB1c2VyIHdpdGggdGhlIHByaXZhdGUga2V5XG4gICAqIEBwYXJhbSBwYXNzd29yZCBUaGUgcGFzc3dvcmQgdXNlZCB0byBkZWNyeXB0IHRoZSBwcml2YXRlIGtleVxuICAgKiBAcGFyYW0gYWRkcmVzcyBUaGUgYWRkcmVzcyB3aG9zZSBwcml2YXRlIGtleSBzaG91bGQgYmUgZXhwb3J0ZWRcbiAgICpcbiAgICogQHJldHVybnMgUHJvbWlzZSB3aXRoIHRoZSBkZWNyeXB0ZWQgcHJpdmF0ZSBrZXkgYXMgc3RvcmUgaW4gdGhlIGRhdGFiYXNlXG4gICAqL1xuICBleHBvcnRLZXkgPSBhc3luYyAodXNlcm5hbWU6c3RyaW5nLCBwYXNzd29yZDpzdHJpbmcsIGFkZHJlc3M6c3RyaW5nKTpQcm9taXNlPHN0cmluZz4gPT4ge1xuICAgIGNvbnN0IHBhcmFtczphbnkgPSB7XG4gICAgICB1c2VybmFtZSxcbiAgICAgIHBhc3N3b3JkLFxuICAgICAgYWRkcmVzcyxcbiAgICB9O1xuICAgIHJldHVybiB0aGlzLmNhbGxNZXRob2QoJ3BsYXRmb3JtLmV4cG9ydEtleScsIHBhcmFtcylcbiAgICAgIC50aGVuKChyZXNwb25zZTpSZXF1ZXN0UmVzcG9uc2VEYXRhKSA9PiByZXNwb25zZS5kYXRhLnJlc3VsdC5wcml2YXRlS2V5KTtcbiAgfTtcblxuICAvKipcbiAgICogR2l2ZSBhIHVzZXIgY29udHJvbCBvdmVyIGFuIGFkZHJlc3MgYnkgcHJvdmlkaW5nIHRoZSBwcml2YXRlIGtleSB0aGF0IGNvbnRyb2xzIHRoZSBhZGRyZXNzLlxuICAgKlxuICAgKiBAcGFyYW0gdXNlcm5hbWUgVGhlIG5hbWUgb2YgdGhlIHVzZXIgdG8gc3RvcmUgdGhlIHByaXZhdGUga2V5XG4gICAqIEBwYXJhbSBwYXNzd29yZCBUaGUgcGFzc3dvcmQgdGhhdCB1bmxvY2tzIHRoZSB1c2VyXG4gICAqIEBwYXJhbSBwcml2YXRlS2V5IEEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgcHJpdmF0ZSBrZXkgaW4gdGhlIHZtJ3MgZm9ybWF0XG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSBhZGRyZXNzIGZvciB0aGUgaW1wb3J0ZWQgcHJpdmF0ZSBrZXkuXG4gICAqL1xuICBpbXBvcnRLZXkgPSBhc3luYyAodXNlcm5hbWU6c3RyaW5nLCBwYXNzd29yZDpzdHJpbmcsIHByaXZhdGVLZXk6c3RyaW5nKTpQcm9taXNlPHN0cmluZz4gPT4ge1xuICAgIGNvbnN0IHBhcmFtczphbnkgPSB7XG4gICAgICB1c2VybmFtZSxcbiAgICAgIHBhc3N3b3JkLFxuICAgICAgcHJpdmF0ZUtleSxcbiAgICB9O1xuICAgIHJldHVybiB0aGlzLmNhbGxNZXRob2QoJ3BsYXRmb3JtLmltcG9ydEtleScsIHBhcmFtcylcbiAgICAgIC50aGVuKChyZXNwb25zZTpSZXF1ZXN0UmVzcG9uc2VEYXRhKSA9PiByZXNwb25zZS5kYXRhLnJlc3VsdC5hZGRyZXNzKTtcbiAgfTtcblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgdHJlYW5zYWN0aW9uIGRhdGEgb2YgYSBwcm92aWRlZCB0cmFuc2FjdGlvbiBJRCBieSBjYWxsaW5nIHRoZSBub2RlJ3MgYGdldFR4YCBtZXRob2QuXG4gICAqXG4gICAqIEBwYXJhbSB0eGlkIFRoZSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHRyYW5zYWN0aW9uIElEXG4gICAqXG4gICAqIEByZXR1cm5zIFJldHVybnMgYSBQcm9taXNlPHN0cmluZz4gY29udGFpbmluZyB0aGUgYnl0ZXMgcmV0cmlldmVkIGZyb20gdGhlIG5vZGVcbiAgICovXG4gIGdldFR4ID0gYXN5bmMgKHR4aWQ6c3RyaW5nKTpQcm9taXNlPHN0cmluZz4gPT4ge1xuICAgIGNvbnN0IHBhcmFtczphbnkgPSB7XG4gICAgICB0eElEOiB0eGlkLFxuICAgIH07XG4gICAgcmV0dXJuIHRoaXMuY2FsbE1ldGhvZCgncGxhdGZvcm0uZ2V0VHgnLCBwYXJhbXMpLnRoZW4oKHJlc3BvbnNlOlJlcXVlc3RSZXNwb25zZURhdGEpID0+IHJlc3BvbnNlLmRhdGEucmVzdWx0LnR4KTtcbiAgfTtcblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgc3RhdHVzIG9mIGEgcHJvdmlkZWQgdHJhbnNhY3Rpb24gSUQgYnkgY2FsbGluZyB0aGUgbm9kZSdzIGBnZXRUeFN0YXR1c2AgbWV0aG9kLlxuICAgKlxuICAgKiBAcGFyYW0gdHhpZCBUaGUgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB0cmFuc2FjdGlvbiBJRFxuICAgKiBAcGFyYW0gaW5jbHVkZVJlYXNvbiBSZXR1cm4gdGhlIHJlYXNvbiB0eCB3YXMgZHJvcHBlZCwgaWYgYXBwbGljYWJsZS4gRGVmYXVsdHMgdG8gdHJ1ZVxuICAgKlxuICAgKiBAcmV0dXJucyBSZXR1cm5zIGEgUHJvbWlzZTxzdHJpbmc+IGNvbnRhaW5pbmcgdGhlIHN0YXR1cyByZXRyaWV2ZWQgZnJvbSB0aGUgbm9kZSBhbmQgdGhlIHJlYXNvbiBhIHR4IHdhcyBkcm9wcGVkLCBpZiBhcHBsaWNhYmxlLlxuICAgKi9cbiAgZ2V0VHhTdGF0dXMgPSBhc3luYyAodHhpZDpzdHJpbmcsIGluY2x1ZGVSZWFzb246Ym9vbGVhbiA9IHRydWUpOlByb21pc2U8c3RyaW5nfHtzdGF0dXM6c3RyaW5nLCByZWFzb246c3RyaW5nfT4gPT4ge1xuICAgIGNvbnN0IHBhcmFtczphbnkgPSB7XG4gICAgICB0eElEOiB0eGlkLFxuICAgICAgaW5jbHVkZVJlYXNvbjogaW5jbHVkZVJlYXNvblxuICAgIH07XG4gICAgcmV0dXJuIHRoaXMuY2FsbE1ldGhvZCgncGxhdGZvcm0uZ2V0VHhTdGF0dXMnLCBwYXJhbXMpLnRoZW4oKHJlc3BvbnNlOlJlcXVlc3RSZXNwb25zZURhdGEpID0+IHJlc3BvbnNlLmRhdGEucmVzdWx0KTtcbiAgfTtcblxuICAvKipcbiAgICogUmV0cmlldmVzIHRoZSBVVFhPcyByZWxhdGVkIHRvIHRoZSBhZGRyZXNzZXMgcHJvdmlkZWQgZnJvbSB0aGUgbm9kZSdzIGBnZXRVVFhPc2AgbWV0aG9kLlxuICAgKlxuICAgKiBAcGFyYW0gYWRkcmVzc2VzIEFuIGFycmF5IG9mIGFkZHJlc3NlcyBhcyBjYjU4IHN0cmluZ3Mgb3IgYWRkcmVzc2VzIGFzIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9c1xuICAgKiBAcGFyYW0gc291cmNlQ2hhaW4gQSBzdHJpbmcgZm9yIHRoZSBjaGFpbiB0byBsb29rIGZvciB0aGUgVVRYTydzLiBEZWZhdWx0IGlzIHRvIHVzZSB0aGlzIGNoYWluLCBidXQgaWYgZXhwb3J0ZWQgVVRYT3MgZXhpc3QgZnJvbSBvdGhlciBjaGFpbnMsIHRoaXMgY2FuIHVzZWQgdG8gcHVsbCB0aGVtIGluc3RlYWQuXG4gICAqIEBwYXJhbSBsaW1pdCBPcHRpb25hbC4gUmV0dXJucyBhdCBtb3N0IFtsaW1pdF0gYWRkcmVzc2VzLiBJZiBbbGltaXRdID09IDAgb3IgPiBbbWF4VVRYT3NUb0ZldGNoXSwgZmV0Y2hlcyB1cCB0byBbbWF4VVRYT3NUb0ZldGNoXS5cbiAgICogQHBhcmFtIHN0YXJ0SW5kZXggT3B0aW9uYWwuIFtTdGFydEluZGV4XSBkZWZpbmVzIHdoZXJlIHRvIHN0YXJ0IGZldGNoaW5nIFVUWE9zIChmb3IgcGFnaW5hdGlvbi4pXG4gICAqIFVUWE9zIGZldGNoZWQgYXJlIGZyb20gYWRkcmVzc2VzIGVxdWFsIHRvIG9yIGdyZWF0ZXIgdGhhbiBbU3RhcnRJbmRleC5BZGRyZXNzXVxuICAgKiBGb3IgYWRkcmVzcyBbU3RhcnRJbmRleC5BZGRyZXNzXSwgb25seSBVVFhPcyB3aXRoIElEcyBncmVhdGVyIHRoYW4gW1N0YXJ0SW5kZXguVXR4b10gd2lsbCBiZSByZXR1cm5lZC5cbiAgICogQHBhcmFtIHBlcnNpc3RPcHRzIE9wdGlvbnMgYXZhaWxhYmxlIHRvIHBlcnNpc3QgdGhlc2UgVVRYT3MgaW4gbG9jYWwgc3RvcmFnZVxuICAgKlxuICAgKiBAcmVtYXJrc1xuICAgKiBwZXJzaXN0T3B0cyBpcyBvcHRpb25hbCBhbmQgbXVzdCBiZSBvZiB0eXBlIFtbUGVyc2lzdGFuY2VPcHRpb25zXV1cbiAgICpcbiAgICovXG4gIGdldFVUWE9zID0gYXN5bmMgKFxuICAgIGFkZHJlc3NlczpBcnJheTxzdHJpbmc+IHwgc3RyaW5nLFxuICAgIHNvdXJjZUNoYWluOnN0cmluZyA9IHVuZGVmaW5lZCxcbiAgICBsaW1pdDpudW1iZXIgPSAwLFxuICAgIHN0YXJ0SW5kZXg6e2FkZHJlc3M6c3RyaW5nLCB1dHhvOnN0cmluZ30gPSB1bmRlZmluZWQsXG4gICAgcGVyc2lzdE9wdHM6UGVyc2lzdGFuY2VPcHRpb25zID0gdW5kZWZpbmVkXG4gICk6UHJvbWlzZTx7XG4gICAgbnVtRmV0Y2hlZDpudW1iZXIsXG4gICAgdXR4b3M6VVRYT1NldCxcbiAgICBlbmRJbmRleDp7YWRkcmVzczpzdHJpbmcsIHV0eG86c3RyaW5nfVxuICB9PiA9PiB7XG4gICAgXG4gICAgaWYodHlwZW9mIGFkZHJlc3NlcyA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgYWRkcmVzc2VzID0gW2FkZHJlc3Nlc107XG4gICAgfVxuXG4gICAgY29uc3QgcGFyYW1zOmFueSA9IHtcbiAgICAgIGFkZHJlc3NlczogYWRkcmVzc2VzLFxuICAgICAgbGltaXRcbiAgICB9O1xuICAgIGlmKHR5cGVvZiBzdGFydEluZGV4ICE9PSBcInVuZGVmaW5lZFwiICYmIHN0YXJ0SW5kZXgpIHtcbiAgICAgIHBhcmFtcy5zdGFydEluZGV4ID0gc3RhcnRJbmRleDtcbiAgICB9XG5cbiAgICBpZih0eXBlb2Ygc291cmNlQ2hhaW4gIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIHBhcmFtcy5zb3VyY2VDaGFpbiA9IHNvdXJjZUNoYWluO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmNhbGxNZXRob2QoJ3BsYXRmb3JtLmdldFVUWE9zJywgcGFyYW1zKS50aGVuKChyZXNwb25zZTpSZXF1ZXN0UmVzcG9uc2VEYXRhKSA9PiB7XG5cbiAgICAgIGNvbnN0IHV0eG9zOlVUWE9TZXQgPSBuZXcgVVRYT1NldCgpO1xuICAgICAgbGV0IGRhdGEgPSByZXNwb25zZS5kYXRhLnJlc3VsdC51dHhvcztcbiAgICAgIGlmIChwZXJzaXN0T3B0cyAmJiB0eXBlb2YgcGVyc2lzdE9wdHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGlmICh0aGlzLmRiLmhhcyhwZXJzaXN0T3B0cy5nZXROYW1lKCkpKSB7XG4gICAgICAgICAgY29uc3Qgc2VsZkFycmF5OkFycmF5PHN0cmluZz4gPSB0aGlzLmRiLmdldChwZXJzaXN0T3B0cy5nZXROYW1lKCkpO1xuICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHNlbGZBcnJheSkpIHtcbiAgICAgICAgICAgIHV0eG9zLmFkZEFycmF5KGRhdGEpO1xuICAgICAgICAgICAgY29uc3Qgc2VsZjpVVFhPU2V0ID0gbmV3IFVUWE9TZXQoKTtcbiAgICAgICAgICAgIHNlbGYuYWRkQXJyYXkoc2VsZkFycmF5KTtcbiAgICAgICAgICAgIHNlbGYubWVyZ2VCeVJ1bGUodXR4b3MsIHBlcnNpc3RPcHRzLmdldE1lcmdlUnVsZSgpKTtcbiAgICAgICAgICAgIGRhdGEgPSBzZWxmLmdldEFsbFVUWE9TdHJpbmdzKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuZGIuc2V0KHBlcnNpc3RPcHRzLmdldE5hbWUoKSwgZGF0YSwgcGVyc2lzdE9wdHMuZ2V0T3ZlcndyaXRlKCkpO1xuICAgICAgfVxuICAgICAgdXR4b3MuYWRkQXJyYXkoZGF0YSwgZmFsc2UpO1xuICAgICAgcmVzcG9uc2UuZGF0YS5yZXN1bHQudXR4b3MgPSB1dHhvcztcbiAgICAgIHJldHVybiByZXNwb25zZS5kYXRhLnJlc3VsdDtcbiAgICB9KTtcbiAgfTtcblxuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB3aGljaCBjcmVhdGVzIGFuIHVuc2lnbmVkIEltcG9ydCBUeC4gRm9yIG1vcmUgZ3JhbnVsYXIgY29udHJvbCwgeW91IG1heSBjcmVhdGUgeW91ciBvd25cbiAqIFtbVW5zaWduZWRUeF1dIG1hbnVhbGx5ICh3aXRoIHRoZWlyIGNvcnJlc3BvbmRpbmcgW1tUcmFuc2ZlcmFibGVJbnB1dF1dcywgW1tUcmFuc2ZlcmFibGVPdXRwdXRdXXMsIGFuZCBbW1RyYW5zZmVyT3BlcmF0aW9uXV1zKS5cbiAqXG4gKiBAcGFyYW0gdXR4b3NldCBBIHNldCBvZiBVVFhPcyB0aGF0IHRoZSB0cmFuc2FjdGlvbiBpcyBidWlsdCBvblxuICogQHBhcmFtIG93bmVyQWRkcmVzc2VzIFRoZSBhZGRyZXNzZXMgYmVpbmcgdXNlZCB0byBpbXBvcnRcbiAqIEBwYXJhbSBzb3VyY2VDaGFpbiBUaGUgY2hhaW5pZCBmb3Igd2hlcmUgdGhlIGltcG9ydCBpcyBjb21pbmcgZnJvbS5cbiAqIEBwYXJhbSB0b0FkZHJlc3NlcyBUaGUgYWRkcmVzc2VzIHRvIHNlbmQgdGhlIGZ1bmRzXG4gKiBAcGFyYW0gZnJvbUFkZHJlc3NlcyBUaGUgYWRkcmVzc2VzIGJlaW5nIHVzZWQgdG8gc2VuZCB0aGUgZnVuZHMgZnJvbSB0aGUgVVRYT3MgcHJvdmlkZWRcbiAqIEBwYXJhbSBjaGFuZ2VBZGRyZXNzZXMgVGhlIGFkZHJlc3NlcyB0aGF0IGNhbiBzcGVuZCB0aGUgY2hhbmdlIHJlbWFpbmluZyBmcm9tIHRoZSBzcGVudCBVVFhPc1xuICogQHBhcmFtIG1lbW8gT3B0aW9uYWwgY29udGFpbnMgYXJiaXRyYXJ5IGJ5dGVzLCB1cCB0byAyNTYgYnl0ZXNcbiAqIEBwYXJhbSBhc09mIE9wdGlvbmFsLiBUaGUgdGltZXN0YW1wIHRvIHZlcmlmeSB0aGUgdHJhbnNhY3Rpb24gYWdhaW5zdCBhcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59XG4gKiBAcGFyYW0gbG9ja3RpbWUgT3B0aW9uYWwuIFRoZSBsb2NrdGltZSBmaWVsZCBjcmVhdGVkIGluIHRoZSByZXN1bHRpbmcgb3V0cHV0c1xuICogQHBhcmFtIHRocmVzaG9sZCBPcHRpb25hbC4gVGhlIG51bWJlciBvZiBzaWduYXR1cmVzIHJlcXVpcmVkIHRvIHNwZW5kIHRoZSBmdW5kcyBpbiB0aGUgcmVzdWx0YW50IFVUWE9cbiAqXG4gKiBAcmV0dXJucyBBbiB1bnNpZ25lZCB0cmFuc2FjdGlvbiAoW1tVbnNpZ25lZFR4XV0pIHdoaWNoIGNvbnRhaW5zIGEgW1tJbXBvcnRUeF1dLlxuICpcbiAqIEByZW1hcmtzXG4gKiBUaGlzIGhlbHBlciBleGlzdHMgYmVjYXVzZSB0aGUgZW5kcG9pbnQgQVBJIHNob3VsZCBiZSB0aGUgcHJpbWFyeSBwb2ludCBvZiBlbnRyeSBmb3IgbW9zdCBmdW5jdGlvbmFsaXR5LlxuICovXG4gIGJ1aWxkSW1wb3J0VHggPSBhc3luYyAoXG4gICAgdXR4b3NldDpVVFhPU2V0LCBcbiAgICBvd25lckFkZHJlc3NlczpBcnJheTxzdHJpbmc+LFxuICAgIHNvdXJjZUNoYWluOkJ1ZmZlciB8IHN0cmluZyxcbiAgICB0b0FkZHJlc3NlczpBcnJheTxzdHJpbmc+LCBcbiAgICBmcm9tQWRkcmVzc2VzOkFycmF5PHN0cmluZz4sXG4gICAgY2hhbmdlQWRkcmVzc2VzOkFycmF5PHN0cmluZz4gPSB1bmRlZmluZWQsXG4gICAgbWVtbzpQYXlsb2FkQmFzZXxCdWZmZXIgPSB1bmRlZmluZWQsIFxuICAgIGFzT2Y6Qk4gPSBVbml4Tm93KCksIFxuICAgIGxvY2t0aW1lOkJOID0gbmV3IEJOKDApLCBcbiAgICB0aHJlc2hvbGQ6bnVtYmVyID0gMVxuICApOlByb21pc2U8VW5zaWduZWRUeD4gPT4ge1xuICAgIGNvbnN0IHRvOkFycmF5PEJ1ZmZlcj4gPSB0aGlzLl9jbGVhbkFkZHJlc3NBcnJheSh0b0FkZHJlc3NlcywgJ2J1aWxkQmFzZVR4JykubWFwKChhKSA9PiBiaW50b29scy5zdHJpbmdUb0FkZHJlc3MoYSkpO1xuICAgIGNvbnN0IGZyb206QXJyYXk8QnVmZmVyPiA9IHRoaXMuX2NsZWFuQWRkcmVzc0FycmF5KGZyb21BZGRyZXNzZXMsICdidWlsZEJhc2VUeCcpLm1hcCgoYSkgPT4gYmludG9vbHMuc3RyaW5nVG9BZGRyZXNzKGEpKTtcbiAgICBjb25zdCBjaGFuZ2U6QXJyYXk8QnVmZmVyPiA9IHRoaXMuX2NsZWFuQWRkcmVzc0FycmF5KGNoYW5nZUFkZHJlc3NlcywgJ2J1aWxkQmFzZVR4JykubWFwKChhKSA9PiBiaW50b29scy5zdHJpbmdUb0FkZHJlc3MoYSkpO1xuXG4gICAgbGV0IHNyY0NoYWluOnN0cmluZyA9IHVuZGVmaW5lZDtcblxuICAgIGlmKHR5cGVvZiBzb3VyY2VDaGFpbiA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRXJyb3IgLSBQbGF0Zm9ybVZNQVBJLmJ1aWxkSW1wb3J0VHg6IFNvdXJjZSBDaGFpbklEIGlzIHVuZGVmaW5lZC5cIik7XG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygc291cmNlQ2hhaW4gPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIHNyY0NoYWluID0gc291cmNlQ2hhaW47XG4gICAgICBzb3VyY2VDaGFpbiA9IGJpbnRvb2xzLmNiNThEZWNvZGUoc291cmNlQ2hhaW4pO1xuICAgIH0gZWxzZSBpZighKHNvdXJjZUNoYWluIGluc3RhbmNlb2YgQnVmZmVyKSkge1xuICAgICAgc3JjQ2hhaW4gPSBiaW50b29scy5jYjU4RW5jb2RlKHNvdXJjZUNoYWluKTtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkVycm9yIC0gUGxhdGZvcm1WTUFQSS5idWlsZEltcG9ydFR4OiBJbnZhbGlkIGRlc3RpbmF0aW9uQ2hhaW4gdHlwZTogXCIgKyAodHlwZW9mIHNvdXJjZUNoYWluKSApO1xuICAgIH1cbiAgICBjb25zdCBhdG9taWNVVFhPczpVVFhPU2V0ID0gYXdhaXQgKGF3YWl0IHRoaXMuZ2V0VVRYT3Mob3duZXJBZGRyZXNzZXMsIHNyY0NoYWluLCAwLCB1bmRlZmluZWQpKS51dHhvcztcbiAgICBjb25zdCBhdmF4QXNzZXRJRDpCdWZmZXIgPSBhd2FpdCB0aGlzLmdldEFWQVhBc3NldElEKCk7XG5cbiAgICBpZiggbWVtbyBpbnN0YW5jZW9mIFBheWxvYWRCYXNlKSB7XG4gICAgICBtZW1vID0gbWVtby5nZXRQYXlsb2FkKCk7XG4gICAgfVxuXG4gICAgY29uc3QgYXRvbWljcyA9IGF0b21pY1VUWE9zLmdldEFsbFVUWE9zKCk7XG5cbiAgICBjb25zdCBidWlsdFVuc2lnbmVkVHg6VW5zaWduZWRUeCA9IHV0eG9zZXQuYnVpbGRJbXBvcnRUeChcbiAgICAgIHRoaXMuY29yZS5nZXROZXR3b3JrSUQoKSwgXG4gICAgICBiaW50b29scy5jYjU4RGVjb2RlKHRoaXMuYmxvY2tjaGFpbklEKSwgXG4gICAgICB0byxcbiAgICAgIGZyb20sXG4gICAgICBjaGFuZ2UsXG4gICAgICBhdG9taWNzLCBcbiAgICAgIHNvdXJjZUNoYWluLFxuICAgICAgdGhpcy5nZXRUeEZlZSgpLCBcbiAgICAgIGF2YXhBc3NldElELCBcbiAgICAgIG1lbW8sIGFzT2YsIGxvY2t0aW1lLCB0aHJlc2hvbGRcbiAgICApO1xuXG4gICAgaWYoISBhd2FpdCB0aGlzLmNoZWNrR29vc2VFZ2coYnVpbHRVbnNpZ25lZFR4KSkge1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkZhaWxlZCBHb29zZSBFZ2cgQ2hlY2tcIik7XG4gICAgfVxuXG4gICAgcmV0dXJuIGJ1aWx0VW5zaWduZWRUeDtcbiAgfTtcblxuICAvKipcbiAgICogSGVscGVyIGZ1bmN0aW9uIHdoaWNoIGNyZWF0ZXMgYW4gdW5zaWduZWQgRXhwb3J0IFR4LiBGb3IgbW9yZSBncmFudWxhciBjb250cm9sLCB5b3UgbWF5IGNyZWF0ZSB5b3VyIG93blxuICAgKiBbW1Vuc2lnbmVkVHhdXSBtYW51YWxseSAod2l0aCB0aGVpciBjb3JyZXNwb25kaW5nIFtbVHJhbnNmZXJhYmxlSW5wdXRdXXMsIFtbVHJhbnNmZXJhYmxlT3V0cHV0XV1zLCBhbmQgW1tUcmFuc2Zlck9wZXJhdGlvbl1dcykuXG4gICAqXG4gICAqIEBwYXJhbSB1dHhvc2V0IEEgc2V0IG9mIFVUWE9zIHRoYXQgdGhlIHRyYW5zYWN0aW9uIGlzIGJ1aWx0IG9uXG4gICAqIEBwYXJhbSBhbW91bnQgVGhlIGFtb3VudCBiZWluZyBleHBvcnRlZCBhcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59XG4gICAqIEBwYXJhbSBkZXN0aW5hdGlvbkNoYWluIFRoZSBjaGFpbmlkIGZvciB3aGVyZSB0aGUgYXNzZXRzIHdpbGwgYmUgc2VudC5cbiAgICogQHBhcmFtIHRvQWRkcmVzc2VzIFRoZSBhZGRyZXNzZXMgdG8gc2VuZCB0aGUgZnVuZHNcbiAgICogQHBhcmFtIGZyb21BZGRyZXNzZXMgVGhlIGFkZHJlc3NlcyBiZWluZyB1c2VkIHRvIHNlbmQgdGhlIGZ1bmRzIGZyb20gdGhlIFVUWE9zIHByb3ZpZGVkXG4gICAqIEBwYXJhbSBjaGFuZ2VBZGRyZXNzZXMgVGhlIGFkZHJlc3NlcyB0aGF0IGNhbiBzcGVuZCB0aGUgY2hhbmdlIHJlbWFpbmluZyBmcm9tIHRoZSBzcGVudCBVVFhPc1xuICAgKiBAcGFyYW0gbWVtbyBPcHRpb25hbCBjb250YWlucyBhcmJpdHJhcnkgYnl0ZXMsIHVwIHRvIDI1NiBieXRlc1xuICAgKiBAcGFyYW0gYXNPZiBPcHRpb25hbC4gVGhlIHRpbWVzdGFtcCB0byB2ZXJpZnkgdGhlIHRyYW5zYWN0aW9uIGFnYWluc3QgYXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfVxuICAgKiBAcGFyYW0gbG9ja3RpbWUgT3B0aW9uYWwuIFRoZSBsb2NrdGltZSBmaWVsZCBjcmVhdGVkIGluIHRoZSByZXN1bHRpbmcgb3V0cHV0c1xuICAgKiBAcGFyYW0gdGhyZXNob2xkIE9wdGlvbmFsLiBUaGUgbnVtYmVyIG9mIHNpZ25hdHVyZXMgcmVxdWlyZWQgdG8gc3BlbmQgdGhlIGZ1bmRzIGluIHRoZSByZXN1bHRhbnQgVVRYT1xuICAgKlxuICAgKiBAcmV0dXJucyBBbiB1bnNpZ25lZCB0cmFuc2FjdGlvbiAoW1tVbnNpZ25lZFR4XV0pIHdoaWNoIGNvbnRhaW5zIGFuIFtbRXhwb3J0VHhdXS5cbiAgICovXG4gIGJ1aWxkRXhwb3J0VHggPSBhc3luYyAoXG4gICAgdXR4b3NldDpVVFhPU2V0LCBcbiAgICBhbW91bnQ6Qk4sXG4gICAgZGVzdGluYXRpb25DaGFpbjpCdWZmZXIgfCBzdHJpbmcsXG4gICAgdG9BZGRyZXNzZXM6QXJyYXk8c3RyaW5nPiwgXG4gICAgZnJvbUFkZHJlc3NlczpBcnJheTxzdHJpbmc+LFxuICAgIGNoYW5nZUFkZHJlc3NlczpBcnJheTxzdHJpbmc+ID0gdW5kZWZpbmVkLFxuICAgIG1lbW86UGF5bG9hZEJhc2V8QnVmZmVyID0gdW5kZWZpbmVkLCBcbiAgICBhc09mOkJOID0gVW5peE5vdygpLFxuICAgIGxvY2t0aW1lOkJOID0gbmV3IEJOKDApLCBcbiAgICB0aHJlc2hvbGQ6bnVtYmVyID0gMVxuICApOlByb21pc2U8VW5zaWduZWRUeD4gPT4ge1xuICAgIFxuICAgIGxldCBwcmVmaXhlczpvYmplY3QgPSB7fTtcbiAgICB0b0FkZHJlc3Nlcy5tYXAoKGEpID0+IHtcbiAgICAgIHByZWZpeGVzW2Euc3BsaXQoXCItXCIpWzBdXSA9IHRydWU7XG4gICAgfSk7XG4gICAgaWYoT2JqZWN0LmtleXMocHJlZml4ZXMpLmxlbmd0aCAhPT0gMSl7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFcnJvciAtIFBsYXRmb3JtVk1BUEkuYnVpbGRFeHBvcnRUeDogVG8gYWRkcmVzc2VzIG11c3QgaGF2ZSB0aGUgc2FtZSBjaGFpbklEIHByZWZpeC5cIik7XG4gICAgfVxuXG4gICAgaWYodHlwZW9mIGRlc3RpbmF0aW9uQ2hhaW4gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkVycm9yIC0gUGxhdGZvcm1WTUFQSS5idWlsZEV4cG9ydFR4OiBEZXN0aW5hdGlvbiBDaGFpbklEIGlzIHVuZGVmaW5lZC5cIik7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZGVzdGluYXRpb25DaGFpbiA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgZGVzdGluYXRpb25DaGFpbiA9IGJpbnRvb2xzLmNiNThEZWNvZGUoZGVzdGluYXRpb25DaGFpbik7IC8vXG4gICAgfSBlbHNlIGlmKCEoZGVzdGluYXRpb25DaGFpbiBpbnN0YW5jZW9mIEJ1ZmZlcikpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkVycm9yIC0gUGxhdGZvcm1WTUFQSS5idWlsZEV4cG9ydFR4OiBJbnZhbGlkIGRlc3RpbmF0aW9uQ2hhaW4gdHlwZTogXCIgKyAodHlwZW9mIGRlc3RpbmF0aW9uQ2hhaW4pICk7XG4gICAgfVxuICAgIGlmKGRlc3RpbmF0aW9uQ2hhaW4ubGVuZ3RoICE9PSAzMikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRXJyb3IgLSBQbGF0Zm9ybVZNQVBJLmJ1aWxkRXhwb3J0VHg6IERlc3RpbmF0aW9uIENoYWluSUQgbXVzdCBiZSAzMiBieXRlcyBpbiBsZW5ndGguXCIpO1xuICAgIH1cbiAgICAvKlxuICAgIGlmKGJpbnRvb2xzLmNiNThFbmNvZGUoZGVzdGluYXRpb25DaGFpbikgIT09IERlZmF1bHRzLm5ldHdvcmtbdGhpcy5jb3JlLmdldE5ldHdvcmtJRCgpXS5YW1wiYmxvY2tjaGFpbklEXCJdKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFcnJvciAtIFBsYXRmb3JtVk1BUEkuYnVpbGRFeHBvcnRUeDogRGVzdGluYXRpb24gQ2hhaW5JRCBtdXN0IFRoZSBYLUNoYWluIElEIGluIHRoZSBjdXJyZW50IHZlcnNpb24gb2YgQXZhbGFuY2hlSlMuXCIpO1xuICAgIH0qL1xuXG4gICAgbGV0IHRvOkFycmF5PEJ1ZmZlcj4gPSBbXTtcbiAgICB0b0FkZHJlc3Nlcy5tYXAoKGEpID0+IHtcbiAgICAgIHRvLnB1c2goYmludG9vbHMuc3RyaW5nVG9BZGRyZXNzKGEpKTtcbiAgICB9KTtcbiAgICBjb25zdCBmcm9tOkFycmF5PEJ1ZmZlcj4gPSB0aGlzLl9jbGVhbkFkZHJlc3NBcnJheShmcm9tQWRkcmVzc2VzLCAnYnVpbGRFeHBvcnRUeCcpLm1hcCgoYSkgPT4gYmludG9vbHMuc3RyaW5nVG9BZGRyZXNzKGEpKTtcbiAgICBjb25zdCBjaGFuZ2U6QXJyYXk8QnVmZmVyPiA9IHRoaXMuX2NsZWFuQWRkcmVzc0FycmF5KGNoYW5nZUFkZHJlc3NlcywgJ2J1aWxkRXhwb3J0VHgnKS5tYXAoKGEpID0+IGJpbnRvb2xzLnN0cmluZ1RvQWRkcmVzcyhhKSk7XG5cbiAgICBpZiggbWVtbyBpbnN0YW5jZW9mIFBheWxvYWRCYXNlKSB7XG4gICAgICBtZW1vID0gbWVtby5nZXRQYXlsb2FkKCk7XG4gICAgfVxuXG4gICAgY29uc3QgYXZheEFzc2V0SUQ6QnVmZmVyID0gYXdhaXQgdGhpcy5nZXRBVkFYQXNzZXRJRCgpO1xuXG4gICAgY29uc3QgYnVpbHRVbnNpZ25lZFR4OlVuc2lnbmVkVHggPSB1dHhvc2V0LmJ1aWxkRXhwb3J0VHgoXG4gICAgICB0aGlzLmNvcmUuZ2V0TmV0d29ya0lEKCksIFxuICAgICAgYmludG9vbHMuY2I1OERlY29kZSh0aGlzLmJsb2NrY2hhaW5JRCksIFxuICAgICAgYW1vdW50LFxuICAgICAgYXZheEFzc2V0SUQsIFxuICAgICAgdG8sXG4gICAgICBmcm9tLFxuICAgICAgY2hhbmdlLFxuICAgICAgZGVzdGluYXRpb25DaGFpbixcbiAgICAgIHRoaXMuZ2V0VHhGZWUoKSwgXG4gICAgICBhdmF4QXNzZXRJRCxcbiAgICAgIG1lbW8sIGFzT2YsIGxvY2t0aW1lLCB0aHJlc2hvbGRcbiAgICApO1xuXG4gICAgaWYoISBhd2FpdCB0aGlzLmNoZWNrR29vc2VFZ2coYnVpbHRVbnNpZ25lZFR4KSkge1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkZhaWxlZCBHb29zZSBFZ2cgQ2hlY2tcIik7XG4gICAgfVxuXG4gICAgcmV0dXJuIGJ1aWx0VW5zaWduZWRUeDtcbiAgfTtcblxuICAvKipcbiAgKiBIZWxwZXIgZnVuY3Rpb24gd2hpY2ggY3JlYXRlcyBhbiB1bnNpZ25lZCBbW0FkZFN1Ym5ldFZhbGlkYXRvclR4XV0uIEZvciBtb3JlIGdyYW51bGFyIGNvbnRyb2wsIHlvdSBtYXkgY3JlYXRlIHlvdXIgb3duXG4gICogW1tVbnNpZ25lZFR4XV0gbWFudWFsbHkgYW5kIGltcG9ydCB0aGUgW1tBZGRTdWJuZXRWYWxpZGF0b3JUeF1dIGNsYXNzIGRpcmVjdGx5LlxuICAqXG4gICogQHBhcmFtIHV0eG9zZXQgQSBzZXQgb2YgVVRYT3MgdGhhdCB0aGUgdHJhbnNhY3Rpb24gaXMgYnVpbHQgb24uXG4gICogQHBhcmFtIGZyb21BZGRyZXNzZXMgQW4gYXJyYXkgb2YgYWRkcmVzc2VzIGFzIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHdobyBwYXlzIHRoZSBmZWVzIGluIEFWQVhcbiAgKiBAcGFyYW0gY2hhbmdlQWRkcmVzc2VzIEFuIGFycmF5IG9mIGFkZHJlc3NlcyBhcyB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSB3aG8gZ2V0cyB0aGUgY2hhbmdlIGxlZnRvdmVyIGZyb20gdGhlIGZlZSBwYXltZW50XG4gICogQHBhcmFtIG5vZGVJRCBUaGUgbm9kZSBJRCBvZiB0aGUgdmFsaWRhdG9yIGJlaW5nIGFkZGVkLlxuICAqIEBwYXJhbSBzdGFydFRpbWUgVGhlIFVuaXggdGltZSB3aGVuIHRoZSB2YWxpZGF0b3Igc3RhcnRzIHZhbGlkYXRpbmcgdGhlIFByaW1hcnkgTmV0d29yay5cbiAgKiBAcGFyYW0gZW5kVGltZSBUaGUgVW5peCB0aW1lIHdoZW4gdGhlIHZhbGlkYXRvciBzdG9wcyB2YWxpZGF0aW5nIHRoZSBQcmltYXJ5IE5ldHdvcmsgKGFuZCBzdGFrZWQgQVZBWCBpcyByZXR1cm5lZCkuXG4gICogQHBhcmFtIHdlaWdodCBUaGUgYW1vdW50IG9mIHdlaWdodCBmb3IgdGhpcyBzdWJuZXQgdmFsaWRhdG9yLlxuICAqIEBwYXJhbSBtZW1vIE9wdGlvbmFsIGNvbnRhaW5zIGFyYml0cmFyeSBieXRlcywgdXAgdG8gMjU2IGJ5dGVzXG4gICogQHBhcmFtIGFzT2YgT3B0aW9uYWwuIFRoZSB0aW1lc3RhbXAgdG8gdmVyaWZ5IHRoZSB0cmFuc2FjdGlvbiBhZ2FpbnN0IGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgKiAgXG4gICogQHJldHVybnMgQW4gdW5zaWduZWQgdHJhbnNhY3Rpb24gY3JlYXRlZCBmcm9tIHRoZSBwYXNzZWQgaW4gcGFyYW1ldGVycy5cbiAgKi9cblxuICAvKiBSZS1pbXBsZW1lbnQgd2hlbiBzdWJuZXRWYWxpZGF0b3Igc2lnbmluZyBwcm9jZXNzIGlzIGNsZWFyZXJcbiAgYnVpbGRBZGRTdWJuZXRWYWxpZGF0b3JUeCA9IGFzeW5jIChcbiAgICB1dHhvc2V0OlVUWE9TZXQsIFxuICAgIGZyb21BZGRyZXNzZXM6QXJyYXk8c3RyaW5nPixcbiAgICBjaGFuZ2VBZGRyZXNzZXM6QXJyYXk8c3RyaW5nPixcbiAgICBub2RlSUQ6c3RyaW5nLCBcbiAgICBzdGFydFRpbWU6Qk4sIFxuICAgIGVuZFRpbWU6Qk4sXG4gICAgd2VpZ2h0OkJOLFxuICAgIG1lbW86UGF5bG9hZEJhc2V8QnVmZmVyID0gdW5kZWZpbmVkLCBcbiAgICBhc09mOkJOID0gVW5peE5vdygpXG4gICk6UHJvbWlzZTxVbnNpZ25lZFR4PiA9PiB7XG4gICAgY29uc3QgZnJvbTpBcnJheTxCdWZmZXI+ID0gdGhpcy5fY2xlYW5BZGRyZXNzQXJyYXkoZnJvbUFkZHJlc3NlcywgJ2J1aWxkQWRkU3VibmV0VmFsaWRhdG9yVHgnKS5tYXAoKGEpID0+IGJpbnRvb2xzLnN0cmluZ1RvQWRkcmVzcyhhKSk7XG4gICAgY29uc3QgY2hhbmdlOkFycmF5PEJ1ZmZlcj4gPSB0aGlzLl9jbGVhbkFkZHJlc3NBcnJheShjaGFuZ2VBZGRyZXNzZXMsICdidWlsZEFkZFN1Ym5ldFZhbGlkYXRvclR4JykubWFwKChhKSA9PiBiaW50b29scy5zdHJpbmdUb0FkZHJlc3MoYSkpO1xuXG4gICAgaWYoIG1lbW8gaW5zdGFuY2VvZiBQYXlsb2FkQmFzZSkge1xuICAgICAgbWVtbyA9IG1lbW8uZ2V0UGF5bG9hZCgpO1xuICAgIH1cblxuICAgIGNvbnN0IGF2YXhBc3NldElEOkJ1ZmZlciA9IGF3YWl0IHRoaXMuZ2V0QVZBWEFzc2V0SUQoKTtcbiAgICBcbiAgICBjb25zdCBub3c6Qk4gPSBVbml4Tm93KCk7XG4gICAgaWYgKHN0YXJ0VGltZS5sdChub3cpIHx8IGVuZFRpbWUubHRlKHN0YXJ0VGltZSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlBsYXRmb3JtVk1BUEkuYnVpbGRBZGRTdWJuZXRWYWxpZGF0b3JUeCAtLSBzdGFydFRpbWUgbXVzdCBiZSBpbiB0aGUgZnV0dXJlIGFuZCBlbmRUaW1lIG11c3QgY29tZSBhZnRlciBzdGFydFRpbWVcIik7XG4gICAgfVxuXG4gICAgY29uc3QgYnVpbHRVbnNpZ25lZFR4OlVuc2lnbmVkVHggPSB1dHhvc2V0LmJ1aWxkQWRkU3VibmV0VmFsaWRhdG9yVHgoXG4gICAgICB0aGlzLmNvcmUuZ2V0TmV0d29ya0lEKCksIFxuICAgICAgYmludG9vbHMuY2I1OERlY29kZSh0aGlzLmJsb2NrY2hhaW5JRCksIFxuICAgICAgZnJvbSxcbiAgICAgIGNoYW5nZSxcbiAgICAgIE5vZGVJRFN0cmluZ1RvQnVmZmVyKG5vZGVJRCksXG4gICAgICBzdGFydFRpbWUsIGVuZFRpbWUsXG4gICAgICB3ZWlnaHQsIFxuICAgICAgdGhpcy5nZXRGZWUoKSwgXG4gICAgICBhdmF4QXNzZXRJRCxcbiAgICAgIG1lbW8sIGFzT2ZcbiAgICApO1xuXG4gICAgaWYoISBhd2FpdCB0aGlzLmNoZWNrR29vc2VFZ2coYnVpbHRVbnNpZ25lZFR4KSkge1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi8vKlxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRmFpbGVkIEdvb3NlIEVnZyBDaGVja1wiKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYnVpbHRVbnNpZ25lZFR4O1xuICB9XG5cbiAgKi9cblxuICAvKipcbiAgKiBIZWxwZXIgZnVuY3Rpb24gd2hpY2ggY3JlYXRlcyBhbiB1bnNpZ25lZCBbW0FkZERlbGVnYXRvclR4XV0uIEZvciBtb3JlIGdyYW51bGFyIGNvbnRyb2wsIHlvdSBtYXkgY3JlYXRlIHlvdXIgb3duXG4gICogW1tVbnNpZ25lZFR4XV0gbWFudWFsbHkgYW5kIGltcG9ydCB0aGUgW1tBZGREZWxlZ2F0b3JUeF1dIGNsYXNzIGRpcmVjdGx5LlxuICAqXG4gICogQHBhcmFtIHV0eG9zZXQgQSBzZXQgb2YgVVRYT3MgdGhhdCB0aGUgdHJhbnNhY3Rpb24gaXMgYnVpbHQgb25cbiAgKiBAcGFyYW0gdG9BZGRyZXNzZXMgQW4gYXJyYXkgb2YgYWRkcmVzc2VzIGFzIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHdobyByZWNpZXZlZCB0aGUgc3Rha2VkIHRva2VucyBhdCB0aGUgZW5kIG9mIHRoZSBzdGFraW5nIHBlcmlvZFxuICAqIEBwYXJhbSBmcm9tQWRkcmVzc2VzIEFuIGFycmF5IG9mIGFkZHJlc3NlcyBhcyB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSB3aG8gb3duIHRoZSBzdGFraW5nIFVUWE9zIHRoZSBmZWVzIGluIEFWQVhcbiAgKiBAcGFyYW0gY2hhbmdlQWRkcmVzc2VzIEFuIGFycmF5IG9mIGFkZHJlc3NlcyBhcyB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSB3aG8gZ2V0cyB0aGUgY2hhbmdlIGxlZnRvdmVyIGZyb20gdGhlIGZlZSBwYXltZW50XG4gICogQHBhcmFtIG5vZGVJRCBUaGUgbm9kZSBJRCBvZiB0aGUgdmFsaWRhdG9yIGJlaW5nIGFkZGVkLlxuICAqIEBwYXJhbSBzdGFydFRpbWUgVGhlIFVuaXggdGltZSB3aGVuIHRoZSB2YWxpZGF0b3Igc3RhcnRzIHZhbGlkYXRpbmcgdGhlIFByaW1hcnkgTmV0d29yay5cbiAgKiBAcGFyYW0gZW5kVGltZSBUaGUgVW5peCB0aW1lIHdoZW4gdGhlIHZhbGlkYXRvciBzdG9wcyB2YWxpZGF0aW5nIHRoZSBQcmltYXJ5IE5ldHdvcmsgKGFuZCBzdGFrZWQgQVZBWCBpcyByZXR1cm5lZCkuXG4gICogQHBhcmFtIHN0YWtlQW1vdW50IFRoZSBhbW91bnQgYmVpbmcgZGVsZWdhdGVkIGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgKiBAcGFyYW0gcmV3YXJkQWRkcmVzc2VzIFRoZSBhZGRyZXNzZXMgd2hpY2ggd2lsbCByZWNpZXZlIHRoZSByZXdhcmRzIGZyb20gdGhlIGRlbGVnYXRlZCBzdGFrZS5cbiAgKiBAcGFyYW0gcmV3YXJkTG9ja3RpbWUgT3B0aW9uYWwuIFRoZSBsb2NrdGltZSBmaWVsZCBjcmVhdGVkIGluIHRoZSByZXN1bHRpbmcgcmV3YXJkIG91dHB1dHNcbiAgKiBAcGFyYW0gcmV3YXJkVGhyZXNob2xkIE9waW9uYWwuIFRoZSBudW1iZXIgb2Ygc2lnbmF0dXJlcyByZXF1aXJlZCB0byBzcGVuZCB0aGUgZnVuZHMgaW4gdGhlIHJlc3VsdGFudCByZXdhcmQgVVRYTy4gRGVmYXVsdCAxLlxuICAqIEBwYXJhbSBtZW1vIE9wdGlvbmFsIGNvbnRhaW5zIGFyYml0cmFyeSBieXRlcywgdXAgdG8gMjU2IGJ5dGVzXG4gICogQHBhcmFtIGFzT2YgT3B0aW9uYWwuIFRoZSB0aW1lc3RhbXAgdG8gdmVyaWZ5IHRoZSB0cmFuc2FjdGlvbiBhZ2FpbnN0IGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgKiAgXG4gICogQHJldHVybnMgQW4gdW5zaWduZWQgdHJhbnNhY3Rpb24gY3JlYXRlZCBmcm9tIHRoZSBwYXNzZWQgaW4gcGFyYW1ldGVycy5cbiAgKi9cbiAgYnVpbGRBZGREZWxlZ2F0b3JUeCA9IGFzeW5jIChcbiAgICB1dHhvc2V0OlVUWE9TZXQsIFxuICAgIHRvQWRkcmVzc2VzOkFycmF5PHN0cmluZz4sXG4gICAgZnJvbUFkZHJlc3NlczpBcnJheTxzdHJpbmc+LFxuICAgIGNoYW5nZUFkZHJlc3NlczpBcnJheTxzdHJpbmc+LFxuICAgIG5vZGVJRDpzdHJpbmcsIFxuICAgIHN0YXJ0VGltZTpCTiwgXG4gICAgZW5kVGltZTpCTixcbiAgICBzdGFrZUFtb3VudDpCTixcbiAgICByZXdhcmRBZGRyZXNzZXM6QXJyYXk8c3RyaW5nPixcbiAgICByZXdhcmRMb2NrdGltZTpCTiA9IG5ldyBCTigwKSxcbiAgICByZXdhcmRUaHJlc2hvbGQ6bnVtYmVyID0gMSxcbiAgICBtZW1vOlBheWxvYWRCYXNlfEJ1ZmZlciA9IHVuZGVmaW5lZCwgXG4gICAgYXNPZjpCTiA9IFVuaXhOb3coKVxuICApOlByb21pc2U8VW5zaWduZWRUeD4gPT4ge1xuICAgIGNvbnN0IHRvOkFycmF5PEJ1ZmZlcj4gPSB0aGlzLl9jbGVhbkFkZHJlc3NBcnJheSh0b0FkZHJlc3NlcywgJ2J1aWxkQWRkRGVsZWdhdG9yVHgnKS5tYXAoKGEpID0+IGJpbnRvb2xzLnN0cmluZ1RvQWRkcmVzcyhhKSk7XG4gICAgY29uc3QgZnJvbTpBcnJheTxCdWZmZXI+ID0gdGhpcy5fY2xlYW5BZGRyZXNzQXJyYXkoZnJvbUFkZHJlc3NlcywgJ2J1aWxkQWRkRGVsZWdhdG9yVHgnKS5tYXAoKGEpID0+IGJpbnRvb2xzLnN0cmluZ1RvQWRkcmVzcyhhKSk7XG4gICAgY29uc3QgY2hhbmdlOkFycmF5PEJ1ZmZlcj4gPSB0aGlzLl9jbGVhbkFkZHJlc3NBcnJheShjaGFuZ2VBZGRyZXNzZXMsICdidWlsZEFkZERlbGVnYXRvclR4JykubWFwKChhKSA9PiBiaW50b29scy5zdHJpbmdUb0FkZHJlc3MoYSkpO1xuICAgIGNvbnN0IHJld2FyZHM6QXJyYXk8QnVmZmVyPiA9IHRoaXMuX2NsZWFuQWRkcmVzc0FycmF5KHJld2FyZEFkZHJlc3NlcywgJ2J1aWxkQWRkVmFsaWRhdG9yVHgnKS5tYXAoKGEpID0+IGJpbnRvb2xzLnN0cmluZ1RvQWRkcmVzcyhhKSk7XG5cbiAgICBpZiggbWVtbyBpbnN0YW5jZW9mIFBheWxvYWRCYXNlKSB7XG4gICAgICBtZW1vID0gbWVtby5nZXRQYXlsb2FkKCk7XG4gICAgfVxuXG4gICAgY29uc3QgbWluU3Rha2U6Qk4gPSAoYXdhaXQgdGhpcy5nZXRNaW5TdGFrZSgpKVtcIm1pbkRlbGVnYXRvclN0YWtlXCJdO1xuICAgIGlmKHN0YWtlQW1vdW50Lmx0KG1pblN0YWtlKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUGxhdGZvcm1WTUFQSS5idWlsZEFkZERlbGVnYXRvclR4IC0tIHN0YWtlIGFtb3VudCBtdXN0IGJlIGF0IGxlYXN0IFwiICsgbWluU3Rha2UudG9TdHJpbmcoMTApKTtcbiAgICB9XG5cbiAgICBjb25zdCBhdmF4QXNzZXRJRDpCdWZmZXIgPSBhd2FpdCB0aGlzLmdldEFWQVhBc3NldElEKCk7XG4gICAgXG4gICAgY29uc3Qgbm93OkJOID0gVW5peE5vdygpO1xuICAgIGlmIChzdGFydFRpbWUubHQobm93KSB8fCBlbmRUaW1lLmx0ZShzdGFydFRpbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQbGF0Zm9ybVZNQVBJLmJ1aWxkQWRkRGVsZWdhdG9yVHggLS0gc3RhcnRUaW1lIG11c3QgYmUgaW4gdGhlIGZ1dHVyZSBhbmQgZW5kVGltZSBtdXN0IGNvbWUgYWZ0ZXIgc3RhcnRUaW1lXCIpO1xuICAgIH1cblxuICAgIGNvbnN0IGJ1aWx0VW5zaWduZWRUeDpVbnNpZ25lZFR4ID0gdXR4b3NldC5idWlsZEFkZERlbGVnYXRvclR4KFxuICAgICAgdGhpcy5jb3JlLmdldE5ldHdvcmtJRCgpLCBcbiAgICAgIGJpbnRvb2xzLmNiNThEZWNvZGUodGhpcy5ibG9ja2NoYWluSUQpLCBcbiAgICAgIGF2YXhBc3NldElELFxuICAgICAgdG8sXG4gICAgICBmcm9tLFxuICAgICAgY2hhbmdlLFxuICAgICAgTm9kZUlEU3RyaW5nVG9CdWZmZXIobm9kZUlEKSxcbiAgICAgIHN0YXJ0VGltZSwgZW5kVGltZSxcbiAgICAgIHN0YWtlQW1vdW50LFxuICAgICAgcmV3YXJkTG9ja3RpbWUsXG4gICAgICByZXdhcmRUaHJlc2hvbGQsXG4gICAgICByZXdhcmRzLFxuICAgICAgbmV3IEJOKDApLCBcbiAgICAgIGF2YXhBc3NldElELFxuICAgICAgbWVtbywgYXNPZlxuICAgICk7XG5cbiAgICBpZighYXdhaXQgdGhpcy5jaGVja0dvb3NlRWdnKGJ1aWx0VW5zaWduZWRUeCkpIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJGYWlsZWQgR29vc2UgRWdnIENoZWNrXCIpO1xuICAgIH1cblxuICAgIHJldHVybiBidWlsdFVuc2lnbmVkVHg7XG4gIH1cblxuXG4gIC8qKlxuICAqIEhlbHBlciBmdW5jdGlvbiB3aGljaCBjcmVhdGVzIGFuIHVuc2lnbmVkIFtbQWRkVmFsaWRhdG9yVHhdXS4gRm9yIG1vcmUgZ3JhbnVsYXIgY29udHJvbCwgeW91IG1heSBjcmVhdGUgeW91ciBvd25cbiAgKiBbW1Vuc2lnbmVkVHhdXSBtYW51YWxseSBhbmQgaW1wb3J0IHRoZSBbW0FkZFZhbGlkYXRvclR4XV0gY2xhc3MgZGlyZWN0bHkuXG4gICpcbiAgKiBAcGFyYW0gdXR4b3NldCBBIHNldCBvZiBVVFhPcyB0aGF0IHRoZSB0cmFuc2FjdGlvbiBpcyBidWlsdCBvblxuICAqIEBwYXJhbSB0b0FkZHJlc3NlcyBBbiBhcnJheSBvZiBhZGRyZXNzZXMgYXMge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gd2hvIHJlY2lldmVkIHRoZSBzdGFrZWQgdG9rZW5zIGF0IHRoZSBlbmQgb2YgdGhlIHN0YWtpbmcgcGVyaW9kXG4gICogQHBhcmFtIGZyb21BZGRyZXNzZXMgQW4gYXJyYXkgb2YgYWRkcmVzc2VzIGFzIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHdobyBvd24gdGhlIHN0YWtpbmcgVVRYT3MgdGhlIGZlZXMgaW4gQVZBWFxuICAqIEBwYXJhbSBjaGFuZ2VBZGRyZXNzZXMgQW4gYXJyYXkgb2YgYWRkcmVzc2VzIGFzIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHdobyBnZXRzIHRoZSBjaGFuZ2UgbGVmdG92ZXIgZnJvbSB0aGUgZmVlIHBheW1lbnRcbiAgKiBAcGFyYW0gbm9kZUlEIFRoZSBub2RlIElEIG9mIHRoZSB2YWxpZGF0b3IgYmVpbmcgYWRkZWQuXG4gICogQHBhcmFtIHN0YXJ0VGltZSBUaGUgVW5peCB0aW1lIHdoZW4gdGhlIHZhbGlkYXRvciBzdGFydHMgdmFsaWRhdGluZyB0aGUgUHJpbWFyeSBOZXR3b3JrLlxuICAqIEBwYXJhbSBlbmRUaW1lIFRoZSBVbml4IHRpbWUgd2hlbiB0aGUgdmFsaWRhdG9yIHN0b3BzIHZhbGlkYXRpbmcgdGhlIFByaW1hcnkgTmV0d29yayAoYW5kIHN0YWtlZCBBVkFYIGlzIHJldHVybmVkKS5cbiAgKiBAcGFyYW0gc3Rha2VBbW91bnQgVGhlIGFtb3VudCBiZWluZyBkZWxlZ2F0ZWQgYXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfVxuICAqIEBwYXJhbSByZXdhcmRBZGRyZXNzZXMgVGhlIGFkZHJlc3NlcyB3aGljaCB3aWxsIHJlY2lldmUgdGhlIHJld2FyZHMgZnJvbSB0aGUgZGVsZWdhdGVkIHN0YWtlLlxuICAqIEBwYXJhbSBkZWxlZ2F0aW9uRmVlIEEgbnVtYmVyIGZvciB0aGUgcGVyY2VudGFnZSBvZiByZXdhcmQgdG8gYmUgZ2l2ZW4gdG8gdGhlIHZhbGlkYXRvciB3aGVuIHNvbWVvbmUgZGVsZWdhdGVzIHRvIHRoZW0uIE11c3QgYmUgYmV0d2VlbiAwIGFuZCAxMDAuIFxuICAqIEBwYXJhbSByZXdhcmRMb2NrdGltZSBPcHRpb25hbC4gVGhlIGxvY2t0aW1lIGZpZWxkIGNyZWF0ZWQgaW4gdGhlIHJlc3VsdGluZyByZXdhcmQgb3V0cHV0c1xuICAqIEBwYXJhbSByZXdhcmRUaHJlc2hvbGQgT3Bpb25hbC4gVGhlIG51bWJlciBvZiBzaWduYXR1cmVzIHJlcXVpcmVkIHRvIHNwZW5kIHRoZSBmdW5kcyBpbiB0aGUgcmVzdWx0YW50IHJld2FyZCBVVFhPLiBEZWZhdWx0IDEuXG4gICogQHBhcmFtIG1lbW8gT3B0aW9uYWwgY29udGFpbnMgYXJiaXRyYXJ5IGJ5dGVzLCB1cCB0byAyNTYgYnl0ZXNcbiAgKiBAcGFyYW0gYXNPZiBPcHRpb25hbC4gVGhlIHRpbWVzdGFtcCB0byB2ZXJpZnkgdGhlIHRyYW5zYWN0aW9uIGFnYWluc3QgYXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfVxuICAqICBcbiAgKiBAcmV0dXJucyBBbiB1bnNpZ25lZCB0cmFuc2FjdGlvbiBjcmVhdGVkIGZyb20gdGhlIHBhc3NlZCBpbiBwYXJhbWV0ZXJzLlxuICAqL1xuICBidWlsZEFkZFZhbGlkYXRvclR4ID0gYXN5bmMgKFxuICAgIHV0eG9zZXQ6VVRYT1NldCwgXG4gICAgdG9BZGRyZXNzZXM6QXJyYXk8c3RyaW5nPixcbiAgICBmcm9tQWRkcmVzc2VzOkFycmF5PHN0cmluZz4sXG4gICAgY2hhbmdlQWRkcmVzc2VzOkFycmF5PHN0cmluZz4sXG4gICAgbm9kZUlEOnN0cmluZywgXG4gICAgc3RhcnRUaW1lOkJOLCBcbiAgICBlbmRUaW1lOkJOLFxuICAgIHN0YWtlQW1vdW50OkJOLFxuICAgIHJld2FyZEFkZHJlc3NlczpBcnJheTxzdHJpbmc+LFxuICAgIGRlbGVnYXRpb25GZWU6bnVtYmVyLFxuICAgIHJld2FyZExvY2t0aW1lOkJOID0gbmV3IEJOKDApLFxuICAgIHJld2FyZFRocmVzaG9sZDpudW1iZXIgPSAxLFxuICAgIG1lbW86UGF5bG9hZEJhc2V8QnVmZmVyID0gdW5kZWZpbmVkLCBcbiAgICBhc09mOkJOID0gVW5peE5vdygpXG4gICk6UHJvbWlzZTxVbnNpZ25lZFR4PiA9PiB7XG4gICAgY29uc3QgdG86QXJyYXk8QnVmZmVyPiA9IHRoaXMuX2NsZWFuQWRkcmVzc0FycmF5KHRvQWRkcmVzc2VzLCAnYnVpbGRBZGRWYWxpZGF0b3JUeCcpLm1hcCgoYSkgPT4gYmludG9vbHMuc3RyaW5nVG9BZGRyZXNzKGEpKTtcbiAgICBjb25zdCBmcm9tOkFycmF5PEJ1ZmZlcj4gPSB0aGlzLl9jbGVhbkFkZHJlc3NBcnJheShmcm9tQWRkcmVzc2VzLCAnYnVpbGRBZGRWYWxpZGF0b3JUeCcpLm1hcCgoYSkgPT4gYmludG9vbHMuc3RyaW5nVG9BZGRyZXNzKGEpKTtcbiAgICBjb25zdCBjaGFuZ2U6QXJyYXk8QnVmZmVyPiA9IHRoaXMuX2NsZWFuQWRkcmVzc0FycmF5KGNoYW5nZUFkZHJlc3NlcywgJ2J1aWxkQWRkVmFsaWRhdG9yVHgnKS5tYXAoKGEpID0+IGJpbnRvb2xzLnN0cmluZ1RvQWRkcmVzcyhhKSk7XG4gICAgY29uc3QgcmV3YXJkczpBcnJheTxCdWZmZXI+ID0gdGhpcy5fY2xlYW5BZGRyZXNzQXJyYXkocmV3YXJkQWRkcmVzc2VzLCAnYnVpbGRBZGRWYWxpZGF0b3JUeCcpLm1hcCgoYSkgPT4gYmludG9vbHMuc3RyaW5nVG9BZGRyZXNzKGEpKTtcblxuICAgIGlmKCBtZW1vIGluc3RhbmNlb2YgUGF5bG9hZEJhc2UpIHtcbiAgICAgIG1lbW8gPSBtZW1vLmdldFBheWxvYWQoKTtcbiAgICB9XG5cbiAgICBjb25zdCBtaW5TdGFrZTpCTiA9IChhd2FpdCB0aGlzLmdldE1pblN0YWtlKCkpW1wibWluVmFsaWRhdG9yU3Rha2VcIl07XG4gICAgaWYoc3Rha2VBbW91bnQubHQobWluU3Rha2UpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQbGF0Zm9ybVZNQVBJLmJ1aWxkQWRkVmFsaWRhdG9yVHggLS0gc3Rha2UgYW1vdW50IG11c3QgYmUgYXQgbGVhc3QgXCIgKyBtaW5TdGFrZS50b1N0cmluZygxMCkpO1xuICAgIH1cblxuICAgIGlmKHR5cGVvZiBkZWxlZ2F0aW9uRmVlICE9PSBcIm51bWJlclwiIHx8IGRlbGVnYXRpb25GZWUgPiAxMDAgfHwgZGVsZWdhdGlvbkZlZSA8IDApe1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUGxhdGZvcm1WTUFQSS5idWlsZEFkZFZhbGlkYXRvclR4IC0tIGRlbGVnYXRpb25GZWUgbXVzdCBiZSBhIG51bWJlciBiZXR3ZWVuIDAgYW5kIDEwMFwiKTtcbiAgICB9XG5cbiAgICBjb25zdCBhdmF4QXNzZXRJRDpCdWZmZXIgPSBhd2FpdCB0aGlzLmdldEFWQVhBc3NldElEKCk7XG4gICAgXG4gICAgY29uc3Qgbm93OkJOID0gVW5peE5vdygpO1xuICAgIGlmIChzdGFydFRpbWUubHQobm93KSB8fCBlbmRUaW1lLmx0ZShzdGFydFRpbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQbGF0Zm9ybVZNQVBJLmJ1aWxkQWRkVmFsaWRhdG9yVHggLS0gc3RhcnRUaW1lIG11c3QgYmUgaW4gdGhlIGZ1dHVyZSBhbmQgZW5kVGltZSBtdXN0IGNvbWUgYWZ0ZXIgc3RhcnRUaW1lXCIpO1xuICAgIH1cblxuICAgIGNvbnN0IGJ1aWx0VW5zaWduZWRUeDpVbnNpZ25lZFR4ID0gdXR4b3NldC5idWlsZEFkZFZhbGlkYXRvclR4KFxuICAgICAgdGhpcy5jb3JlLmdldE5ldHdvcmtJRCgpLCBcbiAgICAgIGJpbnRvb2xzLmNiNThEZWNvZGUodGhpcy5ibG9ja2NoYWluSUQpLCBcbiAgICAgIGF2YXhBc3NldElELFxuICAgICAgdG8sXG4gICAgICBmcm9tLFxuICAgICAgY2hhbmdlLFxuICAgICAgTm9kZUlEU3RyaW5nVG9CdWZmZXIobm9kZUlEKSxcbiAgICAgIHN0YXJ0VGltZSwgZW5kVGltZSxcbiAgICAgIHN0YWtlQW1vdW50LFxuICAgICAgcmV3YXJkTG9ja3RpbWUsXG4gICAgICByZXdhcmRUaHJlc2hvbGQsXG4gICAgICByZXdhcmRzLFxuICAgICAgZGVsZWdhdGlvbkZlZSxcbiAgICAgIG5ldyBCTigwKSwgXG4gICAgICBhdmF4QXNzZXRJRCxcbiAgICAgIG1lbW8sIGFzT2ZcbiAgICApO1xuXG4gICAgaWYoISBhd2FpdCB0aGlzLmNoZWNrR29vc2VFZ2coYnVpbHRVbnNpZ25lZFR4KSkge1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkZhaWxlZCBHb29zZSBFZ2cgQ2hlY2tcIik7XG4gICAgfVxuXG4gICAgcmV0dXJuIGJ1aWx0VW5zaWduZWRUeDtcbiAgfVxuXG4gIC8qKlxuICAgICogQ2xhc3MgcmVwcmVzZW50aW5nIGFuIHVuc2lnbmVkIFtbQ3JlYXRlU3VibmV0VHhdXSB0cmFuc2FjdGlvbi5cbiAgICAqXG4gICAgKiBAcGFyYW0gdXR4b3NldCBBIHNldCBvZiBVVFhPcyB0aGF0IHRoZSB0cmFuc2FjdGlvbiBpcyBidWlsdCBvblxuICAgICogQHBhcmFtIGZyb21BZGRyZXNzZXMgVGhlIGFkZHJlc3NlcyBiZWluZyB1c2VkIHRvIHNlbmQgdGhlIGZ1bmRzIGZyb20gdGhlIFVUWE9zIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9XG4gICAgKiBAcGFyYW0gY2hhbmdlQWRkcmVzc2VzIFRoZSBhZGRyZXNzZXMgdGhhdCBjYW4gc3BlbmQgdGhlIGNoYW5nZSByZW1haW5pbmcgZnJvbSB0aGUgc3BlbnQgVVRYT3NcbiAgICAqIEBwYXJhbSBzdWJuZXRPd25lckFkZHJlc3NlcyBBbiBhcnJheSBvZiBhZGRyZXNzZXMgZm9yIG93bmVycyBvZiB0aGUgbmV3IHN1Ym5ldFxuICAgICogQHBhcmFtIHN1Ym5ldE93bmVyVGhyZXNob2xkIEEgbnVtYmVyIGluZGljYXRpbmcgdGhlIGFtb3VudCBvZiBzaWduYXR1cmVzIHJlcXVpcmVkIHRvIGFkZCB2YWxpZGF0b3JzIHRvIGEgc3VibmV0XG4gICAgKiBAcGFyYW0gbWVtbyBPcHRpb25hbCBjb250YWlucyBhcmJpdHJhcnkgYnl0ZXMsIHVwIHRvIDI1NiBieXRlc1xuICAgICogQHBhcmFtIGFzT2YgT3B0aW9uYWwuIFRoZSB0aW1lc3RhbXAgdG8gdmVyaWZ5IHRoZSB0cmFuc2FjdGlvbiBhZ2FpbnN0IGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgICAqIFxuICAgICogQHJldHVybnMgQW4gdW5zaWduZWQgdHJhbnNhY3Rpb24gY3JlYXRlZCBmcm9tIHRoZSBwYXNzZWQgaW4gcGFyYW1ldGVycy5cbiAgICAqL1xuICBidWlsZENyZWF0ZVN1Ym5ldFR4ID0gYXN5bmMgKFxuICAgIHV0eG9zZXQ6VVRYT1NldCwgXG4gICAgZnJvbUFkZHJlc3NlczpBcnJheTxzdHJpbmc+LFxuICAgIGNoYW5nZUFkZHJlc3NlczpBcnJheTxzdHJpbmc+LFxuICAgIHN1Ym5ldE93bmVyQWRkcmVzc2VzOkFycmF5PHN0cmluZz4sXG4gICAgc3VibmV0T3duZXJUaHJlc2hvbGQ6bnVtYmVyLCBcbiAgICBtZW1vOlBheWxvYWRCYXNlfEJ1ZmZlciA9IHVuZGVmaW5lZCwgXG4gICAgYXNPZjpCTiA9IFVuaXhOb3coKVxuICApOlByb21pc2U8VW5zaWduZWRUeD4gPT4ge1xuICAgIGNvbnN0IGZyb206QXJyYXk8QnVmZmVyPiA9IHRoaXMuX2NsZWFuQWRkcmVzc0FycmF5KGZyb21BZGRyZXNzZXMsICdidWlsZENyZWF0ZVN1Ym5ldFR4JykubWFwKChhKSA9PiBiaW50b29scy5zdHJpbmdUb0FkZHJlc3MoYSkpO1xuICAgIGNvbnN0IGNoYW5nZTpBcnJheTxCdWZmZXI+ID0gdGhpcy5fY2xlYW5BZGRyZXNzQXJyYXkoY2hhbmdlQWRkcmVzc2VzLCAnYnVpbGRDcmVhdGVTdWJuZXRUeCcpLm1hcCgoYSkgPT4gYmludG9vbHMuc3RyaW5nVG9BZGRyZXNzKGEpKTtcbiAgICBjb25zdCBvd25lcnM6QXJyYXk8QnVmZmVyPiA9IHRoaXMuX2NsZWFuQWRkcmVzc0FycmF5KHN1Ym5ldE93bmVyQWRkcmVzc2VzLCAnYnVpbGRDcmVhdGVTdWJuZXRUeCcpLm1hcCgoYSkgPT4gYmludG9vbHMuc3RyaW5nVG9BZGRyZXNzKGEpKTtcblxuICAgIGlmKCBtZW1vIGluc3RhbmNlb2YgUGF5bG9hZEJhc2UpIHtcbiAgICAgIG1lbW8gPSBtZW1vLmdldFBheWxvYWQoKTtcbiAgICB9XG5cbiAgICBjb25zdCBhdmF4QXNzZXRJRDpCdWZmZXIgPSBhd2FpdCB0aGlzLmdldEFWQVhBc3NldElEKCk7XG5cbiAgICBjb25zdCBidWlsdFVuc2lnbmVkVHg6VW5zaWduZWRUeCA9IHV0eG9zZXQuYnVpbGRDcmVhdGVTdWJuZXRUeChcbiAgICAgIHRoaXMuY29yZS5nZXROZXR3b3JrSUQoKSwgXG4gICAgICBiaW50b29scy5jYjU4RGVjb2RlKHRoaXMuYmxvY2tjaGFpbklEKSwgXG4gICAgICBmcm9tLFxuICAgICAgY2hhbmdlLFxuICAgICAgb3duZXJzLFxuICAgICAgc3VibmV0T3duZXJUaHJlc2hvbGQsXG4gICAgICB0aGlzLmdldENyZWF0aW9uVHhGZWUoKSwgXG4gICAgICBhdmF4QXNzZXRJRCxcbiAgICAgIG1lbW8sIGFzT2ZcbiAgICApO1xuXG4gICAgaWYoISBhd2FpdCB0aGlzLmNoZWNrR29vc2VFZ2coYnVpbHRVbnNpZ25lZFR4LCB0aGlzLmdldENyZWF0aW9uVHhGZWUoKSkpIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJGYWlsZWQgR29vc2UgRWdnIENoZWNrXCIpO1xuICAgIH1cblxuICAgIHJldHVybiBidWlsdFVuc2lnbmVkVHg7XG4gIH1cblxuICAvKipcbiAgICogQGlnbm9yZVxuICAgKi9cbiAgcHJvdGVjdGVkIF9jbGVhbkFkZHJlc3NBcnJheShhZGRyZXNzZXM6QXJyYXk8c3RyaW5nPiB8IEFycmF5PEJ1ZmZlcj4sIGNhbGxlcjpzdHJpbmcpOkFycmF5PHN0cmluZz4ge1xuICAgIGNvbnN0IGFkZHJzOkFycmF5PHN0cmluZz4gPSBbXTtcbiAgICBjb25zdCBjaGFpbmlkOnN0cmluZyA9IHRoaXMuZ2V0QmxvY2tjaGFpbkFsaWFzKCkgPyB0aGlzLmdldEJsb2NrY2hhaW5BbGlhcygpIDogdGhpcy5nZXRCbG9ja2NoYWluSUQoKTtcbiAgICBpZiAoYWRkcmVzc2VzICYmIGFkZHJlc3Nlcy5sZW5ndGggPiAwKSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFkZHJlc3Nlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAodHlwZW9mIGFkZHJlc3Nlc1tpXSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICBpZiAodHlwZW9mIHRoaXMucGFyc2VBZGRyZXNzKGFkZHJlc3Nlc1tpXSBhcyBzdHJpbmcpID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRXJyb3IgLSBQbGF0Zm9ybVZNQVBJLiR7Y2FsbGVyfTogSW52YWxpZCBhZGRyZXNzIGZvcm1hdCAke2FkZHJlc3Nlc1tpXX1gKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYWRkcnMucHVzaChhZGRyZXNzZXNbaV0gYXMgc3RyaW5nKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhZGRycy5wdXNoKGJpbnRvb2xzLmFkZHJlc3NUb1N0cmluZyh0aGlzLmNvcmUuZ2V0SFJQKCksIGNoYWluaWQsIGFkZHJlc3Nlc1tpXSBhcyBCdWZmZXIpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYWRkcnM7XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBjbGFzcyBzaG91bGQgbm90IGJlIGluc3RhbnRpYXRlZCBkaXJlY3RseS5cbiAgICogSW5zdGVhZCB1c2UgdGhlIFtbQXZhbGFuY2hlLmFkZEFQSV1dIG1ldGhvZC5cbiAgICpcbiAgICogQHBhcmFtIGNvcmUgQSByZWZlcmVuY2UgdG8gdGhlIEF2YWxhbmNoZSBjbGFzc1xuICAgKiBAcGFyYW0gYmFzZXVybCBEZWZhdWx0cyB0byB0aGUgc3RyaW5nIFwiL2V4dC9QXCIgYXMgdGhlIHBhdGggdG8gYmxvY2tjaGFpbidzIGJhc2V1cmxcbiAgICovXG4gIGNvbnN0cnVjdG9yKGNvcmU6QXZhbGFuY2hlQ29yZSwgYmFzZXVybDpzdHJpbmcgPSAnL2V4dC9iYy9QJykgeyBcbiAgICBzdXBlcihjb3JlLCBiYXNldXJsKTsgXG4gICAgdGhpcy5ibG9ja2NoYWluSUQgPSBQbGF0Zm9ybUNoYWluSUQ7XG4gICAgY29uc3QgbmV0aWQ6bnVtYmVyID0gY29yZS5nZXROZXR3b3JrSUQoKTtcbiAgICBpZiAobmV0aWQgaW4gRGVmYXVsdHMubmV0d29yayAmJiB0aGlzLmJsb2NrY2hhaW5JRCBpbiBEZWZhdWx0cy5uZXR3b3JrW25ldGlkXSkge1xuICAgICAgY29uc3QgeyBhbGlhcyB9ID0gRGVmYXVsdHMubmV0d29ya1tuZXRpZF1bdGhpcy5ibG9ja2NoYWluSURdO1xuICAgICAgdGhpcy5rZXljaGFpbiA9IG5ldyBLZXlDaGFpbih0aGlzLmNvcmUuZ2V0SFJQKCksIGFsaWFzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5rZXljaGFpbiA9IG5ldyBLZXlDaGFpbih0aGlzLmNvcmUuZ2V0SFJQKCksIHRoaXMuYmxvY2tjaGFpbklEKTtcbiAgICB9XG4gIH1cbn1cblxuIl19