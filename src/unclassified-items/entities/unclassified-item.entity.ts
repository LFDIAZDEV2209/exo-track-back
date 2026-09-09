import { ApiProperty } from '@nestjs/swagger';
import { Declaration } from 'src/declarations/entities/declaration.entity';
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Source } from 'src/shared/enums/source.enum';

/**
 * Registro exógeno que llegó sin clasificación válida.
 * Se persiste (nunca se descarta) hasta que el administrador lo
 * cataloga hacia Patrimonios/Ingresos/Deudas o un tipo personalizado.
 */
@Entity({ name: 'unclassified_items' })
export class UnclassifiedItem {

    @ApiProperty({
        description: 'The ID of the unclassified item',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        description: 'The declaration of the item',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @Index()
    @ManyToOne(() => Declaration, (declaration) => declaration.unclassifiedItems, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'declaration_id' })
    declaration: Declaration;

    @ApiProperty({
        description: 'The concept of the item',
        example: 'Consumo tarjeta de crédito'
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
        example: Source.EXOGENA
    })
    @Column({
        type: 'enum',
        enum: Source,
        default: Source.EXOGENA
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
        description: 'Name of the third party that reported the item (DIAN)',
        required: false
    })
    @Column({
        type: 'varchar',
        length: 300,
        name: 'reporter_name',
        nullable: true
    })
    reporterName: string;

    @ApiProperty({
        description: 'NIT of the third party that reported the item (DIAN)',
        required: false
    })
    @Column({
        type: 'varchar',
        length: 30,
        name: 'reporter_nit',
        nullable: true
    })
    reporterNit: string;

    @CreateDateColumn({
        name: 'created_at'
    })
    createdAt: Date;

    @UpdateDateColumn({
        name: 'updated_at'
    })
    updatedAt: Date;
}
