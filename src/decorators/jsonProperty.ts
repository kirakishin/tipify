import {PropertyMapping} from "../mapping/PropertyMapping";
import {JsonConverterMapper} from "../mapping/JsonConverterMapper";
import {JsonValidator} from "../mapping/JsonValidators";
import {JsonPropertyOptions} from "./JsonPropertyOptions";
import {SubGroup} from "../core/SubGroup";

function isStringArray(arg: any[]): arg is string[] {
    return typeof arg[0] === 'string';
}

function isValidatorArray(arg: any): arg is JsonValidator[] {
    return arg && Array.isArray(arg);
}

/**
 * set a mapping metadata on a property
 * @param serializedName
 * @param type
 * @param options
 */
export function jsonProperty(serializedName: string, type: any, options?: JsonPropertyOptions): (cls: any, property: string) => void;
/**
 * @deprecated use new signature `jsonProperty(serializedName: string, type: any, options: JsonPropertyOptions)`
 * @param serializedName
 * @param type
 * @param validators
 */
export function jsonProperty(serializedName: string, type: any, validators?: JsonValidator[]): (cls: any, property: string) => void;
export function jsonProperty(serializedName: string, type: any, arg3?: JsonValidator[] | JsonPropertyOptions): (cls: any, property: string) => void {
    let groups: string[] = undefined;
    let subgroups: SubGroup[] = undefined;
    let validators: JsonValidator[] = undefined;
    let groupDepth: number = 1;
    // old signature case
    if (arg3 && isValidatorArray(arg3)) {
        groups = [];
        validators = arg3;
    } else {
        // new signature case (arg3 is the options object)
        const options = <JsonPropertyOptions>arg3;
        if (options) {
            groups = options.groups ? options.groups : groups;
            validators = options.validators ? options.validators : validators;
            groupDepth = options.groupDepth ? options.groupDepth : groupDepth;
            subgroups = options.subgroups ? options.subgroups : subgroups;
        }
    }

    return (cls: any, property: string) => {

        const typeMapping = JsonConverterMapper.createMappingForType(cls.constructor);

        const propertyMapping: PropertyMapping = {
            name: property,
            serializedName: serializedName,
            type: type,
            groups: groups,
            subgroups: subgroups,
            groupDepth: groupDepth,
            validators: validators
        };

        typeMapping.properties.push(propertyMapping);
    };
}