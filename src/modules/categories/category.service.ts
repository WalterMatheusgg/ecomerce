import { AppError } from '../../errors/AppError.js';
import { Prisma } from '@prisma/client';
import { CategoryRepository } from './category.repository.js';

export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async createCategory(name: string) {
    const existing = await this.categoryRepository.findByName(name);
    if (existing) {
      throw new AppError('Category already exists', 409);
    }

    try {
      return await this.categoryRepository.create({ name });
    } catch (err: unknown) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new AppError('Category already exists', 409);
      }

      throw err;
    }
  }

  async listCategories(page: number, limit: number) {
    const { items, total } = await this.categoryRepository.findMany(page, limit);
    return { items, total, page, limit };
  }

  async getCategory(id: string) {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new AppError('Category not found', 404);
    }
    return category;
  }

  async updateCategory(id: string, data: { name?: string }) {
    const existing = await this.categoryRepository.findById(id);
    if (!existing) {
      throw new AppError('Category not found', 404);
    }

    if (data.name && data.name !== existing.name) {
      const duplicate = await this.categoryRepository.findByName(data.name);
      if (duplicate && duplicate.id !== id) {
        throw new AppError('Category already exists', 409);
      }
    }

    try {
      return await this.categoryRepository.update(id, data);
    } catch (err: unknown) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new AppError('Category already exists', 409);
      }

      throw err;
    }
  }

  async deleteCategory(id: string) {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    const result = await this.categoryRepository.deleteWithProductCheck(id);
    if (!result || result.deleted === false) {
      throw new AppError('Cannot delete category with active products', 409);
    }

    return null;
  }
}
