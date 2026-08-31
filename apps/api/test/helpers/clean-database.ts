import { DataSource } from 'typeorm';
export async function cleanDatabase(dataSource: DataSource): Promise<void> {
  await dataSource.query(`
    TRUNCATE
      users
    RESTART IDENTITY CASCADE
  `);
}
