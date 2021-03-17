/**
 * @packageDocumentation
 * @module Avalanche
 */
import AvalancheCore from './avalanche';
import { AdminAPI } from './apis/admin/api';
import { AuthAPI } from './apis/auth/api';
import { AVMAPI } from './apis/avm/api';
import { EVMAPI } from './apis/evm/api';
import { HealthAPI } from './apis/health/api';
import { InfoAPI } from './apis/info/api';
import { KeystoreAPI } from './apis/keystore/api';
import { MetricsAPI } from './apis/metrics/api';
import { PlatformVMAPI } from './apis/platformvm/api';
import BinTools from './utils/bintools';
import DB from './utils/db';
import BN from "bn.js";
import { Buffer } from 'buffer/';
/**
 * AvalancheJS is middleware for interacting with Avalanche node RPC APIs.
 *
 * Example usage:
 * ```js
 * let avalanche = new Avalanche("127.0.0.1", 9650, "https");
 * ```
 *
 */
export default class Avalanche extends AvalancheCore {
    /**
       * Returns a reference to the Admin RPC.
       */
    Admin: () => AdminAPI;
    /**
       * Returns a reference to the Auth RPC.
       */
    Auth: () => AuthAPI;
    /**
     * Returns a reference to the EVMAPI RPC pointed at the C-Chain.
     */
    CChain: () => EVMAPI;
    /**
       * Returns a reference to the AVM RPC pointed at the X-Chain.
       */
    XChain: () => AVMAPI;
    /**
       * Returns a reference to the Health RPC for a node.
       */
    Health: () => HealthAPI;
    /**
       * Returns a reference to the Info RPC for a node.
       */
    Info: () => InfoAPI;
    /**
       * Returns a reference to the Metrics RPC.
       */
    Metrics: () => MetricsAPI;
    /**
       * Returns a reference to the Keystore RPC for a node. We label it "NodeKeys" to reduce
       * confusion about what it's accessing.
       */
    NodeKeys: () => KeystoreAPI;
    /**
       * Returns a reference to the PlatformVM RPC pointed at the P-Chain.
       */
    PChain: () => PlatformVMAPI;
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
    constructor(ip: string, port: number, protocol?: string, networkID?: number, XChainID?: string, CChainID?: string, hrp?: string, skipinit?: boolean);
}
export { Avalanche };
export { BinTools };
export { DB };
export { AvalancheCore };
export { BN };
export { Buffer };
export * as utils from './utils';
export * as common from './common';
export * as admin from './apis/admin';
export * as auth from './apis/auth';
export * as avm from './apis/avm';
export * as evm from './apis/evm';
export * as health from './apis/health';
export * as info from './apis/info';
export * as keystore from './apis/keystore';
export * as metrics from './apis/metrics';
export * as platformvm from './apis/platformvm';
//# sourceMappingURL=index.d.ts.map