"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfoAPI = void 0;
const jrpcapi_1 = require("../../common/jrpcapi");
const bn_js_1 = __importDefault(require("bn.js"));
/**
 * Class for interacting with a node's InfoAPI.
 *
 * @category RPCAPIs
 *
 * @remarks This extends the [[JRPCAPI]] class. This class should not be directly called. Instead, use the [[Avalanche.addAPI]] function to register this interface with Avalanche.
 */
class InfoAPI extends jrpcapi_1.JRPCAPI {
    constructor(core, baseurl = '/ext/info') {
        super(core, baseurl);
        /**
         * Fetches the blockchainID from the node for a given alias.
         *
         * @param alias The blockchain alias to get the blockchainID
         *
         * @returns Returns a Promise<string> containing the base 58 string representation of the blockchainID.
         */
        this.getBlockchainID = (alias) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                alias,
            };
            return this.callMethod('info.getBlockchainID', params)
                .then((response) => response.data.result.blockchainID);
        });
        /**
         * Fetches the networkID from the node.
         *
         * @returns Returns a Promise<number> of the networkID.
         */
        this.getNetworkID = () => __awaiter(this, void 0, void 0, function* () {
            const params = {};
            return this.callMethod('info.getNetworkID', params)
                .then((response) => response.data.result.networkID);
        });
        /**
         * Fetches the network name this node is running on
         *
         * @returns Returns a Promise<string> containing the network name.
         */
        this.getNetworkName = () => __awaiter(this, void 0, void 0, function* () {
            return this.callMethod('info.getNetworkName')
                .then((response) => response.data.result.networkName);
        });
        /**
         * Fetches the nodeID from the node.
         *
         * @returns Returns a Promise<string> of the nodeID.
         */
        this.getNodeID = () => __awaiter(this, void 0, void 0, function* () {
            const params = {};
            return this.callMethod('info.getNodeID', params)
                .then((response) => response.data.result.nodeID);
        });
        /**
         * Fetches the version of Gecko this node is running
         *
         * @returns Returns a Promise<string> containing the version of Gecko.
         */
        this.getNodeVersion = () => __awaiter(this, void 0, void 0, function* () {
            return this.callMethod('info.getNodeVersion')
                .then((response) => response.data.result.version);
        });
        /**
         * Fetches the transaction fee from the node.
         *
         * @returns Returns a Promise<object> of the transaction fee in nAVAX.
         */
        this.getTxFee = () => __awaiter(this, void 0, void 0, function* () {
            return this.callMethod('info.getTxFee')
                .then((response) => {
                return {
                    txFee: new bn_js_1.default(response.data.result.txFee, 10),
                    creationTxFee: new bn_js_1.default(response.data.result.creationTxFee, 10)
                };
            });
        });
        /**
         * Check whether a given chain is done bootstrapping
         * @param chain The ID or alias of a chain.
         *
         * @returns Returns a Promise<boolean> of whether the chain has completed bootstrapping.
         */
        this.isBootstrapped = (chain) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                chain
            };
            return this.callMethod('info.isBootstrapped', params)
                .then((response) => response.data.result.isBootstrapped);
        });
        /**
         * Returns the peers connected to the node.
         *
         * @returns Promise for the list of connected peers in <ip>:<port> format.
         */
        this.peers = () => __awaiter(this, void 0, void 0, function* () {
            return this.callMethod('info.peers')
                .then((response) => response.data.result.peers);
        });
    }
}
exports.InfoAPI = InfoAPI;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2FwaXMvaW5mby9hcGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBS0Esa0RBQStDO0FBRS9DLGtEQUF1QjtBQUV2Qjs7Ozs7O0dBTUc7QUFDSCxNQUFhLE9BQVEsU0FBUSxpQkFBTztJQTJGbEMsWUFBWSxJQUFrQixFQUFFLFVBQWlCLFdBQVc7UUFBSSxLQUFLLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBMUZyRjs7Ozs7O1dBTUc7UUFDSCxvQkFBZSxHQUFHLENBQU8sS0FBWSxFQUFrQixFQUFFO1lBQ3ZELE1BQU0sTUFBTSxHQUFPO2dCQUNqQixLQUFLO2FBQ04sQ0FBQztZQUNGLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxzQkFBc0IsRUFBRSxNQUFNLENBQUM7aUJBQ25ELElBQUksQ0FBQyxDQUFDLFFBQTRCLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQy9FLENBQUMsQ0FBQSxDQUFDO1FBRUY7Ozs7V0FJRztRQUNILGlCQUFZLEdBQUcsR0FBeUIsRUFBRTtZQUN4QyxNQUFNLE1BQU0sR0FBTyxFQUFFLENBQUM7WUFDdEIsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLG1CQUFtQixFQUFFLE1BQU0sQ0FBQztpQkFDaEQsSUFBSSxDQUFDLENBQUMsUUFBNEIsRUFBRSxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDNUUsQ0FBQyxDQUFBLENBQUM7UUFFRjs7OztXQUlHO1FBQ0gsbUJBQWMsR0FBRyxHQUF5QixFQUFFO1lBQUMsT0FBQSxJQUFJLENBQUMsVUFBVSxDQUFDLHFCQUFxQixDQUFDO2lCQUNoRixJQUFJLENBQUMsQ0FBQyxRQUE0QixFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQTtVQUFBLENBQUM7UUFFNUU7Ozs7V0FJRztRQUNILGNBQVMsR0FBRyxHQUF5QixFQUFFO1lBQ3JDLE1BQU0sTUFBTSxHQUFPLEVBQUUsQ0FBQztZQUN0QixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLEVBQUUsTUFBTSxDQUFDO2lCQUM3QyxJQUFJLENBQUMsQ0FBQyxRQUE0QixFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN6RSxDQUFDLENBQUEsQ0FBQztRQUVGOzs7O1dBSUc7UUFDSCxtQkFBYyxHQUFHLEdBQXlCLEVBQUU7WUFBQyxPQUFBLElBQUksQ0FBQyxVQUFVLENBQUMscUJBQXFCLENBQUM7aUJBQ2hGLElBQUksQ0FBQyxDQUFDLFFBQTRCLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFBO1VBQUEsQ0FBQztRQUV4RTs7OztXQUlHO1FBQ0gsYUFBUSxHQUFHLEdBQStDLEVBQUU7WUFDMUQsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQztpQkFDbEMsSUFBSSxDQUFDLENBQUMsUUFBNEIsRUFBRSxFQUFFO2dCQUNyQyxPQUFPO29CQUNMLEtBQUssRUFBRSxJQUFJLGVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDO29CQUM3QyxhQUFhLEVBQUUsSUFBSSxlQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLEVBQUUsQ0FBQztpQkFDOUQsQ0FBQTtZQUNILENBQUMsQ0FBQyxDQUFDO1FBQ1QsQ0FBQyxDQUFBLENBQUM7UUFFRjs7Ozs7V0FLRztRQUNILG1CQUFjLEdBQUcsQ0FBTyxLQUFZLEVBQW1CLEVBQUU7WUFDdkQsTUFBTSxNQUFNLEdBQU87Z0JBQ2pCLEtBQUs7YUFDTixDQUFDO1lBQ0YsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLHFCQUFxQixFQUFFLE1BQU0sQ0FBQztpQkFDaEQsSUFBSSxDQUFDLENBQUMsUUFBNEIsRUFBRSxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDbkYsQ0FBQyxDQUFBLENBQUM7UUFFRjs7OztXQUlHO1FBQ0gsVUFBSyxHQUFHLEdBQWdDLEVBQUU7WUFBQyxPQUFBLElBQUksQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDO2lCQUNyRSxJQUFJLENBQUMsQ0FBQyxRQUE0QixFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQTtVQUFBLENBQUM7SUFFZ0IsQ0FBQztDQUN4RjtBQTVGRCwwQkE0RkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBwYWNrYWdlRG9jdW1lbnRhdGlvblxuICogQG1vZHVsZSBBUEktSW5mb1xuICovXG5pbXBvcnQgQXZhbGFuY2hlQ29yZSBmcm9tICcuLi8uLi9hdmFsYW5jaGUnO1xuaW1wb3J0IHsgSlJQQ0FQSSB9IGZyb20gJy4uLy4uL2NvbW1vbi9qcnBjYXBpJztcbmltcG9ydCB7IFJlcXVlc3RSZXNwb25zZURhdGEgfSBmcm9tICcuLi8uLi9jb21tb24vYXBpYmFzZSc7XG5pbXBvcnQgQk4gZnJvbSBcImJuLmpzXCI7XG5cbi8qKlxuICogQ2xhc3MgZm9yIGludGVyYWN0aW5nIHdpdGggYSBub2RlJ3MgSW5mb0FQSS5cbiAqXG4gKiBAY2F0ZWdvcnkgUlBDQVBJc1xuICpcbiAqIEByZW1hcmtzIFRoaXMgZXh0ZW5kcyB0aGUgW1tKUlBDQVBJXV0gY2xhc3MuIFRoaXMgY2xhc3Mgc2hvdWxkIG5vdCBiZSBkaXJlY3RseSBjYWxsZWQuIEluc3RlYWQsIHVzZSB0aGUgW1tBdmFsYW5jaGUuYWRkQVBJXV0gZnVuY3Rpb24gdG8gcmVnaXN0ZXIgdGhpcyBpbnRlcmZhY2Ugd2l0aCBBdmFsYW5jaGUuXG4gKi9cbmV4cG9ydCBjbGFzcyBJbmZvQVBJIGV4dGVuZHMgSlJQQ0FQSSB7XG4gIC8qKlxuICAgKiBGZXRjaGVzIHRoZSBibG9ja2NoYWluSUQgZnJvbSB0aGUgbm9kZSBmb3IgYSBnaXZlbiBhbGlhcy5cbiAgICpcbiAgICogQHBhcmFtIGFsaWFzIFRoZSBibG9ja2NoYWluIGFsaWFzIHRvIGdldCB0aGUgYmxvY2tjaGFpbklEXG4gICAqXG4gICAqIEByZXR1cm5zIFJldHVybnMgYSBQcm9taXNlPHN0cmluZz4gY29udGFpbmluZyB0aGUgYmFzZSA1OCBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIGJsb2NrY2hhaW5JRC5cbiAgICovXG4gIGdldEJsb2NrY2hhaW5JRCA9IGFzeW5jIChhbGlhczpzdHJpbmcpOlByb21pc2U8c3RyaW5nPiA9PiB7XG4gICAgY29uc3QgcGFyYW1zOmFueSA9IHtcbiAgICAgIGFsaWFzLFxuICAgIH07XG4gICAgcmV0dXJuIHRoaXMuY2FsbE1ldGhvZCgnaW5mby5nZXRCbG9ja2NoYWluSUQnLCBwYXJhbXMpXG4gICAgICAudGhlbigocmVzcG9uc2U6UmVxdWVzdFJlc3BvbnNlRGF0YSkgPT4gcmVzcG9uc2UuZGF0YS5yZXN1bHQuYmxvY2tjaGFpbklEKTtcbiAgfTtcblxuICAvKipcbiAgICogRmV0Y2hlcyB0aGUgbmV0d29ya0lEIGZyb20gdGhlIG5vZGUuXG4gICAqXG4gICAqIEByZXR1cm5zIFJldHVybnMgYSBQcm9taXNlPG51bWJlcj4gb2YgdGhlIG5ldHdvcmtJRC5cbiAgICovXG4gIGdldE5ldHdvcmtJRCA9IGFzeW5jICgpOlByb21pc2U8bnVtYmVyPiA9PiB7XG4gICAgY29uc3QgcGFyYW1zOmFueSA9IHt9O1xuICAgIHJldHVybiB0aGlzLmNhbGxNZXRob2QoJ2luZm8uZ2V0TmV0d29ya0lEJywgcGFyYW1zKVxuICAgICAgLnRoZW4oKHJlc3BvbnNlOlJlcXVlc3RSZXNwb25zZURhdGEpID0+IHJlc3BvbnNlLmRhdGEucmVzdWx0Lm5ldHdvcmtJRCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEZldGNoZXMgdGhlIG5ldHdvcmsgbmFtZSB0aGlzIG5vZGUgaXMgcnVubmluZyBvblxuICAgKlxuICAgKiBAcmV0dXJucyBSZXR1cm5zIGEgUHJvbWlzZTxzdHJpbmc+IGNvbnRhaW5pbmcgdGhlIG5ldHdvcmsgbmFtZS5cbiAgICovXG4gIGdldE5ldHdvcmtOYW1lID0gYXN5bmMgKCk6UHJvbWlzZTxzdHJpbmc+ID0+IHRoaXMuY2FsbE1ldGhvZCgnaW5mby5nZXROZXR3b3JrTmFtZScpXG4gICAgLnRoZW4oKHJlc3BvbnNlOlJlcXVlc3RSZXNwb25zZURhdGEpID0+IHJlc3BvbnNlLmRhdGEucmVzdWx0Lm5ldHdvcmtOYW1lKTtcblxuICAvKipcbiAgICogRmV0Y2hlcyB0aGUgbm9kZUlEIGZyb20gdGhlIG5vZGUuXG4gICAqXG4gICAqIEByZXR1cm5zIFJldHVybnMgYSBQcm9taXNlPHN0cmluZz4gb2YgdGhlIG5vZGVJRC5cbiAgICovXG4gIGdldE5vZGVJRCA9IGFzeW5jICgpOlByb21pc2U8c3RyaW5nPiA9PiB7XG4gICAgY29uc3QgcGFyYW1zOmFueSA9IHt9O1xuICAgIHJldHVybiB0aGlzLmNhbGxNZXRob2QoJ2luZm8uZ2V0Tm9kZUlEJywgcGFyYW1zKVxuICAgICAgLnRoZW4oKHJlc3BvbnNlOlJlcXVlc3RSZXNwb25zZURhdGEpID0+IHJlc3BvbnNlLmRhdGEucmVzdWx0Lm5vZGVJRCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEZldGNoZXMgdGhlIHZlcnNpb24gb2YgR2Vja28gdGhpcyBub2RlIGlzIHJ1bm5pbmdcbiAgICpcbiAgICogQHJldHVybnMgUmV0dXJucyBhIFByb21pc2U8c3RyaW5nPiBjb250YWluaW5nIHRoZSB2ZXJzaW9uIG9mIEdlY2tvLlxuICAgKi9cbiAgZ2V0Tm9kZVZlcnNpb24gPSBhc3luYyAoKTpQcm9taXNlPHN0cmluZz4gPT4gdGhpcy5jYWxsTWV0aG9kKCdpbmZvLmdldE5vZGVWZXJzaW9uJylcbiAgICAudGhlbigocmVzcG9uc2U6UmVxdWVzdFJlc3BvbnNlRGF0YSkgPT4gcmVzcG9uc2UuZGF0YS5yZXN1bHQudmVyc2lvbik7XG5cbiAgLyoqXG4gICAqIEZldGNoZXMgdGhlIHRyYW5zYWN0aW9uIGZlZSBmcm9tIHRoZSBub2RlLlxuICAgKlxuICAgKiBAcmV0dXJucyBSZXR1cm5zIGEgUHJvbWlzZTxvYmplY3Q+IG9mIHRoZSB0cmFuc2FjdGlvbiBmZWUgaW4gbkFWQVguXG4gICAqL1xuICBnZXRUeEZlZSA9IGFzeW5jICgpOlByb21pc2U8e3R4RmVlOkJOLCBjcmVhdGlvblR4RmVlOkJOfT4gPT4ge1xuICAgIHJldHVybiB0aGlzLmNhbGxNZXRob2QoJ2luZm8uZ2V0VHhGZWUnKVxuICAgICAgICAudGhlbigocmVzcG9uc2U6UmVxdWVzdFJlc3BvbnNlRGF0YSkgPT4ge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0eEZlZTogbmV3IEJOKHJlc3BvbnNlLmRhdGEucmVzdWx0LnR4RmVlLCAxMCksXG4gICAgICAgICAgICBjcmVhdGlvblR4RmVlOiBuZXcgQk4ocmVzcG9uc2UuZGF0YS5yZXN1bHQuY3JlYXRpb25UeEZlZSwgMTApXG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgfTtcblxuICAvKipcbiAgICogQ2hlY2sgd2hldGhlciBhIGdpdmVuIGNoYWluIGlzIGRvbmUgYm9vdHN0cmFwcGluZ1xuICAgKiBAcGFyYW0gY2hhaW4gVGhlIElEIG9yIGFsaWFzIG9mIGEgY2hhaW4uXG4gICAqXG4gICAqIEByZXR1cm5zIFJldHVybnMgYSBQcm9taXNlPGJvb2xlYW4+IG9mIHdoZXRoZXIgdGhlIGNoYWluIGhhcyBjb21wbGV0ZWQgYm9vdHN0cmFwcGluZy5cbiAgICovXG4gIGlzQm9vdHN0cmFwcGVkID0gYXN5bmMgKGNoYWluOnN0cmluZyk6UHJvbWlzZTxib29sZWFuPiA9PiB7XG4gICAgY29uc3QgcGFyYW1zOmFueSA9IHtcbiAgICAgIGNoYWluXG4gICAgfTtcbiAgICByZXR1cm4gdGhpcy5jYWxsTWV0aG9kKCdpbmZvLmlzQm9vdHN0cmFwcGVkJywgcGFyYW1zKVxuICAgICAgICAudGhlbigocmVzcG9uc2U6UmVxdWVzdFJlc3BvbnNlRGF0YSkgPT4gcmVzcG9uc2UuZGF0YS5yZXN1bHQuaXNCb290c3RyYXBwZWQpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBwZWVycyBjb25uZWN0ZWQgdG8gdGhlIG5vZGUuXG4gICAqXG4gICAqIEByZXR1cm5zIFByb21pc2UgZm9yIHRoZSBsaXN0IG9mIGNvbm5lY3RlZCBwZWVycyBpbiA8aXA+Ojxwb3J0PiBmb3JtYXQuXG4gICAqL1xuICBwZWVycyA9IGFzeW5jICgpOlByb21pc2U8QXJyYXk8c3RyaW5nPj4gPT4gdGhpcy5jYWxsTWV0aG9kKCdpbmZvLnBlZXJzJylcbiAgICAudGhlbigocmVzcG9uc2U6UmVxdWVzdFJlc3BvbnNlRGF0YSkgPT4gcmVzcG9uc2UuZGF0YS5yZXN1bHQucGVlcnMpO1xuXG4gIGNvbnN0cnVjdG9yKGNvcmU6QXZhbGFuY2hlQ29yZSwgYmFzZXVybDpzdHJpbmcgPSAnL2V4dC9pbmZvJykgeyBzdXBlcihjb3JlLCBiYXNldXJsKTsgfVxufVxuIl19