/**
 * @packageDocumentation
 * @module API-AVM-ImportTx
 */
import { Buffer } from 'buffer/';
import { TransferableOutput } from './outputs';
import { TransferableInput } from './inputs';
import { BaseTx } from './basetx';
import { Credential } from '../../common/credentials';
import { KeyChain } from './keychain';
import { SerializedEncoding } from '../../utils/serialization';
/**
 * Class representing an unsigned Import transaction.
 */
export declare class ImportTx extends BaseTx {
    protected _typeName: string;
    protected _codecID: number;
    protected _typeID: number;
    serialize(encoding?: SerializedEncoding): object;
    deserialize(fields: object, encoding?: SerializedEncoding): void;
    protected sourceChain: Buffer;
    protected numIns: Buffer;
    protected importIns: Array<TransferableInput>;
    setCodecID(codecID: number): void;
    /**
       * Returns the id of the [[ImportTx]]
       */
    getTxType: () => number;
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} for the source chainid.
     */
    getSourceChain: () => Buffer;
    /**
       * Takes a {@link https://github.com/feross/buffer|Buffer} containing an [[ImportTx]], parses it, populates the class, and returns the length of the [[ImportTx]] in bytes.
       *
       * @param bytes A {@link https://github.com/feross/buffer|Buffer} containing a raw [[ImportTx]]
       *
       * @returns The length of the raw [[ImportTx]]
       *
       * @remarks assume not-checksummed
       */
    fromBuffer(bytes: Buffer, offset?: number): number;
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[ImportTx]].
     */
    toBuffer(): Buffer;
    /**
       * Returns an array of [[TransferableInput]]s in this transaction.
       */
    getImportInputs(): Array<TransferableInput>;
    clone(): this;
    create(...args: any[]): this;
    /**
       * Takes the bytes of an [[UnsignedTx]] and returns an array of [[Credential]]s
       *
       * @param msg A Buffer for the [[UnsignedTx]]
       * @param kc An [[KeyChain]] used in signing
       *
       * @returns An array of [[Credential]]s
       */
    sign(msg: Buffer, kc: KeyChain): Array<Credential>;
    /**
     * Class representing an unsigned Import transaction.
     *
     * @param networkid Optional networkid, [[DefaultNetworkID]]
     * @param blockchainid Optional blockchainid, default Buffer.alloc(32, 16)
     * @param outs Optional array of the [[TransferableOutput]]s
     * @param ins Optional array of the [[TransferableInput]]s
     * @param memo Optional {@link https://github.com/feross/buffer|Buffer} for the memo field
     * @param sourceChain Optional chainid for the source inputs to import. Default platform chainid.
     * @param importIns Array of [[TransferableInput]]s used in the transaction
     */
    constructor(networkid?: number, blockchainid?: Buffer, outs?: Array<TransferableOutput>, ins?: Array<TransferableInput>, memo?: Buffer, sourceChain?: Buffer, importIns?: Array<TransferableInput>);
}
//# sourceMappingURL=importtx.d.ts.map