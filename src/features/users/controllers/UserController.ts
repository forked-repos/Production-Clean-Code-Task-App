import { Request, Response } from 'express';
import { route, before, GET, POST, PATCH, DELETE, inject } from 'awilix-express';

import { IUserService } from './../services/UserService';
import { IExpressHttpResponseHandler } from '../../../common/http/express/ExpressHttpResponseHandler';

import CreateUserDTO from './../dtos/ingress/createUserDTO';
import UserCredentialsDTO from './../dtos/ingress/userCredentialsDTO';
import LoggedInUserResponseDTO from './../dtos/egress/loggedInUserResponseDTO';
import UpdateUserDTO from './../dtos/ingress/updateUserDTO';


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
        return this.httpHandler.withDTO(dto);
    }

    @PATCH()
    @route('/:id')
    async updateUser(request: Request): Promise<Response> {
        const targetId = request.params.id;
        await this.userService.updateUserById(targetId, request.body as UpdateUserDTO);
        return this.httpHandler.ok();
    }

    @GET()
    @route('/:id')
    async getUserById(request: Request): Promise<Response> {
        const user = await this.userService.findUserById(request.params.id);
        return this.httpHandler.withDTO(user);
    }
}