import {JsonValidator} from '../mapping/JsonValidators';

export interface JsonObjectOptions {
    discriminatorProperty?: string;
    discriminatorValue?: string;
    /** default groups to be set on declared properties */
    defaultGroups?: string[];
    /** default deserialization groups to be take into account */
    defaultDeserializationGroups?: string[];
    /** default validators to be set on declared properties */
    defaultValidators?: JsonValidator[];
}