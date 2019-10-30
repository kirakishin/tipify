import {JsonConverterError} from "../JsonConverterError";
import {DeserializeContext} from "../core/DeserializeContext";
import {TypeMapping} from "./TypeMapping";
import {DeserializeLevelContext} from "../core/DeserializeLevelContext";

export type JsonValidator = (obj: any, serializedName: string, groups?: string[], context?: DeserializeContext, levelContext?: DeserializeLevelContext, defaultDeserializationGroups?: string[]) => void;

export class JsonValidators {

    public static required: JsonValidator = (obj: any, serializedName: string, groups?: string[], context?: DeserializeContext, levelContext?: DeserializeLevelContext, defaultDeserializationGroups?: string[]) => {
        let deserializationGroups: string[] | undefined;
        // if the current level context has a groups defined, so apply it, instead of other
        if (levelContext && levelContext.groups) {
            deserializationGroups = levelContext.groups ? levelContext.groups : defaultDeserializationGroups;
        } else if (context && context.groups) {
            deserializationGroups = context.groups ? context.groups : defaultDeserializationGroups;
        }
        // we does not have to validate with groups defined for the property, so we check the required standard validator
        if (!deserializationGroups) {
            if (!obj.hasOwnProperty(serializedName)) {
                throw new JsonConverterError('value is required');
            }
        }
    };

    /**
     * If any group array is configured for the deserialization and on the property,
     * the availability of the property will be checked
     */
    public static matchGroupRequired: JsonValidator = (obj: any, serializedName: string, groups?: string[], context?: DeserializeContext, levelContext?: DeserializeLevelContext, defaultDeserializationGroups?: string[]) => {
        let deserializationGroups: string[] | undefined;
        // if the current level context has a groups defined, so apply it, instead of other
        if (levelContext && levelContext.groups) {
            deserializationGroups = levelContext.groups ? levelContext.groups : defaultDeserializationGroups;
        } else if (context && context.groups) {
            deserializationGroups = context.groups ? context.groups : defaultDeserializationGroups;
        }
        // we have to validate with a context group and there is groups defined for the property
        if (deserializationGroups && groups) {
            // in case of a property has to be present in the object and it's not
            if (
                groups.some((g) => deserializationGroups.some((cg) => g === cg)) &&
                !obj.hasOwnProperty(serializedName)
            ) {
                throw new JsonConverterError(`property <${serializedName}> required for the groups <${deserializationGroups.join(',')}>`);
            }
        }
    };


    /**
     * If any group array is configured for the deserialization and on the property,
     * the non availability of the property will be checked
     */
    public static matchGroupNonexistent: JsonValidator = (obj: any, serializedName: string, groups?: string[], context?: DeserializeContext, levelContext?: DeserializeLevelContext, defaultDeserializationGroups?: string[]) => {
                let deserializationGroups: string[] | undefined;
        // if the current level context has a groups defined, so apply it, instead of other
        if (levelContext && levelContext.groups) {
            deserializationGroups = levelContext.groups ? levelContext.groups : defaultDeserializationGroups;
        } else if (context && context.groups) {
            deserializationGroups = context.groups ? context.groups : defaultDeserializationGroups;
        }
        // we have to validate with a context group and there is groups defined for the property
        if (deserializationGroups && groups) {
            if(
                // in case of a property does not have to be present in the object but it's there
                !groups.some((g) => deserializationGroups.some((cg) => g === cg)) &&
                obj.hasOwnProperty(serializedName)
            ) {
                throw new JsonConverterError(`property <${serializedName}> not required but here for the groups <${deserializationGroups.join(',')}>`);
            }
        }
    };
}