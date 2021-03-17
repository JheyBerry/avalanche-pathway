/**
 * @packageDocumentation
 * @module API-AVM-MinterSet
 */
import { Buffer } from "buffer/";
import { Serializable, SerializedEncoding } from '../../utils/serialization';
/**
 * Class for representing a threshold and set of minting addresses in Avalanche.
 *
 * @typeparam MinterSet including a threshold and array of addresses
 */
export declare class MinterSet extends Serializable {
    protected _typeName: string;
    protected _typeID: any;
    serialize(encoding?: SerializedEncoding): object;
    deserialize(fields: object, encoding?: SerializedEncoding): void;
    protected threshold: number;
    protected minters: Array<Buffer>;
    /**
     * Returns the threshold.
     */
    getThreshold: () => number;
    /**
     * Returns the minters.
     */
    getMinters: () => Array<Buffer>;
    protected _cleanAddresses: (addresses: Array<string | Buffer>) => Array<Buffer>;
    /**
     *
     * @param threshold The number of signatures required to mint more of an asset by signing a minting transaction
     * @param minters Array of addresss which are authorized to sign a minting transaction
     */
    constructor(threshold: number, minters: Array<string | Buffer>);
}
//# sourceMappingURL=minterset.d.ts.map