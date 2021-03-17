"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Buffer = exports.BN = exports.AvalancheCore = exports.DB = exports.BinTools = exports.Avalanche = void 0;
/**
 * @packageDocumentation
 * @module Avalanche
 */
const avalanche_1 = __importDefault(require("./avalanche"));
exports.AvalancheCore = avalanche_1.default;
const api_1 = require("./apis/admin/api");
const api_2 = require("./apis/auth/api");
const api_3 = require("./apis/avm/api");
const api_4 = require("./apis/evm/api");
const api_5 = require("./apis/health/api");
const api_6 = require("./apis/info/api");
const api_7 = require("./apis/keystore/api");
const api_8 = require("./apis/metrics/api");
const api_9 = require("./apis/platformvm/api");
const constants_1 = require("./utils/constants");
const helperfunctions_1 = require("./utils/helperfunctions");
const bintools_1 = __importDefault(require("./utils/bintools"));
exports.BinTools = bintools_1.default;
const db_1 = __importDefault(require("./utils/db"));
exports.DB = db_1.default;
const bn_js_1 = __importDefault(require("bn.js"));
exports.BN = bn_js_1.default;
const buffer_1 = require("buffer/");
Object.defineProperty(exports, "Buffer", { enumerable: true, get: function () { return buffer_1.Buffer; } });
/**
 * AvalancheJS is middleware for interacting with Avalanche node RPC APIs.
 *
 * Example usage:
 * ```js
 * let avalanche = new Avalanche("127.0.0.1", 9650, "https");
 * ```
 *
 */
class Avalanche extends avalanche_1.default {
    /**
       * Creates a new Avalanche instance. Sets the address and port of the main Avalanche Client.
       *
       * @param ip The hostname to resolve to reach the Avalanche Client RPC APIs
       * @param port The port to resolve to reach the Avalanche Client RPC APIs
       * @param protocol The protocol string to use before a "://" in a request,
       * ex: "http", "https", "git", "ws", etc ...
       * @param networkid Sets the NetworkID of the class. Default [[DefaultNetworkID]]
       * @param XChainID Sets the blockchainID for the AVM. Will try to auto-detect,
       * otherwise default "4R5p2RXDGLqaifZE4hHWH9owe34pfoBULn1DrQTWivjg8o4aH"
       * @param CChainID Sets the blockchainID for the EVM. Will try to auto-detect,
       * otherwise default "2q9e4r6Mu3U68nU1fYjgbR6JvwrRx36CohpAX5UQxse55x1Q5"
       * @param hrp The human-readable part of the bech32 addresses
       * @param skipinit Skips creating the APIs
       */
    constructor(ip, port, protocol = 'http', networkID = constants_1.DefaultNetworkID, XChainID = undefined, CChainID = undefined, hrp = undefined, skipinit = false) {
        super(ip, port, protocol);
        /**
           * Returns a reference to the Admin RPC.
           */
        this.Admin = () => this.apis.admin;
        /**
           * Returns a reference to the Auth RPC.
           */
        this.Auth = () => this.apis.auth;
        /**
         * Returns a reference to the EVMAPI RPC pointed at the C-Chain.
         */
        this.CChain = () => this.apis.cchain;
        /**
           * Returns a reference to the AVM RPC pointed at the X-Chain.
           */
        this.XChain = () => this.apis.xchain;
        /**
           * Returns a reference to the Health RPC for a node.
           */
        this.Health = () => this.apis.health;
        /**
           * Returns a reference to the Info RPC for a node.
           */
        this.Info = () => this.apis.info;
        /**
           * Returns a reference to the Metrics RPC.
           */
        this.Metrics = () => this.apis.metrics;
        /**
           * Returns a reference to the Keystore RPC for a node. We label it "NodeKeys" to reduce
           * confusion about what it's accessing.
           */
        this.NodeKeys = () => this.apis.keystore;
        /**
           * Returns a reference to the PlatformVM RPC pointed at the P-Chain.
           */
        this.PChain = () => this.apis.pchain;
        let xchainid = XChainID;
        let cchainid = CChainID;
        if (typeof XChainID === 'undefined'
            || !XChainID
            || XChainID.toLowerCase() === 'x') {
            if (networkID.toString() in constants_1.Defaults.network) {
                xchainid = constants_1.Defaults.network[networkID].X.blockchainID;
            }
            else {
                xchainid = constants_1.Defaults.network[12345].X.blockchainID;
            }
        }
        if (typeof CChainID === 'undefined'
            || !CChainID
            || CChainID.toLowerCase() === 'c') {
            if (networkID.toString() in constants_1.Defaults.network) {
                cchainid = constants_1.Defaults.network[networkID].C.blockchainID;
            }
            else {
                cchainid = constants_1.Defaults.network[12345].C.blockchainID;
            }
        }
        if (typeof networkID === 'number' && networkID >= 0) {
            this.networkID = networkID;
        }
        else if (typeof networkID === "undefined") {
            networkID = constants_1.DefaultNetworkID;
        }
        if (typeof hrp !== "undefined") {
            this.hrp = hrp;
        }
        else {
            this.hrp = helperfunctions_1.getPreferredHRP(this.networkID);
        }
        if (!skipinit) {
            this.addAPI('admin', api_1.AdminAPI);
            this.addAPI('auth', api_2.AuthAPI);
            this.addAPI('xchain', api_3.AVMAPI, '/ext/bc/X', xchainid);
            this.addAPI('cchain', api_4.EVMAPI, '/ext/bc/C/avax', cchainid);
            this.addAPI('health', api_5.HealthAPI);
            this.addAPI('info', api_6.InfoAPI);
            this.addAPI('keystore', api_7.KeystoreAPI);
            this.addAPI('metrics', api_8.MetricsAPI);
            this.addAPI('pchain', api_9.PlatformVMAPI);
        }
    }
}
exports.default = Avalanche;
exports.Avalanche = Avalanche;
exports.utils = __importStar(require("./utils"));
exports.common = __importStar(require("./common"));
exports.admin = __importStar(require("./apis/admin"));
exports.auth = __importStar(require("./apis/auth"));
exports.avm = __importStar(require("./apis/avm"));
exports.evm = __importStar(require("./apis/evm"));
exports.health = __importStar(require("./apis/health"));
exports.info = __importStar(require("./apis/info"));
exports.keystore = __importStar(require("./apis/keystore"));
exports.metrics = __importStar(require("./apis/metrics"));
exports.platformvm = __importStar(require("./apis/platformvm"));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOzs7R0FHRztBQUNILDREQUF3QztBQW1KL0Isd0JBbkpGLG1CQUFhLENBbUpFO0FBbEp0QiwwQ0FBNEM7QUFDNUMseUNBQTBDO0FBQzFDLHdDQUF3QztBQUN4Qyx3Q0FBd0M7QUFDeEMsMkNBQThDO0FBQzlDLHlDQUEwQztBQUMxQyw2Q0FBa0Q7QUFDbEQsNENBQWdEO0FBQ2hELCtDQUFzRDtBQUN0RCxpREFBK0Q7QUFDL0QsNkRBQTBEO0FBQzFELGdFQUF3QztBQXFJL0IsbUJBcklGLGtCQUFRLENBcUlFO0FBcElqQixvREFBNEI7QUFxSW5CLGFBcklGLFlBQUUsQ0FxSUU7QUFwSVgsa0RBQXVCO0FBc0lkLGFBdElGLGVBQUUsQ0FzSUU7QUFySVgsb0NBQWlDO0FBc0l4Qix1RkF0SUEsZUFBTSxPQXNJQTtBQXBJZjs7Ozs7Ozs7R0FRRztBQUNILE1BQXFCLFNBQVUsU0FBUSxtQkFBYTtJQStDbEQ7Ozs7Ozs7Ozs7Ozs7O1NBY0s7SUFDTCxZQUNFLEVBQVMsRUFDVCxJQUFXLEVBQ1gsV0FBa0IsTUFBTSxFQUN4QixZQUFtQiw0QkFBZ0IsRUFDbkMsV0FBa0IsU0FBUyxFQUMzQixXQUFrQixTQUFTLEVBQzNCLE1BQWEsU0FBUyxFQUN0QixXQUFtQixLQUFLO1FBQ3hCLEtBQUssQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBdEU1Qjs7YUFFSztRQUNMLFVBQUssR0FBRyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQWlCLENBQUM7UUFFMUM7O2FBRUs7UUFDTCxTQUFJLEdBQUcsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFlLENBQUM7UUFFdkM7O1dBRUc7UUFDSCxXQUFNLEdBQUcsR0FBRyxF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WUFDakMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsYUFBTyxDQUFDLENBQUM7WUFDN0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsaUJBQVcsQ0FBQyxDQUFDO1lBQ3JDLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLGdCQUFVLENBQUMsQ0FBQztZQUNuQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxtQkFBYSxDQUFDLENBQUM7U0FDdEM7SUFDSCxDQUFDO0NBQ0Y7QUFwSEQsNEJBb0hDO0FBRVEsOEJBQVM7QUFPbEIsaURBQWlDO0FBQ2pDLG1EQUFtQztBQUNuQyxzREFBc0M7QUFDdEMsb0RBQW9DO0FBQ3BDLGtEQUFrQztBQUNsQyxrREFBa0M7QUFDbEMsd0RBQXdDO0FBQ3hDLG9EQUFvQztBQUNwQyw0REFBNEM7QUFDNUMsMERBQTBDO0FBQzFDLGdFQUFnRCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQHBhY2thZ2VEb2N1bWVudGF0aW9uXG4gKiBAbW9kdWxlIEF2YWxhbmNoZVxuICovXG5pbXBvcnQgQXZhbGFuY2hlQ29yZSBmcm9tICcuL2F2YWxhbmNoZSc7XG5pbXBvcnQgeyBBZG1pbkFQSSB9IGZyb20gJy4vYXBpcy9hZG1pbi9hcGknO1xuaW1wb3J0IHsgQXV0aEFQSSB9IGZyb20gJy4vYXBpcy9hdXRoL2FwaSc7XG5pbXBvcnQgeyBBVk1BUEkgfSBmcm9tICcuL2FwaXMvYXZtL2FwaSc7XG5pbXBvcnQgeyBFVk1BUEkgfSBmcm9tICcuL2FwaXMvZXZtL2FwaSc7XG5pbXBvcnQgeyBIZWFsdGhBUEkgfSBmcm9tICcuL2FwaXMvaGVhbHRoL2FwaSc7XG5pbXBvcnQgeyBJbmZvQVBJIH0gZnJvbSAnLi9hcGlzL2luZm8vYXBpJztcbmltcG9ydCB7IEtleXN0b3JlQVBJIH0gZnJvbSAnLi9hcGlzL2tleXN0b3JlL2FwaSc7XG5pbXBvcnQgeyBNZXRyaWNzQVBJIH0gZnJvbSAnLi9hcGlzL21ldHJpY3MvYXBpJztcbmltcG9ydCB7IFBsYXRmb3JtVk1BUEkgfSBmcm9tICcuL2FwaXMvcGxhdGZvcm12bS9hcGknO1xuaW1wb3J0IHsgRGVmYXVsdE5ldHdvcmtJRCwgRGVmYXVsdHMgfSBmcm9tICcuL3V0aWxzL2NvbnN0YW50cyc7XG5pbXBvcnQgeyBnZXRQcmVmZXJyZWRIUlAgfSBmcm9tICcuL3V0aWxzL2hlbHBlcmZ1bmN0aW9ucyc7XG5pbXBvcnQgQmluVG9vbHMgZnJvbSAnLi91dGlscy9iaW50b29scyc7XG5pbXBvcnQgREIgZnJvbSAnLi91dGlscy9kYic7XG5pbXBvcnQgQk4gZnJvbSBcImJuLmpzXCI7XG5pbXBvcnQgeyBCdWZmZXIgfSBmcm9tICdidWZmZXIvJztcblxuLyoqXG4gKiBBdmFsYW5jaGVKUyBpcyBtaWRkbGV3YXJlIGZvciBpbnRlcmFjdGluZyB3aXRoIEF2YWxhbmNoZSBub2RlIFJQQyBBUElzLlxuICpcbiAqIEV4YW1wbGUgdXNhZ2U6XG4gKiBgYGBqc1xuICogbGV0IGF2YWxhbmNoZSA9IG5ldyBBdmFsYW5jaGUoXCIxMjcuMC4wLjFcIiwgOTY1MCwgXCJodHRwc1wiKTtcbiAqIGBgYFxuICpcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXZhbGFuY2hlIGV4dGVuZHMgQXZhbGFuY2hlQ29yZSB7XG4gIC8qKlxuICAgICAqIFJldHVybnMgYSByZWZlcmVuY2UgdG8gdGhlIEFkbWluIFJQQy5cbiAgICAgKi9cbiAgQWRtaW4gPSAoKSA9PiB0aGlzLmFwaXMuYWRtaW4gYXMgQWRtaW5BUEk7XG5cbiAgLyoqXG4gICAgICogUmV0dXJucyBhIHJlZmVyZW5jZSB0byB0aGUgQXV0aCBSUEMuXG4gICAgICovXG4gIEF1dGggPSAoKSA9PiB0aGlzLmFwaXMuYXV0aCBhcyBBdXRoQVBJO1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgcmVmZXJlbmNlIHRvIHRoZSBFVk1BUEkgUlBDIHBvaW50ZWQgYXQgdGhlIEMtQ2hhaW4uXG4gICAqL1xuICBDQ2hhaW4gPSAoKSA9PiB0aGlzLmFwaXMuY2NoYWluIGFzIEVWTUFQSTtcblxuICAvKipcbiAgICAgKiBSZXR1cm5zIGEgcmVmZXJlbmNlIHRvIHRoZSBBVk0gUlBDIHBvaW50ZWQgYXQgdGhlIFgtQ2hhaW4uXG4gICAgICovXG4gIFhDaGFpbiA9ICgpID0+IHRoaXMuYXBpcy54Y2hhaW4gYXMgQVZNQVBJO1xuXG4gIC8qKlxuICAgICAqIFJldHVybnMgYSByZWZlcmVuY2UgdG8gdGhlIEhlYWx0aCBSUEMgZm9yIGEgbm9kZS5cbiAgICAgKi9cbiAgSGVhbHRoID0gKCkgPT4gdGhpcy5hcGlzLmhlYWx0aCBhcyBIZWFsdGhBUEk7XG5cbiAgLyoqXG4gICAgICogUmV0dXJucyBhIHJlZmVyZW5jZSB0byB0aGUgSW5mbyBSUEMgZm9yIGEgbm9kZS5cbiAgICAgKi9cbiAgSW5mbyA9ICgpID0+IHRoaXMuYXBpcy5pbmZvIGFzIEluZm9BUEk7XG5cbiAgLyoqXG4gICAgICogUmV0dXJucyBhIHJlZmVyZW5jZSB0byB0aGUgTWV0cmljcyBSUEMuXG4gICAgICovXG4gIE1ldHJpY3MgPSAoKSA9PiB0aGlzLmFwaXMubWV0cmljcyBhcyBNZXRyaWNzQVBJO1xuXG4gIC8qKlxuICAgICAqIFJldHVybnMgYSByZWZlcmVuY2UgdG8gdGhlIEtleXN0b3JlIFJQQyBmb3IgYSBub2RlLiBXZSBsYWJlbCBpdCBcIk5vZGVLZXlzXCIgdG8gcmVkdWNlXG4gICAgICogY29uZnVzaW9uIGFib3V0IHdoYXQgaXQncyBhY2Nlc3NpbmcuXG4gICAgICovXG4gIE5vZGVLZXlzID0gKCkgPT4gdGhpcy5hcGlzLmtleXN0b3JlIGFzIEtleXN0b3JlQVBJO1xuXG4gIC8qKlxuICAgICAqIFJldHVybnMgYSByZWZlcmVuY2UgdG8gdGhlIFBsYXRmb3JtVk0gUlBDIHBvaW50ZWQgYXQgdGhlIFAtQ2hhaW4uXG4gICAgICovXG4gIFBDaGFpbiA9ICgpID0+IHRoaXMuYXBpcy5wY2hhaW4gYXMgUGxhdGZvcm1WTUFQSTtcblxuICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IEF2YWxhbmNoZSBpbnN0YW5jZS4gU2V0cyB0aGUgYWRkcmVzcyBhbmQgcG9ydCBvZiB0aGUgbWFpbiBBdmFsYW5jaGUgQ2xpZW50LlxuICAgICAqXG4gICAgICogQHBhcmFtIGlwIFRoZSBob3N0bmFtZSB0byByZXNvbHZlIHRvIHJlYWNoIHRoZSBBdmFsYW5jaGUgQ2xpZW50IFJQQyBBUElzXG4gICAgICogQHBhcmFtIHBvcnQgVGhlIHBvcnQgdG8gcmVzb2x2ZSB0byByZWFjaCB0aGUgQXZhbGFuY2hlIENsaWVudCBSUEMgQVBJc1xuICAgICAqIEBwYXJhbSBwcm90b2NvbCBUaGUgcHJvdG9jb2wgc3RyaW5nIHRvIHVzZSBiZWZvcmUgYSBcIjovL1wiIGluIGEgcmVxdWVzdCxcbiAgICAgKiBleDogXCJodHRwXCIsIFwiaHR0cHNcIiwgXCJnaXRcIiwgXCJ3c1wiLCBldGMgLi4uXG4gICAgICogQHBhcmFtIG5ldHdvcmtpZCBTZXRzIHRoZSBOZXR3b3JrSUQgb2YgdGhlIGNsYXNzLiBEZWZhdWx0IFtbRGVmYXVsdE5ldHdvcmtJRF1dXG4gICAgICogQHBhcmFtIFhDaGFpbklEIFNldHMgdGhlIGJsb2NrY2hhaW5JRCBmb3IgdGhlIEFWTS4gV2lsbCB0cnkgdG8gYXV0by1kZXRlY3QsXG4gICAgICogb3RoZXJ3aXNlIGRlZmF1bHQgXCI0UjVwMlJYREdMcWFpZlpFNGhIV0g5b3dlMzRwZm9CVUxuMURyUVRXaXZqZzhvNGFIXCJcbiAgICAgKiBAcGFyYW0gQ0NoYWluSUQgU2V0cyB0aGUgYmxvY2tjaGFpbklEIGZvciB0aGUgRVZNLiBXaWxsIHRyeSB0byBhdXRvLWRldGVjdCxcbiAgICAgKiBvdGhlcndpc2UgZGVmYXVsdCBcIjJxOWU0cjZNdTNVNjhuVTFmWWpnYlI2SnZ3clJ4MzZDb2hwQVg1VVF4c2U1NXgxUTVcIlxuICAgICAqIEBwYXJhbSBocnAgVGhlIGh1bWFuLXJlYWRhYmxlIHBhcnQgb2YgdGhlIGJlY2gzMiBhZGRyZXNzZXNcbiAgICAgKiBAcGFyYW0gc2tpcGluaXQgU2tpcHMgY3JlYXRpbmcgdGhlIEFQSXNcbiAgICAgKi9cbiAgY29uc3RydWN0b3IoXG4gICAgaXA6c3RyaW5nLFxuICAgIHBvcnQ6bnVtYmVyLFxuICAgIHByb3RvY29sOnN0cmluZyA9ICdodHRwJyxcbiAgICBuZXR3b3JrSUQ6bnVtYmVyID0gRGVmYXVsdE5ldHdvcmtJRCxcbiAgICBYQ2hhaW5JRDpzdHJpbmcgPSB1bmRlZmluZWQsXG4gICAgQ0NoYWluSUQ6c3RyaW5nID0gdW5kZWZpbmVkLFxuICAgIGhycDpzdHJpbmcgPSB1bmRlZmluZWQsXG4gICAgc2tpcGluaXQ6Ym9vbGVhbiA9IGZhbHNlKSB7XG4gICAgc3VwZXIoaXAsIHBvcnQsIHByb3RvY29sKTtcbiAgICBsZXQgeGNoYWluaWQgPSBYQ2hhaW5JRDtcbiAgICBsZXQgY2NoYWluaWQgPSBDQ2hhaW5JRDtcblxuICAgIGlmICh0eXBlb2YgWENoYWluSUQgPT09ICd1bmRlZmluZWQnXG4gICAgfHwgIVhDaGFpbklEXG4gICAgfHwgWENoYWluSUQudG9Mb3dlckNhc2UoKSA9PT0gJ3gnKSB7XG4gICAgICBpZiAobmV0d29ya0lELnRvU3RyaW5nKCkgaW4gRGVmYXVsdHMubmV0d29yaykge1xuICAgICAgICB4Y2hhaW5pZCA9IERlZmF1bHRzLm5ldHdvcmtbbmV0d29ya0lEXS5YLmJsb2NrY2hhaW5JRDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHhjaGFpbmlkID0gRGVmYXVsdHMubmV0d29ya1sxMjM0NV0uWC5ibG9ja2NoYWluSUQ7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0eXBlb2YgQ0NoYWluSUQgPT09ICd1bmRlZmluZWQnXG4gICAgfHwgIUNDaGFpbklEXG4gICAgfHwgQ0NoYWluSUQudG9Mb3dlckNhc2UoKSA9PT0gJ2MnKSB7XG4gICAgICBpZiAobmV0d29ya0lELnRvU3RyaW5nKCkgaW4gRGVmYXVsdHMubmV0d29yaykge1xuICAgICAgICBjY2hhaW5pZCA9IERlZmF1bHRzLm5ldHdvcmtbbmV0d29ya0lEXS5DLmJsb2NrY2hhaW5JRDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNjaGFpbmlkID0gRGVmYXVsdHMubmV0d29ya1sxMjM0NV0uQy5ibG9ja2NoYWluSUQ7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0eXBlb2YgbmV0d29ya0lEID09PSAnbnVtYmVyJyAmJiBuZXR3b3JrSUQgPj0gMCkge1xuICAgICAgdGhpcy5uZXR3b3JrSUQgPSBuZXR3b3JrSUQ7XG4gICAgfSBlbHNlIGlmKHR5cGVvZiBuZXR3b3JrSUQgPT09IFwidW5kZWZpbmVkXCIpe1xuICAgICAgbmV0d29ya0lEID0gRGVmYXVsdE5ldHdvcmtJRDtcbiAgICB9XG4gICAgaWYodHlwZW9mIGhycCAhPT0gXCJ1bmRlZmluZWRcIil7XG4gICAgICB0aGlzLmhycCA9IGhycDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5ocnAgPSBnZXRQcmVmZXJyZWRIUlAodGhpcy5uZXR3b3JrSUQpO1xuICAgIH1cbiAgICBcbiAgICBpZiAoIXNraXBpbml0KSB7XG4gICAgICB0aGlzLmFkZEFQSSgnYWRtaW4nLCBBZG1pbkFQSSk7XG4gICAgICB0aGlzLmFkZEFQSSgnYXV0aCcsIEF1dGhBUEkpO1xuICAgICAgdGhpcy5hZGRBUEkoJ3hjaGFpbicsIEFWTUFQSSwgJy9leHQvYmMvWCcsIHhjaGFpbmlkKTtcbiAgICAgIHRoaXMuYWRkQVBJKCdjY2hhaW4nLCBFVk1BUEksICcvZXh0L2JjL0MvYXZheCcsIGNjaGFpbmlkKTtcbiAgICAgIHRoaXMuYWRkQVBJKCdoZWFsdGgnLCBIZWFsdGhBUEkpO1xuICAgICAgdGhpcy5hZGRBUEkoJ2luZm8nLCBJbmZvQVBJKTtcbiAgICAgIHRoaXMuYWRkQVBJKCdrZXlzdG9yZScsIEtleXN0b3JlQVBJKTtcbiAgICAgIHRoaXMuYWRkQVBJKCdtZXRyaWNzJywgTWV0cmljc0FQSSk7XG4gICAgICB0aGlzLmFkZEFQSSgncGNoYWluJywgUGxhdGZvcm1WTUFQSSk7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCB7IEF2YWxhbmNoZSB9O1xuZXhwb3J0IHsgQmluVG9vbHMgfTtcbmV4cG9ydCB7IERCIH07XG5leHBvcnQgeyBBdmFsYW5jaGVDb3JlIH07XG5leHBvcnQgeyBCTiB9O1xuZXhwb3J0IHsgQnVmZmVyIH07XG5cbmV4cG9ydCAqIGFzIHV0aWxzIGZyb20gJy4vdXRpbHMnO1xuZXhwb3J0ICogYXMgY29tbW9uIGZyb20gJy4vY29tbW9uJztcbmV4cG9ydCAqIGFzIGFkbWluIGZyb20gJy4vYXBpcy9hZG1pbic7XG5leHBvcnQgKiBhcyBhdXRoIGZyb20gJy4vYXBpcy9hdXRoJztcbmV4cG9ydCAqIGFzIGF2bSBmcm9tICcuL2FwaXMvYXZtJztcbmV4cG9ydCAqIGFzIGV2bSBmcm9tICcuL2FwaXMvZXZtJztcbmV4cG9ydCAqIGFzIGhlYWx0aCBmcm9tICcuL2FwaXMvaGVhbHRoJztcbmV4cG9ydCAqIGFzIGluZm8gZnJvbSAnLi9hcGlzL2luZm8nO1xuZXhwb3J0ICogYXMga2V5c3RvcmUgZnJvbSAnLi9hcGlzL2tleXN0b3JlJztcbmV4cG9ydCAqIGFzIG1ldHJpY3MgZnJvbSAnLi9hcGlzL21ldHJpY3MnO1xuZXhwb3J0ICogYXMgcGxhdGZvcm12bSBmcm9tICcuL2FwaXMvcGxhdGZvcm12bSc7XG5cbiJdfQ==