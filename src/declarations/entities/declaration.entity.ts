import { ApiProperty } from '@nestjs/swagger';
import { Asset } from 'src/assets/entities/asset.entity';
import { Income } from 'src/incomes/entities/income.entity';
import { Liability } from 'src/liabilities/entities/liability.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { DeclarationStatus } from '../enums/declaration-status.enum';
@Entity({ name: 'declarations' })
export class Declaration {

    @ApiProperty({
        description: 'The ID of the declaration',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        description: 'The user of the declaration',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ManyToOne(() => User, (user) => user.declarations, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ApiProperty({
        description: 'The taxable year of the declaration',
        example: 2023
    })
    @Column({
        type: 'int',
        name: 'taxable_year',
        nullable: false
    })
    taxableYear: number;

    @ApiProperty({
        description: 'The status of the declaration',
        example: DeclarationStatus.PENDING
    })
    @Column({
        type: 'enum',
        enum: DeclarationStatus,
        default: DeclarationStatus.PENDING
    })
    status: DeclarationStatus;

    @ApiProperty({
        description: 'The description of the declaration',
        example: 'Declaración de renta 2023'
    })
    @Column({
        type: 'text',
        nullable: true
    })
    description: string;

    @CreateDateColumn({
        name: 'created_at'
    })
    createdAt: Date;

    @UpdateDateColumn({
        name: 'updated_at'
    })
    updatedAt: Date;

    @OneToMany(() => Asset, (asset) => asset.declaration)
    assets: Asset[];

    @OneToMany(() => Liability, (liability) => liability.declaration)
    liabilities: Liability[];

    @OneToMany(() => Income, (income) => income.declaration)
    incomes: Income[];
}
