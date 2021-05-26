import { PayloadWithUserId } from "src/models/authentication/PayloadWithUserId";

export function isPayloadWithUserId(payload: object): payload is PayloadWithUserId {
    return (
        payload.hasOwnProperty('userId')
    )
}