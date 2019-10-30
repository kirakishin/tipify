import {JsonValidator} from '../mapping/JsonValidators';
import {SubGroup} from "../core/SubGroup";

export interface JsonPropertyOptions {
    groups?: string[];
    /**
     * in case of group match, how many level to deserialize
     */
    groupDepth?: number;
    validators?: JsonValidator[];
    /** list of groups conditions with their groups to apply on the nested entity */
    subgroups?: SubGroup[]
}