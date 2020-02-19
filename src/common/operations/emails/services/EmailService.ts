import { IEmailAdapter } from './../../adapters/IEmailAdapter';

export interface IEmailService {

}

export default class EmailService implements IEmailService {
    public constructor (private readonly emailAdapter: IEmailAdapter) {}
}