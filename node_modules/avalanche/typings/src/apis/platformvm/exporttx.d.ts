/**
 * @packageDocumentation
 * @module API-PlatformVM-ExportTx
 */
import { Buffer } from 'buffer/';
import { TransferableOutput } from './outputs';
import { TransferableInput } from './inputs';
import { BaseTx } from './basetx';
import BN from 'bn.js';
import { SerializedEncoding } from '../../utils/serialization';
/**
 * Class representing an unsigned Export transaction.
 */
export declare class ExportTx extends BaseTx {
    protected _typeName: string;
    protected _typeID: number;
    serialize(encoding?: SerializedEncoding): object;
    deserialize(fields: object, encoding?: SerializedEncoding): void;
    protected destinationChain: Buffer;
    protected numOuts: Buffer;
    protected exportOuts: Array<TransferableOutput>;
    /**
     * Returns the id of the [[ExportTx]]
     */
    getTxType: () => number;
    /**
     * Returns an array of [[TransferableOutput]]s in this transaction.
     */
    getExportOutputs(): Array<TransferableOutput>;
    /**
     * Returns the total exported amount as a {@link https://github.com/indutny/bn.js/|BN}.
     */
    getExportTotal(): BN;
    getTotalOuts(): Array<TransferableOutput>;
    /**
     * Takes a {@link https://github.com/feross/buffer|Buffer} containing an [[ExportTx]], parses it, populates the class, and returns the length of the [[ExportTx]] in bytes.
     *
     * @param bytes A {@link https://github.com/feross/buffer|Buffer} containing a raw [[ExportTx]]
     *
     * @returns The length of the raw [[ExportTx]]
     *
     * @remarks assume not-checksummed
     */
    fromBuffer(bytes: Buffer, offset?: number): number;
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[ExportTx]].
     */
    toBuffer(): Buffer;
    clone(): this;
    create(...args: any[]): this;
    /**
     * Class representing an unsigned Export transaction.
     *
     * @param networkid Optional networkid, [[DefaultNetworkID]]
     * @param blockchainid Optional blockchainid, default Buffer.alloc(32, 16)
     * @param outs Optional array of the [[TransferableOutput]]s
     * @param ins Optional array of the [[TransferableInput]]s
     * @param memo Optional {@link https://github.com/feross/buffer|Buffer} for the memo field
     * @param destinationChain Optional chainid which identifies where the funds will send to.
     * @param exportOuts Array of [[TransferableOutputs]]s used in the transaction
     */
    constructor(networkid?: number, blockchainid?: Buffer, outs?: Array<TransferableOutput>, ins?: Array<TransferableInput>, memo?: Buffer, destinationChain?: Buffer, exportOuts?: Array<TransferableOutput>);
}
//# sourceMappingURL=exporttx.d.ts.map