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
exports.HealthAPI = void 0;
const jrpcapi_1 = require("../../common/jrpcapi");
/**
 * Class for interacting with a node API that is using the node's HealthApi.
 *
 * @category RPCAPIs
 *
 * @remarks This extends the [[JRPCAPI]] class. This class should not be directly called. Instead, use the [[Avalanche.addAPI]] function to register this interface with Avalanche.
 */
class HealthAPI extends jrpcapi_1.JRPCAPI {
    /**
       * This class should not be instantiated directly. Instead use the [[Avalanche.addAPI]] method.
       *
       * @param core A reference to the Avalanche class
       * @param baseurl Defaults to the string "/ext/health" as the path to blockchain's baseurl
       */
    constructor(core, baseurl = '/ext/health') {
        super(core, baseurl);
        /**
           *
           * @returns Promise for an object containing the health check response
           */
        this.getLiveness = () => __awaiter(this, void 0, void 0, function* () {
            return this.callMethod('health.getLiveness')
                .then((response) => response.data.result);
        });
    }
}
exports.HealthAPI = HealthAPI;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2FwaXMvaGVhbHRoL2FwaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFLQSxrREFBK0M7QUFJL0M7Ozs7OztHQU1HO0FBQ0gsTUFBYSxTQUFVLFNBQVEsaUJBQU87SUFRcEM7Ozs7O1NBS0s7SUFDTCxZQUFZLElBQWtCLEVBQUUsVUFBaUIsYUFBYTtRQUFJLEtBQUssQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFidkY7OzthQUdLO1FBQ0wsZ0JBQVcsR0FBRyxHQUF5QixFQUFFO1lBQUMsT0FBQSxJQUFJLENBQUMsVUFBVSxDQUFDLG9CQUFvQixDQUFDO2lCQUM1RSxJQUFJLENBQUMsQ0FBQyxRQUE0QixFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO1VBQUEsQ0FBQztJQVF3QixDQUFDO0NBQzFGO0FBZkQsOEJBZUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBwYWNrYWdlRG9jdW1lbnRhdGlvblxuICogQG1vZHVsZSBBUEktSGVhbHRoXG4gKi9cbmltcG9ydCBBdmFsYW5jaGVDb3JlIGZyb20gJy4uLy4uL2F2YWxhbmNoZSc7XG5pbXBvcnQgeyBKUlBDQVBJIH0gZnJvbSAnLi4vLi4vY29tbW9uL2pycGNhcGknO1xuaW1wb3J0IHsgUmVxdWVzdFJlc3BvbnNlRGF0YSB9IGZyb20gJy4uLy4uL2NvbW1vbi9hcGliYXNlJztcblxuXG4vKipcbiAqIENsYXNzIGZvciBpbnRlcmFjdGluZyB3aXRoIGEgbm9kZSBBUEkgdGhhdCBpcyB1c2luZyB0aGUgbm9kZSdzIEhlYWx0aEFwaS5cbiAqXG4gKiBAY2F0ZWdvcnkgUlBDQVBJc1xuICpcbiAqIEByZW1hcmtzIFRoaXMgZXh0ZW5kcyB0aGUgW1tKUlBDQVBJXV0gY2xhc3MuIFRoaXMgY2xhc3Mgc2hvdWxkIG5vdCBiZSBkaXJlY3RseSBjYWxsZWQuIEluc3RlYWQsIHVzZSB0aGUgW1tBdmFsYW5jaGUuYWRkQVBJXV0gZnVuY3Rpb24gdG8gcmVnaXN0ZXIgdGhpcyBpbnRlcmZhY2Ugd2l0aCBBdmFsYW5jaGUuXG4gKi9cbmV4cG9ydCBjbGFzcyBIZWFsdGhBUEkgZXh0ZW5kcyBKUlBDQVBJIHtcbiAgLyoqXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBQcm9taXNlIGZvciBhbiBvYmplY3QgY29udGFpbmluZyB0aGUgaGVhbHRoIGNoZWNrIHJlc3BvbnNlXG4gICAgICovXG4gIGdldExpdmVuZXNzID0gYXN5bmMgKCk6UHJvbWlzZTxvYmplY3Q+ID0+IHRoaXMuY2FsbE1ldGhvZCgnaGVhbHRoLmdldExpdmVuZXNzJylcbiAgICAudGhlbigocmVzcG9uc2U6UmVxdWVzdFJlc3BvbnNlRGF0YSkgPT4gcmVzcG9uc2UuZGF0YS5yZXN1bHQpO1xuXG4gIC8qKlxuICAgICAqIFRoaXMgY2xhc3Mgc2hvdWxkIG5vdCBiZSBpbnN0YW50aWF0ZWQgZGlyZWN0bHkuIEluc3RlYWQgdXNlIHRoZSBbW0F2YWxhbmNoZS5hZGRBUEldXSBtZXRob2QuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gY29yZSBBIHJlZmVyZW5jZSB0byB0aGUgQXZhbGFuY2hlIGNsYXNzXG4gICAgICogQHBhcmFtIGJhc2V1cmwgRGVmYXVsdHMgdG8gdGhlIHN0cmluZyBcIi9leHQvaGVhbHRoXCIgYXMgdGhlIHBhdGggdG8gYmxvY2tjaGFpbidzIGJhc2V1cmxcbiAgICAgKi9cbiAgY29uc3RydWN0b3IoY29yZTpBdmFsYW5jaGVDb3JlLCBiYXNldXJsOnN0cmluZyA9ICcvZXh0L2hlYWx0aCcpIHsgc3VwZXIoY29yZSwgYmFzZXVybCk7IH1cbn1cblxuIl19