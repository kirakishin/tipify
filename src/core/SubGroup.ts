export interface SubGroup {
    /** condition for apply the groups. the condition is a list of group */
    conditions: string[] | null;
    /** applied groups on the deserialized nested entity */
    groups: string[];
}