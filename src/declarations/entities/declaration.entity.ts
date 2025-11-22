import { User } from 'src/users/entities/user.entity';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { DeclarationStatus } from '../enums/declaration-status.enum';

@Entity({ name: 'declarations' })
export class Declaration {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, (user) => user.declarations)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({
        type: 'int',
        name: 'taxable_year',
        nullable: false
    })
    taxableYear: number;

    @Column({
        type: 'enum',
        enum: DeclarationStatus,
        default: DeclarationStatus.PENDING
    })
    status: DeclarationStatus;

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
}
