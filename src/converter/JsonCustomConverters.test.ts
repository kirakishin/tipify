import {JsonCustomConverters} from "./JsonCustomConverters";
import {JsonCustomConverter} from "./JsonCustomConverter";
import * as chai from 'chai';

describe('JsonCustomConverters', () => {

    class DateConverter extends JsonCustomConverter<Date> {
        public deserialize(obj: any): Date {
            return undefined;
        }

        public serialize(obj: Date): any {
        }

        constructor() {
            super();
        }
    }

    /**
     * Instantiate converter
     */
    describe('instantiateConverter', () => {

        it('should instantiate DateConverter', () => {

            JsonCustomConverters.instantiateConverter(DateConverter);
            const foundConverter = JsonCustomConverters.CONVERTERS.find(c => c instanceof DateConverter);

            chai.expect(foundConverter).not.undefined;
        });

        it('should not instantiate DateConverter 2 times', () => {

            JsonCustomConverters.instantiateConverter(DateConverter);
            JsonCustomConverters.instantiateConverter(DateConverter);

            const foundConverters = JsonCustomConverters.CONVERTERS.filter(c => c instanceof DateConverter);

            chai.expect(foundConverters).length(1);
        })
    });

    /**
     * Get converter instance
     */
    describe('getConverterInstance', () => {

        it('should return DateConverter instance', () => {

            const foundConverter = JsonCustomConverters.getConverterInstance(DateConverter);

            chai.expect(foundConverter).not.undefined;
            chai.expect(foundConverter).is.instanceOf(DateConverter);
        })
    });
});