// DigitalOcean Spaces (S3-compatible) for clip videos and thumbnails.
// The bucket stays private; the dashboard hands out short-lived signed URLs.
import { DeleteObjectsCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

let _client: S3Client | null = null

export function storageConfigured(): boolean {
  return Boolean(process.env.SPACES_KEY && process.env.SPACES_SECRET && process.env.SPACES_BUCKET)
}

function bucket(): string {
  const b = process.env.SPACES_BUCKET
  if (!b) throw new Error('SPACES_BUCKET is not set')
  return b
}

function client(): S3Client {
  if (!_client) {
    const region = process.env.SPACES_REGION || 'nyc3'
    _client = new S3Client({
      region: 'us-east-1', // Spaces ignores this; the endpoint picks the region
      endpoint: process.env.SPACES_ENDPOINT || `https://${region}.digitaloceanspaces.com`,
      forcePathStyle: process.env.SPACES_PATH_STYLE === '1', // only for local S3 stand-ins
      // Spaces doesn't accept the newer default checksum headers from AWS SDK v3.
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
      credentials: {
        accessKeyId: process.env.SPACES_KEY || '',
        secretAccessKey: process.env.SPACES_SECRET || '',
      },
    })
  }
  return _client
}

export async function putObject(key: string, body: Buffer | Uint8Array, contentType: string): Promise<void> {
  await client().send(
    new PutObjectCommand({ Bucket: bucket(), Key: key, Body: body, ContentType: contentType, ACL: 'private' }),
  )
}

export async function signedUrl(key: string, seconds = 3600, downloadName?: string): Promise<string> {
  return getSignedUrl(
    client(),
    new GetObjectCommand({
      Bucket: bucket(),
      Key: key,
      ResponseContentDisposition: downloadName ? `attachment; filename="${downloadName}"` : undefined,
    }),
    { expiresIn: seconds },
  )
}

export async function deleteObjects(keys: string[]): Promise<void> {
  const list = keys.filter(Boolean)
  for (let i = 0; i < list.length; i += 1000) {
    await client().send(
      new DeleteObjectsCommand({
        Bucket: bucket(),
        Delete: { Objects: list.slice(i, i + 1000).map((Key) => ({ Key })), Quiet: true },
      }),
    )
  }
}
