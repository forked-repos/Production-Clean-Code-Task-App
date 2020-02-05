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

    public async generateSalt(rounds: number): Promise<string> {
        try {
            return await this.bcrypt.genSalt(rounds);
        } catch (e) {
            throw HashingErrors.CouldNotGenerateSaltError.create(e.message);
        }
    }

    public async generateHash(toHash: string, salt: string): Promise<string> {
        try {
            return await this.bcrypt.hash(toHash, salt);
        } catch (e) {
            throw HashingErrors.CouldNotHashDataError.create(e.message)
        }
    }

    public async compareAgainstHash(candidate: string, knownHash: string): Promise<boolean> {
        try {
            return await this.bcrypt.compare(candidate, knownHash);
        } catch (e) {
            throw HashingErrors.CouldNotCompareHashesError.create(e.message);
        }
    }
}