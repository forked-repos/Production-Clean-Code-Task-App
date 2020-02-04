/**
 * Maps between domain and persistence model.
 */
export interface IDomainPersistenceMapper<TDomain, TDalEntity> {
    toPersistence(domainEntity: TDomain): TDalEntity;
    toDomain(raw: TDalEntity): TDomain;
}