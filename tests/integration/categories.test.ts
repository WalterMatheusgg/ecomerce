import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import app from '../../src/app.js';
import { prisma } from '../../src/database/prisma.js';
import { cleanDatabase } from '../helpers/cleanDatabase.js';

beforeEach(async () => {
  await cleanDatabase();
});

describe('Categories integration', () => {
  it('creates a category', async () => {
    const response = await request(app).post('/categories').send({ name: 'Electronics' });
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe('Electronics');
  });

  it('does not create a category with empty name', async () => {
    const response = await request(app).post('/categories').send({ name: '   ' });
    expect(response.status).toBe(400);
  });

  it('does not create a duplicate category', async () => {
    await prisma.category.create({ data: { name: 'Books' } });
    const response = await request(app).post('/categories').send({ name: 'Books' });
    expect(response.status).toBe(409);
  });

  it('returns 409 when creating a category with name of a soft-deleted category', async () => {
    const res1 = await request(app).post('/categories').send({ name: 'Duplicada' });
    expect(res1.status).toBe(201);

    const id = res1.body.data.id;
    const del = await request(app).delete(`/categories/${id}`);
    expect(del.status).toBe(204);

    const res2 = await request(app).post('/categories').send({ name: 'Duplicada' });
    expect(res2.status).toBe(201);
    expect(res2.body.data.name).toBe('Duplicada');
  });

  it('lists categories with pagination', async () => {
    await prisma.category.createMany({ data: [{ name: 'A' }, { name: 'B' }] });
    const response = await request(app).get('/categories?page=1&limit=1');
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.meta.total).toBe(2);
  });

  it('gets category by id', async () => {
    const category = await prisma.category.create({ data: { name: 'Shoes' } });
    const response = await request(app).get(`/categories/${category.id}`);
    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(category.id);
  });

  it('returns 404 for nonexistent category', async () => {
    const response = await request(app).get('/categories/00000000-0000-0000-0000-000000000000');
    expect(response.status).toBe(404);
  });

  it('updates a category', async () => {
    const category = await prisma.category.create({ data: { name: 'Toys' } });
    const response = await request(app).put(`/categories/${category.id}`).send({ name: 'Games' });
    expect(response.status).toBe(200);
    expect(response.body.data.name).toBe('Games');
  });

  it('does not delete category with active products', async () => {
    const category = await prisma.category.create({ data: { name: 'Home' } });
    await prisma.product.create({ data: { name: 'Lamp', price: 10, stock: 2, categoryId: category.id } });
    const response = await request(app).delete(`/categories/${category.id}`);
    expect(response.status).toBe(409);
  });

  it('soft deletes category without active products', async () => {
    const category = await prisma.category.create({ data: { name: 'Office' } });
    const response = await request(app).delete(`/categories/${category.id}`);
    expect(response.status).toBe(204);
    const updated = await prisma.category.findUnique({ where: { id: category.id } });
    expect(updated?.deletedAt).not.toBeNull();
  });
});
