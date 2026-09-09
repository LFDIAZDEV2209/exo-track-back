import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';
import { ItemScope } from 'src/shared/enums/item-scope.enum';
import { ConceptType } from 'src/concept-types/entities/concept-type.entity';

/**
 * Subtipo de concepto autogestionable (ej. "Dividendos" dentro de Ingresos).
 *
 * Genérico por ámbito: hoy se usan en ingresos, pero el mismo catálogo sirve
 * para patrimonios, deudas o tipos personalizados sin cambiar código —
 * solo hace falta exponer el ámbito en la UI.
 */
@Entity({ name: 'concept_subtypes' })
@Unique('UQ_subtype_scope_type_name', ['scope', 'conceptType', 'name'])
export class ConceptSubtype {

    @ApiProperty({
        description: 'The ID of the concept subtype',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        description: 'Display name of the subtype (unique per scope/type)',
        example: 'Dividendos'
    })
    @Column({
        type: 'varchar',
        length: 100,
        nullable: false
    })
    name: string;

    @ApiProperty({
        description: 'Optional description of the subtype',
        required: false
    })
    @Column({
        type: 'text',
        nullable: true
    })
    description: string;

    @ApiProperty({
        description: 'Scope the subtype belongs to',
        enum: ItemScope,
        example: ItemScope.INCOME
    })
    @Index()
    @Column({
        type: 'enum',
        enum: ItemScope,
        nullable: false
    })
    scope: ItemScope;

    @ApiProperty({
        description: 'Custom concept type (required only when scope is custom)',
        required: false
    })
    @Index()
    @ManyToOne(() => ConceptType, { onDelete: 'RESTRICT', nullable: true })
    @JoinColumn({ name: 'concept_type_id' })
    conceptType: ConceptType;

    @ApiProperty({
        description: 'Whether the subtype is offered for new records',
        example: true
    })
    @Column({
        type: 'boolean',
        name: 'is_active',
        default: true
    })
    isActive: boolean;

    @CreateDateColumn({
        name: 'created_at'
    })
    createdAt: Date;

    @UpdateDateColumn({
        name: 'updated_at'
    })
    updatedAt: Date;
}
