import {Instantiable} from './JsonConverterUtil';
import {JsonCustomConverter} from './converter/JsonCustomConverter';
import {JsonConverterSerializer} from './core/JsonConverterSerializer';
import {JsonConverterDeserializer} from './core/JsonConverterDeserializer';
import {JsonDeserializeOptions} from "./JsonDeserializeOptions";
import {isJsonSerializeOptions, JsonSerializeOptions} from "./JsonSerializeOptions";

export class JsonConverter {

    private serializer = new JsonConverterSerializer();
    private deserializer = new JsonConverterDeserializer();

    constructor() {
    }

    /**
     * Serialize
     * @param {T[]} obj
     * @param {Instantiable<T>[] | JsonCustomConverter<T>[]} type
     * @returns {any}
     */
    public serialize<T>(obj: T[], type?: Instantiable<T>[] | JsonCustomConverter<T>[]): any;
    /**
     * Serialize
     * @param {T} obj
     * @param {Instantiable<T> | JsonCustomConverter<T>} type
     * @returns {any}
     */
    public serialize<T>(obj: T, type?: Instantiable<T> | JsonCustomConverter<T>): any;
    /**
     *
     * @param {T} obj
     * @param options
     * @returns {any}
     */
    public serialize<T>(obj: T, options?: JsonSerializeOptions): any;
    /**
     * Serialize
     * @deprecated use the new signature `serialize<T>(obj: T, options?: JsonSerializeOptions): any;`
     * @param {T} obj
     * @param type
     * @returns {any}
     */
    public serialize<T>(obj: T, type?: any): any;
    public serialize<T>(obj: T, arg2?: any | JsonSerializeOptions): any {
        let groups: string[];
        let type;
        // new signature case with a 3rd argument
        if (arg2 && isJsonSerializeOptions(arg2)) {
            groups = arg2.groups;
            type = arg2.type;
        } else {
            // old deprecated signature case
            groups = [];
            type = arg2;
        }
        return this.serializer.serialize(obj,{groups: groups}, type);
    }


    /**
     * Deserialize
     * @param obj
     * @param options
     * @param type
     */
    public deserialize<T>(obj: any, type: any, options?: JsonDeserializeOptions): T;
    /**
     * Deserialize
     * @deprecated use new signature `deserialize<T>(obj: any, type: any, options?: JsonDeserializeOptions): T;`
     * @param obj
     * @param type
     */
    public deserialize<T>(obj: any, type: any): T;
    public deserialize<T>(obj: any, type: any, arg3?: string[] | JsonDeserializeOptions): T {
        let groups: string[];
        // old signature case
        if (arg3 && Array.isArray(arg3)) {
            groups = undefined;
        } else {
            // new signature case
            const options = <JsonDeserializeOptions>arg3;
            if (options) {
                groups = options.groups;
            }
        }
        return this.deserializer.deserialize(obj, type, {object: obj, groups: groups});
    }
}