import { UUID } from "crypto"

export interface AuthenticationMethod {
    readonly type: string
}

export interface PasswordMethod extends AuthenticationMethod {
    readonly type: "password"
    readonly email: string
    readonly password: string
}

export interface OidcMethod {

}

export interface GoogleMethod extends AuthenticationMethod {
    readonly type: "google"
}

export type CreateSessionDto = {
    owner_uuid: UUID
    method: PasswordMethod | GoogleMethod
}

export type CensoredOutputSessionDto = {
    uuid: UUID
    owner_uuid: UUID
    created_time: Date
    second_duration: number
    revoked: boolean
}

export type FullOutputSessionDto = CensoredOutputSessionDto & {
    token: string
}