export type Either<L, A> = Left<L, A> | Right<L, A>;

export class Left<L, A> {
    public constructor (public readonly value: L) {}

    isLeft(): this is Left<L, A> {
        return true;
    }

    isRight(): this is Right<L, A> {
        return false;
    }

    map<B>(_: (a: A) => B): Either<L, B> {
        return this as any;
    }

    flatMap<B>(func: (wrapped: A) => Either<L, B>): Either<L, B> {
        return this as any;
    }
}

export class Right<L, A> {
    public constructor (public readonly value: A) {}

    isLeft(): this is Left<L, A> {
        return false;
    }

    isRight(): this is Right<L, A> {
        return true;
    }

    map<B>(func: (a: A) => B): Either<L, B> {
        return new Right<L, B>(func(this.value));
    }

    flatMap<B>(func: (wrapped: A) => Either<L, B>): Either<L, B> {
        return func(this.value);
    }
}

export const left = <L, A>(l: L): Either<L, A> => new Left(l);
export const right = <L, A>(a: A): Either<L, A> => new Right(a);