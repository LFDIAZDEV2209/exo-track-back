import { BeforeInsert, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { UserRole } from '../enums/user-role.enum';
import { Declaration } from 'src/declarations/entities/declaration.entity';

@Entity({ name: 'users' })
export class User {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ 
        type: 'varchar', 
        length: 150, 
        name: 'full_name',
        nullable: false })
    fullName: string;

    @Column({ 
        type: 'varchar', 
        unique: true, 
        name: 'document_number',
        nullable: false })
    documentNumber: string;

    @Column({ 
        type: 'varchar', 
        length: 150, 
        unique: true,
        nullable: true })
    email: string;

    @Column({ 
        type: 'varchar', 
        length: 150, 
        unique: true, 
        name: 'phone_number',
        nullable: true })
    phoneNumber: string;

    @Column({ 
        type: 'varchar', 
        length: 150, 
        unique: true,
        nullable: false })
    password: string;

    @Column({ 
        type: 'enum', 
        enum: UserRole,
        default: UserRole.USER,
    })
    role: UserRole;

    @Column({ 
        type: 'boolean', 
        default: true, 
        name: 'is_active' })
    isActive: boolean;

    @CreateDateColumn({ 
        name: 'created_at' 
    })
    createdAt: Date;

    @UpdateDateColumn({ 
        name: 'updated_at' 
    })
    updatedAt: Date;

    @OneToMany(() => Declaration, (declaration) => declaration.user)
    declarations: Declaration[];

    @BeforeInsert()
    defaultPassword() {
        if (!this.password) {
            this.password = this.fullName.substring(0, 4) + this.documentNumber;
        }
    }

}
