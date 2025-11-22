import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Source } from "src/shared/enums/source.enum";
import { Declaration } from "src/declarations/entities/declaration.entity";

@Entity({name: 'liabilities'})
export class Liability {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Declaration, (declaration) => declaration.liabilities)
    @JoinColumn({ name: 'declaration_id' })
    declaration: Declaration;

    @Column({
        type: 'text',
        nullable: false
    })
    concept: string;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: false
    })
    amount: number;

    @Column({
        type: 'enum',
        enum: Source,
        default: Source.MANUAL
    })
    source: Source;

    @CreateDateColumn({
        name: 'created_at'
    })
    createdAt: Date;

    @UpdateDateColumn({
        name: 'updated_at'
    })
    updatedAt: Date;
}
