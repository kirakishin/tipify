import {JsonValidator} from '../mapping/JsonValidators';

export interface JsonObjectOptions {
    discriminatorProperty?: string;
    discriminatorValue?: string;
    defaultValidators?: JsonValidator[];
}