import {JsonConverterError} from "./JsonConverterError";
import {JsonValidator} from "./mapping/JsonValidators";
import {Any} from "./type/Any";

export type Instantiable<T> = { new(...args: any[]): T };

export class JsonConverterUtil {

    public static validate(obj: any, serializedName: string, validators: JsonValidator[]) {

        if (!validators) {
            return;
        }

        try {
            validators.forEach(validator => validator(obj, serializedName));
        } catch (err) {
            throw new JsonConverterError('(E50) property invalid', err);
        }
    }

    public static isNullOrUndefined(obj: any) {
        return typeof obj === 'undefined' || obj === null
    }

    public static checkConsistency<T>(obj: any, type: any) {

        if (type === Any) {
            return;
        }

        if (type === String &&
            typeof obj !== 'string' && obj instanceof String === false) {
            const errorMessage = '(E03) Expected type is <String>, but obj is not';
            throw new JsonConverterError(errorMessage);
        }

        if (type === Boolean &&
            typeof obj !== 'boolean' && obj instanceof Boolean === false) {
            const errorMessage = '(E03) Expected type is <Boolean>, but obj is not';
            throw new JsonConverterError(errorMessage);
        }

        if (type === Number &&
            typeof obj !== 'number' && obj instanceof Number === false) {
            const errorMessage = '(E03) Expected type is <Number>, but obj is not';
            throw new JsonConverterError(errorMessage);
        }

        if (Array.isArray(type) && !Array.isArray(obj)) {
            const errorMessage = '(E03) Expected type is an array, but given obj is not';
            throw new JsonConverterError(errorMessage);
        }

        if (!Array.isArray(type) && Array.isArray(obj)) {
            const errorMessage = '(E03) Given object is an array, but expected type is not';
            throw new JsonConverterError(errorMessage);
        }
    }

    public static deepCopy(obj: any): any {
        // TODO : to implement
        return obj;
    }
}
