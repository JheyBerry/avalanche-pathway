import { Serializable, SerializedEncoding } from '../../utils/serialization';
/**
 * Class representing a base for all transactions.
 */
export declare class Foo extends Serializable {
    protected _typeName: string;
    protected _typeID: number;
    serialize(encoding?: SerializedEncoding): object;
    deserialize(fields: object, encoding?: SerializedEncoding): void;
    protected bar: string;
    /**
     * Class representing a Foo
     *
     * @param bar string
     */
    constructor(bar?: string);
}
//# sourceMappingURL=foo.d.ts.map