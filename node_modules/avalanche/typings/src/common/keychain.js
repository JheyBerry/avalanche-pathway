"use strict";
/**
 * @packageDocumentation
 * @module Common-KeyChain
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StandardKeyChain = exports.StandardKeyPair = void 0;
const buffer_1 = require("buffer/");
/**
 * Class for representing a private and public keypair in Avalanche.
 * All APIs that need key pairs should extend on this class.
 */
class StandardKeyPair {
    constructor() {
        /**
           * Returns a reference to the private key.
           *
           * @returns A {@link https://github.com/feross/buffer|Buffer} containing the private key
           */
        this.getPrivateKey = () => this.privk;
        /**
           * Returns a reference to the public key.
           *
           * @returns A {@link https://github.com/feross/buffer|Buffer} containing the public key
           */
        this.getPublicKey = () => this.pubk;
    }
}
exports.StandardKeyPair = StandardKeyPair;
/**
 * Class for representing a key chain in Avalanche.
 * All endpoints that need key chains should extend on this class.
 *
 * @typeparam KPClass extending [[StandardKeyPair]] which is used as the key in [[StandardKeyChain]]
 */
class StandardKeyChain {
    constructor() {
        this.keys = {};
        /**
           * Gets an array of addresses stored in the [[StandardKeyChain]].
           *
           * @returns An array of {@link https://github.com/feross/buffer|Buffer}  representations
           * of the addresses
           */
        this.getAddresses = () => Object.values(this.keys).map((kp) => kp.getAddress());
        /**
           * Gets an array of addresses stored in the [[StandardKeyChain]].
           *
           * @returns An array of string representations of the addresses
           */
        this.getAddressStrings = () => Object.values(this.keys)
            .map((kp) => kp.getAddressString());
        /**
           * Removes the key pair from the list of they keys managed in the [[StandardKeyChain]].
           *
           * @param key A {@link https://github.com/feross/buffer|Buffer} for the address or
           * KPClass to remove
           *
           * @returns The boolean true if a key was removed.
           */
        this.removeKey = (key) => {
            let kaddr;
            if (key instanceof buffer_1.Buffer) {
                kaddr = key.toString('hex');
            }
            else {
                kaddr = key.getAddress().toString('hex');
            }
            if (kaddr in this.keys) {
                delete this.keys[kaddr];
                return true;
            }
            return false;
        };
        /**
           * Checks if there is a key associated with the provided address.
           *
           * @param address The address to check for existence in the keys database
           *
           * @returns True on success, false if not found
           */
        this.hasKey = (address) => (address.toString('hex') in this.keys);
        /**
           * Returns the [[StandardKeyPair]] listed under the provided address
           *
           * @param address The {@link https://github.com/feross/buffer|Buffer} of the address to
           * retrieve from the keys database
           *
           * @returns A reference to the [[StandardKeyPair]] in the keys database
           */
        this.getKey = (address) => this.keys[address.toString('hex')];
    }
    /**
       * Adds the key pair to the list of the keys managed in the [[StandardKeyChain]].
       *
       * @param newKey A key pair of the appropriate class to be added to the [[StandardKeyChain]]
       */
    addKey(newKey) {
        this.keys[newKey.getAddress().toString('hex')] = newKey;
    }
    ;
}
exports.StandardKeyChain = StandardKeyChain;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5Y2hhaW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbW9uL2tleWNoYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O0dBR0c7OztBQUVILG9DQUFpQztBQUVqQzs7O0dBR0c7QUFDSCxNQUFzQixlQUFlO0lBQXJDO1FBb0RJOzs7O2FBSUs7UUFDTCxrQkFBYSxHQUFHLEdBQVUsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7UUFFeEM7Ozs7YUFJSztRQUNMLGlCQUFZLEdBQUcsR0FBVSxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztJQWtDeEMsQ0FBQztDQUFBO0FBbEdILDBDQWtHRztBQUVEOzs7OztHQUtHO0FBQ0gsTUFBc0IsZ0JBQWdCO0lBQXRDO1FBQ1ksU0FBSSxHQUFnQyxFQUFFLENBQUM7UUFrQmpEOzs7OzthQUtLO1FBQ0wsaUJBQVksR0FBRyxHQUFpQixFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztRQUV6Rjs7OzthQUlLO1FBQ0wsc0JBQWlCLEdBQUcsR0FBaUIsRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQzthQUM3RCxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUM7UUFXdEM7Ozs7Ozs7YUFPSztRQUNMLGNBQVMsR0FBRyxDQUFDLEdBQW9CLEVBQUUsRUFBRTtZQUNuQyxJQUFJLEtBQVksQ0FBQztZQUNqQixJQUFJLEdBQUcsWUFBWSxlQUFNLEVBQUU7Z0JBQ3pCLEtBQUssR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQzdCO2lCQUFNO2dCQUNMLEtBQUssR0FBRyxHQUFHLENBQUMsVUFBVSxFQUFFLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQzFDO1lBQ0QsSUFBSSxLQUFLLElBQUksSUFBSSxDQUFDLElBQUksRUFBRTtnQkFDdEIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUN4QixPQUFPLElBQUksQ0FBQzthQUNiO1lBQ0QsT0FBTyxLQUFLLENBQUM7UUFDZixDQUFDLENBQUM7UUFFRjs7Ozs7O2FBTUs7UUFDTCxXQUFNLEdBQUcsQ0FBQyxPQUFjLEVBQVUsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFNUU7Ozs7Ozs7YUFPSztRQUNMLFdBQU0sR0FBRyxDQUFDLE9BQWMsRUFBVyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFRM0UsQ0FBQztJQXhEQzs7OztTQUlLO0lBQ0wsTUFBTSxDQUFDLE1BQWM7UUFDbkIsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDO0lBQzFELENBQUM7SUFBQSxDQUFDO0NBaURIO0FBM0ZELDRDQTJGQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQHBhY2thZ2VEb2N1bWVudGF0aW9uXG4gKiBAbW9kdWxlIENvbW1vbi1LZXlDaGFpblxuICovXG5cbmltcG9ydCB7IEJ1ZmZlciB9IGZyb20gXCJidWZmZXIvXCI7XG5cbi8qKlxuICogQ2xhc3MgZm9yIHJlcHJlc2VudGluZyBhIHByaXZhdGUgYW5kIHB1YmxpYyBrZXlwYWlyIGluIEF2YWxhbmNoZS4gXG4gKiBBbGwgQVBJcyB0aGF0IG5lZWQga2V5IHBhaXJzIHNob3VsZCBleHRlbmQgb24gdGhpcyBjbGFzcy5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFN0YW5kYXJkS2V5UGFpciB7XG4gICAgcHJvdGVjdGVkIHB1Yms6QnVmZmVyO1xuICAgIHByb3RlY3RlZCBwcml2azpCdWZmZXI7XG4gIFxuICAgIC8qKlxuICAgICAgICogR2VuZXJhdGVzIGEgbmV3IGtleXBhaXIuXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIGVudHJvcHkgT3B0aW9uYWwgcGFyYW1ldGVyIHRoYXQgbWF5IGJlIG5lY2Vzc2FyeSB0byBwcm9kdWNlIHNlY3VyZSBrZXlzXG4gICAgICAgKi9cbiAgICBnZW5lcmF0ZUtleTooZW50cm9weT86QnVmZmVyKSA9PiB2b2lkO1xuICBcbiAgICAvKipcbiAgICAgICAqIEltcG9ydHMgYSBwcml2YXRlIGtleSBhbmQgZ2VuZXJhdGVzIHRoZSBhcHByb3ByaWF0ZSBwdWJsaWMga2V5LlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSBwcml2ayBBIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHJlcHJlc2VudGluZyB0aGUgcHJpdmF0ZSBrZXlcbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJucyB0cnVlIG9uIHN1Y2Nlc3MsIGZhbHNlIG9uIGZhaWx1cmVcbiAgICAgICAqL1xuICAgIGltcG9ydEtleToocHJpdms6QnVmZmVyKSA9PiBib29sZWFuO1xuICBcbiAgICAvKipcbiAgICAgICAqIFRha2VzIGEgbWVzc2FnZSwgc2lnbnMgaXQsIGFuZCByZXR1cm5zIHRoZSBzaWduYXR1cmUuXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIG1zZyBUaGUgbWVzc2FnZSB0byBzaWduXG4gICAgICAgKlxuICAgICAgICogQHJldHVybnMgQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBjb250YWluaW5nIHRoZSBzaWduYXR1cmVcbiAgICAgICAqL1xuICAgIHNpZ246KG1zZzpCdWZmZXIpID0+IEJ1ZmZlcjtcbiAgXG4gICAgLyoqXG4gICAgICAgKiBSZWNvdmVycyB0aGUgcHVibGljIGtleSBvZiBhIG1lc3NhZ2Ugc2lnbmVyIGZyb20gYSBtZXNzYWdlIGFuZCBpdHMgYXNzb2NpYXRlZCBzaWduYXR1cmUuXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIG1zZyBUaGUgbWVzc2FnZSB0aGF0J3Mgc2lnbmVkXG4gICAgICAgKiBAcGFyYW0gc2lnIFRoZSBzaWduYXR1cmUgdGhhdCdzIHNpZ25lZCBvbiB0aGUgbWVzc2FnZVxuICAgICAgICpcbiAgICAgICAqIEByZXR1cm5zIEEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gY29udGFpbmluZyB0aGUgcHVibGljXG4gICAgICAgKiBrZXkgb2YgdGhlIHNpZ25lclxuICAgICAgICovXG4gICAgcmVjb3ZlcjoobXNnOkJ1ZmZlciwgc2lnOkJ1ZmZlcikgPT4gQnVmZmVyO1xuICBcbiAgICAvKipcbiAgICAgICAqIFZlcmlmaWVzIHRoYXQgdGhlIHByaXZhdGUga2V5IGFzc29jaWF0ZWQgd2l0aCB0aGUgcHJvdmlkZWQgcHVibGljIGtleSBwcm9kdWNlcyB0aGVcbiAgICAgICAqIHNpZ25hdHVyZSBhc3NvY2lhdGVkIHdpdGggdGhlIGdpdmVuIG1lc3NhZ2UuXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIG1zZyBUaGUgbWVzc2FnZSBhc3NvY2lhdGVkIHdpdGggdGhlIHNpZ25hdHVyZVxuICAgICAgICogQHBhcmFtIHNpZyBUaGUgc2lnbmF0dXJlIG9mIHRoZSBzaWduZWQgbWVzc2FnZVxuICAgICAgICogQHBhcmFtIHB1YmsgVGhlIHB1YmxpYyBrZXkgYXNzb2NpYXRlZCB3aXRoIHRoZSBtZXNzYWdlIHNpZ25hdHVyZVxuICAgICAgICpcbiAgICAgICAqIEByZXR1cm5zIFRydWUgb24gc3VjY2VzcywgZmFsc2Ugb24gZmFpbHVyZVxuICAgICAgICovXG4gICAgdmVyaWZ5Oihtc2c6QnVmZmVyLCBzaWc6QnVmZmVyLCBwdWJrOkJ1ZmZlcikgPT4gYm9vbGVhbjtcbiAgXG4gICAgLyoqXG4gICAgICAgKiBSZXR1cm5zIGEgcmVmZXJlbmNlIHRvIHRoZSBwcml2YXRlIGtleS5cbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJucyBBIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IGNvbnRhaW5pbmcgdGhlIHByaXZhdGUga2V5XG4gICAgICAgKi9cbiAgICBnZXRQcml2YXRlS2V5ID0gKCk6QnVmZmVyID0+IHRoaXMucHJpdms7XG4gIFxuICAgIC8qKlxuICAgICAgICogUmV0dXJucyBhIHJlZmVyZW5jZSB0byB0aGUgcHVibGljIGtleS5cbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJucyBBIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IGNvbnRhaW5pbmcgdGhlIHB1YmxpYyBrZXlcbiAgICAgICAqL1xuICAgIGdldFB1YmxpY0tleSA9ICgpOkJ1ZmZlciA9PiB0aGlzLnB1Yms7XG4gIFxuICAgIC8qKlxuICAgICAgICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgcHJpdmF0ZSBrZXkuXG4gICAgICAgKlxuICAgICAgICogQHJldHVybnMgQSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHB1YmxpYyBrZXlcbiAgICAgICAqL1xuICAgIGdldFByaXZhdGVLZXlTdHJpbmc6KCkgPT4gc3RyaW5nO1xuICBcbiAgICAvKipcbiAgICAgICAqIFJldHVybnMgdGhlIHB1YmxpYyBrZXkuXG4gICAgICAgKlxuICAgICAgICogQHJldHVybnMgQSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHB1YmxpYyBrZXlcbiAgICAgICAqL1xuICAgIGdldFB1YmxpY0tleVN0cmluZzooKSA9PiBzdHJpbmc7XG4gIFxuICAgIC8qKlxuICAgICAgICogUmV0dXJucyB0aGUgYWRkcmVzcy5cbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJucyBBIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9ICByZXByZXNlbnRhdGlvbiBvZiB0aGUgYWRkcmVzc1xuICAgICAgICovXG4gICAgZ2V0QWRkcmVzczooKSA9PiBCdWZmZXI7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBhZGRyZXNzJ3Mgc3RyaW5nIHJlcHJlc2VudGF0aW9uLlxuICAgICAqIFxuICAgICAqIEByZXR1cm5zIEEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBhZGRyZXNzXG4gICAgICovXG4gICAgZ2V0QWRkcmVzc1N0cmluZzooKSA9PiBzdHJpbmdcblxuICAgIGFic3RyYWN0IGNyZWF0ZSguLi5hcmdzOmFueVtdKTp0aGlzO1xuXG4gICAgYWJzdHJhY3QgY2xvbmUoKTp0aGlzO1xuICBcbiAgfVxuICBcbiAgLyoqXG4gICAqIENsYXNzIGZvciByZXByZXNlbnRpbmcgYSBrZXkgY2hhaW4gaW4gQXZhbGFuY2hlLlxuICAgKiBBbGwgZW5kcG9pbnRzIHRoYXQgbmVlZCBrZXkgY2hhaW5zIHNob3VsZCBleHRlbmQgb24gdGhpcyBjbGFzcy5cbiAgICpcbiAgICogQHR5cGVwYXJhbSBLUENsYXNzIGV4dGVuZGluZyBbW1N0YW5kYXJkS2V5UGFpcl1dIHdoaWNoIGlzIHVzZWQgYXMgdGhlIGtleSBpbiBbW1N0YW5kYXJkS2V5Q2hhaW5dXVxuICAgKi9cbiAgZXhwb3J0IGFic3RyYWN0IGNsYXNzIFN0YW5kYXJkS2V5Q2hhaW48S1BDbGFzcyBleHRlbmRzIFN0YW5kYXJkS2V5UGFpcj4ge1xuICAgIHByb3RlY3RlZCBrZXlzOntbYWRkcmVzczogc3RyaW5nXTogS1BDbGFzc30gPSB7fTtcbiAgXG4gICAgLyoqXG4gICAgICAgKiBNYWtlcyBhIG5ldyBbW1N0YW5kYXJkS2V5UGFpcl1dLCByZXR1cm5zIHRoZSBhZGRyZXNzLlxuICAgICAgICpcbiAgICAgICAqIEByZXR1cm5zIEFkZHJlc3Mgb2YgdGhlIG5ldyBbW1N0YW5kYXJkS2V5UGFpcl1dXG4gICAgICAgKi9cbiAgICBtYWtlS2V5OigpID0+IEtQQ2xhc3M7XG4gIFxuICAgIC8qKlxuICAgICAgICogR2l2ZW4gYSBwcml2YXRlIGtleSwgbWFrZXMgYSBuZXcgW1tTdGFuZGFyZEtleVBhaXJdXSwgcmV0dXJucyB0aGUgYWRkcmVzcy5cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0gcHJpdmsgQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSByZXByZXNlbnRpbmcgdGhlIHByaXZhdGUga2V5XG4gICAgICAgKlxuICAgICAgICogQHJldHVybnMgQSBuZXcgW1tTdGFuZGFyZEtleVBhaXJdXVxuICAgICAgICovXG4gICAgaW1wb3J0S2V5Oihwcml2azpCdWZmZXIpID0+IEtQQ2xhc3M7XG4gIFxuICAgIC8qKlxuICAgICAgICogR2V0cyBhbiBhcnJheSBvZiBhZGRyZXNzZXMgc3RvcmVkIGluIHRoZSBbW1N0YW5kYXJkS2V5Q2hhaW5dXS5cbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJucyBBbiBhcnJheSBvZiB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSAgcmVwcmVzZW50YXRpb25zXG4gICAgICAgKiBvZiB0aGUgYWRkcmVzc2VzXG4gICAgICAgKi9cbiAgICBnZXRBZGRyZXNzZXMgPSAoKTpBcnJheTxCdWZmZXI+ID0+IE9iamVjdC52YWx1ZXModGhpcy5rZXlzKS5tYXAoKGtwKSA9PiBrcC5nZXRBZGRyZXNzKCkpO1xuICBcbiAgICAvKipcbiAgICAgICAqIEdldHMgYW4gYXJyYXkgb2YgYWRkcmVzc2VzIHN0b3JlZCBpbiB0aGUgW1tTdGFuZGFyZEtleUNoYWluXV0uXG4gICAgICAgKlxuICAgICAgICogQHJldHVybnMgQW4gYXJyYXkgb2Ygc3RyaW5nIHJlcHJlc2VudGF0aW9ucyBvZiB0aGUgYWRkcmVzc2VzXG4gICAgICAgKi9cbiAgICBnZXRBZGRyZXNzU3RyaW5ncyA9ICgpOkFycmF5PHN0cmluZz4gPT4gT2JqZWN0LnZhbHVlcyh0aGlzLmtleXMpXG4gICAgICAubWFwKChrcCkgPT4ga3AuZ2V0QWRkcmVzc1N0cmluZygpKTtcbiAgXG4gICAgLyoqXG4gICAgICAgKiBBZGRzIHRoZSBrZXkgcGFpciB0byB0aGUgbGlzdCBvZiB0aGUga2V5cyBtYW5hZ2VkIGluIHRoZSBbW1N0YW5kYXJkS2V5Q2hhaW5dXS5cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0gbmV3S2V5IEEga2V5IHBhaXIgb2YgdGhlIGFwcHJvcHJpYXRlIGNsYXNzIHRvIGJlIGFkZGVkIHRvIHRoZSBbW1N0YW5kYXJkS2V5Q2hhaW5dXVxuICAgICAgICovXG4gICAgYWRkS2V5KG5ld0tleTpLUENsYXNzKSB7XG4gICAgICB0aGlzLmtleXNbbmV3S2V5LmdldEFkZHJlc3MoKS50b1N0cmluZygnaGV4JyldID0gbmV3S2V5O1xuICAgIH07XG4gIFxuICAgIC8qKlxuICAgICAgICogUmVtb3ZlcyB0aGUga2V5IHBhaXIgZnJvbSB0aGUgbGlzdCBvZiB0aGV5IGtleXMgbWFuYWdlZCBpbiB0aGUgW1tTdGFuZGFyZEtleUNoYWluXV0uXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIGtleSBBIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IGZvciB0aGUgYWRkcmVzcyBvclxuICAgICAgICogS1BDbGFzcyB0byByZW1vdmVcbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJucyBUaGUgYm9vbGVhbiB0cnVlIGlmIGEga2V5IHdhcyByZW1vdmVkLlxuICAgICAgICovXG4gICAgcmVtb3ZlS2V5ID0gKGtleTpLUENsYXNzIHwgQnVmZmVyKSA9PiB7XG4gICAgICBsZXQga2FkZHI6c3RyaW5nO1xuICAgICAgaWYgKGtleSBpbnN0YW5jZW9mIEJ1ZmZlcikge1xuICAgICAgICBrYWRkciA9IGtleS50b1N0cmluZygnaGV4Jyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBrYWRkciA9IGtleS5nZXRBZGRyZXNzKCkudG9TdHJpbmcoJ2hleCcpO1xuICAgICAgfVxuICAgICAgaWYgKGthZGRyIGluIHRoaXMua2V5cykge1xuICAgICAgICBkZWxldGUgdGhpcy5rZXlzW2thZGRyXTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcbiAgXG4gICAgLyoqXG4gICAgICAgKiBDaGVja3MgaWYgdGhlcmUgaXMgYSBrZXkgYXNzb2NpYXRlZCB3aXRoIHRoZSBwcm92aWRlZCBhZGRyZXNzLlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSBhZGRyZXNzIFRoZSBhZGRyZXNzIHRvIGNoZWNrIGZvciBleGlzdGVuY2UgaW4gdGhlIGtleXMgZGF0YWJhc2VcbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJucyBUcnVlIG9uIHN1Y2Nlc3MsIGZhbHNlIGlmIG5vdCBmb3VuZFxuICAgICAgICovXG4gICAgaGFzS2V5ID0gKGFkZHJlc3M6QnVmZmVyKTpib29sZWFuID0+IChhZGRyZXNzLnRvU3RyaW5nKCdoZXgnKSBpbiB0aGlzLmtleXMpO1xuICBcbiAgICAvKipcbiAgICAgICAqIFJldHVybnMgdGhlIFtbU3RhbmRhcmRLZXlQYWlyXV0gbGlzdGVkIHVuZGVyIHRoZSBwcm92aWRlZCBhZGRyZXNzXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIGFkZHJlc3MgVGhlIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IG9mIHRoZSBhZGRyZXNzIHRvXG4gICAgICAgKiByZXRyaWV2ZSBmcm9tIHRoZSBrZXlzIGRhdGFiYXNlXG4gICAgICAgKlxuICAgICAgICogQHJldHVybnMgQSByZWZlcmVuY2UgdG8gdGhlIFtbU3RhbmRhcmRLZXlQYWlyXV0gaW4gdGhlIGtleXMgZGF0YWJhc2VcbiAgICAgICAqL1xuICAgIGdldEtleSA9IChhZGRyZXNzOkJ1ZmZlcik6IEtQQ2xhc3MgPT4gdGhpcy5rZXlzW2FkZHJlc3MudG9TdHJpbmcoJ2hleCcpXTtcblxuICAgIGFic3RyYWN0IGNyZWF0ZSguLi5hcmdzOmFueVtdKTp0aGlzO1xuXG4gICAgYWJzdHJhY3QgY2xvbmUoKTp0aGlzO1xuXG4gICAgYWJzdHJhY3QgdW5pb24oa2M6dGhpcyk6dGhpcztcbiAgICBcbiAgfSJdfQ==