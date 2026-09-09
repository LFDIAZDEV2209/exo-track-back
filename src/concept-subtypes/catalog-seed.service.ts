import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConceptSubtype } from './entities/concept-subtype.entity';
import { ItemScope } from 'src/shared/enums/item-scope.enum';

/**
 * Catálogo base que se garantiza al arrancar la plataforma (dev y producción).
 *
 * IDEMPOTENTE y seguro: solo inserta los nombres que falten en cada ámbito,
 * jamás borra ni modifica lo que el administrador haya gestionado.
 * (Si el admin renombra un subtipo semilla, el original se repone en el
 * siguiente arranque: comportamiento documentado y predecible.)
 */
const SEED_SUBTYPES: Array<{ scope: ItemScope; name: string }> = [
  { scope: ItemScope.INCOME, name: 'Rentas de trabajo' },
  { scope: ItemScope.INCOME, name: 'Rentas de trabajo No legal' },
  { scope: ItemScope.INCOME, name: 'Rentas de Capital' },
  { scope: ItemScope.INCOME, name: 'Rentas no laborales' },
  { scope: ItemScope.INCOME, name: 'Rentas de pensiones' },
  { scope: ItemScope.INCOME, name: 'Dividendos' },
  { scope: ItemScope.INCOME, name: 'Ganancias Ocasionales' },
  { scope: ItemScope.INCOME, name: 'Otras rentas' },
];

@Injectable()
export class CatalogSeedService implements OnModuleInit {

  private readonly logger = new Logger('CatalogSeedService');

  constructor(
    @InjectRepository(ConceptSubtype)
    private readonly subtypeRepository: Repository<ConceptSubtype>,
  ) {}

  async onModuleInit() {
    try {
      let created = 0;
      for (const seed of SEED_SUBTYPES) {
        const exists = await this.subtypeRepository
          .createQueryBuilder('subtype')
          .where('subtype.scope = :scope', { scope: seed.scope })
          .andWhere('LOWER(subtype.name) = LOWER(:name)', { name: seed.name })
          .andWhere('subtype.conceptType IS NULL')
          .getExists();
        if (!exists) {
          await this.subtypeRepository.save(
            this.subtypeRepository.create({ scope: seed.scope, name: seed.name }),
          );
          created += 1;
        }
      }
      this.logger.log(`Catalog seed verified (${created} subtypes created)`);
    } catch (error) {
      // No tumbar el arranque por el catálogo: se reintentará en el próximo boot
      this.logger.error(`Catalog seed failed: ${error.message}`);
    }
  }
}
