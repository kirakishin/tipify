import {Vehicle} from "./Vehicle";
import {jsonObject} from "../../decorators/JsonObject";
import {jsonProperty} from "../../decorators/JsonProperty";
import {CarOptions} from "./CarOptions";

@jsonObject({discriminatorValue: 'car'})
export class Car extends Vehicle {

    @jsonProperty('brand', String)
    private _brand: string;

    constructor(options?: CarOptions) {
        super('car', options);

        if (options) {
            this._brand = options.brand;
        }
    }
}