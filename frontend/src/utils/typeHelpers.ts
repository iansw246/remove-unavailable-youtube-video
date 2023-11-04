// Makes Key on Type required (not optional)
export type KeyRequired<Type, Key extends keyof Type> = Pick<Required<Type>, Key> & Omit<Type, Key>