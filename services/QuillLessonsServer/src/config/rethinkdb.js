import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

dotenv.config()

const rethinkdbConfig = (() => {
  const keyFileName = `/rethink-public-key-${process.env.NODE_ENV}.crt`;
  const pathToCert  = path.resolve(__dirname + '/../..') + keyFileName;

  let config = {
    host: process.env.RETHINKDB_HOST,
    port: process.env.RETHINKDB_PORT,
    db:   'quill_lessons'
  }

  if (process.env.RETHINKDB_AUTH_KEY) {
    config['authKey'] = process.env.RETHINKDB_AUTH_KEY
  }

  if (process.env.RETHINKDB_USE_SSL === 'true') {
    const caCert  = fs.readFileSync(pathToCert)
    config['ssl'] = { ca: caCert }
  }

  return config
})()

export default rethinkdbConfig
