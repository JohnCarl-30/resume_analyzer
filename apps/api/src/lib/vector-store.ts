export type VectorStoreProvider = "qdrant" | "pinecone";

export interface VectorStoreClient {
  provider: VectorStoreProvider;
}

export const vectorStoreClient: VectorStoreClient = {
  provider: "qdrant",
};
