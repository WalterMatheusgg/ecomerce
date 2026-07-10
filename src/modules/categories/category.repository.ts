import { Prisma, PrismaClient } from '@prisma/client';

export class CategoryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: { name: string }) {
    return this.prisma.category.create({ data });
  }

  async findById(id: string) {
    return this.prisma.category.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findByName(name: string) {
    return this.prisma.category.findFirst({
      where: { name, deletedAt: null },
    });
  }

  async findMany(page: number, limit: number) {
    const [items, total] = await Promise.all([
      this.prisma.category.findMany({
        where: { deletedAt: null },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.category.count({ where: { deletedAt: null } }),
    ]);

    return { items, total };
  }

  async update(id: string, data: { name?: string }) {
    return this.prisma.category.update({ where: { id }, data });
  }

  async deleteWithProductCheck(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const count = await tx.product.count({ where: { categoryId: id, deletedAt: null } });

      if (count > 0) {
        return { deleted: false };
      }

      await tx.category.update({ where: { id }, data: { deletedAt: new Date() } });
      return { deleted: true };
    });
  }
}
