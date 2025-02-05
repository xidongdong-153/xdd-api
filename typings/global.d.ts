/**
 * 防止SWC下循环依赖报错
 */
declare type WrapperType<T> = T; // WrapperType === Relation
