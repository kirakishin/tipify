import {JsonConverterUtil} from '../JsonConverterUtil';
import {EnumOptions} from '../type/Enum';
import {JsonCustomConverters} from '../converter/JsonCustomConverters';
import {JsonConverterError} from '../JsonConverterError';
import {JsonCustomConverter} from '../converter/JsonCustomConverter';
import {JsonConverterMapper} from '../mapping/JsonConverterMapper';
import {Any} from '../type/Any';
import {DeserializeContext} from './DeserializeContext';
import {DeserializeLevelContext} from "./DeserializeLevelContext";

export class JsonConverterDeserializer {


    public deserialize<T>(obj: any, type: any, context?: DeserializeContext, levelContext?: DeserializeLevelContext): T {
        try {
            return this.processDeserialize<T>(obj, type, context, levelContext);
        } catch (err) {
            const errorMessage = '(E40) cannot deserialize :\n'
                + JSON.stringify(obj, null, 2);
            throw new JsonConverterError(errorMessage, err);
        }
    }

    public processDeserialize<T>(obj: any, type: any, context?: DeserializeContext, levelContext?: DeserializeLevelContext): T {

        // when custom converter is provided, use custom provider
        if (type.prototype instanceof JsonCustomConverter) {
            const converterInstance = JsonCustomConverters.getConverterInstance(type);
            if (!converterInstance) {
                const errorMessage = `(E01) Cannot get instance of custom converter <${type.name}>, this may occur when :\n`
                    + '   -  decorator @jsonCustomConverter is missing\n'
                    + '   -  class does not extends JsonCustomConverter';
                throw new JsonConverterError(errorMessage);
            }
            return converterInstance.deserialize(obj, {
                ...context
            }, levelContext);
        }

        // when obj is null or undefined, return null or undefined
        if (JsonConverterUtil.isNullOrUndefined(obj)) {
            return obj;
        }

        JsonConverterUtil.checkConsistency(obj, type);

        // when an enum is provided
        if (type instanceof EnumOptions) {
            return this.processDeserializeEnum(obj, type);
        }

        // when any type is provided, copy object
        else if (type === Any) {
            return JsonConverterUtil.deepCopy(obj);
        }

        // when obj is an array, deserialize as an array
        if (Array.isArray(obj)) {
            const _type = type[0];
            if (!_type) {
                const errorMessage = `(E02) Given type is not valid, it should be an array like [String]`;
                throw new JsonConverterError(errorMessage);
            }
            return <any>this.processDeserializeArray(obj, _type, {
                ...context,
                parent: obj
            }, levelContext);
        }

        if (obj === Object(obj)) {
            return this.processDeserializeObject<T>(obj, type, context, levelContext);
        }

        return obj;
    }

    /**
     * Deserialize array
     * @param json
     * @param type
     * @param context
     * @param levelContext
     */
    public processDeserializeArray<T>(json: any[], type: any, context?: DeserializeContext, levelContext?: DeserializeLevelContext): T[] {
        const instance: T[] = [];

        json.forEach((entry, index) => {
            try {
                instance.push(<T>this.processDeserialize(entry, type, context, levelContext));
            } catch (err) {
                const errorMessage = `(E30) error deserializing index <${index}>, type <${type.name}>`
                    + (context ? ` context groups: ${JSON.stringify(context.groups)}` : '')
                    + (levelContext ? ` levelContext groups: ${JSON.stringify(levelContext.groups)}` : '')
                    + '\n'
                    + JSON.stringify(entry, null, 2);
                throw new JsonConverterError(errorMessage, err);
            }
        });

        return instance;
    }

    /**
     * Deserialize enum
     * @param obj
     * @param options
     */
    public processDeserializeEnum(obj: any, options: EnumOptions): any {

        if (JsonConverterUtil.isNullOrUndefined(options.type[obj])) {
            const errorMessage = `(E31) error deserializing, enum value <${obj}> cannot be found`;
            throw new JsonConverterError(errorMessage);
        }

        if (typeof obj === 'number' || obj instanceof Number) {
            return obj;
        }

        return options.type[obj];
    }

    /**
     * Deserialize object
     * @param obj
     * @param type
     * @param context
     * @param levelContext
     */
    public processDeserializeObject<T>(obj: any, type: any, context?: DeserializeContext, levelContext?: DeserializeLevelContext): T {

        const typeMapping = JsonConverterMapper.getMappingForType(type);
        if (!typeMapping) {
            const errorMessage = `(E09) Cannot get mapping for <${type.name}>, this may occur when :\n`
                + '   -  decorator @jsonObject is missing\n';
            throw new JsonConverterError(errorMessage);
        }


        // when polymorphism is defined
        const discriminatorProperty = JsonConverterMapper.getDiscriminatorPropertyForTypeMapping(typeMapping);
        if (discriminatorProperty) {
            const discriminatorValue = obj[discriminatorProperty];
            const subTypes = JsonConverterMapper.listMappingForExtendingType(type);
            const subType = subTypes.find(m => m.options && m.options.discriminatorValue === discriminatorValue);

            if (!subType) {
                const errorMessage = `(E80) Polymorphism error : Cannot get subtype for <${type.name}> `
                    + `got only subtypes <${subTypes.map(t => t.options ? t.options.discriminatorValue : t.type.name).toString()}>`;
                throw new JsonConverterError(errorMessage);
            }

            return this.processDeserializeObject(obj, subType.type, context, levelContext);
        }

        // new instance of type
        const instance = new typeMapping.type();

        // deserialize each property
        const properties = JsonConverterMapper.getAllPropertiesForTypeMapping(typeMapping);
        const defaultValidators = JsonConverterMapper.getDefaultValidators(typeMapping);
        const defaultGroups = JsonConverterMapper.getDefaultGroups(typeMapping);
        const defaultDeserializationGroups = JsonConverterMapper.getDefaultDeserializationGroups(typeMapping);


        properties.forEach(property => {
            let groups: string[] | undefined = property.groups ? property.groups : defaultGroups;
            let newLevelContext: DeserializeLevelContext = {};
            let computedContextGroups: string[] | undefined;
            // if the current level context has a groups defined, so apply it, instead of other
            if (levelContext && levelContext.groups) {
                computedContextGroups = levelContext.groups;
            } else if (context && context.groups) {
                computedContextGroups = context.groups;
            }
            if (property.subgroups && property.subgroups.length) {
                // check if there is any defined subgroups with a null condition
                const noGroupCondition = property.subgroups.find(sg => sg.conditions === null);
                // in case of a null condition detected and no groups on this property, apply the specified groups for the nested entity
                if ((!context || !context.groups) && noGroupCondition) {
                    newLevelContext.groups = noGroupCondition.groups;
                } else if (context && context.groups) {
                    // in other case, find and apply the correct groups for the nested entity
                    const subGroupToApply = property.subgroups.find(sg => sg.conditions && sg.conditions.some(c => context.groups.some(gg => gg === c)));
                    if (subGroupToApply) {
                        newLevelContext.groups = subGroupToApply.groups;
                    }
                }
            }
            try {
                const validators = property.validators ? property.validators : defaultValidators;
                JsonConverterUtil.validate(obj, property.serializedName, validators, groups, context, levelContext, defaultDeserializationGroups);
                // treat the property if the declared groups matches at least one of the context.
                // if there is no context or groups to manage, treat it
                if (
                    !computedContextGroups || computedContextGroups.length === 0 ||
                    !groups || groups.length === 0 || groups.some((g) => computedContextGroups.some((cg) => g === cg))
                ) {
                    instance[property.name] = this.deserialize(obj[property.serializedName], property.type, {
                        ...context,
                        parent: obj
                    }, newLevelContext);
                } else {
                    instance[property.name] = `${property.serializedName} no exists computedContextGroups=${JSON.stringify(computedContextGroups)}, groups=${groups}, `;
                }
            } catch (err) {
                const errorMessage = `(E32) error deserializing property <${property.name}>, type <${property.type.name}>`;
                throw new JsonConverterError(errorMessage, err);
            }
        });

        return instance;
    }
}