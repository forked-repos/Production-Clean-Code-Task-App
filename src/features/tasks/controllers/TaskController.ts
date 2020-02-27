import { Request, Response } from 'express';
import BaseController from './../../../common/controllers/BaseController';
import { ITaskService } from './../services/TaskService';
import { IExpressHttpResponseHandler } from '../../../common/http/express/ExpressHttpResponseHandler';
import { route, POST, GET, before, inject, PATCH, DELETE } from 'awilix-express';
import CreateTaskDTO from './../dtos/ingress/createTaskDTO';
import { stripBearerToken } from './../../../common/middleware/auth/stripBearerToken';
import { verifyAuthProvider } from './../../../common/middleware/auth/verifyAuthToken';
import UpdateTaskDTO from './../dtos/ingress/updateTaskDTO';

@route('/api/v1/tasks')
export default class TaskController extends BaseController {
    public constructor (
        private readonly taskService: ITaskService,
        httpHandler: IExpressHttpResponseHandler
    ) {
        super(httpHandler);
    }

    @POST()
    @before([stripBearerToken, inject(verifyAuthProvider)])
    async createTask(request: Request): Promise<Response> {
        return this.performOnlyIfUserExists(request, async () => {
            await this.taskService.createNewTask({ ...request.body, owner: request.user!.id } as CreateTaskDTO);
            return this.httpHandler.createdOk();
        });
    }

    @GET()
    @route('/mine')
    @before([stripBearerToken, inject(verifyAuthProvider)])
    async getMyTasks(request: Request): Promise<Response> {
        return this.performOnlyIfUserExists(request, async () => {
            const tasks = await this.taskService.findTasksByOwnerId(request.user!.id);
            return this.httpHandler.withDTO(tasks);
        });        
    }

    @GET()
    @route('/:id')
    @before([stripBearerToken, inject(verifyAuthProvider)])
    async getTaskById(request: Request): Promise<Response> {
        return this.performOnlyIfUserExists(request, async () => {
            const tasks = await this.taskService.findTaskByIdForOwner(request.params.id, request.user!.id);
            return this.httpHandler.withDTO(tasks);
        }); 
    }

    @PATCH()
    @route('/:id')
    @before([stripBearerToken, inject(verifyAuthProvider)])
    async updateTaskById(request: Request): Promise<Response> {
        return this.performOnlyIfUserExists(request, async () => {
            await this.taskService.updateTaskByIdForOwner(
                request.params.id, 
                request.user!.id, 
                request.body as UpdateTaskDTO
            );
            return this.httpHandler.ok();
        });
    }

    @DELETE()
    @route('/:id')
    @before([stripBearerToken, inject(verifyAuthProvider)])
    async removeTaskById(request: Request): Promise<Response> {
        return this.performOnlyIfUserExists(request, async () => {
            await this.taskService.deleteTaskByIdForOwner(
                request.params.id,
                request.user!.id
            );
            return this.httpHandler.ok();
        });
    }
}