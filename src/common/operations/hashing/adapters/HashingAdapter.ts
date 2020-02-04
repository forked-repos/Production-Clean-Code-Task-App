import bcryptjs from 'bcryptjs';
import { HashingErrors } from '../errors/errors';

export interface IHashHandler {
    /**
     * Generates a salt with the given rounds.
     * @param rounds The number of rounds to use while generating the salt.
     */
    generateSalt(rounds: number): Promise<string>;

    /**
     * Generates a salted hash.
     * @param toHash The data to hash
     * @param salt   The salt to generate the hash with/
     */
    generateHash(toHash: string, salt: string): Promise<string>;

    /**
     * Compares a candidate with a hash.
     * @param candidate Candidate to verify.
     * @param knownHash Known hash to verify candidate against.
     */
    compareAgainstHash(candidate: string, knownHash: string): Promise<boolean>;
}

export default class BcryptAdapter implements IHashHandler {
    public constructor (private bcrypt: typeof bcryptjs) {}

    public generateSalt(rounds: number): Promise<string> {
        return new Promise((resolve, reject) => {
            this.bcrypt.genSalt(rounds, (err: Error, salt: string) => {
                if (err) return reject(HashingErrors.CouldNotGenerateSaltError.create(err.message));
                return resolve(salt);
            });
        });
    }

    public generateHash(toHash: string, salt: string): Promise<string> {
        return new Promise((resolve, reject) => {
            this.bcrypt.hash(toHash, salt, (err: Error, hash: string) => {
                if (err) return reject(HashingErrors.CouldNotHashDataError.create(err.message));
                return resolve(hash);
            });
        });
    }

    public compareAgainstHash(candidate: string, knownHash: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.bcrypt.compare(candidate, knownHash, (err: Error, isMatch: boolean) => {
                if (err) return reject(HashingErrors.CouldNotCompareHashesError.create(err.message));
                return resolve(isMatch);
            });
        });
    }
}