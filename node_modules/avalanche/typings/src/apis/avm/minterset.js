"use strict";
/**
 * @packageDocumentation
 * @module API-AVM-MinterSet
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MinterSet = void 0;
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("../../utils/bintools"));
const serialization_1 = require("../../utils/serialization");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
const serializer = serialization_1.Serialization.getInstance();
/**
 * Class for representing a threshold and set of minting addresses in Avalanche.
 *
 * @typeparam MinterSet including a threshold and array of addresses
 */
class MinterSet extends serialization_1.Serializable {
    /**
     *
     * @param threshold The number of signatures required to mint more of an asset by signing a minting transaction
     * @param minters Array of addresss which are authorized to sign a minting transaction
     */
    constructor(threshold, minters) {
        super();
        this._typeName = "MinterSet";
        this._typeID = undefined;
        this.minters = [];
        /**
         * Returns the threshold.
         */
        this.getThreshold = () => {
            return this.threshold;
        };
        /**
         * Returns the minters.
         */
        this.getMinters = () => {
            return this.minters;
        };
        this._cleanAddresses = (addresses) => {
            let addrs = [];
            for (let i = 0; i < addresses.length; i++) {
                if (typeof addresses[i] === "string") {
                    addrs.push(bintools.stringToAddress(addresses[i]));
                }
                else if (addresses[i] instanceof buffer_1.Buffer) {
                    addrs.push(addresses[i]);
                }
            }
            return addrs;
        };
        this.threshold = threshold;
        this.minters = this._cleanAddresses(minters);
    }
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { "threshold": serializer.encoder(this.threshold, encoding, "number", "decimalString", 4), "minters": this.minters.map((m) => serializer.encoder(m, encoding, "Buffer", "cb58", 20)) });
    }
    ;
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.threshold = serializer.decoder(fields["threshold"], encoding, "decimalString", "number", 4);
        this.minters = fields["minters"].map((m) => serializer.decoder(m, encoding, "cb58", "Buffer", 20));
    }
}
exports.MinterSet = MinterSet;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWludGVyc2V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2FwaXMvYXZtL21pbnRlcnNldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztHQUdHOzs7Ozs7QUFFSCxvQ0FBaUM7QUFDakMsb0VBQTZDO0FBQzdDLDZEQUE0RjtBQUU1Rjs7R0FFRztBQUNILE1BQU0sUUFBUSxHQUFHLGtCQUFRLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDeEMsTUFBTSxVQUFVLEdBQUcsNkJBQWEsQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUUvQzs7OztHQUlHO0FBQ0gsTUFBYSxTQUFVLFNBQVEsNEJBQVk7SUErQ3ZDOzs7O09BSUc7SUFDSCxZQUFZLFNBQWdCLEVBQUUsT0FBNEI7UUFDdEQsS0FBSyxFQUFFLENBQUM7UUFwREYsY0FBUyxHQUFHLFdBQVcsQ0FBQztRQUN4QixZQUFPLEdBQUcsU0FBUyxDQUFDO1FBaUJwQixZQUFPLEdBQWlCLEVBQUUsQ0FBQztRQUVyQzs7V0FFRztRQUNILGlCQUFZLEdBQUcsR0FBVSxFQUFFO1lBQ3ZCLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUMxQixDQUFDLENBQUE7UUFFRDs7V0FFRztRQUNILGVBQVUsR0FBRyxHQUFpQixFQUFFO1lBQzVCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUN4QixDQUFDLENBQUE7UUFFVSxvQkFBZSxHQUFHLENBQUMsU0FBOEIsRUFBZ0IsRUFBRTtZQUMxRSxJQUFJLEtBQUssR0FBaUIsRUFBRSxDQUFDO1lBQzdCLEtBQUksSUFBSSxDQUFDLEdBQVUsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUM3QyxJQUFHLE9BQU8sU0FBUyxDQUFDLENBQUMsQ0FBQyxLQUFLLFFBQVEsRUFBRTtvQkFDakMsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQVcsQ0FBQyxDQUFDLENBQUM7aUJBQ2hFO3FCQUFNLElBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxZQUFZLGVBQU0sRUFBRTtvQkFDdEMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFXLENBQUMsQ0FBQztpQkFDdEM7YUFDSjtZQUNELE9BQU8sS0FBSyxDQUFDO1FBQ2pCLENBQUMsQ0FBQTtRQVNHLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQzNCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBcERELFNBQVMsQ0FBQyxXQUE4QixLQUFLO1FBQ3pDLElBQUksTUFBTSxHQUFVLEtBQUssQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDOUMsdUNBQ08sTUFBTSxLQUNULFdBQVcsRUFBRSxVQUFVLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxlQUFlLEVBQUUsQ0FBQyxDQUFDLEVBQ3ZGLFNBQVMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUMsSUFDNUY7SUFDTCxDQUFDO0lBQUEsQ0FBQztJQUNGLFdBQVcsQ0FBQyxNQUFhLEVBQUUsV0FBOEIsS0FBSztRQUMxRCxLQUFLLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztRQUNwQyxJQUFJLENBQUMsU0FBUyxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUFFLFFBQVEsRUFBRSxlQUFlLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2pHLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQVEsRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUM5RyxDQUFDO0NBeUNKO0FBekRELDhCQXlEQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQHBhY2thZ2VEb2N1bWVudGF0aW9uXG4gKiBAbW9kdWxlIEFQSS1BVk0tTWludGVyU2V0XG4gKi9cblxuaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSBcImJ1ZmZlci9cIjtcbmltcG9ydCBCaW5Ub29scyAgZnJvbSAnLi4vLi4vdXRpbHMvYmludG9vbHMnO1xuaW1wb3J0IHsgU2VyaWFsaXphYmxlLCBTZXJpYWxpemF0aW9uLCBTZXJpYWxpemVkRW5jb2RpbmcgfSBmcm9tICcuLi8uLi91dGlscy9zZXJpYWxpemF0aW9uJztcblxuLyoqXG4gKiBAaWdub3JlXG4gKi9cbmNvbnN0IGJpbnRvb2xzID0gQmluVG9vbHMuZ2V0SW5zdGFuY2UoKTtcbmNvbnN0IHNlcmlhbGl6ZXIgPSBTZXJpYWxpemF0aW9uLmdldEluc3RhbmNlKCk7XG5cbi8qKlxuICogQ2xhc3MgZm9yIHJlcHJlc2VudGluZyBhIHRocmVzaG9sZCBhbmQgc2V0IG9mIG1pbnRpbmcgYWRkcmVzc2VzIGluIEF2YWxhbmNoZS4gXG4gKiBcbiAqIEB0eXBlcGFyYW0gTWludGVyU2V0IGluY2x1ZGluZyBhIHRocmVzaG9sZCBhbmQgYXJyYXkgb2YgYWRkcmVzc2VzXG4gKi9cbmV4cG9ydCBjbGFzcyBNaW50ZXJTZXQgZXh0ZW5kcyBTZXJpYWxpemFibGV7XG4gICAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiTWludGVyU2V0XCI7XG4gICAgcHJvdGVjdGVkIF90eXBlSUQgPSB1bmRlZmluZWQ7XG5cbiAgICBzZXJpYWxpemUoZW5jb2Rpbmc6U2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIik6b2JqZWN0IHtcbiAgICAgICAgbGV0IGZpZWxkczpvYmplY3QgPSBzdXBlci5zZXJpYWxpemUoZW5jb2RpbmcpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgLi4uZmllbGRzLFxuICAgICAgICAgICAgXCJ0aHJlc2hvbGRcIjogc2VyaWFsaXplci5lbmNvZGVyKHRoaXMudGhyZXNob2xkLCBlbmNvZGluZywgXCJudW1iZXJcIiwgXCJkZWNpbWFsU3RyaW5nXCIsIDQpLFxuICAgICAgICAgICAgXCJtaW50ZXJzXCI6IHRoaXMubWludGVycy5tYXAoKG0pID0+IHNlcmlhbGl6ZXIuZW5jb2RlcihtLCBlbmNvZGluZywgXCJCdWZmZXJcIiwgXCJjYjU4XCIsIDIwKSlcbiAgICAgICAgfVxuICAgIH07XG4gICAgZGVzZXJpYWxpemUoZmllbGRzOm9iamVjdCwgZW5jb2Rpbmc6U2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIikge1xuICAgICAgICBzdXBlci5kZXNlcmlhbGl6ZShmaWVsZHMsIGVuY29kaW5nKTtcbiAgICAgICAgdGhpcy50aHJlc2hvbGQgPSBzZXJpYWxpemVyLmRlY29kZXIoZmllbGRzW1widGhyZXNob2xkXCJdLCBlbmNvZGluZywgXCJkZWNpbWFsU3RyaW5nXCIsIFwibnVtYmVyXCIsIDQpO1xuICAgICAgICB0aGlzLm1pbnRlcnMgPSBmaWVsZHNbXCJtaW50ZXJzXCJdLm1hcCgobTpzdHJpbmcpID0+IHNlcmlhbGl6ZXIuZGVjb2RlcihtLCBlbmNvZGluZywgXCJjYjU4XCIsIFwiQnVmZmVyXCIsIDIwKSk7XG4gICAgfVxuICBcbiAgICBwcm90ZWN0ZWQgdGhyZXNob2xkOm51bWJlcjtcbiAgICBwcm90ZWN0ZWQgbWludGVyczpBcnJheTxCdWZmZXI+ID0gW107XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSB0aHJlc2hvbGQuXG4gICAgICovXG4gICAgZ2V0VGhyZXNob2xkID0gKCk6bnVtYmVyID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGhyZXNob2xkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIG1pbnRlcnMuXG4gICAgICovXG4gICAgZ2V0TWludGVycyA9ICgpOkFycmF5PEJ1ZmZlcj4gPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5taW50ZXJzO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCAgX2NsZWFuQWRkcmVzc2VzID0gKGFkZHJlc3NlczpBcnJheTxzdHJpbmd8QnVmZmVyPik6QXJyYXk8QnVmZmVyPiA9PiB7XG4gICAgICAgIGxldCBhZGRyczpBcnJheTxCdWZmZXI+ID0gW107XG4gICAgICAgIGZvcihsZXQgaTpudW1iZXIgPSAwOyBpIDwgYWRkcmVzc2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZih0eXBlb2YgYWRkcmVzc2VzW2ldID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgYWRkcnMucHVzaChiaW50b29scy5zdHJpbmdUb0FkZHJlc3MoYWRkcmVzc2VzW2ldIGFzIHN0cmluZykpO1xuICAgICAgICAgICAgfSBlbHNlIGlmKGFkZHJlc3Nlc1tpXSBpbnN0YW5jZW9mIEJ1ZmZlcikge1xuICAgICAgICAgICAgICAgIGFkZHJzLnB1c2goYWRkcmVzc2VzW2ldIGFzIEJ1ZmZlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFkZHJzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB0aHJlc2hvbGQgVGhlIG51bWJlciBvZiBzaWduYXR1cmVzIHJlcXVpcmVkIHRvIG1pbnQgbW9yZSBvZiBhbiBhc3NldCBieSBzaWduaW5nIGEgbWludGluZyB0cmFuc2FjdGlvblxuICAgICAqIEBwYXJhbSBtaW50ZXJzIEFycmF5IG9mIGFkZHJlc3NzIHdoaWNoIGFyZSBhdXRob3JpemVkIHRvIHNpZ24gYSBtaW50aW5nIHRyYW5zYWN0aW9uXG4gICAgICovXG4gICAgY29uc3RydWN0b3IodGhyZXNob2xkOm51bWJlciwgbWludGVyczpBcnJheTxzdHJpbmd8QnVmZmVyPikge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLnRocmVzaG9sZCA9IHRocmVzaG9sZDtcbiAgICAgICAgdGhpcy5taW50ZXJzID0gdGhpcy5fY2xlYW5BZGRyZXNzZXMobWludGVycyk7XG4gICAgfVxufSJdfQ==