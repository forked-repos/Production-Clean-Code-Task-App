import { Request, Response } from 'express';
import { route, before, GET, POST, PATCH, DELETE, inject } from 'awilix-express';

import { IUserService } from './../services/UserService';
import { IExpressHttpResponseHandler } from '../../../common/http/express/ExpressHttpResponseHandler';

import CreateUserDTO from './../dtos/ingress/createUserDTO';
import UserCredentialsDTO from './../dtos/ingress/userCredentialsDTO';
import LoggedInUserResponseDTO from './../dtos/egress/loggedInUserResponseDTO';


@route('/api/v1/users')
export default class UserController {
    public constructor(
        private readonly userService: IUserService,
        private httpHandler: IExpressHttpResponseHandler
    ) {
        console.log('loaded')
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
        return this.httpHandler.withDTO<LoggedInUserResponseDTO>(dto);
    }
}