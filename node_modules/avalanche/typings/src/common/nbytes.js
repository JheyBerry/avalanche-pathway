"use strict";
/**
 * @packageDocumentation
 * @module Common-NBytes
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NBytes = void 0;
const bintools_1 = __importDefault(require("../utils/bintools"));
const serialization_1 = require("../utils/serialization");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
const serializer = serialization_1.Serialization.getInstance();
/**
 * Abstract class that implements basic functionality for managing a
 * {@link https://github.com/feross/buffer|Buffer} of an exact length.
 *
 * Create a class that extends this one and override bsize to make it validate for exactly
 * the correct length.
 */
class NBytes extends serialization_1.Serializable {
    constructor() {
        super(...arguments);
        this._typeName = "NBytes";
        this._typeID = undefined;
        /**
         * Returns the length of the {@link https://github.com/feross/buffer|Buffer}.
         *
         * @returns The exact length requirement of this class
         */
        this.getSize = () => this.bsize;
    }
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { "bsize": serializer.encoder(this.bsize, encoding, "number", "decimalString", 4), "bytes": serializer.encoder(this.bytes, encoding, "Buffer", "hex", this.bsize) });
    }
    ;
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.bsize = serializer.decoder(fields["bsize"], encoding, "decimalString", "number", 4);
        this.bytes = serializer.decoder(fields["bytes"], encoding, "hex", "Buffer", this.bsize);
    }
    /**
     * Takes a base-58 encoded string, verifies its length, and stores it.
     *
     * @returns The size of the {@link https://github.com/feross/buffer|Buffer}
     */
    fromString(b58str) {
        try {
            this.fromBuffer(bintools.b58ToBuffer(b58str));
        }
        catch (e) {
            /* istanbul ignore next */
            const emsg = `Error - NBytes.fromString: ${e}`;
            /* istanbul ignore next */
            throw new Error(emsg);
        }
        return this.bsize;
    }
    /**
     * Takes a [[Buffer]], verifies its length, and stores it.
     *
     * @returns The size of the {@link https://github.com/feross/buffer|Buffer}
     */
    fromBuffer(buff, offset = 0) {
        try {
            if (buff.length - offset < this.bsize) {
                /* istanbul ignore next */
                throw new Error(`Buffer length must be ${this.bsize} bytes. Only have ${buff.length - offset} remaining in buffer.`);
            }
            this.bytes = bintools.copyFrom(buff, offset, offset + this.bsize);
        }
        catch (e) {
            /* istanbul ignore next */
            const emsg = `Error - NBytes.fromBuffer: ${e}`;
            /* istanbul ignore next */
            throw new Error(emsg);
        }
        return offset + this.bsize;
    }
    /**
     * @returns A reference to the stored {@link https://github.com/feross/buffer|Buffer}
     */
    toBuffer() {
        return this.bytes;
    }
    /**
     * @returns A base-58 string of the stored {@link https://github.com/feross/buffer|Buffer}
     */
    toString() {
        return bintools.bufferToB58(this.toBuffer());
    }
}
exports.NBytes = NBytes;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmJ5dGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1vbi9uYnl0ZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7R0FHRzs7Ozs7O0FBR0gsaUVBQXlDO0FBQ3pDLDBEQUF5RjtBQUd6Rjs7R0FFRztBQUNILE1BQU0sUUFBUSxHQUFZLGtCQUFRLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDakQsTUFBTSxVQUFVLEdBQUcsNkJBQWEsQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUUvQzs7Ozs7O0dBTUc7QUFDSCxNQUFzQixNQUFPLFNBQVEsNEJBQVk7SUFBakQ7O1FBQ1ksY0FBUyxHQUFHLFFBQVEsQ0FBQztRQUNyQixZQUFPLEdBQUcsU0FBUyxDQUFDO1FBbUI5Qjs7OztXQUlHO1FBQ0gsWUFBTyxHQUFHLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7SUEyRDdCLENBQUM7SUFqRkMsU0FBUyxDQUFDLFdBQThCLEtBQUs7UUFDM0MsSUFBSSxNQUFNLEdBQVUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM5Qyx1Q0FDSyxNQUFNLEtBQ1QsT0FBTyxFQUFFLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLGVBQWUsRUFBRSxDQUFDLENBQUMsRUFDL0UsT0FBTyxFQUFFLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQy9FO0lBQ0gsQ0FBQztJQUFBLENBQUM7SUFDRixXQUFXLENBQUMsTUFBYSxFQUFFLFdBQThCLEtBQUs7UUFDNUQsS0FBSyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDcEMsSUFBSSxDQUFDLEtBQUssR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFBRSxRQUFRLEVBQUUsZUFBZSxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN6RixJQUFJLENBQUMsS0FBSyxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMxRixDQUFDO0lBWUQ7Ozs7T0FJRztJQUNILFVBQVUsQ0FBQyxNQUFhO1FBQ3RCLElBQUk7WUFDRixJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztTQUMvQztRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1YsMEJBQTBCO1lBQzFCLE1BQU0sSUFBSSxHQUFVLDhCQUE4QixDQUFDLEVBQUUsQ0FBQztZQUN0RCwwQkFBMEI7WUFDMUIsTUFBTSxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN2QjtRQUNELE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztJQUNwQixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILFVBQVUsQ0FBQyxJQUFXLEVBQUUsU0FBZ0IsQ0FBQztRQUN2QyxJQUFJO1lBQ0YsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxFQUFFO2dCQUNyQywwQkFBMEI7Z0JBQzFCLE1BQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLElBQUksQ0FBQyxLQUFLLHFCQUFxQixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sdUJBQXVCLENBQUMsQ0FBQzthQUN0SDtZQUVELElBQUksQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDbkU7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNWLDBCQUEwQjtZQUMxQixNQUFNLElBQUksR0FBVSw4QkFBOEIsQ0FBQyxFQUFFLENBQUM7WUFDdEQsMEJBQTBCO1lBQzFCLE1BQU0sSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDdkI7UUFDRCxPQUFPLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQzdCLENBQUM7SUFFRDs7T0FFRztJQUNILFFBQVE7UUFDTixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUM7SUFDcEIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsUUFBUTtRQUNOLE9BQU8sUUFBUSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUMvQyxDQUFDO0NBTUY7QUFyRkQsd0JBcUZDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAcGFja2FnZURvY3VtZW50YXRpb25cbiAqIEBtb2R1bGUgQ29tbW9uLU5CeXRlc1xuICovXG5cbmltcG9ydCB7IEJ1ZmZlciB9IGZyb20gJ2J1ZmZlci8nO1xuaW1wb3J0IEJpblRvb2xzIGZyb20gJy4uL3V0aWxzL2JpbnRvb2xzJztcbmltcG9ydCB7IFNlcmlhbGl6YWJsZSwgU2VyaWFsaXphdGlvbiwgU2VyaWFsaXplZEVuY29kaW5nIH0gZnJvbSAnLi4vdXRpbHMvc2VyaWFsaXphdGlvbic7XG5cblxuLyoqXG4gKiBAaWdub3JlXG4gKi9cbmNvbnN0IGJpbnRvb2xzOkJpblRvb2xzID0gQmluVG9vbHMuZ2V0SW5zdGFuY2UoKTtcbmNvbnN0IHNlcmlhbGl6ZXIgPSBTZXJpYWxpemF0aW9uLmdldEluc3RhbmNlKCk7XG5cbi8qKlxuICogQWJzdHJhY3QgY2xhc3MgdGhhdCBpbXBsZW1lbnRzIGJhc2ljIGZ1bmN0aW9uYWxpdHkgZm9yIG1hbmFnaW5nIGFcbiAqIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IG9mIGFuIGV4YWN0IGxlbmd0aC5cbiAqXG4gKiBDcmVhdGUgYSBjbGFzcyB0aGF0IGV4dGVuZHMgdGhpcyBvbmUgYW5kIG92ZXJyaWRlIGJzaXplIHRvIG1ha2UgaXQgdmFsaWRhdGUgZm9yIGV4YWN0bHlcbiAqIHRoZSBjb3JyZWN0IGxlbmd0aC5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIE5CeXRlcyBleHRlbmRzIFNlcmlhbGl6YWJsZSB7XG4gIHByb3RlY3RlZCBfdHlwZU5hbWUgPSBcIk5CeXRlc1wiO1xuICBwcm90ZWN0ZWQgX3R5cGVJRCA9IHVuZGVmaW5lZDtcblxuICBzZXJpYWxpemUoZW5jb2Rpbmc6U2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIik6b2JqZWN0IHtcbiAgICBsZXQgZmllbGRzOm9iamVjdCA9IHN1cGVyLnNlcmlhbGl6ZShlbmNvZGluZyk7XG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLmZpZWxkcyxcbiAgICAgIFwiYnNpemVcIjogc2VyaWFsaXplci5lbmNvZGVyKHRoaXMuYnNpemUsIGVuY29kaW5nLCBcIm51bWJlclwiLCBcImRlY2ltYWxTdHJpbmdcIiwgNCksXG4gICAgICBcImJ5dGVzXCI6IHNlcmlhbGl6ZXIuZW5jb2Rlcih0aGlzLmJ5dGVzLCBlbmNvZGluZywgXCJCdWZmZXJcIiwgXCJoZXhcIiwgdGhpcy5ic2l6ZSlcbiAgICB9XG4gIH07XG4gIGRlc2VyaWFsaXplKGZpZWxkczpvYmplY3QsIGVuY29kaW5nOlNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpIHtcbiAgICBzdXBlci5kZXNlcmlhbGl6ZShmaWVsZHMsIGVuY29kaW5nKTtcbiAgICB0aGlzLmJzaXplID0gc2VyaWFsaXplci5kZWNvZGVyKGZpZWxkc1tcImJzaXplXCJdLCBlbmNvZGluZywgXCJkZWNpbWFsU3RyaW5nXCIsIFwibnVtYmVyXCIsIDQpO1xuICAgIHRoaXMuYnl0ZXMgPSBzZXJpYWxpemVyLmRlY29kZXIoZmllbGRzW1wiYnl0ZXNcIl0sIGVuY29kaW5nLCBcImhleFwiLCBcIkJ1ZmZlclwiLCB0aGlzLmJzaXplKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBieXRlczpCdWZmZXI7XG4gIHByb3RlY3RlZCBic2l6ZTpudW1iZXI7XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGxlbmd0aCBvZiB0aGUge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0uXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSBleGFjdCBsZW5ndGggcmVxdWlyZW1lbnQgb2YgdGhpcyBjbGFzc1xuICAgKi9cbiAgZ2V0U2l6ZSA9ICgpID0+IHRoaXMuYnNpemU7XG5cbiAgLyoqXG4gICAqIFRha2VzIGEgYmFzZS01OCBlbmNvZGVkIHN0cmluZywgdmVyaWZpZXMgaXRzIGxlbmd0aCwgYW5kIHN0b3JlcyBpdC5cbiAgICpcbiAgICogQHJldHVybnMgVGhlIHNpemUgb2YgdGhlIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9XG4gICAqL1xuICBmcm9tU3RyaW5nKGI1OHN0cjpzdHJpbmcpOm51bWJlciB7XG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuZnJvbUJ1ZmZlcihiaW50b29scy5iNThUb0J1ZmZlcihiNThzdHIpKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgY29uc3QgZW1zZzpzdHJpbmcgPSBgRXJyb3IgLSBOQnl0ZXMuZnJvbVN0cmluZzogJHtlfWA7XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGVtc2cpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5ic2l6ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUYWtlcyBhIFtbQnVmZmVyXV0sIHZlcmlmaWVzIGl0cyBsZW5ndGgsIGFuZCBzdG9yZXMgaXQuXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSBzaXplIG9mIHRoZSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfVxuICAgKi9cbiAgZnJvbUJ1ZmZlcihidWZmOkJ1ZmZlciwgb2Zmc2V0Om51bWJlciA9IDApOm51bWJlciB7XG4gICAgdHJ5IHtcbiAgICAgIGlmIChidWZmLmxlbmd0aCAtIG9mZnNldCA8IHRoaXMuYnNpemUpIHtcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBCdWZmZXIgbGVuZ3RoIG11c3QgYmUgJHt0aGlzLmJzaXplfSBieXRlcy4gT25seSBoYXZlICR7YnVmZi5sZW5ndGggLSBvZmZzZXR9IHJlbWFpbmluZyBpbiBidWZmZXIuYCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYnl0ZXMgPSBiaW50b29scy5jb3B5RnJvbShidWZmLCBvZmZzZXQsIG9mZnNldCArIHRoaXMuYnNpemUpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICBjb25zdCBlbXNnOnN0cmluZyA9IGBFcnJvciAtIE5CeXRlcy5mcm9tQnVmZmVyOiAke2V9YDtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoZW1zZyk7XG4gICAgfVxuICAgIHJldHVybiBvZmZzZXQgKyB0aGlzLmJzaXplO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm5zIEEgcmVmZXJlbmNlIHRvIHRoZSBzdG9yZWQge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn1cbiAgICovXG4gIHRvQnVmZmVyKCk6QnVmZmVyIHtcbiAgICByZXR1cm4gdGhpcy5ieXRlcztcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJucyBBIGJhc2UtNTggc3RyaW5nIG9mIHRoZSBzdG9yZWQge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn1cbiAgICovXG4gIHRvU3RyaW5nKCk6c3RyaW5nIHtcbiAgICByZXR1cm4gYmludG9vbHMuYnVmZmVyVG9CNTgodGhpcy50b0J1ZmZlcigpKTtcbiAgfVxuXG4gIGFic3RyYWN0IGNsb25lKCk6dGhpcztcblxuICBhYnN0cmFjdCBjcmVhdGUoLi4uYXJnczphbnlbXSk6dGhpcztcbiAgXG59Il19