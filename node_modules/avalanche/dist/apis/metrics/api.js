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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsAPI = void 0;
const restapi_1 = require("../../common/restapi");
/**
 * Class for interacting with a node API that is using the node's MetricsApi.
 *
 * @category RPCAPIs
 *
 * @remarks This extends the [[RESTAPI]] class. This class should not be directly called. Instead, use the [[Avalanche.addAPI]] function to register this interface with Avalanche.
 */
class MetricsAPI extends restapi_1.RESTAPI {
    /**
       * This class should not be instantiated directly. Instead use the [[Avalanche.addAPI]] method.
       *
       * @param core A reference to the Avalanche class
       * @param baseurl Defaults to the string "/ext/metrics" as the path to blockchain's baseurl
       */
    constructor(core, baseurl = '/ext/metrics') {
        super(core, baseurl);
        this.axConf = () => {
            return {
                baseURL: `${this.core.getProtocol()}://${this.core.getIP()}:${this.core.getPort()}`,
                responseType: 'text',
            };
        };
        /**
           *
           * @returns Promise for an object containing the metrics response
           */
        this.getMetrics = () => __awaiter(this, void 0, void 0, function* () {
            return this.post('')
                .then((response) => response.data);
        });
    }
}
exports.MetricsAPI = MetricsAPI;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2FwaXMvbWV0cmljcy9hcGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBS0Esa0RBQStDO0FBSy9DOzs7Ozs7R0FNRztBQUNILE1BQWEsVUFBVyxTQUFRLGlCQUFPO0lBZ0JyQzs7Ozs7U0FLSztJQUNMLFlBQVksSUFBa0IsRUFBRSxVQUFpQixjQUFjO1FBQUksS0FBSyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztRQXJCOUUsV0FBTSxHQUFHLEdBQXNCLEVBQUU7WUFDekMsT0FBUTtnQkFDTixPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRTtnQkFDbkYsWUFBWSxFQUFFLE1BQU07YUFDckIsQ0FBQztRQUVKLENBQUMsQ0FBQTtRQUVEOzs7YUFHSztRQUNMLGVBQVUsR0FBRyxHQUF5QixFQUFFO1lBQUMsT0FBQSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztpQkFDbkQsSUFBSSxDQUFDLENBQUMsUUFBNEIsRUFBRSxFQUFFLENBQUMsUUFBUSxDQUFDLElBQWMsQ0FBQyxDQUFBO1VBQUEsQ0FBQztJQVFzQixDQUFDO0NBQzNGO0FBdkJELGdDQXVCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQHBhY2thZ2VEb2N1bWVudGF0aW9uXG4gKiBAbW9kdWxlIEFQSS1NZXRyaWNzXG4gKi9cbmltcG9ydCBBdmFsYW5jaGVDb3JlIGZyb20gJy4uLy4uL2F2YWxhbmNoZSc7XG5pbXBvcnQgeyBSRVNUQVBJIH0gZnJvbSAnLi4vLi4vY29tbW9uL3Jlc3RhcGknO1xuaW1wb3J0IHsgUmVxdWVzdFJlc3BvbnNlRGF0YSB9IGZyb20gJy4uLy4uL2NvbW1vbi9hcGliYXNlJztcbmltcG9ydCB7IEF4aW9zUmVxdWVzdENvbmZpZyB9IGZyb20gJ2F4aW9zJztcblxuXG4vKipcbiAqIENsYXNzIGZvciBpbnRlcmFjdGluZyB3aXRoIGEgbm9kZSBBUEkgdGhhdCBpcyB1c2luZyB0aGUgbm9kZSdzIE1ldHJpY3NBcGkuXG4gKlxuICogQGNhdGVnb3J5IFJQQ0FQSXNcbiAqXG4gKiBAcmVtYXJrcyBUaGlzIGV4dGVuZHMgdGhlIFtbUkVTVEFQSV1dIGNsYXNzLiBUaGlzIGNsYXNzIHNob3VsZCBub3QgYmUgZGlyZWN0bHkgY2FsbGVkLiBJbnN0ZWFkLCB1c2UgdGhlIFtbQXZhbGFuY2hlLmFkZEFQSV1dIGZ1bmN0aW9uIHRvIHJlZ2lzdGVyIHRoaXMgaW50ZXJmYWNlIHdpdGggQXZhbGFuY2hlLlxuICovXG5leHBvcnQgY2xhc3MgTWV0cmljc0FQSSBleHRlbmRzIFJFU1RBUEkge1xuICBwcm90ZWN0ZWQgYXhDb25mID0gKCk6QXhpb3NSZXF1ZXN0Q29uZmlnID0+IHtcbiAgICByZXR1cm4gIHtcbiAgICAgIGJhc2VVUkw6IGAke3RoaXMuY29yZS5nZXRQcm90b2NvbCgpfTovLyR7dGhpcy5jb3JlLmdldElQKCl9OiR7dGhpcy5jb3JlLmdldFBvcnQoKX1gLFxuICAgICAgcmVzcG9uc2VUeXBlOiAndGV4dCcsXG4gICAgfTtcblxuICB9XG5cbiAgLyoqXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBQcm9taXNlIGZvciBhbiBvYmplY3QgY29udGFpbmluZyB0aGUgbWV0cmljcyByZXNwb25zZVxuICAgICAqL1xuICBnZXRNZXRyaWNzID0gYXN5bmMgKCk6UHJvbWlzZTxzdHJpbmc+ID0+IHRoaXMucG9zdCgnJylcbiAgICAudGhlbigocmVzcG9uc2U6UmVxdWVzdFJlc3BvbnNlRGF0YSkgPT4gcmVzcG9uc2UuZGF0YSBhcyBzdHJpbmcpO1xuXG4gIC8qKlxuICAgICAqIFRoaXMgY2xhc3Mgc2hvdWxkIG5vdCBiZSBpbnN0YW50aWF0ZWQgZGlyZWN0bHkuIEluc3RlYWQgdXNlIHRoZSBbW0F2YWxhbmNoZS5hZGRBUEldXSBtZXRob2QuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gY29yZSBBIHJlZmVyZW5jZSB0byB0aGUgQXZhbGFuY2hlIGNsYXNzXG4gICAgICogQHBhcmFtIGJhc2V1cmwgRGVmYXVsdHMgdG8gdGhlIHN0cmluZyBcIi9leHQvbWV0cmljc1wiIGFzIHRoZSBwYXRoIHRvIGJsb2NrY2hhaW4ncyBiYXNldXJsXG4gICAgICovXG4gIGNvbnN0cnVjdG9yKGNvcmU6QXZhbGFuY2hlQ29yZSwgYmFzZXVybDpzdHJpbmcgPSAnL2V4dC9tZXRyaWNzJykgeyBzdXBlcihjb3JlLCBiYXNldXJsKTsgfVxufVxuXG4iXX0=