"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyChain = exports.KeyPair = void 0;
const bintools_1 = __importDefault(require("../../utils/bintools"));
const secp256k1_1 = require("../../common/secp256k1");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
/**
 * Class for representing a private and public keypair on an AVM Chain.
 */
class KeyPair extends secp256k1_1.SECP256k1KeyPair {
    constructor(hrp, chainid) {
        super();
        this.chainid = '';
        this.hrp = '';
        /**
         * Returns the address's string representation.
         *
         * @returns A string representation of the address
         */
        this.getAddressString = () => {
            const addr = this.addressFromPublicKey(this.pubk);
            return bintools.addressToString(this.hrp, this.chainid, addr);
        };
        /**
           * Returns the chainID associated with this key.
           *
           * @returns The [[KeyPair]]'s chainID
           */
        this.getChainID = () => this.chainid;
        /**
         * Sets the the chainID associated with this key.
         *
         * @param chainid String for the chainID
         */
        this.setChainID = (chainid) => {
            this.chainid = chainid;
        };
        /**
         * Returns the Human-Readable-Part of the network associated with this key.
         *
         * @returns The [[KeyPair]]'s Human-Readable-Part of the network's Bech32 addressing scheme
         */
        this.getHRP = () => this.hrp;
        /**
         * Sets the the Human-Readable-Part of the network associated with this key.
         *
         * @param hrp String for the Human-Readable-Part of Bech32 addresses
         */
        this.setHRP = (hrp) => {
            this.hrp = hrp;
        };
        this.chainid = chainid;
        this.hrp = hrp;
        this.generateKey();
    }
    clone() {
        let newkp = new KeyPair(this.hrp, this.chainid);
        newkp.importKey(bintools.copyFrom(this.getPrivateKey()));
        return newkp;
    }
    create(...args) {
        if (args.length == 2) {
            return new KeyPair(args[0], args[1]);
        }
        return new KeyPair(this.hrp, this.chainid);
    }
}
exports.KeyPair = KeyPair;
/**
 * Class for representing a key chain in Avalanche.
 *
 * @typeparam KeyPair Class extending [[SECP256k1KeyChain]] which is used as the key in [[KeyChain]]
 */
class KeyChain extends secp256k1_1.SECP256k1KeyChain {
    /**
     * Returns instance of KeyChain.
     */
    constructor(hrp, chainid) {
        super();
        this.hrp = '';
        this.chainid = '';
        /**
         * Makes a new key pair, returns the address.
         *
         * @returns The new key pair
         */
        this.makeKey = () => {
            let keypair = new KeyPair(this.hrp, this.chainid);
            this.addKey(keypair);
            return keypair;
        };
        this.addKey = (newKey) => {
            newKey.setChainID(this.chainid);
            super.addKey(newKey);
        };
        /**
         * Given a private key, makes a new key pair, returns the address.
         *
         * @param privk A {@link https://github.com/feross/buffer|Buffer} or cb58 serialized string representing the private key
         *
         * @returns The new key pair
         */
        this.importKey = (privk) => {
            let keypair = new KeyPair(this.hrp, this.chainid);
            let pk;
            if (typeof privk === 'string') {
                pk = bintools.cb58Decode(privk.split('-')[1]);
            }
            else {
                pk = bintools.copyFrom(privk);
            }
            keypair.importKey(pk);
            if (!(keypair.getAddress().toString("hex") in this.keys)) {
                this.addKey(keypair);
            }
            return keypair;
        };
        this.hrp = hrp;
        this.chainid = chainid;
    }
    create(...args) {
        if (args.length == 2) {
            return new KeyChain(args[0], args[1]);
        }
        return new KeyChain(this.hrp, this.chainid);
    }
    ;
    clone() {
        const newkc = new KeyChain(this.hrp, this.chainid);
        for (let k in this.keys) {
            newkc.addKey(this.keys[k].clone());
        }
        return newkc;
    }
    ;
    union(kc) {
        let newkc = kc.clone();
        for (let k in this.keys) {
            newkc.addKey(this.keys[k].clone());
        }
        return newkc;
    }
}
exports.KeyChain = KeyChain;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5Y2hhaW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvYXBpcy9hdm0va2V5Y2hhaW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBS0Esb0VBQTRDO0FBQzVDLHNEQUE2RTtBQUU3RTs7R0FFRztBQUNILE1BQU0sUUFBUSxHQUFhLGtCQUFRLENBQUMsV0FBVyxFQUFFLENBQUM7QUFHbEQ7O0dBRUc7QUFDSCxNQUFhLE9BQVEsU0FBUSw0QkFBZ0I7SUE2RHpDLFlBQVksR0FBVSxFQUFFLE9BQWM7UUFDbEMsS0FBSyxFQUFFLENBQUM7UUE1REYsWUFBTyxHQUFVLEVBQUUsQ0FBQztRQUNwQixRQUFHLEdBQVUsRUFBRSxDQUFDO1FBRTFCOzs7O1dBSUc7UUFDSCxxQkFBZ0IsR0FBRyxHQUFVLEVBQUU7WUFDM0IsTUFBTSxJQUFJLEdBQVUsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN6RCxPQUFPLFFBQVEsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2xFLENBQUMsQ0FBQTtRQUVEOzs7O2FBSUs7UUFDTCxlQUFVLEdBQUcsR0FBVSxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUV2Qzs7OztXQUlHO1FBQ0gsZUFBVSxHQUFHLENBQUMsT0FBYyxFQUFPLEVBQUU7WUFDakMsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDM0IsQ0FBQyxDQUFDO1FBR0Y7Ozs7V0FJRztRQUNILFdBQU0sR0FBRyxHQUFVLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO1FBRS9COzs7O1dBSUc7UUFDSCxXQUFNLEdBQUcsQ0FBQyxHQUFVLEVBQU8sRUFBRTtZQUMzQixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUNqQixDQUFDLENBQUM7UUFpQkUsSUFB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LENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFTLENBQUM7U0FDakQ7UUFDRCxPQUFPLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBUyxDQUFDO0lBQ3hELENBQUM7SUFBQSxDQUFDO0lBRUYsS0FBSztRQUNELE1BQU0sS0FBSyxHQUFZLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzVELEtBQUksSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksRUFBQztZQUNuQixLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztTQUN0QztRQUNELE9BQU8sS0FBYSxDQUFDO0lBQ3pCLENBQUM7SUFBQSxDQUFDO0lBRUYsS0FBSyxDQUFDLEVBQU87UUFDVCxJQUFJLEtBQUssR0FBWSxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDaEMsS0FBSSxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFDO1lBQ25CLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1NBQ3RDO1FBQ0QsT0FBTyxLQUFhLENBQUM7SUFDekIsQ0FBQztDQVVKO0FBMUVELDRCQTBFQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQHBhY2thZ2VEb2N1bWVudGF0aW9uXG4gKiBAbW9kdWxlIEFQSS1BVk0tS2V5Q2hhaW5cbiAqL1xuaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSAnYnVmZmVyLyc7XG5pbXBvcnQgQmluVG9vbHMgZnJvbSAnLi4vLi4vdXRpbHMvYmludG9vbHMnO1xuaW1wb3J0IHsgU0VDUDI1NmsxS2V5Q2hhaW4sIFNFQ1AyNTZrMUtleVBhaXIgfSBmcm9tICcuLi8uLi9jb21tb24vc2VjcDI1NmsxJztcblxuLyoqXG4gKiBAaWdub3JlXG4gKi9cbmNvbnN0IGJpbnRvb2xzOiBCaW5Ub29scyA9IEJpblRvb2xzLmdldEluc3RhbmNlKCk7XG5cblxuLyoqXG4gKiBDbGFzcyBmb3IgcmVwcmVzZW50aW5nIGEgcHJpdmF0ZSBhbmQgcHVibGljIGtleXBhaXIgb24gYW4gQVZNIENoYWluLiBcbiAqL1xuZXhwb3J0IGNsYXNzIEtleVBhaXIgZXh0ZW5kcyBTRUNQMjU2azFLZXlQYWlyIHtcblxuICAgIHByb3RlY3RlZCBjaGFpbmlkOnN0cmluZyA9ICcnO1xuICAgIHByb3RlY3RlZCBocnA6c3RyaW5nID0gJyc7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBhZGRyZXNzJ3Mgc3RyaW5nIHJlcHJlc2VudGF0aW9uLlxuICAgICAqIFxuICAgICAqIEByZXR1cm5zIEEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBhZGRyZXNzXG4gICAgICovXG4gICAgZ2V0QWRkcmVzc1N0cmluZyA9ICgpOnN0cmluZyA9PiB7XG4gICAgICAgIGNvbnN0IGFkZHI6QnVmZmVyID0gdGhpcy5hZGRyZXNzRnJvbVB1YmxpY0tleSh0aGlzLnB1YmspO1xuICAgICAgICByZXR1cm4gYmludG9vbHMuYWRkcmVzc1RvU3RyaW5nKHRoaXMuaHJwLCB0aGlzLmNoYWluaWQsIGFkZHIpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAgICogUmV0dXJucyB0aGUgY2hhaW5JRCBhc3NvY2lhdGVkIHdpdGggdGhpcyBrZXkuXG4gICAgICAgKlxuICAgICAgICogQHJldHVybnMgVGhlIFtbS2V5UGFpcl1dJ3MgY2hhaW5JRFxuICAgICAgICovXG4gICAgZ2V0Q2hhaW5JRCA9ICgpOnN0cmluZyA9PiB0aGlzLmNoYWluaWQ7XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSB0aGUgY2hhaW5JRCBhc3NvY2lhdGVkIHdpdGggdGhpcyBrZXkuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gY2hhaW5pZCBTdHJpbmcgZm9yIHRoZSBjaGFpbklEXG4gICAgICovXG4gICAgc2V0Q2hhaW5JRCA9IChjaGFpbmlkOnN0cmluZyk6dm9pZCA9PiB7XG4gICAgICAgIHRoaXMuY2hhaW5pZCA9IGNoYWluaWQ7XG4gICAgfTtcbiAgICBcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIEh1bWFuLVJlYWRhYmxlLVBhcnQgb2YgdGhlIG5ldHdvcmsgYXNzb2NpYXRlZCB3aXRoIHRoaXMga2V5LlxuICAgICAqXG4gICAgICogQHJldHVybnMgVGhlIFtbS2V5UGFpcl1dJ3MgSHVtYW4tUmVhZGFibGUtUGFydCBvZiB0aGUgbmV0d29yaydzIEJlY2gzMiBhZGRyZXNzaW5nIHNjaGVtZVxuICAgICAqL1xuICAgIGdldEhSUCA9ICgpOnN0cmluZyA9PiB0aGlzLmhycDtcbiAgXG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgdGhlIEh1bWFuLVJlYWRhYmxlLVBhcnQgb2YgdGhlIG5ldHdvcmsgYXNzb2NpYXRlZCB3aXRoIHRoaXMga2V5LlxuICAgICAqXG4gICAgICogQHBhcmFtIGhycCBTdHJpbmcgZm9yIHRoZSBIdW1hbi1SZWFkYWJsZS1QYXJ0IG9mIEJlY2gzMiBhZGRyZXNzZXNcbiAgICAgKi9cbiAgICBzZXRIUlAgPSAoaHJwOnN0cmluZyk6dm9pZCA9PiB7XG4gICAgICB0aGlzLmhycCA9IGhycDtcbiAgICB9O1xuXG4gICAgY2xvbmUoKTp0aGlzIHtcbiAgICAgICAgbGV0IG5ld2twOktleVBhaXIgPSBuZXcgS2V5UGFpcih0aGlzLmhycCwgdGhpcy5jaGFpbmlkKTtcbiAgICAgICAgbmV3a3AuaW1wb3J0S2V5KGJpbnRvb2xzLmNvcHlGcm9tKHRoaXMuZ2V0UHJpdmF0ZUtleSgpKSk7XG4gICAgICAgIHJldHVybiBuZXdrcCBhcyB0aGlzO1xuICAgIH1cblxuICAgIGNyZWF0ZSguLi5hcmdzOmFueVtdKTp0aGlzIHtcbiAgICAgICAgaWYoYXJncy5sZW5ndGggPT0gMil7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEtleVBhaXIoYXJnc1swXSwgYXJnc1sxXSkgYXMgdGhpcztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IEtleVBhaXIodGhpcy5ocnAsIHRoaXMuY2hhaW5pZCkgYXMgdGhpcztcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3RvcihocnA6c3RyaW5nLCBjaGFpbmlkOnN0cmluZykge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmNoYWluaWQgPSBjaGFpbmlkO1xuICAgICAgICB0aGlzLmhycCA9IGhycDtcbiAgICAgICAgdGhpcy5nZW5lcmF0ZUtleSgpO1xuICAgIH1cbiAgICBcbn1cblxuLyoqXG4gKiBDbGFzcyBmb3IgcmVwcmVzZW50aW5nIGEga2V5IGNoYWluIGluIEF2YWxhbmNoZS4gXG4gKiBcbiAqIEB0eXBlcGFyYW0gS2V5UGFpciBDbGFzcyBleHRlbmRpbmcgW1tTRUNQMjU2azFLZXlDaGFpbl1dIHdoaWNoIGlzIHVzZWQgYXMgdGhlIGtleSBpbiBbW0tleUNoYWluXV1cbiAqL1xuZXhwb3J0IGNsYXNzIEtleUNoYWluIGV4dGVuZHMgU0VDUDI1NmsxS2V5Q2hhaW48S2V5UGFpcj4ge1xuXG4gICAgaHJwOnN0cmluZyA9ICcnO1xuICAgIGNoYWluaWQ6c3RyaW5nID0gJyc7XG5cbiAgICAvKipcbiAgICAgKiBNYWtlcyBhIG5ldyBrZXkgcGFpciwgcmV0dXJucyB0aGUgYWRkcmVzcy5cbiAgICAgKiBcbiAgICAgKiBAcmV0dXJucyBUaGUgbmV3IGtleSBwYWlyXG4gICAgICovXG4gICAgbWFrZUtleSA9ICgpOktleVBhaXIgPT4ge1xuICAgICAgICBsZXQga2V5cGFpcjpLZXlQYWlyID0gbmV3IEtleVBhaXIodGhpcy5ocnAsIHRoaXMuY2hhaW5pZCk7XG4gICAgICAgIHRoaXMuYWRkS2V5KGtleXBhaXIpO1xuICAgICAgICByZXR1cm4ga2V5cGFpclxuICAgIH1cblxuICAgIGFkZEtleSA9IChuZXdLZXk6S2V5UGFpcikgPT4ge1xuICAgICAgICBuZXdLZXkuc2V0Q2hhaW5JRCh0aGlzLmNoYWluaWQpO1xuICAgICAgICBzdXBlci5hZGRLZXkobmV3S2V5KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHaXZlbiBhIHByaXZhdGUga2V5LCBtYWtlcyBhIG5ldyBrZXkgcGFpciwgcmV0dXJucyB0aGUgYWRkcmVzcy5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gcHJpdmsgQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBvciBjYjU4IHNlcmlhbGl6ZWQgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgcHJpdmF0ZSBrZXkgXG4gICAgICogXG4gICAgICogQHJldHVybnMgVGhlIG5ldyBrZXkgcGFpclxuICAgICAqL1xuICAgIGltcG9ydEtleSA9IChwcml2azpCdWZmZXIgfCBzdHJpbmcpOktleVBhaXIgPT4ge1xuICAgICAgICBsZXQga2V5cGFpcjpLZXlQYWlyID0gbmV3IEtleVBhaXIodGhpcy5ocnAsIHRoaXMuY2hhaW5pZCk7XG4gICAgICAgIGxldCBwazpCdWZmZXI7XG4gICAgICAgIGlmKHR5cGVvZiBwcml2ayA9PT0gJ3N0cmluZycpe1xuICAgICAgICAgICAgcGsgPSBiaW50b29scy5jYjU4RGVjb2RlKHByaXZrLnNwbGl0KCctJylbMV0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGsgPSBiaW50b29scy5jb3B5RnJvbShwcml2ayk7XG4gICAgICAgIH1cbiAgICAgICAga2V5cGFpci5pbXBvcnRLZXkocGspO1xuICAgICAgICBpZighKGtleXBhaXIuZ2V0QWRkcmVzcygpLnRvU3RyaW5nKFwiaGV4XCIpIGluIHRoaXMua2V5cykpe1xuICAgICAgICAgICAgdGhpcy5hZGRLZXkoa2V5cGFpcik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGtleXBhaXI7XG4gICAgfVxuXG4gICAgY3JlYXRlKC4uLmFyZ3M6YW55W10pOnRoaXMge1xuICAgICAgICBpZihhcmdzLmxlbmd0aCA9PSAyKXtcbiAgICAgICAgICAgIHJldHVybiBuZXcgS2V5Q2hhaW4oYXJnc1swXSwgYXJnc1sxXSkgYXMgdGhpcztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IEtleUNoYWluKHRoaXMuaHJwLCB0aGlzLmNoYWluaWQpIGFzIHRoaXM7XG4gICAgfTtcblxuICAgIGNsb25lKCk6dGhpcyB7XG4gICAgICAgIGNvbnN0IG5ld2tjOktleUNoYWluID0gbmV3IEtleUNoYWluKHRoaXMuaHJwLCB0aGlzLmNoYWluaWQpO1xuICAgICAgICBmb3IobGV0IGsgaW4gdGhpcy5rZXlzKXtcbiAgICAgICAgICAgIG5ld2tjLmFkZEtleSh0aGlzLmtleXNba10uY2xvbmUoKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ld2tjIGFzIHRoaXM7XG4gICAgfTtcblxuICAgIHVuaW9uKGtjOnRoaXMpOnRoaXMge1xuICAgICAgICBsZXQgbmV3a2M6S2V5Q2hhaW4gPSBrYy5jbG9uZSgpO1xuICAgICAgICBmb3IobGV0IGsgaW4gdGhpcy5rZXlzKXtcbiAgICAgICAgICAgIG5ld2tjLmFkZEtleSh0aGlzLmtleXNba10uY2xvbmUoKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ld2tjIGFzIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBpbnN0YW5jZSBvZiBLZXlDaGFpbi5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihocnA6c3RyaW5nLCBjaGFpbmlkOnN0cmluZyl7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuaHJwID0gaHJwO1xuICAgICAgICB0aGlzLmNoYWluaWQgPSBjaGFpbmlkO1xuICAgIH1cbn1cbiJdfQ==