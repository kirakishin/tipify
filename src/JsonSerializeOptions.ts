export interface JsonSerializeOptions {
    type?: any;
    groups?: string[];
}

export function isJsonSerializeOptions(arg: any): arg is JsonSerializeOptions {
    return arg && (typeof arg.type === 'object' || Array.isArray(arg.groups))
}