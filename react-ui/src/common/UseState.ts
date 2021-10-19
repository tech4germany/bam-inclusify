import { Dispatch, SetStateAction } from "react";

export type SetState<S> = Dispatch<SetStateAction<S>>;
export type UseState<S> = [S, SetState<S>];
