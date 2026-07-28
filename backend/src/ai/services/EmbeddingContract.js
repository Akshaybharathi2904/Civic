export class EmbeddingContract {
  async embedText(text) {
    throw new Error('EmbeddingContract.embedText must be implemented by concrete embedding engines.');
  }

  async embedImage(imageUrl) {
    throw new Error('EmbeddingContract.embedImage must be implemented by concrete embedding engines.');
  }
}

export default EmbeddingContract;
