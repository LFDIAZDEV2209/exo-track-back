import { ApiProperty } from '@nestjs/swagger';
import { BeforeInsert, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { UserRole } from '../../shared/enums/user-role.enum';
import { Declaration } from 'src/declarations/entities/declaration.entity';
import * as bcrypt from 'bcrypt';

@Entity({ name: 'users' })
export class User {

    @ApiProperty({
        description: 'The ID of the user',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        description: 'The full name of the user',
        example: 'John Doe'
    })
    @Column({ 
        type: 'varchar', 
        length: 150, 
        name: 'full_name',
        nullable: false })
    fullName: string;

    @ApiProperty({
        description: 'The document number of the user',
        example: '1234567890'
    })
    @Column({ 
        type: 'varchar', 
        unique: true, 
        name: 'document_number',
        nullable: false })
    documentNumber: string;

    @ApiProperty({
        description: 'The email of the user',
        example: 'john.doe@example.com'
    })
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

    @ApiProperty({
        description: 'The password of the user',
        example: 'password'
    })
    @Column({ 
        type: 'varchar', 
        length: 150, 
        unique: true,
        nullable: false,
        select: false 
    })
    password: string;

    @ApiProperty({
        description: 'The role of the user',
        example: UserRole.ADMIN
    })
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
            this.password = this.fullName.substring(0, 2) + this.documentNumber;
            this.password = bcrypt.hashSync(this.password, 10);
        }
    }

}
