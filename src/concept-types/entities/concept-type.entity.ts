import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { CustomItem } from 'src/custom-items/entities/custom-item.entity';

/**
 * Catálogo de tipos de concepto definidos por el administrador
 * (ej. Vehículos, Inversiones, Cuentas bancarias).
 *
 * Los 3 tipos del sistema (Patrimonios, Ingresos, Deudas) viven en sus
 * propias tablas históricas y NO están en este catálogo: aquí solo van
 * los tipos personalizados (isSystem siempre false vía API).
 */
@Entity({ name: 'concept_types' })
export class ConceptType {

    @ApiProperty({
        description: 'The ID of the concept type',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        description: 'Display name of the concept type (unique)',
        example: 'Vehículos'
    })
    @Column({
        type: 'varchar',
        length: 100,
        unique: true,
        nullable: false
    })
    name: string;

    @ApiProperty({
        description: 'Optional description of the concept type',
        example: 'Vehículos y automotores del declarante',
        required: false
    })
    @Column({
        type: 'text',
        nullable: true
    })
    description: string;

    @ApiProperty({
        description: 'Whether the type is shown as a tab in declarations',
        example: true
    })
    @Column({
        type: 'boolean',
        name: 'is_active',
        default: true
    })
    isActive: boolean;

    @ApiProperty({
        description: 'Reserved for system types. Always false for admin-created types.',
        example: false
    })
    @Column({
        type: 'boolean',
        name: 'is_system',
        default: false
    })
    isSystem: boolean;

    @CreateDateColumn({
        name: 'created_at'
    })
    createdAt: Date;

    @UpdateDateColumn({
        name: 'updated_at'
    })
    updatedAt: Date;

    @OneToMany(() => CustomItem, (item) => item.conceptType)
    items: CustomItem[];
}
