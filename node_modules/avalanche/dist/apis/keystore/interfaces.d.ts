/**
 * @packageDocumentation
 * @module Info-Interfaces
 */
export interface iCredentials {
    username: string;
    password: string;
}
export interface iCreateUserParams extends iCredentials {
}
export interface iExportUserParams extends iCredentials {
}
export interface iImportUserParams extends iCredentials {
    user: string;
}
export interface iDeleteUserParams extends iCredentials {
}
//# sourceMappingURL=interfaces.d.ts.map