import { IUnitOfWorkFactory } from "../unit-of-work";
import { IUnitOfWork } from './../unit-of-work';

interface IFakeUnitOfWorkFactory {
    didCommit: boolean;
    didRollback: boolean;
}

export class FakeUnitOfWorkFactory implements IUnitOfWorkFactory, IFakeUnitOfWorkFactory {
    public didCommit = false;
    public didRollback = false;

    public create = async (): Promise<IUnitOfWork> => {
        return {
            commit: async (): Promise<void> => {
                this.didCommit = true;
                this.didRollback = false;
            }, 

            rollback: async (): Promise<void> => {
                this.didCommit = false;
                this.didRollback = true;
            }
        }
    }
}
