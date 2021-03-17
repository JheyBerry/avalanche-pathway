/**
 * @packageDocumentation
 * @module Common-APIBase
 */
/// <reference types="node" />
import { StoreAPI } from 'store2';
import { ClientRequest } from 'http';
import AvalancheCore from '../avalanche';
/**
 * Response data for HTTP requests.
 */
export declare class RequestResponseData {
    data: any;
    headers: any;
    status: number;
    statusText: string;
    request: ClientRequest | XMLHttpRequest;
}
/**
 * Abstract class defining a generic endpoint that all endpoints must implement (extend).
 */
export declare abstract class APIBase {
    protected core: AvalancheCore;
    protected baseurl: string;
    protected db: StoreAPI;
    /**
       * Sets the path of the APIs baseurl.
       *
       * @param baseurl Path of the APIs baseurl - ex: "/ext/bc/X"
       */
    setBaseURL: (baseurl: string) => void;
    /**
       * Returns the baseurl's path.
       */
    getBaseURL: () => string;
    /**
       * Returns the baseurl's database.
       */
    getDB: () => StoreAPI;
    /**
       *
       * @param core Reference to the Avalanche instance using this baseurl
       * @param baseurl Path to the baseurl - ex: "/ext/bc/X"
       */
    constructor(core: AvalancheCore, baseurl: string);
}
//# sourceMappingURL=apibase.d.ts.map