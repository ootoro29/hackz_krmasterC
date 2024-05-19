export type User = {
    id: string;
    name: string;
};
export type UserInfo = {
    game:string;
    coins:number;
};
export type UserScoreInfo = {
    gameKind:number;
    UID:string;
    name:string|null;
    score:number;
};