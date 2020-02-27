import { IUnitOfWorkFactory, IUnitOfWork } from './unit-of-work';

/**
 * Permits the teardown of a Unit of Work.
 * @param unitOfWork        The Unit of Work within which to perform an operation.
 * @param businessOperation The business operation to perform.
 */
export const usingUnitOfWork = async <T>(
    unitOfWorkFactory: IUnitOfWorkFactory, 
    businessOperation: (unitOfWork: IUnitOfWork) => Promise<T>
): Promise<T> => {
    const unitOfWork = await unitOfWorkFactory.create();

    try {
        return await businessOperation(unitOfWork);
    } catch (e) {
        await unitOfWork.rollback();
        throw e;
    }
};