export class FileStorageContract {
  async uploadFile(fileName, buffer, mimeType) { throw new Error('FileStorageContract.uploadFile must be implemented.'); }
  async deleteFile(fileUrl) { throw new Error('FileStorageContract.deleteFile must be implemented.'); }
}

export class MockFileStorage extends FileStorageContract {
  async uploadFile(fileName = 'evidence_file.jpg', buffer = null, mimeType = 'image/jpeg') {
    const fileId = `file_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const mockUrl = `https://gov-storage.local/evidence/${fileId}_${fileName}`;
    return {
      fileId,
      fileUrl: mockUrl,
      fileName,
      fileSize: buffer ? buffer.length : 1245000,
      mimeType,
      uploadedAt: new Date().toISOString(),
    };
  }

  async deleteFile(fileUrl) {
    return { success: true, deletedUrl: fileUrl };
  }
}

export default { FileStorageContract, MockFileStorage };
