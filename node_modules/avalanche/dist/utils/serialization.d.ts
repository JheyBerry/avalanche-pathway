import { Buffer } from 'buffer/';
export declare const SERIALIZATIONVERSION = 0;
export declare type SerializedType = 'hex' | 'BN' | 'Buffer' | 'bech32' | 'nodeID' | 'privateKey' | 'cb58' | 'base58' | 'base64' | 'decimalString' | 'number' | 'utf8';
export declare type SerializedEncoding = 'hex' | 'cb58' | 'base58' | 'base64' | 'decimalString' | 'number' | 'utf8' | 'display';
export declare abstract class Serializable {
    protected _typeName: string;
    protected _typeID: number;
    protected _codecID: number;
    /**
     * Used in serialization. TypeName is a string name for the type of object being output.
     */
    getTypeName(): string;
    /**
     * Used in serialization. Optional. TypeID is a number for the typeID of object being output.
     */
    getTypeID(): number;
    /**
     * Used in serialization. Optional. TypeID is a number for the typeID of object being output.
     */
    getCodecID(): number;
    serialize(encoding?: SerializedEncoding): object;
    deserialize(fields: object, encoding?: SerializedEncoding): void;
}
export declare class Serialization {
    private static instance;
    private constructor();
    private bintools;
    /**
     * Retrieves the Serialization singleton.
     */
    static getInstance(): Serialization;
    bufferToType(vb: Buffer, type: SerializedType, ...args: Array<any>): any;
    typeToBuffer(v: any, type: SerializedType, ...args: Array<any>): Buffer;
    encoder(value: any, encoding: SerializedEncoding, intype: SerializedType, outtype: SerializedType, ...args: Array<any>): string;
    decoder(value: string, encoding: SerializedEncoding, intype: SerializedType, outtype: SerializedType, ...args: Array<any>): any;
    serialize(serialize: Serializable, vm: string, encoding?: SerializedEncoding, notes?: string): object;
    deserialize(input: object, output: Serializable): void;
}
//# sourceMappingURL=serialization.d.ts.map