import { copyFile, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const defaultSourceRoot = path.resolve(projectRoot, "..", "capturas de tela", "fotos arrumadas");
const sourceRoot = path.resolve(process.argv.find((value) => value.startsWith("--source="))?.slice("--source=".length) ?? defaultSourceRoot);
const guideDataPath = path.join(projectRoot, "src", "data", "other-apps-guides.ts");
const whatsappDataPath = path.join(projectRoot, "src", "data", "whatsapp-guides.ts");
const manifestPath = path.join(projectRoot, "src", "data", "local-guide-images.ts");
const acceptedExtensions = new Set([".png", ".jpg", ".jpeg", ".webp"]);
const guideFolderAliases = new Map([
  ["anexar-foto-ou-documento", "anexar-foto-documento-gmail"],
  ["assistir-a-transmissoes-ao-vivo", "assistir-transmissoes-ao-vivo-youtube"],
  ["assistir-aos-stories", "assistir-stories-instagram"],
  ["aumentar-o-tamanho-das-letras", "aumentar-letra-whatsapp"],
  ["ativar-legendas-em-portugues", "ativar-legendas-youtube"],
  ["aumentar-o-volume-e-colocar-a-tela-cheia", "aumentar-volume-youtube"],
  ["bloquear-perfil-desconhecido", "bloquear-perfil-estranho-instagram"],
  ["bloquear-remetente-de-propaganda", "bloquear-remetente-spam-gmail"],
  ["baixar-mapa-para-usar-sem-internet", "baixar-mapa-sem-internet-maps"],
  ["compartilhar-uma-publicacao-pelo-whatsapp", "compartilhar-post-amigos-instagram"],
  ["compartilhar-um-video-com-a-familia", "compartilhar-video-familia-youtube"],
  ["compartilhar-localizacao", "compartilhar-localizacao-whatsapp"],
  ["desativar-notificacoes", "desativar-notificacoes-instagram"],
  ["desativar-a-reproducao-automatica", "desativar-reproducao-automatica-youtube"],
  ["desviar-de-pedagios", "evitar-pedagios-maps"],
  ["deixar-o-perfil-privado", "deixar-perfil-privado-instagram"],
  ["esvaziar-a-lixeira", "esvaziar-lixeira-gmail"],
  ["fazer-chamada-de-video", "fazer-chamada-video-whatsapp"],
  ["gravar-um-story", "gravar-story-camera-instagram"],
  ["inscrever-se-em-um-canal", "inscrever-se-canal-youtube"],
  ["melhorar-a-qualidade-da-imagem", "melhorar-qualidade-imagem-youtube"],
  ["pesquisar-o-perfil-de-alguem", "pesquisar-amigo-perfil-instagram"],
  ["procurar-o-perfil-de-alguem", "pesquisar-amigo-perfil-instagram"],
  ["publicar-uma-foto-no-perfil", "publicar-foto-feed-instagram"],
  ["responder-a-um-e-mail", "responder-email-gmail"],
  ["salvar-onde-estacionou-o-carro", "salvar-onde-estacionou-maps"],
  ["salvar-publicacao-para-ver-depois", "salvar-publicacao-instagram"],
  ["salvar-um-video-para-assistir-depois", "salvar-video-youtube"],
  ["seguir-uma-pessoa", "seguir-perfil-amigo-instagram"],
  ["silenciar-publicacoes-de-alguem", "silenciar-publicacoes-instagram"],
  ["silenciar-um-grupo", "silenciar-grupo-whatsapp"],
  ["tirar-o-som-dos-videos", "tirar-som-videos-instagram"],
  ["trocar-senha-do-gmail", "trocar-senha-gmail"],
  ["adicionar-um-contato", "adicionar-contato-whatsapp"],
  ["apagar-uma-mensagem", "apagar-mensagem-whatsapp"],
  ["bloquear-um-contato", "bloquear-contato-whatsapp"],
  ["enviar-foto-ou-video-da-galeria", "enviar-foto-whatsapp"],
  ["ver-foto-da-frente-do-local-street-view", "ver-foto-da-fachada-streetview-maps"],
  ["ver-horario-de-funcionamento-de-lojas-e-clinicas", "ver-horario-funcionamento-maps"],
  ["ver-linhas-de-onibus-ou-trajeto", "caminho-onibus-maps"],
  ["pesquisar-usando-a-voz", "pesquisar-por-voz-youtube"],
  ["pular-anuncios", "pular-anuncios-youtube"],
  ["ver-o-historico-de-videos-assistidos", "ver-historico-videos-youtube"],
  ["cancelar-envio-de-e-mail", "cancelar-envio-email-gmail"],
]);
const ignoredApplicationFolders = new Set(["gov-br"]);

function normalize(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeGuideFolder(value) {
  return normalize(value).replace(/^\d+-/, "");
}

function readField(block, field) {
  return block.match(new RegExp(`${field}:\\s*"([^"]*)"`))?.[1] ?? null;
}

function readObjectBlocks(section) {
  return [...section.matchAll(/\n  \{([\s\S]*?)\n  \},/g)].map((match) => match[1]);
}

function extractCatalog(content) {
  const applicationsSection = content.match(/export const externalApplications: Application\[\] = \[([\s\S]*?)\n\];/)?.[1];
  const tasksSection = content.match(/export const otherAppsTasks: Task\[\] = \[([\s\S]*?)\n\];/)?.[1];
  if (!applicationsSection || !tasksSection) {
    throw new Error("Não foi possível ler o catálogo de aplicativos e guias.");
  }

  const applications = readObjectBlocks(applicationsSection)
    .map((block) => ({
      id: readField(block, "id"),
      name: readField(block, "name"),
      slug: readField(block, "slug"),
    }))
    .filter((item) => item.id && item.name && item.slug);

  const tasks = readObjectBlocks(tasksSection)
    .map((block) => ({
      applicationId: readField(block, "applicationId"),
      title: readField(block, "title"),
      slug: readField(block, "slug"),
    }))
    .filter((item) => item.applicationId && item.title && item.slug);

  return { applications, tasks };
}

function stepNumberFor(filename, fallback) {
  const match = filename.match(/(?:^|[^0-9])(\d+)(?:[^0-9]|$)/);
  return match ? Number(match[1]) : fallback;
}

function compareImages(first, second) {
  const firstNumber = stepNumberFor(first.name, Number.MAX_SAFE_INTEGER);
  const secondNumber = stepNumberFor(second.name, Number.MAX_SAFE_INTEGER);
  return firstNumber - secondNumber || first.name.localeCompare(second.name, "pt-BR");
}

async function listDirectories(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory()).sort((first, second) => first.name.localeCompare(second.name, "pt-BR"));
}

async function main() {
  const content = await readFile(guideDataPath, "utf8");
  const whatsappContent = await readFile(whatsappDataPath, "utf8");
  const otherAppsCatalog = extractCatalog(content);
  const whatsappTasksSection = whatsappContent.match(/export const whatsappTasks: Task\[\] = \[([\s\S]*?)\n\];/)?.[1];
  if (!whatsappTasksSection) throw new Error("Não foi possível ler os guias do WhatsApp.");
  const whatsappTasks = readObjectBlocks(whatsappTasksSection)
    .map((block) => ({
      applicationId: readField(block, "applicationId"),
      title: readField(block, "title"),
      slug: readField(block, "slug"),
    }))
    .filter((item) => item.applicationId && item.title && item.slug);
  const applications = [
    ...otherAppsCatalog.applications,
    { id: "app-whatsapp", name: "WhatsApp", slug: "whatsapp" },
  ];
  const tasks = [...otherAppsCatalog.tasks, ...whatsappTasks];
  const applicationByName = new Map(applications.flatMap((application) => [
    [normalize(application.name), application],
    [normalize(application.slug), application],
  ]));
  const manifest = {};
  const warnings = [];
  let importedFiles = 0;

  let applicationDirectories;
  try {
    applicationDirectories = await listDirectories(sourceRoot);
  } catch (error) {
    throw new Error(`Pasta de imagens não encontrada: ${sourceRoot}`);
  }

  for (const applicationDirectory of applicationDirectories) {
    if (ignoredApplicationFolders.has(normalize(applicationDirectory.name))) continue;
    const application = applicationByName.get(normalize(applicationDirectory.name));
    if (!application) {
      warnings.push(`Aplicativo sem correspondência no catálogo: ${applicationDirectory.name}`);
      continue;
    }

    const taskByTitle = new Map(
      tasks
        .filter((task) => task.applicationId === application.id)
        .flatMap((task) => [[normalize(task.title), task], [normalize(task.slug), task]]),
    );
    const taskDirectories = await listDirectories(path.join(sourceRoot, applicationDirectory.name));

    for (const taskDirectory of taskDirectories) {
      const folderSlug = normalizeGuideFolder(taskDirectory.name);
      const task = taskByTitle.get(folderSlug) ?? taskByTitle.get(guideFolderAliases.get(folderSlug) ?? "");
      if (!task) {
        warnings.push(`Guia sem correspondência no catálogo: ${applicationDirectory.name} / ${taskDirectory.name}`);
        continue;
      }

      const entries = await readdir(path.join(sourceRoot, applicationDirectory.name, taskDirectory.name), { withFileTypes: true });
      const images = entries
        .filter((entry) => entry.isFile() && acceptedExtensions.has(path.extname(entry.name).toLowerCase()))
        .sort(compareImages);
      if (images.length === 0) continue;

      const guideManifest = {};
      const usedSteps = new Set();
      for (let index = 0; index < images.length; index += 1) {
        const image = images[index];
        const step = stepNumberFor(image.name, index + 1);
        if (usedSteps.has(step)) {
          warnings.push(`Etapa duplicada ignorada: ${applicationDirectory.name} / ${taskDirectory.name} / ${image.name}`);
          continue;
        }
        usedSteps.add(step);

        const extension = path.extname(image.name).toLowerCase();
        const relativeTarget = path.join("images", "guide-screens", application.slug, task.slug, `step-${step}${extension}`);
        const absoluteTarget = path.join(projectRoot, "public", relativeTarget);
        await mkdir(path.dirname(absoluteTarget), { recursive: true });
        await copyFile(path.join(sourceRoot, applicationDirectory.name, taskDirectory.name, image.name), absoluteTarget);
        guideManifest[step] = `/${relativeTarget.replaceAll(path.sep, "/")}`;
        importedFiles += 1;
      }

      if (Object.keys(guideManifest).length > 0) manifest[task.slug] = guideManifest;
    }
  }

  if (Object.keys(manifest).length === 0) {
    throw new Error("Nenhuma imagem de guia foi importada; o mapa existente não foi alterado.");
  }

  const manifestSource = `// Arquivo gerado por scripts/import-guide-images.mjs. Não edite manualmente.\n\nexport const localGuideImages: Readonly<Record<string, Readonly<Record<number, string>>>> = ${JSON.stringify(manifest, null, 2)} as const;\n\nexport function getLocalGuideImages(guideSlug: string) {\n  return localGuideImages[guideSlug] ?? {};\n}\n`;
  await writeFile(manifestPath, manifestSource, "utf8");

  console.log(`Imagens importadas: ${importedFiles}`);
  console.log(`Guias atualizados: ${Object.keys(manifest).join(", ")}`);
  warnings.forEach((warning) => console.warn(`Aviso: ${warning}`));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
