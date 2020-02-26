import { Request, Response } from 'express';
import { route, before, GET, POST, PATCH, DELETE, inject } from 'awilix-express';

import { IUserService } from './../services/UserService';
import { IExpressHttpResponseHandler } from '../../../common/http/express/ExpressHttpResponseHandler';

import CreateUserDTO from './../dtos/ingress/createUserDTO';
import UserCredentialsDTO from './../dtos/ingress/userCredentialsDTO';
import LoggedInUserResponseDTO from './../dtos/egress/loggedInUserResponseDTO';
import UpdateUserDTO from './../dtos/ingress/updateUserDTO';
import { stripBearerToken } from './../../../common/middleware/auth/stripBearerToken';
import { verifyAuthProvider } from './../../../common/middleware/auth/verifyAuthToken';
import { AuthorizationErrors } from '../../auth/errors/errors';
import BaseController from './../../../common/controllers/BaseController';


@route('/api/v1/users')
export default class UserController extends BaseController {
    public constructor(
        private readonly userService: IUserService,
        httpHandler: IExpressHttpResponseHandler
    ) {
        super(httpHandler)
    }

    @POST()
    async createUser(request: Request, res: Response): Promise<Response> {
        await this.userService.signUpUser(request.body as CreateUserDTO);
        return this.httpHandler.createdOk();
    }

    @POST()
    @route('/login')
    async loginUser(request: Request): Promise<Response> {
        const dto = await this.userService.loginUser(request.body as UserCredentialsDTO);
        return this.httpHandler.withDTO(dto);
    }

    @GET()
    @route('/me')
    @before([stripBearerToken, inject(verifyAuthProvider)])
    async getMeById(request: Request): Promise<Response> {
        return this.performOnlyIfUserExists(request, async () => {
            const user = await this.userService.findUserById(request.user!.id);
            return this.httpHandler.withDTO(user);
        });
    }

    @GET()
    @route('/:id')
    async getUserById(request: Request): Promise<Response> {
        const user = await this.userService.findUserById(request.params.id);
        return this.httpHandler.withDTO(user);
    }

    @PATCH()
    @route('/me')
    @before([stripBearerToken, inject(verifyAuthProvider)])
    async updateUser(request: Request): Promise<Response> {
        return this.performOnlyIfUserExists(request, async () => {
            await this.userService.updateUserById(request.user!.id, request.body as UpdateUserDTO);
            return this.httpHandler.ok();
        });
    }

    @DELETE()
    @route('/me')
    @before([stripBearerToken, inject(verifyAuthProvider)])
    async deleteUserById(request: Request): Promise<Response> {
        return this.performOnlyIfUserExists(request, async () => {
            await this.userService.deleteUserById(request.user!.id);
            return this.httpHandler.ok();
        });
    }
}