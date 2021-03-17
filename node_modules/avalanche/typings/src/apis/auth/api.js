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
exports.AuthAPI = void 0;
const jrpcapi_1 = require("../../common/jrpcapi");
/**
 * Class for interacting with a node's AuthAPI.
 *
 * @category RPCAPIs
 *
 * @remarks This extends the [[JRPCAPI]] class. This class should not be directly called. Instead, use the [[Avalanche.addAPI]] function to register this interface with Avalanche.
 */
class AuthAPI extends jrpcapi_1.JRPCAPI {
    constructor(core, baseurl = '/ext/auth') {
        super(core, baseurl);
        /**
         * Creates a new authorization token that grants access to one or more API endpoints.
         *
         * @param password This node's authorization token password, set through the CLI when the node was launched.
         * @param endpoints A list of endpoints that will be accessible using the generated token. If there's an element that is "*", this token can reach any endpoint.
         *
         * @returns Returns a Promise<string> containing the authorization token.
         */
        this.newToken = (password, endpoints) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                password,
                endpoints
            };
            return this.callMethod('auth.newToken', params)
                .then((response) => response.data.result.token);
        });
        /**
         * Revokes an authorization token, removing all of its rights to access endpoints.
         *
         * @param password This node's authorization token password, set through the CLI when the node was launched.
         * @param token An authorization token whose access should be revoked.
         *
         * @returns Returns a Promise<boolean> indicating if a token was successfully revoked.
         */
        this.revokeToken = (password, token) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                password,
                token
            };
            return this.callMethod('auth.revokeToken', params)
                .then((response) => response.data.result.success);
        });
        /**
         * Change this node's authorization token password. **Any authorization tokens created under an old password will become invalid.**
         *
         * @param oldPassword This node's authorization token password, set through the CLI when the node was launched.
         * @param newPassword A new password for this node's authorization token issuance.
         *
         * @returns Returns a Promise<boolean> indicating if the password was successfully changed.
         */
        this.changePassword = (oldPassword, newPassword) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                oldPassword,
                newPassword
            };
            return this.callMethod('auth.changePassword', params)
                .then((response) => response.data.result.success);
        });
    }
}
exports.AuthAPI = AuthAPI;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2FwaXMvYXV0aC9hcGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBS0Esa0RBQStDO0FBRy9DOzs7Ozs7R0FNRztBQUNILE1BQWEsT0FBUSxTQUFRLGlCQUFPO0lBcURoQyxZQUFZLElBQWtCLEVBQUUsVUFBaUIsV0FBVztRQUFJLEtBQUssQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFwRHJGOzs7Ozs7O1dBT0c7UUFDSCxhQUFRLEdBQUcsQ0FBTyxRQUFlLEVBQUUsU0FBdUIsRUFBa0IsRUFBRTtZQUMxRSxNQUFNLE1BQU0sR0FBTztnQkFDZixRQUFRO2dCQUNSLFNBQVM7YUFDWixDQUFDO1lBQ0YsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLGVBQWUsRUFBRSxNQUFNLENBQUM7aUJBQzFDLElBQUksQ0FBQyxDQUFDLFFBQTRCLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzVFLENBQUMsQ0FBQSxDQUFDO1FBR0Y7Ozs7Ozs7V0FPRztRQUNILGdCQUFXLEdBQUcsQ0FBTyxRQUFlLEVBQUUsS0FBWSxFQUFtQixFQUFFO1lBQ25FLE1BQU0sTUFBTSxHQUFPO2dCQUNmLFFBQVE7Z0JBQ1IsS0FBSzthQUNSLENBQUM7WUFDRixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsa0JBQWtCLEVBQUUsTUFBTSxDQUFDO2lCQUM3QyxJQUFJLENBQUMsQ0FBQyxRQUE0QixFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM5RSxDQUFDLENBQUEsQ0FBQztRQUVGOzs7Ozs7O1dBT0c7UUFDSCxtQkFBYyxHQUFHLENBQU8sV0FBa0IsRUFBRSxXQUFrQixFQUFtQixFQUFFO1lBQy9FLE1BQU0sTUFBTSxHQUFPO2dCQUNmLFdBQVc7Z0JBQ1gsV0FBVzthQUNkLENBQUM7WUFDRixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMscUJBQXFCLEVBQUUsTUFBTSxDQUFDO2lCQUNoRCxJQUFJLENBQUMsQ0FBQyxRQUE0QixFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM5RSxDQUFDLENBQUEsQ0FBQztJQUVvRixDQUFDO0NBQzFGO0FBdERELDBCQXNEQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQHBhY2thZ2VEb2N1bWVudGF0aW9uXG4gKiBAbW9kdWxlIEFQSS1BdXRoXG4gKi9cbmltcG9ydCBBdmFsYW5jaGVDb3JlIGZyb20gJy4uLy4uL2F2YWxhbmNoZSc7XG5pbXBvcnQgeyBKUlBDQVBJIH0gZnJvbSAnLi4vLi4vY29tbW9uL2pycGNhcGknO1xuaW1wb3J0IHsgUmVxdWVzdFJlc3BvbnNlRGF0YSB9IGZyb20gJy4uLy4uL2NvbW1vbi9hcGliYXNlJztcblxuLyoqXG4gKiBDbGFzcyBmb3IgaW50ZXJhY3Rpbmcgd2l0aCBhIG5vZGUncyBBdXRoQVBJLlxuICpcbiAqIEBjYXRlZ29yeSBSUENBUElzXG4gKlxuICogQHJlbWFya3MgVGhpcyBleHRlbmRzIHRoZSBbW0pSUENBUEldXSBjbGFzcy4gVGhpcyBjbGFzcyBzaG91bGQgbm90IGJlIGRpcmVjdGx5IGNhbGxlZC4gSW5zdGVhZCwgdXNlIHRoZSBbW0F2YWxhbmNoZS5hZGRBUEldXSBmdW5jdGlvbiB0byByZWdpc3RlciB0aGlzIGludGVyZmFjZSB3aXRoIEF2YWxhbmNoZS5cbiAqL1xuZXhwb3J0IGNsYXNzIEF1dGhBUEkgZXh0ZW5kcyBKUlBDQVBJIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IGF1dGhvcml6YXRpb24gdG9rZW4gdGhhdCBncmFudHMgYWNjZXNzIHRvIG9uZSBvciBtb3JlIEFQSSBlbmRwb2ludHMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcGFzc3dvcmQgVGhpcyBub2RlJ3MgYXV0aG9yaXphdGlvbiB0b2tlbiBwYXNzd29yZCwgc2V0IHRocm91Z2ggdGhlIENMSSB3aGVuIHRoZSBub2RlIHdhcyBsYXVuY2hlZC5cbiAgICAgKiBAcGFyYW0gZW5kcG9pbnRzIEEgbGlzdCBvZiBlbmRwb2ludHMgdGhhdCB3aWxsIGJlIGFjY2Vzc2libGUgdXNpbmcgdGhlIGdlbmVyYXRlZCB0b2tlbi4gSWYgdGhlcmUncyBhbiBlbGVtZW50IHRoYXQgaXMgXCIqXCIsIHRoaXMgdG9rZW4gY2FuIHJlYWNoIGFueSBlbmRwb2ludC5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIFJldHVybnMgYSBQcm9taXNlPHN0cmluZz4gY29udGFpbmluZyB0aGUgYXV0aG9yaXphdGlvbiB0b2tlbi5cbiAgICAgKi9cbiAgICBuZXdUb2tlbiA9IGFzeW5jIChwYXNzd29yZDpzdHJpbmcsIGVuZHBvaW50czpBcnJheTxzdHJpbmc+KTpQcm9taXNlPHN0cmluZz4gPT4ge1xuICAgICAgICBjb25zdCBwYXJhbXM6YW55ID0ge1xuICAgICAgICAgICAgcGFzc3dvcmQsXG4gICAgICAgICAgICBlbmRwb2ludHNcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FsbE1ldGhvZCgnYXV0aC5uZXdUb2tlbicsIHBhcmFtcylcbiAgICAgICAgICAgIC50aGVuKChyZXNwb25zZTpSZXF1ZXN0UmVzcG9uc2VEYXRhKSA9PiByZXNwb25zZS5kYXRhLnJlc3VsdC50b2tlbik7XG4gICAgfTtcblxuXG4gICAgLyoqXG4gICAgICogUmV2b2tlcyBhbiBhdXRob3JpemF0aW9uIHRva2VuLCByZW1vdmluZyBhbGwgb2YgaXRzIHJpZ2h0cyB0byBhY2Nlc3MgZW5kcG9pbnRzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHBhc3N3b3JkIFRoaXMgbm9kZSdzIGF1dGhvcml6YXRpb24gdG9rZW4gcGFzc3dvcmQsIHNldCB0aHJvdWdoIHRoZSBDTEkgd2hlbiB0aGUgbm9kZSB3YXMgbGF1bmNoZWQuXG4gICAgICogQHBhcmFtIHRva2VuIEFuIGF1dGhvcml6YXRpb24gdG9rZW4gd2hvc2UgYWNjZXNzIHNob3VsZCBiZSByZXZva2VkLlxuICAgICAqXG4gICAgICogQHJldHVybnMgUmV0dXJucyBhIFByb21pc2U8Ym9vbGVhbj4gaW5kaWNhdGluZyBpZiBhIHRva2VuIHdhcyBzdWNjZXNzZnVsbHkgcmV2b2tlZC5cbiAgICAgKi9cbiAgICByZXZva2VUb2tlbiA9IGFzeW5jIChwYXNzd29yZDpzdHJpbmcsIHRva2VuOnN0cmluZyk6UHJvbWlzZTxib29sZWFuPiA9PiB7XG4gICAgICAgIGNvbnN0IHBhcmFtczphbnkgPSB7XG4gICAgICAgICAgICBwYXNzd29yZCxcbiAgICAgICAgICAgIHRva2VuXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiB0aGlzLmNhbGxNZXRob2QoJ2F1dGgucmV2b2tlVG9rZW4nLCBwYXJhbXMpXG4gICAgICAgICAgICAudGhlbigocmVzcG9uc2U6UmVxdWVzdFJlc3BvbnNlRGF0YSkgPT4gcmVzcG9uc2UuZGF0YS5yZXN1bHQuc3VjY2Vzcyk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIENoYW5nZSB0aGlzIG5vZGUncyBhdXRob3JpemF0aW9uIHRva2VuIHBhc3N3b3JkLiAqKkFueSBhdXRob3JpemF0aW9uIHRva2VucyBjcmVhdGVkIHVuZGVyIGFuIG9sZCBwYXNzd29yZCB3aWxsIGJlY29tZSBpbnZhbGlkLioqXG4gICAgICpcbiAgICAgKiBAcGFyYW0gb2xkUGFzc3dvcmQgVGhpcyBub2RlJ3MgYXV0aG9yaXphdGlvbiB0b2tlbiBwYXNzd29yZCwgc2V0IHRocm91Z2ggdGhlIENMSSB3aGVuIHRoZSBub2RlIHdhcyBsYXVuY2hlZC5cbiAgICAgKiBAcGFyYW0gbmV3UGFzc3dvcmQgQSBuZXcgcGFzc3dvcmQgZm9yIHRoaXMgbm9kZSdzIGF1dGhvcml6YXRpb24gdG9rZW4gaXNzdWFuY2UuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBSZXR1cm5zIGEgUHJvbWlzZTxib29sZWFuPiBpbmRpY2F0aW5nIGlmIHRoZSBwYXNzd29yZCB3YXMgc3VjY2Vzc2Z1bGx5IGNoYW5nZWQuXG4gICAgICovXG4gICAgY2hhbmdlUGFzc3dvcmQgPSBhc3luYyAob2xkUGFzc3dvcmQ6c3RyaW5nLCBuZXdQYXNzd29yZDpzdHJpbmcpOlByb21pc2U8Ym9vbGVhbj4gPT4ge1xuICAgICAgICBjb25zdCBwYXJhbXM6YW55ID0ge1xuICAgICAgICAgICAgb2xkUGFzc3dvcmQsXG4gICAgICAgICAgICBuZXdQYXNzd29yZFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gdGhpcy5jYWxsTWV0aG9kKCdhdXRoLmNoYW5nZVBhc3N3b3JkJywgcGFyYW1zKVxuICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlOlJlcXVlc3RSZXNwb25zZURhdGEpID0+IHJlc3BvbnNlLmRhdGEucmVzdWx0LnN1Y2Nlc3MpO1xuICAgIH07XG5cbiAgICBjb25zdHJ1Y3Rvcihjb3JlOkF2YWxhbmNoZUNvcmUsIGJhc2V1cmw6c3RyaW5nID0gJy9leHQvYXV0aCcpIHsgc3VwZXIoY29yZSwgYmFzZXVybCk7IH1cbn1cbiJdfQ==