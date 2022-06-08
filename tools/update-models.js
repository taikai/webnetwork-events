import 'dotenv/config';
import {execSync} from 'child_process';
import {readdirSync, renameSync} from 'fs';
import {resolve} from 'path';

const {
  DB_DATABASE: d,
  DB_HOST: h,
  DB_PASSWORD: x,
  DB_PORT: p,
  DB_USERNAME: u,
} = process.env;

if ([d, h, x, p, u].some(v => !v))
  throw new Error(`Missing database variables`);

const command = `-h ${h} -d ${d} -u ${u} -x ${x} -p ${p} --dialect postgres -c ./db/config.json`;
const commandPaths = `-o ./db/`;

execSync(`npx sequelize-auto ${command} ${commandPaths}`);

readdirSync('./db/')
  .forEach(file => {
    if (/.js$/gi.test(file))
      renameSync(
        resolve('./db/', file),
        resolve('./db',file.replace(`.js`, '.cjs'))
      )
  })

