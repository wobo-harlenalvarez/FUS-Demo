import { AttachmentDto, AttachmentStatusEnum, FusConfig } from "@workboard/wobo-fus";

export const woboConfig: FusConfig['config'] = {
  fetchUploadToken: async () => {
    const tokenReponse = await fetch('http://localhost:3000/gettoken');
    const result = await tokenReponse.text()
    return result
  },
  startProcess: async (file: AttachmentDto) => {
    //TODO: in the api if status remains not started and not error we set this to uploaded
    // else if status remains not started and error set this to uploadFailed
    file.status = AttachmentStatusEnum.uploaded;
    const saveResponse = await fetch('http://localhost:3000/', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(file)
    });
    const savedFile = await saveResponse.json();
    return savedFile;
  },
  fetchProcessingFiles: async (_, referenceType) => {
    const savedFilesResponse = await fetch(`http://localhost:3000/${referenceType}`);
    return savedFilesResponse.json() as Promise<AttachmentDto[]>
  },
  downloadFile: async (file: AttachmentDto) => {
    const fileBlobResponse = await fetch(`http://localhost:3000/download/${file.name}`);
    return fileBlobResponse.blob()
  },
  removeAttachment: async (file: AttachmentDto) => {
    await fetch('http://localhost:3000/', {
      method: 'DELETE',
      body: JSON.stringify(file)
    })
  }
}