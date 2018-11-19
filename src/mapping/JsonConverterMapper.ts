import {TypeMapping} from "./TypeMapping";
import {PropertyMapping} from "./PropertyMapping";
import {JsonValidator} from './JsonValidators';

export class JsonConverterMapper {

    public static MAPPING: TypeMapping[] = [];

    /**
     * Create mapping for type
     * @param type
     */
    public static createMappingForType(type: any): TypeMapping {

        let typeMapping = this.getMappingForType(type);

        if (!typeMapping) {
            typeMapping = {
                type: type,
                properties: []
            };
            this.MAPPING.push(typeMapping);
        }

        return typeMapping;
    }

    /**
     * Get mapping for type
     * @param type
     */
    public static getMappingForType(type: any): TypeMapping {
        return this.MAPPING.find(m => m.type === type);
    }

    /**
     * List mapping for extending type
     * @param type
     */
    public static listMappingForExtendingType(type: any): TypeMapping[] {
        return this.MAPPING.filter(m => m.type.prototype instanceof type);
    }

    /**
     * Get discriminator property for type mapping
     * @param {TypeMapping} typeMapping
     * @returns {string}
     */
    public static getDiscriminatorPropertyForTypeMapping(typeMapping: TypeMapping): string {

        if (typeMapping.options && typeMapping.options.discriminatorValue) {
            return;
        }

        let current = typeMapping;

        do {
            if (current.options && current.options.discriminatorProperty) {
                return current.options.discriminatorProperty;
            }

            current = current.parent;
        } while (current);
    }

    /**
     * get default validators described in `jsonObject` options.
     * It concat all validators from parent or far away
     * @param {TypeMapping} typeMapping
     * @returns {JsonValidator[]}
     */
    public static getDefaultValidators(typeMapping: TypeMapping): JsonValidator[] {

        let defaultValidators: JsonValidator[] = [];

        let current = typeMapping;

        do {

            if (current.options && current.options.defaultValidators && current.options.defaultValidators.length) {
                const newOnes = current.options.defaultValidators.filter(v => !defaultValidators.some(dv => dv === v));
                defaultValidators = defaultValidators.concat(newOnes)
            }

            current = current.parent;
        } while (current);

        return defaultValidators;
    }

    /**
     * Get all properties for type mapping
     * @param {TypeMapping} typeMapping
     * @returns {PropertyMapping[]}
     */
    public static getAllPropertiesForTypeMapping(typeMapping: TypeMapping): PropertyMapping[] {

        const properties: PropertyMapping[] = [];

        let current = typeMapping;

        do {
            current.properties.forEach(property => {
                if (!properties.some(p => p.name === property.name)) {
                    properties.push(property);
                }
            });

            current = current.parent;
        } while (current);

        return properties;
    }
}