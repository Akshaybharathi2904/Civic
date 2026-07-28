export class VectorStoreContract {
  async upsertVectors(vectors = []) {
    throw new Error('VectorStoreContract.upsertVectors must be implemented by concrete vector stores.');
  }

  async similaritySearch(queryVector, topK = 5) {
    throw new Error('VectorStoreContract.similaritySearch must be implemented by concrete vector stores.');
  }
}

export default VectorStoreContract;
