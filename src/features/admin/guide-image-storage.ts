import type { ImageDimensions } from "./guide-image-validation";

const databaseName = "guido-admin-drafts";
const storeName = "guide-screenshots";
const databaseVersion = 1;

export interface GuideImageDraft extends ImageDimensions {
  stepId: string;
  file: Blob;
  filename: string;
  mimeType: string;
  byteSize: number;
  updatedAt: string;
}

function openDraftDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, databaseVersion);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(storeName)) {
        request.result.createObjectStore(storeName, { keyPath: "stepId" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Não foi possível abrir os rascunhos locais."));
  });
}

function waitForTransaction(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("Não foi possível salvar o rascunho."));
    transaction.onabort = () => reject(transaction.error ?? new Error("O salvamento foi interrompido."));
  });
}

/** Mantém prints fora do servidor até existir autorização administrativa. */
export async function saveGuideImageDraft(draft: GuideImageDraft): Promise<void> {
  const database = await openDraftDatabase();
  const transaction = database.transaction(storeName, "readwrite");
  transaction.objectStore(storeName).put(draft);
  await waitForTransaction(transaction);
  database.close();
}

export async function listGuideImageDrafts(): Promise<GuideImageDraft[]> {
  const database = await openDraftDatabase();
  const transaction = database.transaction(storeName, "readonly");
  const request = transaction.objectStore(storeName).getAll();
  const drafts = await new Promise<GuideImageDraft[]>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result as GuideImageDraft[]);
    request.onerror = () => reject(request.error ?? new Error("Não foi possível ler os rascunhos."));
  });
  database.close();
  return drafts;
}

export async function removeGuideImageDraft(stepId: string): Promise<void> {
  const database = await openDraftDatabase();
  const transaction = database.transaction(storeName, "readwrite");
  transaction.objectStore(storeName).delete(stepId);
  await waitForTransaction(transaction);
  database.close();
}
