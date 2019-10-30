# tipify

Inspired by : https://github.com/dhlab-basel/json2typescript
## Usage

```
const car = new Car();

const converter = new JsonConverter();

const json = converter.serialize(car);

const car2 = converter.deserialize(car, Car);
```

## Mapping

```
@jsonObject()
export class Passenger {

    @jsonProperty('pid', PidConverter)
    private _pid: Pid;

    @jsonProperty('gender', Enum(Gender, EnumStrategy.INDEX_COMPATIBLE))
    private _gender: Gender;

    @jsonProperty('name', String)
    private _name: string;

    @jsonProperty('informations', Any)
    private _informations: object;

    constructor(options?: PassengerOptions) {
        if (options) {
            this._pid = options.pid;
            this._gender = options.gender;
            this._name = options.name;
            this._informations = options.informations;
        }
    }
}
```

|                |   |
|----------------|---|
| String         |   |
| Number         |   |
| Boolean        |   |
| Any            |   |
| [String]       |   |
| [PidConverter] |   |
| Enum(...)      |   |


## Groups
Filter some properties to deserialize depending groups.
```
@jsonObject()
export class Passenger {

    @jsonProperty('id', Number)
    private _id: number;
    
    @jsonProperty('filteredData', String, ['group1', 'group2'])
    public _filteredData?: string;
}

const deserialized = 
```
## Polymorphism

```
@jsonObject({discriminatorProperty: 'type'})
export abstract class Vehicle {

    @jsonProperty('type', String)
    private _type: string;
    
    constructor(type?: string) {
        this._type = type;
    }
}

@jsonObject({discriminatorValue: 'car'})
export class Car extends Vehicle {

    constructor() {
        super('car');
    }
}
```

## Enum

```
@jsonProperty('color', Enum(Color, EnumStrategy.NAME_COMPATIBLE))
private _color: Color;
```

|                 |   |
|-----------------|---|
| NAME_COMPATIBLE |   |
| NAME            |   |
| INDEX_COMPATIBLE|   |
| INDEX           |   |

## Custom converter

```
@jsonCustomConverter()
export class PidConverter implements JsonCustomConverter<Pid> {

    public deserialize(obj: any): Pid {
        return undefined;
    }

    public serialize(obj: Pid): any {
        return undefined;
    }
}
```

## Validation

### How it works ?

Before deserialization, data can be validated.

Validation is enabled by `@jsonProperty` 4th field :

```
@jsonObject({discriminatorProperty: 'type'})
export abstract class Vehicle {

    @jsonProperty('type', String, [], [JsonValidators.required])
    public _type: string;

    @jsonProperty('id', Number, ['group1'], [JsonValidators.required])
    public _id: number;

    @jsonProperty('name', String, [], [JsonValidators.required])
    public _name: string;
    
    /** @deprecated signature */
    @jsonProperty('name', String, [JsonValidators.required])
    public _name: string;
...
```

Implemented validation :
* required

### Custom validation

You may want to add your own validation functions :

```
public static required: JsonValidator = (obj: any, serializedName: string) => {
    if (!obj.hasOwnProperty(serializedName)) {
        throw new JsonConverterError('value is required');
    }
};
```

## Transient

WIP