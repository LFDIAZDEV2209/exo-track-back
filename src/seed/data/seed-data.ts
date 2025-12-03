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
        },
        {
            fullName: 'Roberto Silva Torres',
            documentNumber: '11111111',
            email: 'roberto.silva@example.com',
            phoneNumber: '+57 300 111 1111',
            password: '',
            role: UserRole.USER
        },
        {
            fullName: 'Laura Martínez Gómez',
            documentNumber: '22222222',
            email: 'laura.martinez@example.com',
            phoneNumber: '+57 300 222 2222',
            password: '',
            role: UserRole.USER
        },
        {
            fullName: 'Diego Fernández Castro',
            documentNumber: '33333333',
            email: 'diego.fernandez@example.com',
            phoneNumber: '+57 300 333 3333',
            password: '',
            role: UserRole.USER
        },
        {
            fullName: 'Sofía Herrera Ruiz',
            documentNumber: '44444444',
            email: 'sofia.herrera@example.com',
            phoneNumber: '+57 300 444 4444',
            password: '',
            role: UserRole.USER
        },
        {
            fullName: 'Andrés Morales Vargas',
            documentNumber: '55555555',
            email: 'andres.morales@example.com',
            phoneNumber: '+57 300 555 5555',
            password: '',
            role: UserRole.USER
        },
        {
            fullName: 'Valentina Rojas Díaz',
            documentNumber: '66666666',
            email: 'valentina.rojas@example.com',
            phoneNumber: '+57 300 666 6666',
            password: '',
            role: UserRole.USER
        },
        {
            fullName: 'Sebastián Jiménez Moreno',
            documentNumber: '77777777',
            email: 'sebastian.jimenez@example.com',
            phoneNumber: '+57 300 777 7777',
            password: '',
            role: UserRole.USER
        },
        {
            fullName: 'Isabella Castro Peña',
            documentNumber: '88888888',
            email: 'isabella.castro@example.com',
            phoneNumber: '+57 300 888 8888',
            password: '',
            role: UserRole.USER
        },
        {
            fullName: 'Mateo Gutiérrez Ríos',
            documentNumber: '10101010',
            email: 'mateo.gutierrez@example.com',
            phoneNumber: '+57 300 101 0101',
            password: '',
            role: UserRole.USER
        },
        {
            fullName: 'Camila Suárez Mendoza',
            documentNumber: '20202020',
            email: 'camila.suarez@example.com',
            phoneNumber: '+57 300 202 0202',
            password: '',
            role: UserRole.USER
        },
        {
            fullName: 'Nicolás Vega Campos',
            documentNumber: '30303030',
            email: 'nicolas.vega@example.com',
            phoneNumber: '+57 300 303 0303',
            password: '',
            role: UserRole.USER
        },
        {
            fullName: 'Mariana Ortiz Salazar',
            documentNumber: '40404040',
            email: 'mariana.ortiz@example.com',
            phoneNumber: '+57 300 404 0404',
            password: '',
            role: UserRole.USER
        },
        {
            fullName: 'Santiago Mejía Cardona',
            documentNumber: '50505050',
            email: 'santiago.mejia@example.com',
            phoneNumber: '+57 300 505 0505',
            password: '',
            role: UserRole.USER
        },
        {
            fullName: 'Daniela Restrepo Londoño',
            documentNumber: '60606060',
            email: 'daniela.restrepo@example.com',
            phoneNumber: '+57 300 606 0606',
            password: '',
            role: UserRole.USER
        },
        {
            fullName: 'Alejandro Zapata Ospina',
            documentNumber: '70707070',
            email: 'alejandro.zapata@example.com',
            phoneNumber: '+57 300 707 0707',
            password: '',
            role: UserRole.USER
        },
        {
            fullName: 'Gabriela Montoya Arango',
            documentNumber: '80808080',
            email: 'gabriela.montoya@example.com',
            phoneNumber: '+57 300 808 0808',
            password: '',
            role: UserRole.USER
        },
        {
            fullName: 'Felipe Cárdenas Betancur',
            documentNumber: '90909090',
            email: 'felipe.cardenas@example.com',
            phoneNumber: '+57 300 909 0909',
            password: '',
            role: UserRole.USER
        },
        {
            fullName: 'Andrea Velásquez Uribe',
            documentNumber: '12121212',
            email: 'andrea.velasquez@example.com',
            phoneNumber: '+57 300 121 2121',
            password: '',
            role: UserRole.USER
        },
        {
            fullName: 'Julián Agudelo Franco',
            documentNumber: '13131313',
            email: 'julian.agudelo@example.com',
            phoneNumber: '+57 300 131 3131',
            password: '',
            role: UserRole.USER
        },
        {
            fullName: 'Paola Henao Zapata',
            documentNumber: '14141414',
            email: 'paola.henao@example.com',
            phoneNumber: '+57 300 141 4141',
            password: '',
            role: UserRole.USER
        },
        {
            fullName: 'Cristian Osorio Giraldo',
            documentNumber: '15151515',
            email: 'cristian.osorio@example.com',
            phoneNumber: '+57 300 151 5151',
            password: '',
            role: UserRole.USER
        },
        {
            fullName: 'Natalia Quintero Jaramillo',
            documentNumber: '16161616',
            email: 'natalia.quintero@example.com',
            phoneNumber: '+57 300 161 6161',
            password: '',
            role: UserRole.USER
        },
        {
            fullName: 'David Tobón Valencia',
            documentNumber: '17171717',
            email: 'david.tobon@example.com',
            phoneNumber: '+57 300 171 7171',
            password: '',
            role: UserRole.USER
        },
        {
            fullName: 'Carolina Muñoz Correa',
            documentNumber: '18181818',
            email: 'carolina.munoz@example.com',
            phoneNumber: '+57 300 181 8181',
            password: '',
            role: UserRole.USER
        },
        {
            fullName: 'Esteban Londoño Bedoya',
            documentNumber: '19191919',
            email: 'esteban.londono@example.com',
            phoneNumber: '+57 300 191 9191',
            password: '',
            role: UserRole.USER
        }
    ],
    declarations: [
        // ✅ Las declaraciones se generan automáticamente en seed.service.ts
        // Cada usuario (29 usuarios USER) recibirá exactamente 15 declaraciones:
        // Años 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025
        // Total: 29 usuarios × 15 años = 435 declaraciones
        // Todas en orden: Usuario 0 tiene 2011-2025, Usuario 1 tiene 2011-2025, etc.
    ],
    assets: [
        // ✅ Los assets se generan automáticamente en seed.service.ts
        // Cada declaración recibe 25-35 assets aleatorios con conceptos y montos variados
        // Total aproximado: 435 declaraciones × 30 assets promedio = ~13,050 assets
    ],
    liabilities: [
        // ✅ Los liabilities se generan automáticamente en seed.service.ts
        // Cada declaración recibe 15-25 liabilities aleatorios con conceptos y montos variados
        // Total aproximado: 435 declaraciones × 20 liabilities promedio = ~8,700 liabilities
    ],
    incomes: [
        // ✅ Los incomes se generan automáticamente en seed.service.ts
        // Cada declaración recibe 10-20 incomes aleatorios con conceptos y montos variados
        // Total aproximado: 435 declaraciones × 15 incomes promedio = ~6,525 incomes
    ]
};
