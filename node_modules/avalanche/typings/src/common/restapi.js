"use strict";
/**
 * @packageDocumentation
 * @module Common-RESTAPI
 */
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
exports.RESTAPI = void 0;
const bintools_1 = __importDefault(require("../utils/bintools"));
const apibase_1 = require("./apibase");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
class RESTAPI extends apibase_1.APIBase {
    /**
       *
       * @param core Reference to the Avalanche instance using this endpoint
       * @param baseurl Path of the APIs baseurl - ex: "/ext/bc/avm"
       * @param contentType Optional Determines the type of the entity attached to the
       * incoming request
       * @param acceptType Optional Determines the type of representation which is
       * desired on the client side
       */
    constructor(core, baseurl, contentType = 'application/json;charset=UTF-8', acceptType = undefined) {
        super(core, baseurl);
        this.prepHeaders = (contentType, acceptType) => {
            const headers = {};
            if (contentType !== undefined) {
                headers['Content-Type'] = contentType;
            }
            else {
                headers['Content-Type'] = this.contentType;
            }
            if (acceptType !== undefined) {
                headers["Accept"] = acceptType;
            }
            else if (this.acceptType !== undefined) {
                headers["Accept"] = this.acceptType;
            }
            return headers;
        };
        this.axConf = () => {
            return {
                baseURL: `${this.core.getProtocol()}://${this.core.getIP()}:${this.core.getPort()}`,
                responseType: 'json',
            };
        };
        this.get = (baseurl, contentType, acceptType) => __awaiter(this, void 0, void 0, function* () {
            const ep = baseurl || this.baseurl;
            let headers = this.prepHeaders(contentType, acceptType);
            return this.core.get(ep, {}, headers, this.axConf()).then((resp) => resp);
        });
        this.post = (method, params, baseurl, contentType, acceptType) => __awaiter(this, void 0, void 0, function* () {
            const ep = baseurl || this.baseurl;
            const rpc = {};
            rpc.method = method;
            // Set parameters if exists
            if (params) {
                rpc.params = params;
            }
            const headers = this.prepHeaders(contentType, acceptType);
            return this.core.post(ep, {}, JSON.stringify(rpc), headers, this.axConf())
                .then((resp) => resp);
        });
        this.put = (method, params, baseurl, contentType, acceptType) => __awaiter(this, void 0, void 0, function* () {
            const ep = baseurl || this.baseurl;
            const rpc = {};
            rpc.method = method;
            // Set parameters if exists
            if (params) {
                rpc.params = params;
            }
            const headers = this.prepHeaders(contentType, acceptType);
            return this.core.put(ep, {}, JSON.stringify(rpc), headers, this.axConf())
                .then((resp) => resp);
        });
        this.delete = (method, params, baseurl, contentType, acceptType) => __awaiter(this, void 0, void 0, function* () {
            const ep = baseurl || this.baseurl;
            const rpc = {};
            rpc.method = method;
            // Set parameters if exists
            if (params) {
                rpc.params = params;
            }
            const headers = this.prepHeaders(contentType, acceptType);
            return this.core.delete(ep, {}, headers, this.axConf()).then((resp) => resp);
        });
        this.patch = (method, params, baseurl, contentType, acceptType) => __awaiter(this, void 0, void 0, function* () {
            const ep = baseurl || this.baseurl;
            const rpc = {};
            rpc.method = method;
            // Set parameters if exists
            if (params) {
                rpc.params = params;
            }
            const headers = this.prepHeaders(contentType, acceptType);
            return this.core.patch(ep, {}, JSON.stringify(rpc), headers, this.axConf())
                .then((resp) => resp);
        });
        /**
           * Returns the type of the entity attached to the incoming request
           */
        this.getContentType = () => this.contentType;
        /**
           * Returns what type of representation is desired at the client side
           */
        this.getAcceptType = () => this.acceptType;
        this.contentType = contentType;
        this.acceptType = acceptType;
    }
}
exports.RESTAPI = RESTAPI;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzdGFwaS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tb24vcmVzdGFwaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztHQUdHOzs7Ozs7Ozs7Ozs7Ozs7QUFHSCxpRUFBeUM7QUFFekMsdUNBQXlEO0FBRXpEOztHQUVHO0FBQ0gsTUFBTSxRQUFRLEdBQUcsa0JBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUV4QyxNQUFhLE9BQVEsU0FBUSxpQkFBTztJQXFIbEM7Ozs7Ozs7O1NBUUs7SUFDTCxZQUFZLElBQWtCLEVBQzVCLE9BQWMsRUFDZCxjQUFxQixnQ0FBZ0MsRUFDckQsYUFBb0IsU0FBUztRQUM3QixLQUFLLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBN0hiLGdCQUFXLEdBQUcsQ0FBQyxXQUFtQixFQUFFLFVBQWtCLEVBQVMsRUFBRTtZQUN6RSxNQUFNLE9BQU8sR0FBVSxFQUFFLENBQUM7WUFDMUIsSUFBSSxXQUFXLEtBQUssU0FBUyxFQUFFO2dCQUM3QixPQUFPLENBQUMsY0FBYyxDQUFDLEdBQUcsV0FBVyxDQUFDO2FBQ3ZDO2lCQUFNO2dCQUNMLE9BQU8sQ0FBQyxjQUFjLENBQUMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO2FBQzVDO1lBRUQsSUFBSSxVQUFVLEtBQUssU0FBUyxFQUFFO2dCQUM1QixPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsVUFBVSxDQUFDO2FBQ2hDO2lCQUFNLElBQUksSUFBSSxDQUFDLFVBQVUsS0FBSyxTQUFTLEVBQUU7Z0JBQ3hDLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO2FBQ3JDO1lBQ0QsT0FBTyxPQUFPLENBQUM7UUFDakIsQ0FBQyxDQUFBO1FBRVMsV0FBTSxHQUFHLEdBQXNCLEVBQUU7WUFDekMsT0FBUTtnQkFDTixPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxN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YUFFSztRQUNMLGtCQUFhLEdBQUcsR0FBVSxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztRQWdCM0MsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7UUFDL0IsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7SUFDL0IsQ0FBQztDQUNGO0FBdElELDBCQXNJQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQHBhY2thZ2VEb2N1bWVudGF0aW9uXG4gKiBAbW9kdWxlIENvbW1vbi1SRVNUQVBJXG4gKi9cblxuaW1wb3J0IHsgQXhpb3NSZXF1ZXN0Q29uZmlnIH0gZnJvbSAnYXhpb3MnO1xuaW1wb3J0IEJpblRvb2xzIGZyb20gJy4uL3V0aWxzL2JpbnRvb2xzJztcbmltcG9ydCBBdmFsYW5jaGVDb3JlIGZyb20gJy4uL2F2YWxhbmNoZSc7XG5pbXBvcnQgeyBBUElCYXNlLCBSZXF1ZXN0UmVzcG9uc2VEYXRhIH0gZnJvbSAnLi9hcGliYXNlJztcblxuLyoqXG4gKiBAaWdub3JlXG4gKi9cbmNvbnN0IGJpbnRvb2xzID0gQmluVG9vbHMuZ2V0SW5zdGFuY2UoKTtcblxuZXhwb3J0IGNsYXNzIFJFU1RBUEkgZXh0ZW5kcyBBUElCYXNlIHtcbiAgcHJvdGVjdGVkIGNvbnRlbnRUeXBlOnN0cmluZztcblxuICBwcm90ZWN0ZWQgYWNjZXB0VHlwZTpzdHJpbmc7XG5cbiAgcHJvdGVjdGVkIHByZXBIZWFkZXJzID0gKGNvbnRlbnRUeXBlPzpzdHJpbmcsIGFjY2VwdFR5cGU/OnN0cmluZyk6b2JqZWN0ID0+IHtcbiAgICBjb25zdCBoZWFkZXJzOm9iamVjdCA9IHt9O1xuICAgIGlmIChjb250ZW50VHlwZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBoZWFkZXJzWydDb250ZW50LVR5cGUnXSA9IGNvbnRlbnRUeXBlO1xuICAgIH0gZWxzZSB7XG4gICAgICBoZWFkZXJzWydDb250ZW50LVR5cGUnXSA9IHRoaXMuY29udGVudFR5cGU7XG4gICAgfVxuXG4gICAgaWYgKGFjY2VwdFR5cGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgaGVhZGVyc1tcIkFjY2VwdFwiXSA9IGFjY2VwdFR5cGU7XG4gICAgfSBlbHNlIGlmICh0aGlzLmFjY2VwdFR5cGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgaGVhZGVyc1tcIkFjY2VwdFwiXSA9IHRoaXMuYWNjZXB0VHlwZTtcbiAgICB9XG4gICAgcmV0dXJuIGhlYWRlcnM7XG4gIH1cblxuICBwcm90ZWN0ZWQgYXhDb25mID0gKCk6QXhpb3NSZXF1ZXN0Q29uZmlnID0+IHtcbiAgICByZXR1cm4gIHtcbiAgICAgIGJhc2VVUkw6IGAke3RoaXMuY29yZS5nZXRQcm90b2NvbCgpfTovLyR7dGhpcy5jb3JlLmdldElQKCl9OiR7dGhpcy5jb3JlLmdldFBvcnQoKX1gLFxuICAgICAgcmVzcG9uc2VUeXBlOiAnanNvbicsXG4gICAgfTtcblxuICB9XG5cbiAgZ2V0ID0gYXN5bmMgKGJhc2V1cmw/OnN0cmluZywgY29udGVudFR5cGU/OnN0cmluZywgYWNjZXB0VHlwZT86c3RyaW5nKTpQcm9taXNlPFJlcXVlc3RSZXNwb25zZURhdGE+ID0+IHtcbiAgICBjb25zdCBlcDpzdHJpbmcgPSBiYXNldXJsIHx8IHRoaXMuYmFzZXVybDtcblxuICAgIGxldCBoZWFkZXJzOm9iamVjdCA9IHRoaXMucHJlcEhlYWRlcnMoY29udGVudFR5cGUsIGFjY2VwdFR5cGUpO1xuXG4gICAgcmV0dXJuIHRoaXMuY29yZS5nZXQoZXAsIHt9LCBoZWFkZXJzLCB0aGlzLmF4Q29uZigpKS50aGVuKChyZXNwOlJlcXVlc3RSZXNwb25zZURhdGEpID0+IHJlc3ApO1xuICB9O1xuXG4gIHBvc3QgPSBhc3luYyAobWV0aG9kOnN0cmluZywgcGFyYW1zPzpBcnJheTxvYmplY3Q+IHwgb2JqZWN0LCBiYXNldXJsPzpzdHJpbmcsXG4gICAgY29udGVudFR5cGU/OnN0cmluZywgYWNjZXB0VHlwZT86c3RyaW5nKTpQcm9taXNlPFJlcXVlc3RSZXNwb25zZURhdGE+ID0+IHtcbiAgICBjb25zdCBlcDpzdHJpbmcgPSBiYXNldXJsIHx8IHRoaXMuYmFzZXVybDtcbiAgICBjb25zdCBycGM6YW55ID0ge307XG4gICAgcnBjLm1ldGhvZCA9IG1ldGhvZDtcblxuICAgIC8vIFNldCBwYXJhbWV0ZXJzIGlmIGV4aXN0c1xuICAgIGlmIChwYXJhbXMpIHtcbiAgICAgIHJwYy5wYXJhbXMgPSBwYXJhbXM7XG4gICAgfVxuXG4gICAgY29uc3QgaGVhZGVyczpvYmplY3QgPSB0aGlzLnByZXBIZWFkZXJzKGNvbnRlbnRUeXBlLCBhY2NlcHRUeXBlKTtcblxuICAgIHJldHVybiB0aGlzLmNvcmUucG9zdChlcCwge30sIEpTT04uc3RyaW5naWZ5KHJwYyksIGhlYWRlcnMsIHRoaXMuYXhDb25mKCkpXG4gICAgICAudGhlbigocmVzcDpSZXF1ZXN0UmVzcG9uc2VEYXRhKSA9PiByZXNwKTtcbiAgfTtcblxuICBwdXQgPSBhc3luYyAobWV0aG9kOnN0cmluZyxcbiAgICBwYXJhbXM/OkFycmF5PG9iamVjdD4gfCBvYmplY3QsXG4gICAgYmFzZXVybD86c3RyaW5nLFxuICAgIGNvbnRlbnRUeXBlPzpzdHJpbmcsXG4gICAgYWNjZXB0VHlwZT86c3RyaW5nKTpQcm9taXNlPFJlcXVlc3RSZXNwb25zZURhdGE+ID0+IHtcbiAgICBjb25zdCBlcDpzdHJpbmcgPSBiYXNldXJsIHx8IHRoaXMuYmFzZXVybDtcbiAgICBjb25zdCBycGM6YW55ID0ge307XG4gICAgcnBjLm1ldGhvZCA9IG1ldGhvZDtcblxuICAgIC8vIFNldCBwYXJhbWV0ZXJzIGlmIGV4aXN0c1xuICAgIGlmIChwYXJhbXMpIHtcbiAgICAgIHJwYy5wYXJhbXMgPSBwYXJhbXM7XG4gICAgfVxuXG4gICAgY29uc3QgaGVhZGVyczpvYmplY3QgPSB0aGlzLnByZXBIZWFkZXJzKGNvbnRlbnRUeXBlLCBhY2NlcHRUeXBlKTtcblxuICAgIHJldHVybiB0aGlzLmNvcmUucHV0KGVwLCB7fSwgSlNPTi5zdHJpbmdpZnkocnBjKSwgaGVhZGVycywgdGhpcy5heENvbmYoKSlcbiAgICAgIC50aGVuKChyZXNwOlJlcXVlc3RSZXNwb25zZURhdGEpID0+IHJlc3ApO1xuICB9O1xuXG4gIGRlbGV0ZSA9IGFzeW5jIChtZXRob2Q6c3RyaW5nLCBwYXJhbXM/OkFycmF5PG9iamVjdD4gfCBvYmplY3QsIGJhc2V1cmw/OnN0cmluZyxcbiAgICBjb250ZW50VHlwZT86c3RyaW5nLCBhY2NlcHRUeXBlPzpzdHJpbmcpOlByb21pc2U8UmVxdWVzdFJlc3BvbnNlRGF0YT4gPT4ge1xuICAgIGNvbnN0IGVwOnN0cmluZyA9IGJhc2V1cmwgfHwgdGhpcy5iYXNldXJsO1xuICAgIGNvbnN0IHJwYzphbnkgPSB7fTtcbiAgICBycGMubWV0aG9kID0gbWV0aG9kO1xuXG4gICAgLy8gU2V0IHBhcmFtZXRlcnMgaWYgZXhpc3RzXG4gICAgaWYgKHBhcmFtcykge1xuICAgICAgcnBjLnBhcmFtcyA9IHBhcmFtcztcbiAgICB9XG5cbiAgICBjb25zdCBoZWFkZXJzOm9iamVjdCA9IHRoaXMucHJlcEhlYWRlcnMoY29udGVudFR5cGUsIGFjY2VwdFR5cGUpO1xuXG4gICAgcmV0dXJuIHRoaXMuY29yZS5kZWxldGUoZXAsIHt9LCBoZWFkZXJzLCB0aGlzLmF4Q29uZigpKS50aGVuKChyZXNwOlJlcXVlc3RSZXNwb25zZURhdGEpID0+IHJlc3ApO1xuICB9O1xuXG4gIHBhdGNoID0gYXN5bmMgKG1ldGhvZDpzdHJpbmcsIHBhcmFtcz86QXJyYXk8b2JqZWN0PiB8IG9iamVjdCwgYmFzZXVybD86c3RyaW5nLFxuICAgIGNvbnRlbnRUeXBlPzpzdHJpbmcsIGFjY2VwdFR5cGU/OnN0cmluZyk6UHJvbWlzZTxSZXF1ZXN0UmVzcG9uc2VEYXRhPiA9PiB7XG4gICAgY29uc3QgZXA6c3RyaW5nID0gYmFzZXVybCB8fCB0aGlzLmJhc2V1cmw7XG4gICAgY29uc3QgcnBjOmFueSA9IHt9O1xuICAgIHJwYy5tZXRob2QgPSBtZXRob2Q7XG5cbiAgICAvLyBTZXQgcGFyYW1ldGVycyBpZiBleGlzdHNcbiAgICBpZiAocGFyYW1zKSB7XG4gICAgICBycGMucGFyYW1zID0gcGFyYW1zO1xuICAgIH1cblxuICAgIGNvbnN0IGhlYWRlcnM6b2JqZWN0ID0gdGhpcy5wcmVwSGVhZGVycyhjb250ZW50VHlwZSwgYWNjZXB0VHlwZSk7XG5cbiAgICByZXR1cm4gdGhpcy5jb3JlLnBhdGNoKGVwLCB7fSwgSlNPTi5zdHJpbmdpZnkocnBjKSwgaGVhZGVycywgdGhpcy5heENvbmYoKSlcbiAgICAgIC50aGVuKChyZXNwOlJlcXVlc3RSZXNwb25zZURhdGEpID0+IHJlc3ApO1xuICB9O1xuXG4gIC8qKlxuICAgICAqIFJldHVybnMgdGhlIHR5cGUgb2YgdGhlIGVudGl0eSBhdHRhY2hlZCB0byB0aGUgaW5jb21pbmcgcmVxdWVzdFxuICAgICAqL1xuICBnZXRDb250ZW50VHlwZSA9ICgpOnN0cmluZyA9PiB0aGlzLmNvbnRlbnRUeXBlO1xuXG4gIC8qKlxuICAgICAqIFJldHVybnMgd2hhdCB0eXBlIG9mIHJlcHJlc2VudGF0aW9uIGlzIGRlc2lyZWQgYXQgdGhlIGNsaWVudCBzaWRlXG4gICAgICovXG4gIGdldEFjY2VwdFR5cGUgPSAoKTpzdHJpbmcgPT4gdGhpcy5hY2NlcHRUeXBlO1xuXG4gIC8qKlxuICAgICAqXG4gICAgICogQHBhcmFtIGNvcmUgUmVmZXJlbmNlIHRvIHRoZSBBdmFsYW5jaGUgaW5zdGFuY2UgdXNpbmcgdGhpcyBlbmRwb2ludFxuICAgICAqIEBwYXJhbSBiYXNldXJsIFBhdGggb2YgdGhlIEFQSXMgYmFzZXVybCAtIGV4OiBcIi9leHQvYmMvYXZtXCJcbiAgICAgKiBAcGFyYW0gY29udGVudFR5cGUgT3B0aW9uYWwgRGV0ZXJtaW5lcyB0aGUgdHlwZSBvZiB0aGUgZW50aXR5IGF0dGFjaGVkIHRvIHRoZVxuICAgICAqIGluY29taW5nIHJlcXVlc3RcbiAgICAgKiBAcGFyYW0gYWNjZXB0VHlwZSBPcHRpb25hbCBEZXRlcm1pbmVzIHRoZSB0eXBlIG9mIHJlcHJlc2VudGF0aW9uIHdoaWNoIGlzXG4gICAgICogZGVzaXJlZCBvbiB0aGUgY2xpZW50IHNpZGVcbiAgICAgKi9cbiAgY29uc3RydWN0b3IoY29yZTpBdmFsYW5jaGVDb3JlLFxuICAgIGJhc2V1cmw6c3RyaW5nLFxuICAgIGNvbnRlbnRUeXBlOnN0cmluZyA9ICdhcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9VVRGLTgnLFxuICAgIGFjY2VwdFR5cGU6c3RyaW5nID0gdW5kZWZpbmVkKSB7XG4gICAgc3VwZXIoY29yZSwgYmFzZXVybCk7XG4gICAgdGhpcy5jb250ZW50VHlwZSA9IGNvbnRlbnRUeXBlO1xuICAgIHRoaXMuYWNjZXB0VHlwZSA9IGFjY2VwdFR5cGU7XG4gIH1cbn1cblxuXG5cblxuXG5cbiJdfQ==