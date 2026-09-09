import { ApiProperty } from '@nestjs/swagger';
import { Declaration } from 'src/declarations/entities/declaration.entity';
import { ConceptType } from 'src/concept-types/entities/concept-type.entity';
import { ConceptSubtype } from 'src/concept-subtypes/entities/concept-subtype.entity';
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Source } from 'src/shared/enums/source.enum';

/**
 * Ítem de declaración bajo un tipo de concepto personalizado.
 * Misma forma que Asset/Income/Liability (tabla separada por decisión
 * de no migrar las tablas históricas), más el FK al tipo.
 */
@Entity({ name: 'custom_items' })
export class CustomItem {

    @ApiProperty({
        description: 'The ID of the custom item',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        description: 'The declaration of the item',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @Index()
    @ManyToOne(() => Declaration, (declaration) => declaration.customItems, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'declaration_id' })
    declaration: Declaration;

    @ApiProperty({
        description: 'The custom concept type of the item',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @Index()
    @ManyToOne(() => ConceptType, (conceptType) => conceptType.items, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'concept_type_id' })
    conceptType: ConceptType;

    @ApiProperty({
        description: 'The concept of the item',
        example: 'Apartamento en Medellín'
    })
    @Column({
        type: 'text',
        nullable: false
    })
    concept: string;

    @ApiProperty({
        description: 'The amount of the item',
        example: 1000000
    })
    @Column({
        type: 'decimal',
        precision: 18,
        scale: 2,
        nullable: false
    })
    amount: number;

    @ApiProperty({
        description: 'The source of the item',
        example: Source.MANUAL
    })
    @Column({
        type: 'enum',
        enum: Source,
        default: Source.MANUAL
    })
    source: Source;

    @ApiProperty({
        description: 'Additional detail about the source (exogenous reporter, account, etc.)',
        required: false
    })
    @Column({
        type: 'text',
        name: 'source_detail',
        nullable: true
    })
    sourceDetail: string;

    @ApiProperty({
        description: 'The concept subtype (must belong to the same custom type). Null = no subtype.',
        required: false
    })
    @Index()
    @ManyToOne(() => ConceptSubtype, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'subtype_id' })
    subtype: ConceptSubtype | null;

    @CreateDateColumn({
        name: 'created_at'
    })
    createdAt: Date;

    @UpdateDateColumn({
        name: 'updated_at'
    })
    updatedAt: Date;
}
