import {DeserializeContext} from '../core/DeserializeContext';
import {SerializeContext} from "../core/SerializeContext";
import {DeserializeLevelContext} from "../core/DeserializeLevelContext";

export abstract class JsonCustomConverter<T> {

    public abstract serialize(obj: T, context: SerializeContext): any;

    public abstract deserialize(obj: any, context: DeserializeContext, levelContext?: DeserializeLevelContext): T;
}