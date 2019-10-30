import {JsonConverterUtil} from "../JsonConverterUtil";
import {EnumOptions, EnumStrategy} from "../type/Enum";
import {JsonCustomConverters} from "../converter/JsonCustomConverters";
import {JsonCustomConverter} from "../converter/JsonCustomConverter";
import {JsonConverterError} from "../JsonConverterError";
import {JsonConverterMapper} from "../mapping/JsonConverterMapper";
import {Any} from "../type/Any";
import {SerializeContext} from "./SerializeContext";

export class JsonConverterSerializer {

    /**
     * Serialize
     * @param {T} obj
     * @param type
     * @param context
     * @returns {any}
     */
    public serialize<T>(obj: T, context: SerializeContext, type?: any): any {

        try {
            return this.processSerialize(obj, context, type);
        } catch (err) {
            const errorMessage = '(E00) cannot serialize object :\n'
                + JSON.stringify(obj, null, 2);
            throw new JsonConverterError(errorMessage, err);
        }
    }

    /**
     * Process serialize
     * @param obj
     * @param context
     * @param type
     * @returns {any}
     */
    public processSerialize<T>(obj: T, context: SerializeContext, type?: any): any {

        // when obj is null or undefined, return null or undefined
        if (JsonConverterUtil.isNullOrUndefined(obj)) {
            return obj;
        }

        if (type) {
            JsonConverterUtil.checkConsistency(obj, type);

            // when custom converter is provided, use custom provider
            if (type.prototype && type.prototype instanceof JsonCustomConverter) {
                const converterInstance = JsonCustomConverters.getConverterInstance(type);
                if (!converterInstance) {
                    const errorMessage = `(E01) Cannot get instance of custom converter <${type.name}>, this may occur when :\n`
                        + '   -  decorator @jsonCustomConverter is missing\n'
                        + '   -  class does not extends JsonCustomConverter';
                    throw new JsonConverterError(errorMessage);
                }
                return converterInstance.serialize(obj, context);
            }

            // when an enum is provided
            else if (type instanceof EnumOptions) {
                return this.processSerializeEnum(obj, type);
            }

            // when any type is provided, copy object
            else if (type === Any) {
                return JsonConverterUtil.deepCopy(obj);
            }
        }

        // when obj is an array, serialize as an array
        if (Array.isArray(obj)) {
            let _type;

            // if type is provided, it should be an array
            if (type &&
                (!Array.isArray(type) || !(_type = type[0]))) {
                const errorMessage = `(E02) Given type is not valid, it should be an array like [String]`;
                throw new JsonConverterError(errorMessage);
            }
            return this.processSerializeArray(obj, context, _type);
        }

        // when obj is an object, serialize as an obj
        if (obj === Object(obj)) {
            return this.processSerializeObject(obj, context);
        }

        // return obj, should match only cases [number, boolean, string]
        return obj;
    }

    /**
     * Serialize enum
     * @param obj
     * @param options
     */
    public processSerializeEnum(obj: any, options: EnumOptions): number | string {

        if (JsonConverterUtil.isNullOrUndefined(options.type[obj])) {
            const errorMessage = `(E10) <${obj}> for enum <${options.type.name}> does not exist`;
            throw new JsonConverterError(errorMessage);
        }

        if (options.strategy === EnumStrategy.INDEX) {
            return obj;
        } else if (options.strategy === EnumStrategy.NAME) {
            return options.type[obj];
        } else {
            const errorMessage = `(E12) strategy for enum <${options.type.name}> is not defined`;
            throw new JsonConverterError(errorMessage);
        }
    }

    /**
     * Serialize object
     * @param obj
     * @param context
     */
    public processSerializeObject(obj: any, context: SerializeContext): any {

        const typeMapping = JsonConverterMapper.getMappingForType(obj.constructor);
        if (!typeMapping) {
            const errorMessage = `(E09) Cannot get mapping for <${obj.constructor.name}>, this may occur when :\n`
                + '   -  decorator @jsonObject is missing\n';
            throw new JsonConverterError(errorMessage);
        }

        const properties = JsonConverterMapper.getAllPropertiesForTypeMapping(typeMapping);
        const defaultGroups = JsonConverterMapper.getDefaultGroups(typeMapping);

        const instance: any = {};

        // serialize each property
        properties.forEach(property => {
            const groups = property.groups ? property.groups : defaultGroups;
            // treat the property if the declared groups matches at least one of the context.
            // if there is no context or groups to manage, treat it
            if (!context || !context.groups || context.groups.length === 0 ||
            !groups || groups.length === 0 || groups.some((g) => context.groups.some((cg) => g === cg))) {
                try {
                    instance[property.serializedName] = this.serialize(obj[property.name], context, property.type);
                } catch (err) {
                    const errorMessage = `(E08) error serializing property <${property.name}>, type <${property.type.name}>`;
                    throw new JsonConverterError(errorMessage, err);
                }
            }
        });

        return instance;
    }

    /**
     * Serialize array
     * @param obj
     * @param context
     * @param type
     */
    public processSerializeArray(obj: any[], context: SerializeContext, type?: any): any[] {
        const instance: any[] = [];

        obj.forEach((entry, index) => {
            try {
                instance.push(this.serialize(entry, context, type));
            } catch (err) {
                const errorMessage = `(E20) error serializing index <${index}>, type <${type ? type.name : undefined}>`;
                throw new JsonConverterError(errorMessage, err);
            }
        });

        return instance;
    }

}