import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Source } from "src/shared/enums/source.enum";
import { Declaration } from "src/declarations/entities/declaration.entity";
import { ConceptSubtype } from "src/concept-subtypes/entities/concept-subtype.entity";

@Entity({name: 'liabilities'})
export class Liability {

    @ApiProperty({
        description: 'The ID of the liability',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        description: 'The declaration of the liability',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ManyToOne(() => Declaration, (declaration) => declaration.liabilities, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'declaration_id' })
    declaration: Declaration;

    @ApiProperty({
        description: 'The concept of the liability',
        example: 'Hipoteca'
    })
    @Column({
        type: 'text',
        nullable: false
    })
    concept: string;

    @ApiProperty({
        description: 'The amount of the liability',
        example: 1000000
    })
    @Column({
        type: 'decimal',
        precision: 18,  // Aumentado de 10 a 18
        scale: 2,
        nullable: false
    })
    amount: number;

    @ApiProperty({
        description: 'The source of the liability',
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
        example: 'Número de Cuenta / Documento: 9943',
        required: false
    })
    @Column({
        type: 'text',
        name: 'source_detail',
        nullable: true
    })
    sourceDetail: string;

    @ApiProperty({
        description: 'The concept subtype. Null = no subtype.',
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
