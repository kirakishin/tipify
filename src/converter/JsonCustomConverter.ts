import {DeserializeContext} from '../core/DeserializeContext';

export abstract class JsonCustomConverter<T> {

    public abstract serialize(obj: T): any;

    public abstract deserialize(obj: any, context: DeserializeContext): T;
}