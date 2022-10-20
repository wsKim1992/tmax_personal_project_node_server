export interface User {
    userId: number;
    email: string;
    password: string;
}

type UserInterface = Pick<User,'userId'|'email'|'password'>;

export interface Music {
    musicId: number;
    artist: string;
    title: string;
    url: string;
    size: string;
    genre: string;
}
