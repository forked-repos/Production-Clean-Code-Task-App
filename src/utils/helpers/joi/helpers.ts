import Joi from '@hapi/joi';

export const joiGenericMapper = (
    toModify: Joi.SchemaMap, 
    modifier: (currSchema: Joi.AnySchema) => Joi.AnySchema
): Joi.SchemaMap => {
    const modifiedObject: Joi.SchemaMap = {};

    Object.keys(toModify).map((key) => {
        modifiedObject[key] = modifier(toModify[key] as Joi.AnySchema);
    });

    return modifiedObject;
};
