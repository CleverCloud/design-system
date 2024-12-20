// eslint-disable-next-line import/default
import AWS from '@aws-sdk/client-s3';
import { createReadStream } from 'fs';
import rawGlob from 'glob';
import mime from 'mime-types';
import path from 'path';
import { promisify } from 'util';

const glob = promisify(rawGlob);

const ONE_YEAR = 365 * 24 * 60 * 60;
export const LONG_CACHE = `public, max-age=${ONE_YEAR}, immutable`;
export const NO_CACHE = `no-cache, max-age=0`;
export const CELLAR_HOST = 'cellar-c2.services.clever-cloud.com';

export class CellarClient {
  constructor({ bucket, accessKeyId, secretAccessKey }) {
    if (accessKeyId == null || secretAccessKey == null) {
      throw new Error('Could not read Cellar access/secret keys!');
    }

    this._bucket = bucket;
    this._client = new AWS.S3Client({
      endpoint: `https://${CELLAR_HOST}`,
      credentials: { accessKeyId, secretAccessKey },
      region: 'REGION',
    });
  }

  getObject({ key }) {
    return this._client
      .send(new AWS.GetObjectCommand({ Bucket: this._bucket, Key: key }))
      .then((response) => streamToObject(response.Body));
  }

  getImage({ key }) {
    return this._client.send(new AWS.GetObjectCommand({ Bucket: this._bucket, Key: key }));
  }

  async listKeys({ prefix }) {
    const listObjectsResponse = await this._client.send(
      new AWS.ListObjectsV2Command({
        Bucket: this._bucket,
        Prefix: prefix,
      }),
    );
    const files = listObjectsResponse.Contents ?? [];
    return files.map((file) => file.Key);
  }

  putObject({ key, body, filepath, acl = 'public-read', cacheControl }) {
    const objectBody = body == null && filepath != null ? createReadStream(filepath) : body;

    return this._client
      .send(
        new AWS.PutObjectCommand({
          Bucket: this._bucket,
          Key: key,
          ContentType: mime.lookup(key),
          Body: objectBody,
          ACL: acl,
          CacheControl: cacheControl,
        }),
      )
      .then(() => console.log(`PUT    ${key}`));
  }

  /**
   * @param {string} key
   * @return {Promise<void>}
   */
  deleteObject({ key }) {
    return this._client
      .send(
        new AWS.DeleteObjectCommand({
          Bucket: this._bucket,
          Key: key,
        }),
      )
      .then(() => console.log(`DELETE ${key}`));
  }

  /**
   * @param {Array<{key: string}>} objects
   * @return {Promise<Awaited<void>[]>}
   */
  deleteObjects(objects) {
    return Promise.all(objects.map((o) => this.deleteObject(o)));
  }

  async deleteManyObjects({ prefix }) {
    const remoteKeys = await this.listKeys({ prefix });
    return this.deleteObjects(remoteKeys.map((key) => ({ key })));
  }

  async sync({ localDir, remoteDir = '', deleteRemoved = false, cacheControl }) {
    const localFiles = await glob('**', { nodir: true, cwd: localDir });
    const localFilesWithKeys = localFiles.map((relativePath) => {
      const filepath = path.join(localDir, relativePath);
      const key = path.join(remoteDir, relativePath);
      return { filepath, key };
    });

    await Promise.all(localFilesWithKeys.map((file) => this.putObject({ ...file, cacheControl })));

    if (deleteRemoved) {
      const remoteKeys = await this.listKeys({ prefix: `${remoteDir}/` });
      const removedKeys = remoteKeys.filter(
        (remoteKey) => localFilesWithKeys.find((file) => file.key === remoteKey) == null,
      );
      return this.deleteObjects(removedKeys.map((key) => ({ key })));
    }
  }
}

function streamToString(stream) {
  return new Promise((resolve, reject) => {
    const data = [];
    stream.on('data', (chunk) => data.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(data).toString()));
    stream.on('error', reject);
  });
}

async function streamToObject(stream) {
  const jsonObject = await streamToString(stream);
  return JSON.parse(jsonObject);
}
