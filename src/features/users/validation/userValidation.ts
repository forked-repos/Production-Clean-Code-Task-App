import Joi from '@hapi/joi';

import { joiGenericMapper } from './../../../utils/helpers/joi/helpers';

const userCommonFields: { [key: string]: Joi.AnySchema } = {
    firstName: Joi.string()
        .min(2)
        .max(20)
        .required(),

    lastName: Joi.string()
        .min(2)
        .max(30)
        .required(),

    username: Joi.string()
        .min(2)
        .max(20)
        .required(),

    biography: Joi.string()
        .min(2)
        .max(350)
        .required(),

    email: Joi.string()
        .email()
        .required(),
};


export namespace UserValidators {
    export const createUser = Joi.object().keys({
        ...userCommonFields,
    
        password: Joi.string()
            .regex(/[A-Z]/, { name: 'Password must include an uppercase letter.' })
            .regex(/[a-z]/, { name: 'Password must include a lowercase letter.' })
            .regex(/\d/, { name: 'Password must include a number.' })
            .regex(/\W/, { name: 'Password must include special character.' })
            .required()
    });  

    export const updateUser = Joi.object(joiGenericMapper(userCommonFields, currSchema => currSchema.optional()));

    export const user = createUser.keys({
        id: Joi.string().required()
    });

    export const userCredentials = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    });
}