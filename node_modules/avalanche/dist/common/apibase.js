"use strict";
/**
 * @packageDocumentation
 * @module Common-APIBase
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIBase = exports.RequestResponseData = void 0;
const bintools_1 = __importDefault(require("../utils/bintools"));
const db_1 = __importDefault(require("../utils/db"));
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
/**
 * Response data for HTTP requests.
 */
class RequestResponseData {
}
exports.RequestResponseData = RequestResponseData;
/**
 * Abstract class defining a generic endpoint that all endpoints must implement (extend).
 */
class APIBase {
    /**
       *
       * @param core Reference to the Avalanche instance using this baseurl
       * @param baseurl Path to the baseurl - ex: "/ext/bc/X"
       */
    constructor(core, baseurl) {
        /**
           * Sets the path of the APIs baseurl.
           *
           * @param baseurl Path of the APIs baseurl - ex: "/ext/bc/X"
           */
        this.setBaseURL = (baseurl) => {
            if (this.db && this.baseurl !== baseurl) {
                const backup = this.db.getAll();
                this.db.clearAll();
                this.baseurl = baseurl;
                this.db = db_1.default.getNamespace(baseurl);
                this.db.setAll(backup, true);
            }
            else {
                this.baseurl = baseurl;
                this.db = db_1.default.getNamespace(baseurl);
            }
        };
        /**
           * Returns the baseurl's path.
           */
        this.getBaseURL = () => this.baseurl;
        /**
           * Returns the baseurl's database.
           */
        this.getDB = () => this.db;
        this.core = core;
        this.setBaseURL(baseurl);
    }
}
exports.APIBase = APIBase;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpYmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tb24vYXBpYmFzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztHQUdHOzs7Ozs7QUFJSCxpRUFBeUM7QUFDekMscURBQTZCO0FBRzdCOztHQUVHO0FBQ0gsTUFBTSxRQUFRLEdBQUcsa0JBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUV4Qzs7R0FFRztBQUNILE1BQWEsbUJBQW1CO0NBVS9CO0FBVkQsa0RBVUM7QUFFRDs7R0FFRztBQUNILE1BQXNCLE9BQU87SUFtQzNCOzs7O1NBSUs7SUFDTCxZQUFZLElBQWtCLEVBQUUsT0FBYztRQWpDOUM7Ozs7YUFJSztRQUNMLGVBQVUsR0FBRyxDQUFDLE9BQWMsRUFBRSxFQUFFO1lBQzlCLElBQUksSUFBSSxDQUFDLEVBQUUsSUFBSSxJQUFJLENBQUMsT0FBTyxLQUFLLE9BQU8sRUFBRTtnQkFDdkMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDaEMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDbkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7Z0JBQ3ZCLElBQUksQ0FBQyxFQUFFLEdBQUcsWUFBRSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDbkMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO2FBQzlCO2lCQUFNO2dCQUNMLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO2dCQUN2QixJQUFJLENBQUMsRUFBRSxHQUFHLFlBQUUsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDcEM7UUFDSCxDQUFDLENBQUM7UUFFRjs7YUFFSztRQUNMLGVBQVUsR0FBRyxHQUFZLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBRXpDOzthQUVLO1FBQ0wsVUFBSyxHQUFHLEdBQVksRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7UUFRN0IsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUMzQixDQUFDO0NBQ0Y7QUE1Q0QsMEJBNENDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAcGFja2FnZURvY3VtZW50YXRpb25cbiAqIEBtb2R1bGUgQ29tbW9uLUFQSUJhc2VcbiAqL1xuXG5pbXBvcnQgeyBTdG9yZUFQSSB9IGZyb20gJ3N0b3JlMic7XG5pbXBvcnQgeyBDbGllbnRSZXF1ZXN0IH0gZnJvbSAnaHR0cCc7XG5pbXBvcnQgQmluVG9vbHMgZnJvbSAnLi4vdXRpbHMvYmludG9vbHMnO1xuaW1wb3J0IERCIGZyb20gJy4uL3V0aWxzL2RiJztcbmltcG9ydCBBdmFsYW5jaGVDb3JlIGZyb20gJy4uL2F2YWxhbmNoZSc7XG5cbi8qKlxuICogQGlnbm9yZVxuICovXG5jb25zdCBiaW50b29scyA9IEJpblRvb2xzLmdldEluc3RhbmNlKCk7XG5cbi8qKlxuICogUmVzcG9uc2UgZGF0YSBmb3IgSFRUUCByZXF1ZXN0cy5cbiAqL1xuZXhwb3J0IGNsYXNzIFJlcXVlc3RSZXNwb25zZURhdGEge1xuICBkYXRhOiBhbnk7XG5cbiAgaGVhZGVyczphbnk7XG5cbiAgc3RhdHVzOiBudW1iZXI7XG5cbiAgc3RhdHVzVGV4dDogc3RyaW5nO1xuXG4gIHJlcXVlc3Q6Q2xpZW50UmVxdWVzdCB8IFhNTEh0dHBSZXF1ZXN0O1xufVxuXG4vKipcbiAqIEFic3RyYWN0IGNsYXNzIGRlZmluaW5nIGEgZ2VuZXJpYyBlbmRwb2ludCB0aGF0IGFsbCBlbmRwb2ludHMgbXVzdCBpbXBsZW1lbnQgKGV4dGVuZCkuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBBUElCYXNlIHtcbiAgcHJvdGVjdGVkIGNvcmU6QXZhbGFuY2hlQ29yZTtcblxuICBwcm90ZWN0ZWQgYmFzZXVybDpzdHJpbmc7XG5cbiAgcHJvdGVjdGVkIGRiOlN0b3JlQVBJO1xuXG4gIC8qKlxuICAgICAqIFNldHMgdGhlIHBhdGggb2YgdGhlIEFQSXMgYmFzZXVybC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBiYXNldXJsIFBhdGggb2YgdGhlIEFQSXMgYmFzZXVybCAtIGV4OiBcIi9leHQvYmMvWFwiXG4gICAgICovXG4gIHNldEJhc2VVUkwgPSAoYmFzZXVybDpzdHJpbmcpID0+IHtcbiAgICBpZiAodGhpcy5kYiAmJiB0aGlzLmJhc2V1cmwgIT09IGJhc2V1cmwpIHtcbiAgICAgIGNvbnN0IGJhY2t1cCA9IHRoaXMuZGIuZ2V0QWxsKCk7XG4gICAgICB0aGlzLmRiLmNsZWFyQWxsKCk7XG4gICAgICB0aGlzLmJhc2V1cmwgPSBiYXNldXJsO1xuICAgICAgdGhpcy5kYiA9IERCLmdldE5hbWVzcGFjZShiYXNldXJsKTtcbiAgICAgIHRoaXMuZGIuc2V0QWxsKGJhY2t1cCwgdHJ1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYmFzZXVybCA9IGJhc2V1cmw7XG4gICAgICB0aGlzLmRiID0gREIuZ2V0TmFtZXNwYWNlKGJhc2V1cmwpO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBiYXNldXJsJ3MgcGF0aC5cbiAgICAgKi9cbiAgZ2V0QmFzZVVSTCA9ICgpIDogc3RyaW5nID0+IHRoaXMuYmFzZXVybDtcblxuICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBiYXNldXJsJ3MgZGF0YWJhc2UuXG4gICAgICovXG4gIGdldERCID0gKCk6U3RvcmVBUEkgPT4gdGhpcy5kYjtcblxuICAvKipcbiAgICAgKlxuICAgICAqIEBwYXJhbSBjb3JlIFJlZmVyZW5jZSB0byB0aGUgQXZhbGFuY2hlIGluc3RhbmNlIHVzaW5nIHRoaXMgYmFzZXVybFxuICAgICAqIEBwYXJhbSBiYXNldXJsIFBhdGggdG8gdGhlIGJhc2V1cmwgLSBleDogXCIvZXh0L2JjL1hcIlxuICAgICAqL1xuICBjb25zdHJ1Y3Rvcihjb3JlOkF2YWxhbmNoZUNvcmUsIGJhc2V1cmw6c3RyaW5nKSB7XG4gICAgdGhpcy5jb3JlID0gY29yZTtcbiAgICB0aGlzLnNldEJhc2VVUkwoYmFzZXVybCk7XG4gIH1cbn1cblxuIl19