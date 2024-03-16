import crypto from 'crypto';
import { ParsedQs } from 'qs';
import Field from './interfaces/Field';

export const calculateHash = (data: Buffer): string => {
  const hash = crypto.createHash('sha256');
  hash.update(data);
  return hash.digest('hex');
};

export function getDataByPath(data: object | Field, pathToMatch: string | string[] | ParsedQs | ParsedQs[] | undefined) {
  // @ts-ignore
  const matchedData = data.items.find(item => item.fields.path === pathToMatch);
  console.log(matchedData)
  return matchedData ? Object.assign(matchedData.fields, { record_id: matchedData.record_id }) : false;
}
