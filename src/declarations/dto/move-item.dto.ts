import { IsIn, IsOptional, IsUUID } from 'class-validator';

// Tablas origen/destino válidas. 'unclassified' solo puede ser ORIGEN:
// nada se "des-cataloga" hacia sin catalogar.
export const MOVEABLE_FROM_KINDS = [
  'asset',
  'income',
  'liability',
  'custom',
  'unclassified',
] as const;

export const MOVEABLE_TO_KINDS = [
  'asset',
  'income',
  'liability',
  'custom',
] as const;

export type MoveableFromKind = (typeof MOVEABLE_FROM_KINDS)[number];
export type MoveableToKind = (typeof MOVEABLE_TO_KINDS)[number];

export class MoveItemDto {

    @IsUUID()
    itemId: string;

    @IsIn(MOVEABLE_FROM_KINDS as unknown as string[])
    from: MoveableFromKind;

    @IsIn(MOVEABLE_TO_KINDS as unknown as string[])
    to: MoveableToKind;

    // Requerido solo cuando `to` es 'custom'
    @IsOptional()
    @IsUUID()
    customTypeId?: string;

    // Subtipo a asignar en destino (mismo ámbito). Si se omite, se conserva
    // el del origen cuando es compatible; si no, se limpia.
    @IsOptional()
    @IsUUID()
    subtypeId?: string;
}
