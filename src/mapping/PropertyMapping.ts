import {JsonValidator} from "./JsonValidators";
import {SubGroup} from "../core/SubGroup";

export interface PropertyMapping {
    name: string;
    serializedName: string;
    type?: any;
    groups?: string[];
    subgroups?: SubGroup[];
    groupDepth?: number;
    validators?: JsonValidator[];
}