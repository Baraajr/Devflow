import { Client } from 'pg';
import { execSync } from 'child_process';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

export default async (globalConfig: { maxWorkers: number }) => {
  const { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD } = process.env;

  const admin = new Client({
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USERNAME,
    password: DB_PASSWORD,
    database: 'postgres', // connect to the maintenance DB, not devflow_test
  });
  await admin.connect();

  await admin.query('DROP DATABASE IF EXISTS devflow_test_template');
  await admin.query('CREATE DATABASE devflow_test_template');

  // migrate the template once
  execSync('npm run migration:run', {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'test', DB_NAME: 'devflow_test_template' },
  });

  for (let i = 1; i <= globalConfig.maxWorkers; i++) {
    await admin.query(`DROP DATABASE IF EXISTS devflow_test_${i}`);
    await admin.query(
      `CREATE DATABASE devflow_test_${i} TEMPLATE devflow_test_template`,
    );
  }
  await admin.end();
};
