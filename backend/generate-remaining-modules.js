const fs = require('fs');
const path = require('path');

const entities = [
  'tertiary-specializations',
  'promo-codes',
  'courses',
  'tutor-sessions-orders',
  'tutor-job-notifications',
  'tutor-student-hours',
  'student-lessons'
];

const generateModule = (entityName) => {
  const className = entityName.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join('');
  
  const serviceName = `${className}Service`;
  const controllerName = `${className}Controller`;
  const entityNameCamel = entityName.split('-').map((word, index) => 
    index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
  ).join('');

  // Generate service
  const serviceContent = `import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ${className} } from './${entityName}.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { SearchDto } from '../common/dto/search.dto';

@Injectable()
export class ${serviceName} {
  constructor(
    @InjectRepository(${className})
    private readonly ${entityNameCamel}Repository: Repository<${className}>,
  ) {}

  async findAll(paginationDto: PaginationDto, searchDto: SearchDto): Promise<{ data: ${className}[]; total: number }> {
    const { page, limit } = paginationDto;
    const { search, sortBy, sortOrder } = searchDto;

    const queryBuilder = this.${entityNameCamel}Repository.createQueryBuilder('${entityNameCamel}');

    if (search) {
      queryBuilder.where(
        '${entityNameCamel}.uniqueId ILIKE :search',
        { search: \`%\${search}%\` },
      );
    }

    if (sortBy) {
      queryBuilder.orderBy(\`${entityNameCamel}.\${sortBy}\`, sortOrder);
    } else {
      queryBuilder.orderBy('${entityNameCamel}.creationDate', 'DESC');
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findOne(uniqueId: string): Promise<${className}> {
    const ${entityNameCamel} = await this.${entityNameCamel}Repository.findOne({
      where: { uniqueId },
    });

    if (!${entityNameCamel}) {
      throw new NotFoundException(\`${className} with unique ID \${uniqueId} not found\`);
    }

    return ${entityNameCamel};
  }
}`;

  // Generate controller
  const controllerContent = `import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ${serviceName} } from './${entityName}.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { SearchDto } from '../common/dto/search.dto';
import { ${className} } from './${entityName}.entity';

@ApiTags('${className}')
@Controller('${entityName}')
export class ${controllerName} {
  constructor(private readonly ${entityNameCamel}Service: ${serviceName}) {}

  @Get()
  @ApiOperation({ summary: 'Get all ${entityName} with pagination and search' })
  @ApiResponse({ status: 200, description: '${entityName} retrieved successfully' })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query() searchDto: SearchDto,
  ): Promise<{ data: ${className}[]; total: number }> {
    return await this.${entityNameCamel}Service.findAll(paginationDto, searchDto);
  }

  @Get(':uniqueId')
  @ApiOperation({ summary: 'Get ${entityName} by unique ID' })
  @ApiResponse({ status: 200, description: '${entityName} retrieved successfully', type: ${className} })
  @ApiResponse({ status: 404, description: '${entityName} not found' })
  async findOne(@Param('uniqueId') uniqueId: string): Promise<${className}> {
    return await this.${entityNameCamel}Service.findOne(uniqueId);
  }
}`;

  // Generate module
  const moduleContent = `import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ${serviceName} } from './${entityName}.service';
import { ${controllerName} } from './${entityName}.controller';
import { ${className} } from './${entityName}.entity';

@Module({
  imports: [TypeOrmModule.forFeature([${className}])],
  controllers: [${controllerName}],
  providers: [${serviceName}],
  exports: [${serviceName}],
})
export class ${className}Module {}`;

  // Create directory if it doesn't exist
  const dir = path.join(__dirname, 'src', entityName);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Write files
  fs.writeFileSync(path.join(dir, `${entityName}.service.ts`), serviceContent);
  fs.writeFileSync(path.join(dir, `${entityName}.controller.ts`), controllerContent);
  fs.writeFileSync(path.join(dir, `${entityName}.module.ts`), moduleContent);

  console.log(`Generated module for ${entityName}`);
};

// Generate all modules
entities.forEach(generateModule);

console.log('All modules generated successfully!');
