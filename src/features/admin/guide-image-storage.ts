import type { ImageDimensions } from "./guide-image-validation";

const databaseName = "guido-admin-drafts";
// Mantemos a coleção antiga intacta para não apagar rascunhos criados antes da
// separação por guia, aplicativo e sistema operacional.
const storeName = "guide-screenshot-contexts";
const databaseVersion = 2;

export interface GuideImageDraft extends ImageDimensions {
  draftId: string;
  guideSlug: string;
  applicationSlug: string | null;
  operatingSystem: "android" | "ios";
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
        request.result.createObjectStore(storeName, { keyPath: "draftId" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Não foi possível abrir os rascunhos locais."));
  });
}

/** Evita que o print de um aplicativo substitua o mesmo passo de outro. */
export function buildGuideImageDraftId(context: {
  guideSlug: string;
  applicationSlug: string | null;
  operatingSystem: "android" | "ios";
  stepId: string;
}) {
  return [
    context.guideSlug,
    context.applicationSlug ?? "sem-aplicativo",
    context.operatingSystem,
    context.stepId,
  ].join(":");
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

export async function removeGuideImageDraft(draftId: string): Promise<void> {
  const database = await openDraftDatabase();
  const transaction = database.transaction(storeName, "readwrite");
  transaction.objectStore(storeName).delete(draftId);
  await waitForTransaction(transaction);
  database.close();
}
