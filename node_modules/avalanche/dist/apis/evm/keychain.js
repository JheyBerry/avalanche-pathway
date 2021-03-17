"use strict";
/**
 * @packageDocumentation
 * @module API-EVM-KeyChain
 */
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
        this.chainID = '';
        this.hrp = '';
        /**
         * Returns the address's string representation.
          *
          * @returns A string representation of the address
          */
        this.getAddressString = () => {
            const addr = this.addressFromPublicKey(this.pubk);
            return bintools.addressToString(this.hrp, this.chainID, addr);
        };
        /**
          * Returns the chainID associated with this key.
          *
          * @returns The [[KeyPair]]'s chainID
          */
        this.getChainID = () => this.chainID;
        /**
          * Sets the the chainID associated with this key.
          *
          * @param chainID String for the chainID
          */
        this.setChainID = (chainID) => {
            this.chainID = chainID;
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
        this.chainID = chainid;
        this.hrp = hrp;
        this.generateKey();
    }
    clone() {
        let newkp = new KeyPair(this.hrp, this.chainID);
        newkp.importKey(bintools.copyFrom(this.getPrivateKey()));
        return newkp;
    }
    create(...args) {
        if (args.length == 2) {
            return new KeyPair(args[0], args[1]);
        }
        return new KeyPair(this.hrp, this.chainID);
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
    constructor(hrp, chainID) {
        super();
        this.hrp = '';
        this.chainID = '';
        /**
          * Makes a new key pair, returns the address.
          *
          * @returns The new key pair
          */
        this.makeKey = () => {
            let keypair = new KeyPair(this.hrp, this.chainID);
            this.addKey(keypair);
            return keypair;
        };
        this.addKey = (newKey) => {
            newKey.setChainID(this.chainID);
            super.addKey(newKey);
        };
        /**
          * Given a private key, makes a new key pair, returns the address.
          *
          * @param privk A {@link https://github.com/feross/buffer|Buffer}
          * or cb58 serialized string representing the private key
          *
          * @returns The new key pair
          */
        this.importKey = (privk) => {
            let keypair = new KeyPair(this.hrp, this.chainID);
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
        this.chainID = chainID;
    }
    create(...args) {
        if (args.length == 2) {
            return new KeyChain(args[0], args[1]);
        }
        return new KeyChain(this.hrp, this.chainID);
    }
    ;
    clone() {
        const newkc = new KeyChain(this.hrp, this.chainID);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5Y2hhaW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvYXBpcy9ldm0va2V5Y2hhaW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7R0FHRzs7Ozs7O0FBR0gsb0VBQTRDO0FBQzVDLHNEQUdnQztBQUVoQzs7R0FFRztBQUNILE1BQU0sUUFBUSxHQUFhLGtCQUFRLENBQUMsV0FBVyxFQUFFLENBQUM7QUFFbEQ7O0dBRUc7QUFDSCxNQUFhLE9BQVEsU0FBUSw0QkFBZ0I7SUEyRDNDLFlBQVksR0FBVyxFQUFFLE9BQWU7UUFDdEMsS0FBSyxFQUFFLENBQUM7UUEzREEsWUFBTyxHQUFXLEVBQUUsQ0FBQztRQUNyQixRQUFHLEdBQVcsRUFBRSxDQUFDO1FBRTNCOzs7O1lBSUk7UUFDSixxQkFBZ0IsR0FBRyxHQUFXLEVBQUU7WUFDOUIsTUFBTSxJQUFJLEdBQVcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMxRCxPQUFPLFFBQVEsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2hFLENBQUMsQ0FBQTtRQUVEOzs7O1lBSUk7UUFDSixlQUFVLEdBQUcsR0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUV4Qzs7OztZQUlJO1FBQ0osZUFBVSxHQUFHLENBQUMsT0FBZSxFQUFRLEVBQUU7WUFDckMsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDekIsQ0FBQyxDQUFDO1FBRUY7Ozs7WUFJSTtRQUNKLFdBQU0sR0FBRyxHQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO1FBRWhDOzs7O1lBSUk7UUFDSixXQUFNLEdBQUcsQ0FBQyxHQUFXLEVBQVEsRUFBRTtZQUM3QixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUNqQixDQUFDLENB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QUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBUyxDQUFDO1NBQy9DO1FBQ0QsT0FBTyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQVMsQ0FBQztJQUN0RCxDQUFDO0lBQUEsQ0FBQztJQUVGLEtBQUs7UUFDSCxNQUFNLEtBQUssR0FBYSxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM3RCxLQUFJLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUM7WUFDckIsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7U0FDcEM7UUFDRCxPQUFPLEtBQWEsQ0FBQztJQUN2QixDQUFDO0lBQUEsQ0FBQztJQUVGLEtBQUssQ0FBQyxFQUFRO1FBQ1osSUFBSSxLQUFLLEdBQVksRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2hDLEtBQUksSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksRUFBQztZQUNyQixLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztTQUNwQztRQUNELE9BQU8sS0FBYSxDQUFDO0lBQ3ZCLENBQUM7Q0FVRjtBQTFFRCw0QkEwRUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBwYWNrYWdlRG9jdW1lbnRhdGlvblxuICogQG1vZHVsZSBBUEktRVZNLUtleUNoYWluXG4gKi9cblxuaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSAnYnVmZmVyLyc7XG5pbXBvcnQgQmluVG9vbHMgZnJvbSAnLi4vLi4vdXRpbHMvYmludG9vbHMnO1xuaW1wb3J0IHsgXG4gIFNFQ1AyNTZrMUtleUNoYWluLCBcbiAgU0VDUDI1NmsxS2V5UGFpciBcbn0gZnJvbSAnLi4vLi4vY29tbW9uL3NlY3AyNTZrMSc7XG5cbi8qKlxuICogQGlnbm9yZVxuICovXG5jb25zdCBiaW50b29sczogQmluVG9vbHMgPSBCaW5Ub29scy5nZXRJbnN0YW5jZSgpO1xuXG4vKipcbiAqIENsYXNzIGZvciByZXByZXNlbnRpbmcgYSBwcml2YXRlIGFuZCBwdWJsaWMga2V5cGFpciBvbiBhbiBBVk0gQ2hhaW4uIFxuICovXG5leHBvcnQgY2xhc3MgS2V5UGFpciBleHRlbmRzIFNFQ1AyNTZrMUtleVBhaXIge1xuICBwcm90ZWN0ZWQgY2hhaW5JRDogc3RyaW5nID0gJyc7XG4gIHByb3RlY3RlZCBocnA6IHN0cmluZyA9ICcnO1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBhZGRyZXNzJ3Mgc3RyaW5nIHJlcHJlc2VudGF0aW9uLlxuICAgICogXG4gICAgKiBAcmV0dXJucyBBIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgYWRkcmVzc1xuICAgICovXG4gIGdldEFkZHJlc3NTdHJpbmcgPSAoKTogc3RyaW5nID0+IHtcbiAgICBjb25zdCBhZGRyOiBCdWZmZXIgPSB0aGlzLmFkZHJlc3NGcm9tUHVibGljS2V5KHRoaXMucHViayk7XG4gICAgcmV0dXJuIGJpbnRvb2xzLmFkZHJlc3NUb1N0cmluZyh0aGlzLmhycCwgdGhpcy5jaGFpbklELCBhZGRyKTtcbiAgfVxuXG4gIC8qKlxuICAgICogUmV0dXJucyB0aGUgY2hhaW5JRCBhc3NvY2lhdGVkIHdpdGggdGhpcyBrZXkuXG4gICAgKlxuICAgICogQHJldHVybnMgVGhlIFtbS2V5UGFpcl1dJ3MgY2hhaW5JRFxuICAgICovXG4gIGdldENoYWluSUQgPSAoKTogc3RyaW5nID0+IHRoaXMuY2hhaW5JRDtcblxuICAvKipcbiAgICAqIFNldHMgdGhlIHRoZSBjaGFpbklEIGFzc29jaWF0ZWQgd2l0aCB0aGlzIGtleS5cbiAgICAqXG4gICAgKiBAcGFyYW0gY2hhaW5JRCBTdHJpbmcgZm9yIHRoZSBjaGFpbklEXG4gICAgKi9cbiAgc2V0Q2hhaW5JRCA9IChjaGFpbklEOiBzdHJpbmcpOiB2b2lkID0+IHtcbiAgICB0aGlzLmNoYWluSUQgPSBjaGFpbklEO1xuICB9O1xuXG4gIC8qKlxuICAgICogUmV0dXJucyB0aGUgSHVtYW4tUmVhZGFibGUtUGFydCBvZiB0aGUgbmV0d29yayBhc3NvY2lhdGVkIHdpdGggdGhpcyBrZXkuXG4gICAgKlxuICAgICogQHJldHVybnMgVGhlIFtbS2V5UGFpcl1dJ3MgSHVtYW4tUmVhZGFibGUtUGFydCBvZiB0aGUgbmV0d29yaydzIEJlY2gzMiBhZGRyZXNzaW5nIHNjaGVtZVxuICAgICovXG4gIGdldEhSUCA9ICgpOiBzdHJpbmcgPT4gdGhpcy5ocnA7XG4gIFxuICAvKipcbiAgICAqIFNldHMgdGhlIHRoZSBIdW1hbi1SZWFkYWJsZS1QYXJ0IG9mIHRoZSBuZXR3b3JrIGFzc29jaWF0ZWQgd2l0aCB0aGlzIGtleS5cbiAgICAqXG4gICAgKiBAcGFyYW0gaHJwIFN0cmluZyBmb3IgdGhlIEh1bWFuLVJlYWRhYmxlLVBhcnQgb2YgQmVjaDMyIGFkZHJlc3Nlc1xuICAgICovXG4gIHNldEhSUCA9IChocnA6IHN0cmluZyk6IHZvaWQgPT4ge1xuICAgIHRoaXMuaHJwID0gaHJwO1xuICB9O1xuXG4gIGNsb25lKCk6IHRoaXMge1xuICAgIGxldCBuZXdrcDogS2V5UGFpciA9IG5ldyBLZXlQYWlyKHRoaXMuaHJwLCB0aGlzLmNoYWluSUQpO1xuICAgIG5ld2twLmltcG9ydEtleShiaW50b29scy5jb3B5RnJvbSh0aGlzLmdldFByaXZhdGVLZXkoKSkpO1xuICAgIHJldHVybiBuZXdrcCBhcyB0aGlzO1xuICB9XG5cbiAgY3JlYXRlKC4uLmFyZ3M6IGFueVtdKTogdGhpcyB7XG4gICAgaWYoYXJncy5sZW5ndGggPT0gMil7XG4gICAgICByZXR1cm4gbmV3IEtleVBhaXIoYXJnc1swXSwgYXJnc1sxXSkgYXMgdGhpcztcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBLZXlQYWlyKHRoaXMuaHJwLCB0aGlzLmNoYWluSUQpIGFzIHRoaXM7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihocnA6IHN0cmluZywgY2hhaW5pZDogc3RyaW5nKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmNoYWluSUQgPSBjaGFpbmlkO1xuICAgIHRoaXMuaHJwID0gaHJwO1xuICAgIHRoaXMuZ2VuZXJhdGVLZXkoKTtcbiAgfVxufVxuXG4vKipcbiAgKiBDbGFzcyBmb3IgcmVwcmVzZW50aW5nIGEga2V5IGNoYWluIGluIEF2YWxhbmNoZS4gXG4gICogXG4gICogQHR5cGVwYXJhbSBLZXlQYWlyIENsYXNzIGV4dGVuZGluZyBbW1NFQ1AyNTZrMUtleUNoYWluXV0gd2hpY2ggaXMgdXNlZCBhcyB0aGUga2V5IGluIFtbS2V5Q2hhaW5dXVxuICAqL1xuZXhwb3J0IGNsYXNzIEtleUNoYWluIGV4dGVuZHMgU0VDUDI1NmsxS2V5Q2hhaW48S2V5UGFpcj4ge1xuICBocnA6IHN0cmluZyA9ICcnO1xuICBjaGFpbklEOiBzdHJpbmcgPSAnJztcblxuICAvKipcbiAgICAqIE1ha2VzIGEgbmV3IGtleSBwYWlyLCByZXR1cm5zIHRoZSBhZGRyZXNzLlxuICAgICogXG4gICAgKiBAcmV0dXJucyBUaGUgbmV3IGtleSBwYWlyXG4gICAgKi9cbiAgbWFrZUtleSA9ICgpOiBLZXlQYWlyID0+IHtcbiAgICBsZXQga2V5cGFpcjogS2V5UGFpciA9IG5ldyBLZXlQYWlyKHRoaXMuaHJwLCB0aGlzLmNoYWluSUQpO1xuICAgIHRoaXMuYWRkS2V5KGtleXBhaXIpO1xuICAgIHJldHVybiBrZXlwYWlyXG4gIH1cblxuICBhZGRLZXkgPSAobmV3S2V5OiBLZXlQYWlyKSA9PiB7XG4gICAgbmV3S2V5LnNldENoYWluSUQodGhpcy5jaGFpbklEKTtcbiAgICBzdXBlci5hZGRLZXkobmV3S2V5KTtcbiAgfVxuXG4gIC8qKlxuICAgICogR2l2ZW4gYSBwcml2YXRlIGtleSwgbWFrZXMgYSBuZXcga2V5IHBhaXIsIHJldHVybnMgdGhlIGFkZHJlc3MuXG4gICAgKiBcbiAgICAqIEBwYXJhbSBwcml2ayBBIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IFxuICAgICogb3IgY2I1OCBzZXJpYWxpemVkIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHByaXZhdGUga2V5IFxuICAgICogXG4gICAgKiBAcmV0dXJucyBUaGUgbmV3IGtleSBwYWlyXG4gICAgKi9cbiAgaW1wb3J0S2V5ID0gKHByaXZrOiBCdWZmZXIgfCBzdHJpbmcpOiBLZXlQYWlyID0+IHtcbiAgICBsZXQga2V5cGFpcjogS2V5UGFpciA9IG5ldyBLZXlQYWlyKHRoaXMuaHJwLCB0aGlzLmNoYWluSUQpO1xuICAgIGxldCBwazogQnVmZmVyO1xuICAgIGlmKHR5cGVvZiBwcml2ayA9PT0gJ3N0cmluZycpe1xuICAgICAgcGsgPSBiaW50b29scy5jYjU4RGVjb2RlKHByaXZrLnNwbGl0KCctJylbMV0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBwayA9IGJpbnRvb2xzLmNvcHlGcm9tKHByaXZrKTtcbiAgICB9XG4gICAga2V5cGFpci5pbXBvcnRLZXkocGspO1xuICAgIGlmKCEoa2V5cGFpci5nZXRBZGRyZXNzKCkudG9TdHJpbmcoXCJoZXhcIikgaW4gdGhpcy5rZXlzKSl7XG4gICAgICB0aGlzLmFkZEtleShrZXlwYWlyKTtcbiAgICB9XG4gICAgcmV0dXJuIGtleXBhaXI7XG4gIH1cblxuICBjcmVhdGUoLi4uYXJnczogYW55W10pOiB0aGlzIHtcbiAgICBpZihhcmdzLmxlbmd0aCA9PSAyKXtcbiAgICAgIHJldHVybiBuZXcgS2V5Q2hhaW4oYXJnc1swXSwgYXJnc1sxXSkgYXMgdGhpcztcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBLZXlDaGFpbih0aGlzLmhycCwgdGhpcy5jaGFpbklEKSBhcyB0aGlzO1xuICB9O1xuXG4gIGNsb25lKCk6IHRoaXMge1xuICAgIGNvbnN0IG5ld2tjOiBLZXlDaGFpbiA9IG5ldyBLZXlDaGFpbih0aGlzLmhycCwgdGhpcy5jaGFpbklEKTtcbiAgICBmb3IobGV0IGsgaW4gdGhpcy5rZXlzKXtcbiAgICAgIG5ld2tjLmFkZEtleSh0aGlzLmtleXNba10uY2xvbmUoKSk7XG4gICAgfVxuICAgIHJldHVybiBuZXdrYyBhcyB0aGlzO1xuICB9O1xuXG4gIHVuaW9uKGtjOiB0aGlzKTogdGhpcyB7XG4gICAgbGV0IG5ld2tjOktleUNoYWluID0ga2MuY2xvbmUoKTtcbiAgICBmb3IobGV0IGsgaW4gdGhpcy5rZXlzKXtcbiAgICAgIG5ld2tjLmFkZEtleSh0aGlzLmtleXNba10uY2xvbmUoKSk7XG4gICAgfVxuICAgIHJldHVybiBuZXdrYyBhcyB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAgKiBSZXR1cm5zIGluc3RhbmNlIG9mIEtleUNoYWluLlxuICAgICovXG4gIGNvbnN0cnVjdG9yKGhycDogc3RyaW5nLCBjaGFpbklEOiBzdHJpbmcpe1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5ocnAgPSBocnA7XG4gICAgdGhpcy5jaGFpbklEID0gY2hhaW5JRDtcbiAgfVxufVxuIl19