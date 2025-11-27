import { DeclarationStatus } from "src/declarations/enums/declaration-status.enum";
import { UserRole } from "src/shared/enums/user-role.enum";

interface SeedUser {
    fullName: string;
    documentNumber: string;
    email: string;
    phoneNumber: string;
    password: string;
    role: UserRole;
}

interface SeedDeclaration {
    userId: string;
    taxableYear: number;
    status: DeclarationStatus;
    description: string;
}

interface SeedAsset {
    declarationId: string;
    concept: string;
    amount: number;
}

interface SeedLiability {
    declarationId: string;
    concept: string;
    amount: number;
}

interface SeedIncome {
    declarationId: string;
    concept: string;
    amount: number;
}

// Datos de ejemplo
export const initialData: {
    users: SeedUser[];
    declarations: SeedDeclaration[];
    assets: SeedAsset[];
    liabilities: SeedLiability[];
    incomes: SeedIncome[];
} = {
    users: [
        {
            fullName: 'Juan Pérez García',
            documentNumber: '12345678',
            email: 'juan.perez@example.com',
            phoneNumber: '+57 300 123 4567',
            password: '',
            role: UserRole.USER
        },
        {
            fullName: 'María López Rodríguez',
            documentNumber: '87654321',
            email: 'maria.lopez@example.com',
            phoneNumber: '+57 300 234 5678',
            password: '',
            role: UserRole.USER
        },
        {
            fullName: 'Carlos Ramírez Martínez',
            documentNumber: '11223344',
            email: 'carlos.ramirez@example.com',
            phoneNumber: '+57 300 345 6789',
            password: '',
            role: UserRole.USER
        },
        {
            fullName: 'Ana González Sánchez',
            documentNumber: '55667788',
            email: 'ana.gonzalez@example.com',
            phoneNumber: '+57 300 456 7890',
            password: '',
            role: UserRole.USER
        },
        {
            fullName: 'Admin Sistema',
            documentNumber: '99999999',
            email: 'admin@exotrack.com',
            phoneNumber: '+57 300 999 9999',
            password: 'Admin123!',
            role: UserRole.ADMIN
        }
    ],
    declarations: [
        // Estas se crearán dinámicamente con los userId generados
        { userId: '', taxableYear: 2023, status: DeclarationStatus.PENDING, description: 'Declaración de renta 2023' },
        { userId: '', taxableYear: 2023, status: DeclarationStatus.COMPLETED, description: 'Declaración de renta 2023 completada' },
        { userId: '', taxableYear: 2024, status: DeclarationStatus.PENDING, description: 'Declaración de renta 2024' },
        { userId: '', taxableYear: 2024, status: DeclarationStatus.PENDING, description: 'Declaración de renta 2024' },
        { userId: '', taxableYear: 2023, status: DeclarationStatus.COMPLETED, description: 'Declaración de renta 2023' },
    ],
    assets: [
        // Estas se crearán dinámicamente con los declarationId generados
        { declarationId: '', concept: 'Casa de habitación', amount: 250000000 },
        { declarationId: '', concept: 'Vehículo', amount: 45000000 },
        { declarationId: '', concept: 'Apartamento', amount: 180000000 },
        { declarationId: '', concept: 'Terreno', amount: 95000000 },
        { declarationId: '', concept: 'Oficina comercial', amount: 320000000 },
        { declarationId: '', concept: 'Vehículo', amount: 38000000 },
        { declarationId: '', concept: 'Casa de habitación', amount: 210000000 },
        { declarationId: '', concept: 'Inversión en acciones', amount: 15000000 },
    ],
    liabilities: [
        // Estas se crearán dinámicamente con los declarationId generados
        { declarationId: '', concept: 'Préstamo hipotecario', amount: 120000000 },
        { declarationId: '', concept: 'Tarjeta de crédito', amount: 8500000 },
        { declarationId: '', concept: 'Préstamo vehicular', amount: 25000000 },
        { declarationId: '', concept: 'Préstamo personal', amount: 5000000 },
        { declarationId: '', concept: 'Préstamo hipotecario', amount: 95000000 },
        { declarationId: '', concept: 'Tarjeta de crédito', amount: 12000000 },
        { declarationId: '', concept: 'Préstamo estudiantil', amount: 8000000 },
    ],
    incomes: [
        // Estas se crearán dinámicamente con los declarationId generados
        { declarationId: '', concept: 'Salario', amount: 48000000 },
        { declarationId: '', concept: 'Arrendamientos', amount: 24000000 },
        { declarationId: '', concept: 'Salario', amount: 55000000 },
        { declarationId: '', concept: 'Honorarios profesionales', amount: 18000000 },
        { declarationId: '', concept: 'Salario', amount: 42000000 },
        { declarationId: '', concept: 'Dividendos', amount: 12000000 },
        { declarationId: '', concept: 'Arrendamientos', amount: 30000000 },
        { declarationId: '', concept: 'Salario', amount: 60000000 },
    ]
};
