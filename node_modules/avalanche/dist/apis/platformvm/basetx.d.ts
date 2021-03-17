/**
 * @packageDocumentation
 * @module API-PlatformVM-BaseTx
 */
import { Buffer } from 'buffer/';
import { TransferableOutput } from './outputs';
import { TransferableInput } from './inputs';
import { KeyChain, KeyPair } from './keychain';
import { StandardBaseTx } from '../../common/tx';
import { Credential } from '../../common/credentials';
import { SerializedEncoding } from '../../utils/serialization';
/**
 * Class representing a base for all transactions.
 */
export declare class BaseTx extends StandardBaseTx<KeyPair, KeyChain> {
    protected _typeName: string;
    protected _typeID: number;
    deserialize(fields: object, encoding?: SerializedEncoding): void;
    getOuts(): Array<TransferableOutput>;
    getIns(): Array<TransferableInput>;
    getTotalOuts(): Array<TransferableOutput>;
    /**
     * Returns the id of the [[BaseTx]]
     */
    getTxType: () => number;
    /**
     * Takes a {@link https://github.com/feross/buffer|Buffer} containing an [[BaseTx]], parses it, populates the class, and returns the length of the BaseTx in bytes.
     *
     * @param bytes A {@link https://github.com/feross/buffer|Buffer} containing a raw [[BaseTx]]
     *
     * @returns The length of the raw [[BaseTx]]
     *
     * @remarks assume not-checksummed
     */
    fromBuffer(bytes: Buffer, offset?: number): number;
    /**
     * Takes the bytes of an [[UnsignedTx]] and returns an array of [[Credential]]s
     *
     * @param msg A Buffer for the [[UnsignedTx]]
     * @param kc An [[KeyChain]] used in signing
     *
     * @returns An array of [[Credential]]s
     */
    sign(msg: Buffer, kc: KeyChain): Array<Credential>;
    clone(): this;
    create(...args: any[]): this;
    select(id: number, ...args: any[]): this;
    /**
     * Class representing a BaseTx which is the foundation for all transactions.
     *
     * @param networkid Optional networkid, [[DefaultNetworkID]]
     * @param blockchainid Optional blockchainid, default Buffer.alloc(32, 16)
     * @param outs Optional array of the [[TransferableOutput]]s
     * @param ins Optional array of the [[TransferableInput]]s
     * @param memo Optional {@link https://github.com/feross/buffer|Buffer} for the memo field
     */
    constructor(networkid?: number, blockchainid?: Buffer, outs?: Array<TransferableOutput>, ins?: Array<TransferableInput>, memo?: Buffer);
}
//# sourceMappingURL=basetx.d.ts.map