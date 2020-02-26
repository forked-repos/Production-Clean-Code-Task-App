import { Request, Response, NextFunction } from 'express';

import { IExpressHttpResponseHandler } from "../http/express/ExpressHttpResponseHandler";
import { AuthorizationErrors } from "../../features/auth/errors/errors";

export default class BaseController {
    protected constructor (protected httpHandler: IExpressHttpResponseHandler) {}

    /**
     * Specifies an operation that may only be performed if the predicate that a user
     * exists is true.
     * @param request   The HTTP Request context.
     * @param operation The business operation to perform.
     */
    protected async performOnlyIfUserExists(
        request: Request, 
        operation: (request?: Request) => Promise<Response>
    ): Promise<Response> {
        return this.performOnlyIfPredicateTrue(
            () => request.user !== undefined,
            () => this.httpHandler.fromError(AuthorizationErrors.AuthorizationError.create('Users')),
            () => operation(request)
        );
    }

    /**
     * Specifies a set of actions to occur based upon the truthfulness of a provided predicate.
     * @param predicate         The given predicate to assert truthy
     * @param onPredicateFalse  A callback for how to handle the case wherein the predicate is false.
     * @param onPredicateTrue   A callback for how to handle the case wherein the predicate is true.
     */
    private async performOnlyIfPredicateTrue(
        predicate: (...args: any[]) => boolean,
        onPredicateFalse: (...args: any[]) => any,
        onPredicateTrue: (...args: any[]) => any
    ): Promise<any> {
        if (await predicate()) {
            return onPredicateFalse();
        } else {
            return onPredicateTrue();
        }
    }
}