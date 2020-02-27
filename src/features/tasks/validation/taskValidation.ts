import Joi from '@hapi/joi';

import { joiGenericMapper } from './../../../utils/helpers/joi/helpers';

const taskCommonFields: { [key: string]: Joi.AnySchema } = {
    name: Joi.string()
        .min(2)
        .max(60)
        .required(),

    description: Joi.string()
        .max(300)
        .optional(),

    owner: Joi.string()
        .required(),

    dueDate: Joi.date()
        .iso()
        .optional(),

    priority: Joi.number()
        .min(1)
        .max(4)
        .required(),

    completionStatus: Joi.string()
        .valid('COMPLETED', 'PENDING')
        .required()
};

export namespace TaskValidators {
    export const createTask = Joi.object().keys(taskCommonFields);

    export const updateTask = Joi.object(joiGenericMapper(taskCommonFields, currSchema => currSchema.optional()));
}