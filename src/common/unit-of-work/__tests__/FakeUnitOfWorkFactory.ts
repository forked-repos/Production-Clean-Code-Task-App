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
            }, 

            rollback: async (): Promise<void> => {
                this.didRollback = true;
            }
        }
    }

    public async createUnderScope<T>(operation: (unitOfWork: IUnitOfWork) => Promise<T>): Promise<T> {
        const unitOfWork = await this.create();
        try {
            return await operation(unitOfWork);
        } catch (e) {
            unitOfWork.rollback();
            throw e;
        }
    }
}
