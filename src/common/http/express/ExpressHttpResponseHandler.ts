import express, { Request, Response } from 'express';
import * as HttpStatus from 'http-status-codes';

import { BaseErrors, ApplicationErrors, ErrorCausationReason } from './../../errors/errors';

export interface IHttpContext {
    req: Request;
    res: Response;
}


export interface IExpressHttpResponseHandler {
    /**
     * Returns a response with HTTP Status 200 and an optional payload.
     * @param json The JSON payload to return.
     */
    ok(json?: any): Response;

    /**
     * Returns a response DTO with the provided payload and an optional response override.
     * @param dto        The DTO with which to respond.
     * @param statusCode [statusCode=200] The status code with which to respond.
     */
    withDTO<T>(dto: T, statusCode?: number): Response;

    /**
     * Returns a response with HTTP Status 201 and an optional payload.
     * @param json The optional JSON payload to respond with.
     */
    createdOk(json?: any): Response;

    /**
     * Returns a serialized error response with HTTP Status 400.
     * @param error A BaseErrors.DomainError instance.
     */
    clientError(error: BaseErrors.DomainError): Response;

    /**
     * Maps an error to an HTTP Response, using built-in error serialization features if supported.
     * @param error             The error over which to map and respond to the client.
     * @param operationalDomain An optional domain of operation within which the error was caught.
     */
    fromError(error: Error, operationalDomain?: string): Response;

    /**
     * Maps the provided error to an HTTP Status 500 Response, using built in error serialization
     * features if supported.
     * 
     * @param error An optional error over which to map and respond to the client.
     */
    fail(error?: any): Response;

    /**
     * Returns an arbitrary JSON payload to the client with the provided HTTP Status Code.
     * 
     * @param json An optional arbitrary JSON Payload.
     * @param statusCode [statusCode=200] An optional status code.
     */
    json(json: any, statusCode?: number): Response;
}

export default class ExpressHttpResponseHandler implements IExpressHttpResponseHandler {
    public constructor (private readonly httpContext: IHttpContext) {}

    public ok(json?: any): Response {
        return this.json(json, HttpStatus.OK);
    }

    public withDTO<T>(dto: T, statusCode: number = HttpStatus.OK): Response {
        return this.json(dto, statusCode);
    }

    public createdOk(json?: any): Response {
        return this.json(json, HttpStatus.CREATED);
    }

    public clientError(error: BaseErrors.DomainError): Response {
        return this.json(error.serializeError(), HttpStatus.BAD_REQUEST);
    }

    public fromError(error: Error, operationalDomain?: string): Response {
        console.log(error)
        const fallbackError = ApplicationErrors.UnexpectedError.create(operationalDomain)
        if (error instanceof BaseErrors.DomainError) {
            const serializedError = error.serializeError();
            const errorWithStatus = (statusCode: number) => 
                this.json({ statusCode, errors: [serializedError] }, statusCode);

            switch (error.errorCausationReason) {
                case ErrorCausationReason.BAD_DATA_PROVIDED:
                    return errorWithStatus(HttpStatus.BAD_REQUEST);
                case ErrorCausationReason.DATA_NON_EXISTENT:
                    return errorWithStatus(HttpStatus.NOT_FOUND);
                case ErrorCausationReason.NOT_AUTHORIZED:
                    return errorWithStatus(HttpStatus.UNAUTHORIZED);
                case ErrorCausationReason.UNKNOWN_ERROR:   // ------
                default:                                   // Intentional fall-through.
                    return this.fail(fallbackError);
            }
        } else {
            return this.fail(fallbackError);
        }
    }

    public fail(errorOrJSON?: any): Response {
        if (errorOrJSON instanceof ApplicationErrors.UnexpectedError) {
            return this.httpContext.res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(errorOrJSON.serializeError());
        } else {
            return this.httpContext.res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(errorOrJSON);
        }
    }
    
    public json(json?: any, statusCode: number = HttpStatus.OK): Response {
        return this.httpContext.res.status(statusCode).send(json);
    }
}