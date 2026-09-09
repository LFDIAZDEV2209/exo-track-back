/**
 * Ámbito al que pertenece un subtipo de concepto (y, por extensión, los ítems
 * que lo usan). 'custom' requiere conceptTypeId (subtipo de un tipo personalizado).
 */
export enum ItemScope {
    INCOME = 'income',
    ASSET = 'asset',
    LIABILITY = 'liability',
    CUSTOM = 'custom',
}
