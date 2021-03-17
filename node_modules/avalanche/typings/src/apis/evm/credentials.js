"use strict";
/**
 * @packageDocumentation
 * @module API-EVM-Credentials
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SECPCredential = exports.SelectCredentialClass = void 0;
const constants_1 = require("./constants");
const credentials_1 = require("../../common/credentials");
/**
 * Takes a buffer representing the credential and returns the proper [[Credential]] instance.
 *
 * @param credid A number representing the credential ID parsed prior to the bytes passed in
 *
 * @returns An instance of an [[Credential]]-extended class.
 */
exports.SelectCredentialClass = (credid, ...args) => {
    if (credid === constants_1.EVMConstants.SECPCREDENTIAL) {
        return new SECPCredential(...args);
    }
    /* istanbul ignore next */
    throw new Error(`Error - SelectCredentialClass: unknown credid ${credid}`);
};
class SECPCredential extends credentials_1.Credential {
    constructor() {
        super(...arguments);
        this._typeName = "SECPCredential";
        this._typeID = constants_1.EVMConstants.SECPCREDENTIAL;
    }
    //serialize and deserialize both are inherited
    getCredentialID() {
        return this._typeID;
    }
    clone() {
        let newbase = new SECPCredential();
        newbase.fromBuffer(this.toBuffer());
        return newbase;
    }
    create(...args) {
        return new SECPCredential(...args);
    }
    select(id, ...args) {
        let credential = exports.SelectCredentialClass(id, ...args);
        return credential;
    }
}
exports.SECPCredential = SECPCredential;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlZGVudGlhbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvYXBpcy9ldm0vY3JlZGVudGlhbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7R0FHRzs7O0FBRUgsMkNBQTJDO0FBQzNDLDBEQUFzRDtBQUV0RDs7Ozs7O0dBTUc7QUFDVSxRQUFBLHFCQUFxQixHQUFHLENBQUMsTUFBYyxFQUFFLEdBQUcsSUFBVyxFQUFjLEVBQUU7SUFDbEYsSUFBSSxNQUFNLEtBQUssd0JBQVksQ0FBQyxjQUFjLEVBQUU7UUFDMUMsT0FBTyxJQUFJLGNBQWMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO0tBQ3BDO0lBQ0QsMEJBQTBCO0lBQzFCLE1BQU0sSUFBSSxLQUFLLENBQUMsaURBQWlELE1BQU0sRUFBRSxDQUFDLENBQUM7QUFDN0UsQ0FBQyxDQUFDO0FBRUYsTUFBYSxjQUFlLFNBQVEsd0JBQVU7SUFBOUM7O1FBQ1ksY0FBUyxHQUFXLGdCQUFnQixDQUFDO1FBQ3JDLFlBQU8sR0FBVyx3QkFBWSxDQUFDLGNBQWMsQ0FBQztJQXNCMUQsQ0FBQztJQXBCQyw4Q0FBOEM7SUFFOUMsZUFBZTtRQUNiLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUN0QixDQUFDO0lBRUQsS0FBSztRQUNILElBQUksT0FBTyxHQUFtQixJQUFJLGNBQWMsRUFBRSxDQUFDO1FBQ25ELE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDcEMsT0FBTyxPQUFlLENBQUM7SUFDekIsQ0FBQztJQUVELE1BQU0sQ0FBQyxHQUFHLElBQVc7UUFDbkIsT0FBTyxJQUFJLGNBQWMsQ0FBQyxHQUFHLElBQUksQ0FBUyxDQUFDO0lBQzdDLENBQUM7SUFFRCxNQUFNLENBQUMsRUFBVSxFQUFFLEdBQUcsSUFBVztRQUMvQixJQUFJLFVBQVUsR0FBZSw2QkFBcUIsQ0FBQyxFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUNoRSxPQUFPLFVBQVUsQ0FBQztJQUNwQixDQUFDO0NBQ0Y7QUF4QkQsd0NBd0JDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAcGFja2FnZURvY3VtZW50YXRpb25cbiAqIEBtb2R1bGUgQVBJLUVWTS1DcmVkZW50aWFsc1xuICovXG5cbmltcG9ydCB7IEVWTUNvbnN0YW50cyB9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7IENyZWRlbnRpYWwgfSBmcm9tICcuLi8uLi9jb21tb24vY3JlZGVudGlhbHMnO1xuXG4vKipcbiAqIFRha2VzIGEgYnVmZmVyIHJlcHJlc2VudGluZyB0aGUgY3JlZGVudGlhbCBhbmQgcmV0dXJucyB0aGUgcHJvcGVyIFtbQ3JlZGVudGlhbF1dIGluc3RhbmNlLlxuICpcbiAqIEBwYXJhbSBjcmVkaWQgQSBudW1iZXIgcmVwcmVzZW50aW5nIHRoZSBjcmVkZW50aWFsIElEIHBhcnNlZCBwcmlvciB0byB0aGUgYnl0ZXMgcGFzc2VkIGluXG4gKlxuICogQHJldHVybnMgQW4gaW5zdGFuY2Ugb2YgYW4gW1tDcmVkZW50aWFsXV0tZXh0ZW5kZWQgY2xhc3MuXG4gKi9cbmV4cG9ydCBjb25zdCBTZWxlY3RDcmVkZW50aWFsQ2xhc3MgPSAoY3JlZGlkOiBudW1iZXIsIC4uLmFyZ3M6IGFueVtdKTogQ3JlZGVudGlhbCA9PiB7XG4gIGlmIChjcmVkaWQgPT09IEVWTUNvbnN0YW50cy5TRUNQQ1JFREVOVElBTCkge1xuICAgIHJldHVybiBuZXcgU0VDUENyZWRlbnRpYWwoLi4uYXJncyk7XG4gIH1cbiAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgdGhyb3cgbmV3IEVycm9yKGBFcnJvciAtIFNlbGVjdENyZWRlbnRpYWxDbGFzczogdW5rbm93biBjcmVkaWQgJHtjcmVkaWR9YCk7XG59O1xuXG5leHBvcnQgY2xhc3MgU0VDUENyZWRlbnRpYWwgZXh0ZW5kcyBDcmVkZW50aWFsIHtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZTogc3RyaW5nID0gXCJTRUNQQ3JlZGVudGlhbFwiO1xuICBwcm90ZWN0ZWQgX3R5cGVJRDogbnVtYmVyID0gRVZNQ29uc3RhbnRzLlNFQ1BDUkVERU5USUFMO1xuXG4gIC8vc2VyaWFsaXplIGFuZCBkZXNlcmlhbGl6ZSBib3RoIGFyZSBpbmhlcml0ZWRcblxuICBnZXRDcmVkZW50aWFsSUQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fdHlwZUlEO1xuICB9XG5cbiAgY2xvbmUoKTogdGhpcyB7XG4gICAgbGV0IG5ld2Jhc2U6IFNFQ1BDcmVkZW50aWFsID0gbmV3IFNFQ1BDcmVkZW50aWFsKCk7XG4gICAgbmV3YmFzZS5mcm9tQnVmZmVyKHRoaXMudG9CdWZmZXIoKSk7XG4gICAgcmV0dXJuIG5ld2Jhc2UgYXMgdGhpcztcbiAgfVxuXG4gIGNyZWF0ZSguLi5hcmdzOiBhbnlbXSk6IHRoaXMge1xuICAgIHJldHVybiBuZXcgU0VDUENyZWRlbnRpYWwoLi4uYXJncykgYXMgdGhpcztcbiAgfVxuXG4gIHNlbGVjdChpZDogbnVtYmVyLCAuLi5hcmdzOiBhbnlbXSk6IENyZWRlbnRpYWwge1xuICAgIGxldCBjcmVkZW50aWFsOiBDcmVkZW50aWFsID0gU2VsZWN0Q3JlZGVudGlhbENsYXNzKGlkLCAuLi5hcmdzKTtcbiAgICByZXR1cm4gY3JlZGVudGlhbDtcbiAgfVxufVxuXG4iXX0=