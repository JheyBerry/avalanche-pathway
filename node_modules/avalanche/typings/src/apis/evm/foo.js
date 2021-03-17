"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Foo = void 0;
const bintools_1 = __importDefault(require("../../utils/bintools"));
const constants_1 = require("./constants");
const serialization_1 = require("../../utils/serialization");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
const serializer = serialization_1.Serialization.getInstance();
/**
 * Class representing a base for all transactions.
 */
class Foo extends serialization_1.Serializable {
    /**
     * Class representing a Foo
     *
     * @param bar string
     */
    constructor(bar = "") {
        super();
        this._typeName = "FOO";
        this._typeID = constants_1.EVMConstants.BASETX;
        this.bar = bar;
    }
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { "bar": serializer.encoder(this.bar, encoding, "utf8", "utf8") });
    }
    ;
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        console.log(fields);
        console.log(fields["bar"]);
        this.bar = serializer.decoder(fields["bar"], encoding, "utf8", "utf8");
    }
}
exports.Foo = Foo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9vLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2FwaXMvZXZtL2Zvby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFLQSxvRUFBNEM7QUFDNUMsMkNBQTJDO0FBUzNDLDZEQUE0RjtBQUU1Rjs7R0FFRztBQUNILE1BQU0sUUFBUSxHQUFHLGtCQUFRLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDeEMsTUFBTSxVQUFVLEdBQUcsNkJBQWEsQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUUvQzs7R0FFRztBQUNILE1BQWEsR0FBSSxTQUFRLDRCQUFZO0lBcUJuQzs7OztPQUlHO0lBQ0gsWUFBWSxNQUFjLEVBQUU7UUFDMUIsS0FBSyxFQUFFLENBQUM7UUExQkEsY0FBUyxHQUFHLEtBQUssQ0FBQztRQUNsQixZQUFPLEdBQUcsd0JBQVksQ0FBQyxNQUFNLENBQUM7UUEwQnRDLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO0lBQ2pCLENBQUM7SUF6QkQsU0FBUyxDQUFDLFdBQThCLEtBQUs7UUFDM0MsSUFBSSxNQUFNLEdBQVUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM5Qyx1Q0FDSyxNQUFNLEtBQ1QsS0FBSyxFQUFFLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxJQUM5RDtJQUNILENBQUM7SUFBQSxDQUFDO0lBRUYsV0FBVyxDQUFDLE1BQWEsRUFBRSxXQUE4QixLQUFLO1FBQzVELEtBQUssQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3BDLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUE7UUFDbkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQTtRQUMxQixJQUFJLENBQUMsR0FBRyxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDekUsQ0FBQztDQWFGO0FBOUJELGtCQThCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQHBhY2thZ2VEb2N1bWVudGF0aW9uXG4gKiBAbW9kdWxlIEFQSS1FVk0tQmFzZVR4XG4gKi9cbmltcG9ydCB7IEJ1ZmZlciB9IGZyb20gJ2J1ZmZlci8nO1xuaW1wb3J0IEJpblRvb2xzIGZyb20gJy4uLy4uL3V0aWxzL2JpbnRvb2xzJztcbmltcG9ydCB7IEVWTUNvbnN0YW50cyB9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7IFRyYW5zZmVyYWJsZU91dHB1dCB9IGZyb20gJy4vb3V0cHV0cyc7XG5pbXBvcnQgeyBUcmFuc2ZlcmFibGVJbnB1dCB9IGZyb20gJy4vaW5wdXRzJztcbmltcG9ydCB7IFNlbGVjdENyZWRlbnRpYWxDbGFzcyB9IGZyb20gJy4vY3JlZGVudGlhbHMnO1xuaW1wb3J0IHsgS2V5Q2hhaW4sIEtleVBhaXIgfSBmcm9tICcuL2tleWNoYWluJztcbmltcG9ydCB7IFN0YW5kYXJkQmFzZVR4IH0gZnJvbSAnLi4vLi4vY29tbW9uL3R4JztcbmltcG9ydCB7IFNpZ25hdHVyZSwgU2lnSWR4LCBDcmVkZW50aWFsIH0gZnJvbSAnLi4vLi4vY29tbW9uL2NyZWRlbnRpYWxzJztcbmltcG9ydCB7IERlZmF1bHROZXR3b3JrSUQgfSBmcm9tICcuLi8uLi91dGlscy9jb25zdGFudHMnO1xuaW1wb3J0IHsgU2VsZWN0VHhDbGFzcyB9IGZyb20gJy4vdHgnO1xuaW1wb3J0IHsgU2VyaWFsaXphYmxlLCBTZXJpYWxpemF0aW9uLCBTZXJpYWxpemVkRW5jb2RpbmcgfSBmcm9tICcuLi8uLi91dGlscy9zZXJpYWxpemF0aW9uJztcblxuLyoqXG4gKiBAaWdub3JlXG4gKi9cbmNvbnN0IGJpbnRvb2xzID0gQmluVG9vbHMuZ2V0SW5zdGFuY2UoKTtcbmNvbnN0IHNlcmlhbGl6ZXIgPSBTZXJpYWxpemF0aW9uLmdldEluc3RhbmNlKCk7XG5cbi8qKlxuICogQ2xhc3MgcmVwcmVzZW50aW5nIGEgYmFzZSBmb3IgYWxsIHRyYW5zYWN0aW9ucy5cbiAqL1xuZXhwb3J0IGNsYXNzIEZvbyBleHRlbmRzIFNlcmlhbGl6YWJsZXtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiRk9PXCI7XG4gIHByb3RlY3RlZCBfdHlwZUlEID0gRVZNQ29uc3RhbnRzLkJBU0VUWDtcblxuICBzZXJpYWxpemUoZW5jb2Rpbmc6U2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIik6b2JqZWN0IHtcbiAgICBsZXQgZmllbGRzOm9iamVjdCA9IHN1cGVyLnNlcmlhbGl6ZShlbmNvZGluZyk7XG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLmZpZWxkcyxcbiAgICAgIFwiYmFyXCI6IHNlcmlhbGl6ZXIuZW5jb2Rlcih0aGlzLmJhciwgZW5jb2RpbmcsIFwidXRmOFwiLCBcInV0ZjhcIilcbiAgICB9XG4gIH07XG5cbiAgZGVzZXJpYWxpemUoZmllbGRzOm9iamVjdCwgZW5jb2Rpbmc6U2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIikge1xuICAgIHN1cGVyLmRlc2VyaWFsaXplKGZpZWxkcywgZW5jb2RpbmcpO1xuICAgIGNvbnNvbGUubG9nKGZpZWxkcylcbiAgICBjb25zb2xlLmxvZyhmaWVsZHNbXCJiYXJcIl0pXG4gICAgdGhpcy5iYXIgPSBzZXJpYWxpemVyLmRlY29kZXIoZmllbGRzW1wiYmFyXCJdLCBlbmNvZGluZywgXCJ1dGY4XCIsIFwidXRmOFwiKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBiYXI6IHN0cmluZztcblxuICAvKipcbiAgICogQ2xhc3MgcmVwcmVzZW50aW5nIGEgRm9vIFxuICAgKlxuICAgKiBAcGFyYW0gYmFyIHN0cmluZ1xuICAgKi9cbiAgY29uc3RydWN0b3IoYmFyOiBzdHJpbmcgPSBcIlwiKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmJhciA9IGJhcjtcbiAgfVxufSJdfQ==