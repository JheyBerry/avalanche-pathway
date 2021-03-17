/**
 * @packageDocumentation
 * @module Info-Interfaces
 */
import BN from "bn.js";
export interface iGetBlockchainIDParams {
    alias: string;
}
export interface iGetTxFeeResponse {
    txFee: BN;
    creationTxFee: BN;
}
export interface iIsBootstrappedParams {
    chain: string;
}
export interface iPeer {
    ip: string;
    publicIP: string;
    nodeID: string;
    version: string;
    lastSent: string;
    lastReceived: string;
}
//# sourceMappingURL=interfaces.d.ts.map