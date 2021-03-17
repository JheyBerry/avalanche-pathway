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
exports.KeystoreAPI = void 0;
const jrpcapi_1 = require("../../common/jrpcapi");
/**
 * Class for interacting with a node API that is using the node's KeystoreAPI.
 *
 * **WARNING**: The KeystoreAPI is to be used by the node-owner as the data is stored locally on the node. Do not trust the root user. If you are not the node-owner, do not use this as your wallet.
 *
 * @category RPCAPIs
 *
 * @remarks This extends the [[JRPCAPI]] class. This class should not be directly called. Instead, use the [[Avalanche.addAPI]] function to register this interface with Avalanche.
 */
class KeystoreAPI extends jrpcapi_1.JRPCAPI {
    /**
       * This class should not be instantiated directly. Instead use the [[Avalanche.addAPI]] method.
       *
       * @param core A reference to the Avalanche class
       * @param baseurl Defaults to the string "/ext/keystore" as the path to blockchain's baseurl
       */
    constructor(core, baseurl = '/ext/keystore') {
        super(core, baseurl);
        /**
           * Creates a user in the node's database.
           *
           * @param username Name of the user to create
           * @param password Password for the user
           *
           * @returns Promise for a boolean with true on success
           */
        this.createUser = (username, password) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                username,
                password,
            };
            return this.callMethod('keystore.createUser', params)
                .then((response) => response.data.result.success);
        });
        /**
           * Exports a user. The user can be imported to another node with keystore.importUser .
           *
           * @param username The name of the user to export
           * @param password The password of the user to export
           *
           * @returns Promise with a string importable using importUser
           */
        this.exportUser = (username, password) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                username,
                password,
            };
            return this.callMethod('keystore.exportUser', params)
                .then((response) => response.data.result.user);
        });
        /**
           * Imports a user file into the node's user database and assigns it to a username.
           *
           * @param username The name the user file should be imported into
           * @param user cb58 serialized string represetning a user's data
           * @param password The user's password
           *
           * @returns A promise with a true-value on success.
           */
        this.importUser = (username, user, password) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                username,
                user,
                password,
            };
            return this.callMethod('keystore.importUser', params)
                .then((response) => response.data.result.success);
        });
        /**
           * Lists the names of all users on the node.
           *
           * @returns Promise of an array with all user names.
           */
        this.listUsers = () => __awaiter(this, void 0, void 0, function* () {
            return this.callMethod('keystore.listUsers')
                .then((response) => response.data.result.users);
        });
        /**
           * Deletes a user in the node's database.
           *
           * @param username Name of the user to delete
           * @param password Password for the user
           *
           * @returns Promise for a boolean with true on success
           */
        this.deleteUser = (username, password) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                username,
                password,
            };
            return this.callMethod('keystore.deleteUser', params)
                .then((response) => response.data.result.success);
        });
    }
}
exports.KeystoreAPI = KeystoreAPI;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2FwaXMva2V5c3RvcmUvYXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUtBLGtEQUErQztBQUcvQzs7Ozs7Ozs7R0FRRztBQUNILE1BQWEsV0FBWSxTQUFRLGlCQUFPO0lBK0V0Qzs7Ozs7U0FLSztJQUNMLFlBQVksSUFBa0IsRUFBRSxVQUFpQixlQUFlO1FBQUksS0FBSyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztRQXBGekY7Ozs7Ozs7YUFPSztRQUNMLGVBQVUsR0FBRyxDQUFPLFFBQWUsRUFBRSxRQUFlLEVBQW1CLEVBQUU7WUFDdkUsTUFBTSxNQUFNLEdBQU87Z0JBQ2pCLFFBQVE7Z0JBQ1IsUUFBUTthQUNULENBQUM7WUFDRixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMscUJBQXFCLEVBQUUsTUFBTSxDQUFDO2lCQUNsRCxJQUFJLENBQUMsQ0FBQyxRQUE0QixFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMxRSxDQUFDLENBQUEsQ0FBQztRQUVGOzs7Ozs7O2FBT0s7UUFDTCxlQUFVLEdBQUcsQ0FBTyxRQUFlLEVBQUUsUUFBZSxFQUFrQixFQUFFO1lBQ3RFLE1BQU0sTUFBTSxHQUFPO2dCQUNqQixRQUFRO2dCQUNSLFFBQVE7YUFDVCxDQUFDO1lBQ0YsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLHFCQUFxQixFQUFFLE1BQU0sQ0FBQztpQkFDbEQsSUFBSSxDQUFDLENBQUMsUUFBNEIsRUFBRSxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdkUsQ0FBQyxDQUFBLENBQUM7UUFFRjs7Ozs7Ozs7YUFRSztRQUNMLGVBQVUsR0FBRyxDQUFPLFFBQWUsRUFBRSxJQUFXLEVBQUUsUUFBZSxFQUFtQixFQUFFO1lBQ3BGLE1BQU0sTUFBTSxHQUFPO2dCQUNqQixRQUFRO2dCQUNSLElBQUk7Z0JBQ0osUUFBUTthQUNULENBQUM7WUFDRixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMscUJBQXFCLEVBQUUsTUFBTSxDQUFDO2lCQUNsRCxJQUFJLENBQUMsQ0FBQyxRQUE0QixFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMxRSxDQUFDLENBQUEsQ0FBQztRQUVGOzs7O2FBSUs7UUFDTCxjQUFTLEdBQUcsR0FBZ0MsRUFBRTtZQUFDLE9BQUEsSUFBSSxDQUFDLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQztpQkFDakYsSUFBSSxDQUFDLENBQUMsUUFBNEIsRUFBRSxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUE7VUFBQSxDQUFDO1FBRXRFOzs7Ozs7O2FBT0s7UUFDTCxlQUFVLEdBQUcsQ0FBTyxRQUFlLEVBQUUsUUFBZSxFQUFtQixFQUFFO1lBQ3ZFLE1BQU0sTUFBTSxHQUFPO2dCQUNqQixRQUFRO2dCQUNSLFFBQVE7YUFDVCxDQUFDO1lBQ0YsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLHFCQUFxQixFQUFFLE1BQU0sQ0FBQztpQkFDbEQsSUFBSSxDQUFDLENBQUMsUUFBNEIsRUFBRSxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDMUUsQ0FBQyxDQUFBLENBQUM7SUFRd0YsQ0FBQztDQUM1RjtBQXRGRCxrQ0FzRkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBwYWNrYWdlRG9jdW1lbnRhdGlvblxuICogQG1vZHVsZSBBUEktS2V5c3RvcmVcbiAqL1xuaW1wb3J0IEF2YWxhbmNoZUNvcmUgZnJvbSAnLi4vLi4vYXZhbGFuY2hlJztcbmltcG9ydCB7IEpSUENBUEkgfSBmcm9tICcuLi8uLi9jb21tb24vanJwY2FwaSc7XG5pbXBvcnQgeyBSZXF1ZXN0UmVzcG9uc2VEYXRhIH0gZnJvbSAnLi4vLi4vY29tbW9uL2FwaWJhc2UnO1xuXG4vKipcbiAqIENsYXNzIGZvciBpbnRlcmFjdGluZyB3aXRoIGEgbm9kZSBBUEkgdGhhdCBpcyB1c2luZyB0aGUgbm9kZSdzIEtleXN0b3JlQVBJLlxuICpcbiAqICoqV0FSTklORyoqOiBUaGUgS2V5c3RvcmVBUEkgaXMgdG8gYmUgdXNlZCBieSB0aGUgbm9kZS1vd25lciBhcyB0aGUgZGF0YSBpcyBzdG9yZWQgbG9jYWxseSBvbiB0aGUgbm9kZS4gRG8gbm90IHRydXN0IHRoZSByb290IHVzZXIuIElmIHlvdSBhcmUgbm90IHRoZSBub2RlLW93bmVyLCBkbyBub3QgdXNlIHRoaXMgYXMgeW91ciB3YWxsZXQuXG4gKlxuICogQGNhdGVnb3J5IFJQQ0FQSXNcbiAqXG4gKiBAcmVtYXJrcyBUaGlzIGV4dGVuZHMgdGhlIFtbSlJQQ0FQSV1dIGNsYXNzLiBUaGlzIGNsYXNzIHNob3VsZCBub3QgYmUgZGlyZWN0bHkgY2FsbGVkLiBJbnN0ZWFkLCB1c2UgdGhlIFtbQXZhbGFuY2hlLmFkZEFQSV1dIGZ1bmN0aW9uIHRvIHJlZ2lzdGVyIHRoaXMgaW50ZXJmYWNlIHdpdGggQXZhbGFuY2hlLlxuICovXG5leHBvcnQgY2xhc3MgS2V5c3RvcmVBUEkgZXh0ZW5kcyBKUlBDQVBJIHtcbiAgLyoqXG4gICAgICogQ3JlYXRlcyBhIHVzZXIgaW4gdGhlIG5vZGUncyBkYXRhYmFzZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB1c2VybmFtZSBOYW1lIG9mIHRoZSB1c2VyIHRvIGNyZWF0ZVxuICAgICAqIEBwYXJhbSBwYXNzd29yZCBQYXNzd29yZCBmb3IgdGhlIHVzZXJcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIFByb21pc2UgZm9yIGEgYm9vbGVhbiB3aXRoIHRydWUgb24gc3VjY2Vzc1xuICAgICAqL1xuICBjcmVhdGVVc2VyID0gYXN5bmMgKHVzZXJuYW1lOnN0cmluZywgcGFzc3dvcmQ6c3RyaW5nKTpQcm9taXNlPGJvb2xlYW4+ID0+IHtcbiAgICBjb25zdCBwYXJhbXM6YW55ID0ge1xuICAgICAgdXNlcm5hbWUsXG4gICAgICBwYXNzd29yZCxcbiAgICB9O1xuICAgIHJldHVybiB0aGlzLmNhbGxNZXRob2QoJ2tleXN0b3JlLmNyZWF0ZVVzZXInLCBwYXJhbXMpXG4gICAgICAudGhlbigocmVzcG9uc2U6UmVxdWVzdFJlc3BvbnNlRGF0YSkgPT4gcmVzcG9uc2UuZGF0YS5yZXN1bHQuc3VjY2Vzcyk7XG4gIH07XG5cbiAgLyoqXG4gICAgICogRXhwb3J0cyBhIHVzZXIuIFRoZSB1c2VyIGNhbiBiZSBpbXBvcnRlZCB0byBhbm90aGVyIG5vZGUgd2l0aCBrZXlzdG9yZS5pbXBvcnRVc2VyIC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB1c2VybmFtZSBUaGUgbmFtZSBvZiB0aGUgdXNlciB0byBleHBvcnRcbiAgICAgKiBAcGFyYW0gcGFzc3dvcmQgVGhlIHBhc3N3b3JkIG9mIHRoZSB1c2VyIHRvIGV4cG9ydFxuICAgICAqXG4gICAgICogQHJldHVybnMgUHJvbWlzZSB3aXRoIGEgc3RyaW5nIGltcG9ydGFibGUgdXNpbmcgaW1wb3J0VXNlclxuICAgICAqL1xuICBleHBvcnRVc2VyID0gYXN5bmMgKHVzZXJuYW1lOnN0cmluZywgcGFzc3dvcmQ6c3RyaW5nKTpQcm9taXNlPHN0cmluZz4gPT4ge1xuICAgIGNvbnN0IHBhcmFtczphbnkgPSB7XG4gICAgICB1c2VybmFtZSxcbiAgICAgIHBhc3N3b3JkLFxuICAgIH07XG4gICAgcmV0dXJuIHRoaXMuY2FsbE1ldGhvZCgna2V5c3RvcmUuZXhwb3J0VXNlcicsIHBhcmFtcylcbiAgICAgIC50aGVuKChyZXNwb25zZTpSZXF1ZXN0UmVzcG9uc2VEYXRhKSA9PiByZXNwb25zZS5kYXRhLnJlc3VsdC51c2VyKTtcbiAgfTtcblxuICAvKipcbiAgICAgKiBJbXBvcnRzIGEgdXNlciBmaWxlIGludG8gdGhlIG5vZGUncyB1c2VyIGRhdGFiYXNlIGFuZCBhc3NpZ25zIGl0IHRvIGEgdXNlcm5hbWUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gdXNlcm5hbWUgVGhlIG5hbWUgdGhlIHVzZXIgZmlsZSBzaG91bGQgYmUgaW1wb3J0ZWQgaW50b1xuICAgICAqIEBwYXJhbSB1c2VyIGNiNTggc2VyaWFsaXplZCBzdHJpbmcgcmVwcmVzZXRuaW5nIGEgdXNlcidzIGRhdGFcbiAgICAgKiBAcGFyYW0gcGFzc3dvcmQgVGhlIHVzZXIncyBwYXNzd29yZFxuICAgICAqXG4gICAgICogQHJldHVybnMgQSBwcm9taXNlIHdpdGggYSB0cnVlLXZhbHVlIG9uIHN1Y2Nlc3MuXG4gICAgICovXG4gIGltcG9ydFVzZXIgPSBhc3luYyAodXNlcm5hbWU6c3RyaW5nLCB1c2VyOnN0cmluZywgcGFzc3dvcmQ6c3RyaW5nKTpQcm9taXNlPGJvb2xlYW4+ID0+IHtcbiAgICBjb25zdCBwYXJhbXM6YW55ID0ge1xuICAgICAgdXNlcm5hbWUsXG4gICAgICB1c2VyLFxuICAgICAgcGFzc3dvcmQsXG4gICAgfTtcbiAgICByZXR1cm4gdGhpcy5jYWxsTWV0aG9kKCdrZXlzdG9yZS5pbXBvcnRVc2VyJywgcGFyYW1zKVxuICAgICAgLnRoZW4oKHJlc3BvbnNlOlJlcXVlc3RSZXNwb25zZURhdGEpID0+IHJlc3BvbnNlLmRhdGEucmVzdWx0LnN1Y2Nlc3MpO1xuICB9O1xuXG4gIC8qKlxuICAgICAqIExpc3RzIHRoZSBuYW1lcyBvZiBhbGwgdXNlcnMgb24gdGhlIG5vZGUuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBQcm9taXNlIG9mIGFuIGFycmF5IHdpdGggYWxsIHVzZXIgbmFtZXMuXG4gICAgICovXG4gIGxpc3RVc2VycyA9IGFzeW5jICgpOlByb21pc2U8QXJyYXk8c3RyaW5nPj4gPT4gdGhpcy5jYWxsTWV0aG9kKCdrZXlzdG9yZS5saXN0VXNlcnMnKVxuICAgIC50aGVuKChyZXNwb25zZTpSZXF1ZXN0UmVzcG9uc2VEYXRhKSA9PiByZXNwb25zZS5kYXRhLnJlc3VsdC51c2Vycyk7XG5cbiAgLyoqXG4gICAgICogRGVsZXRlcyBhIHVzZXIgaW4gdGhlIG5vZGUncyBkYXRhYmFzZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB1c2VybmFtZSBOYW1lIG9mIHRoZSB1c2VyIHRvIGRlbGV0ZVxuICAgICAqIEBwYXJhbSBwYXNzd29yZCBQYXNzd29yZCBmb3IgdGhlIHVzZXJcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIFByb21pc2UgZm9yIGEgYm9vbGVhbiB3aXRoIHRydWUgb24gc3VjY2Vzc1xuICAgICAqL1xuICBkZWxldGVVc2VyID0gYXN5bmMgKHVzZXJuYW1lOnN0cmluZywgcGFzc3dvcmQ6c3RyaW5nKTpQcm9taXNlPGJvb2xlYW4+ID0+IHtcbiAgICBjb25zdCBwYXJhbXM6YW55ID0ge1xuICAgICAgdXNlcm5hbWUsXG4gICAgICBwYXNzd29yZCxcbiAgICB9O1xuICAgIHJldHVybiB0aGlzLmNhbGxNZXRob2QoJ2tleXN0b3JlLmRlbGV0ZVVzZXInLCBwYXJhbXMpXG4gICAgICAudGhlbigocmVzcG9uc2U6UmVxdWVzdFJlc3BvbnNlRGF0YSkgPT4gcmVzcG9uc2UuZGF0YS5yZXN1bHQuc3VjY2Vzcyk7XG4gIH07XG5cbiAgLyoqXG4gICAgICogVGhpcyBjbGFzcyBzaG91bGQgbm90IGJlIGluc3RhbnRpYXRlZCBkaXJlY3RseS4gSW5zdGVhZCB1c2UgdGhlIFtbQXZhbGFuY2hlLmFkZEFQSV1dIG1ldGhvZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBjb3JlIEEgcmVmZXJlbmNlIHRvIHRoZSBBdmFsYW5jaGUgY2xhc3NcbiAgICAgKiBAcGFyYW0gYmFzZXVybCBEZWZhdWx0cyB0byB0aGUgc3RyaW5nIFwiL2V4dC9rZXlzdG9yZVwiIGFzIHRoZSBwYXRoIHRvIGJsb2NrY2hhaW4ncyBiYXNldXJsXG4gICAgICovXG4gIGNvbnN0cnVjdG9yKGNvcmU6QXZhbGFuY2hlQ29yZSwgYmFzZXVybDpzdHJpbmcgPSAnL2V4dC9rZXlzdG9yZScpIHsgc3VwZXIoY29yZSwgYmFzZXVybCk7IH1cbn0iXX0=