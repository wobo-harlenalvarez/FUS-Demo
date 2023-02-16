import express from 'express';
import { createClient } from 'redis';
import { BlobServiceClient, ContainerSASPermissions } from '@azure/storage-blob';
import cors from 'cors';
import { AttachmentDto, AttachmentStatusEnum } from '@workboard/wobo-fus';
import { v4 as uuidv4 } from 'uuid';

const perm = new ContainerSASPermissions();
perm.read = true;
perm.create = true;
perm.delete = true;
perm.add = true;

const blob = BlobServiceClient.fromConnectionString('DefaultEndpointsProtocol=https;AccountName=wobohateststorage;AccountKey=JUrN4v2jNIq2JoekeAl5WLpAWuffl4gybYvyp3gggCHjisXZ+vWt3d+tK0pU9P0DfHNsmC7Ppp84sul+aM4wGw==;EndpointSuffix=core.windows.net');

const redisClient = createClient();
redisClient.on('error', (err) => console.log('Redis Client Error', err));

const app = express();
app.use(cors());
app.use(express.json());

const genKey = (type: string, name: string) => `${type}:${name}`

app.get('/gettoken', async (req, res) => {
    const expiration = new Date();
    expiration.setMinutes(expiration.getMinutes() + 5);
    const container = await blob.getContainerClient('upload');
    const token = await container.generateSasUrl({
      expiresOn: expiration,
      permissions: perm
    })
    res.send(token)

})

app.post('/', async (req, res) => {
  const file = { ...req.body } as AttachmentDto
  file.id = uuidv4();
  file.status = 3;
  const storedFiles = await redisClient.get('files');
  const savedFiles = JSON.parse(storedFiles|| '[]') as string[];
  const fileKey = genKey(file.referenceType || '', file.name);
  await redisClient.set(fileKey, JSON.stringify(file))
  savedFiles.push(fileKey)
  await redisClient.set('files', JSON.stringify(savedFiles))
  res.send(file)
})

app.get('/clear', async (req, res) => {
  const flushRes = await redisClient.flushAll()
  const result = await redisClient.flushDb()

  console.log('++++++++++++++++++++++++++', flushRes, result)
  res.send(`${flushRes}${result}`)
})

app.get('/:refType', async (req, res) => {
  const files = JSON.parse(await redisClient.get('files') || '[]') as string[]
  const fileAtts: AttachmentDto[] = [];
  for(let filename of files) {
    if(!filename.startsWith(req.params.refType)) continue
    const storedFile = await redisClient.get(filename)
    const savedFile = JSON.parse(storedFile || '{}') as AttachmentDto;
    fileAtts.push(savedFile)
  }
  res.send(fileAtts)
})


app.get('/setdone/:refType/:name', async(req, res) => {
  const name = req.params.name;
  const refType = req.params.refType;
  const fileKey = genKey(refType, name);
  const file = await redisClient.get(fileKey);
  if(!file) return res.status(404).send('File not found');
  const fileObj = JSON.parse(file) as AttachmentDto;
  fileObj.status = 4;
  await redisClient.set(fileKey, JSON.stringify(fileObj))
  res.status(201).send('done')
})

app.get('/setfail/:reqType/:name', async(req, res) => {
  const name = req.params.name;
  const fileKey = genKey(req.params.reqType, name)
  const file = await redisClient.get(fileKey);
  if(!file) return res.status(404).send('File not found');
  const fileObj = JSON.parse(file) as AttachmentDto;
  fileObj.status = 5;
  await redisClient.set(fileKey, JSON.stringify(fileObj))
  res.status(201).send('done')
})

app.get('/download/:name', async (req, res) => {
  const container = await blob.getContainerClient('upload');
  const block = await container.getBlobClient(req.params.name)
  const downloadRes = await block.download()
  downloadRes.readableStreamBody?.pipe(res)
})

const startServer = async() => {
  await redisClient.connect();
  app.listen(3000, () => { console.log('running on port')});
}

startServer();