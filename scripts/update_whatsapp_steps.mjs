import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Carrega .env.local se as variáveis não estiverem no ambiente
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const idx = trimmed.indexOf("=");
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://sdkarkppfcbyylbnlind.supabase.co";
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error("ERRO: SUPABASE_SECRET_KEY não encontrada no .env.local!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const updates = [
  // 1. ENVIAR ÁUDIO NO WHATSAPP
  // Android
  {
    id: "80de37e1-6744-4140-93e6-7b10883ab746",
    title: "Abra o WhatsApp",
    instruction: "Toque no ícone verde do WhatsApp na tela do seu celular para abrir o aplicativo.",
    image_alt: "Tela inicial do celular com o ícone do WhatsApp destacado."
  },
  {
    id: "20a01f58-7138-4486-b7b7-2e78601d9f55",
    title: "Escolha a conversa",
    instruction: "Toque no nome da pessoa para quem você deseja enviar o áudio.",
    image_alt: "Lista de conversas do WhatsApp com o contato selecionado."
  },
  {
    id: "51e4dba6-c9fb-4453-bf09-eef9b08e397c",
    title: "Localize o microfone",
    instruction: "Encontre o botão verde com o símbolo de microfone no canto inferior direito.",
    image_alt: "Conversa do WhatsApp com o botão de microfone destacado."
  },
  {
    id: "01f996a0-b4bf-4d18-9237-3c3756d4ad76",
    title: "Segure para gravar",
    instruction: "Mantenha o dedo pressionado no microfone e fale a sua mensagem com clareza.",
    image_alt: "Barra de gravação de áudio em andamento com contador de tempo."
  },
  {
    id: "28bb78f2-8534-483b-87ac-5ba55fa6cf0a",
    title: "Solte para enviar",
    instruction: "Quando terminar de falar, solte o botão do microfone. O áudio será enviado na conversa.",
    image_alt: "Conversa com a mensagem de áudio enviada com sucesso."
  },
  // iOS
  {
    id: "fd761fc4-6ec6-4ed6-b20f-9da0f4c8cd90",
    title: "Abra o WhatsApp",
    instruction: "Toque no ícone verde do WhatsApp na tela do seu celular para abrir o aplicativo.",
    image_alt: "Tela inicial do celular com o ícone do WhatsApp destacado."
  },
  {
    id: "93bd7f45-dc66-42f8-9a31-04441abe831f",
    title: "Escolha a conversa",
    instruction: "Toque no nome da pessoa para quem você deseja enviar o áudio.",
    image_alt: "Lista de conversas do WhatsApp com o contato selecionado."
  },
  {
    id: "b7f8150c-ba4e-4315-a23c-2c44acad7650",
    title: "Localize o microfone",
    instruction: "Encontre o botão verde com o símbolo de microfone no canto inferior direito.",
    image_alt: "Conversa do WhatsApp com o botão de microfone destacado."
  },
  {
    id: "8f2445cc-dc45-4c0d-a445-c8809e8dcd53",
    title: "Segure para gravar",
    instruction: "Mantenha o dedo pressionado no microfone e fale a sua mensagem com clareza.",
    image_alt: "Barra de gravação de áudio em andamento com contador de tempo."
  },
  {
    id: "bd042a4a-8322-4a42-a549-cf93752dd712",
    title: "Solte para enviar",
    instruction: "Quando terminar de falar, solte o botão do microfone. O áudio será enviado na conversa.",
    image_alt: "Conversa com a mensagem de áudio enviada com sucesso."
  },

  // 2. FAZER UMA CHAMADA NO WHATSAPP
  // Android
  {
    id: "11f0819d-eac2-4b97-ab23-3744d126bbe9",
    title: "Abra o WhatsApp",
    instruction: "Toque no ícone do WhatsApp na tela inicial do celular para abrir o aplicativo.",
    image_alt: "Tela inicial do celular com o WhatsApp destacado."
  },
  {
    id: "ce300b2f-e722-4bbc-82e7-3e16270a4845",
    title: "Escolha o contato",
    instruction: "Toque no nome da pessoa para quem você deseja ligar.",
    image_alt: "Lista de conversas com o contato desejado selecionado."
  },
  {
    id: "02448e7a-c488-4b45-8bff-402a4f07df9d",
    title: "Toque no telefone",
    instruction: "Toque no símbolo de telefone no canto superior direito para fazer a chamada.",
    image_alt: "Conversa aberta com o ícone de chamada destacado no topo direito."
  },
  {
    id: "c83266ea-4900-43fa-b98f-080f2d5f05ad",
    title: "Permita o microfone",
    instruction: "Se o celular perguntar, toque em 'Durante o uso do app' para liberar a sua voz.",
    image_alt: "Aviso de permissão solicitando acesso ao microfone do celular."
  },
  {
    id: "7ea04d62-f4dc-46e9-be42-13b1afb2e4d9",
    title: "Encerre a chamada",
    instruction: "Quando terminar de conversar, toque no botão vermelho redondo para desligar.",
    image_alt: "Tela de chamada em andamento com o botão vermelho de desligar."
  },
  // iOS
  {
    id: "3a3587ee-f8bc-4ac8-b970-f55b0e2030a7",
    title: "Abra o WhatsApp",
    instruction: "Toque no ícone do WhatsApp na tela inicial do celular para abrir o aplicativo.",
    image_alt: "Tela inicial do celular com o WhatsApp destacado."
  },
  {
    id: "09ff840f-92a0-42f7-ac65-61607986ec2d",
    title: "Escolha o contato",
    instruction: "Toque no nome da pessoa para quem você deseja ligar.",
    image_alt: "Lista de conversas com o contato desejado selecionado."
  },
  {
    id: "1eb11c0c-eef4-4414-90e4-4b95b669dd6d",
    title: "Toque no telefone",
    instruction: "Toque no símbolo de telefone no canto superior direito para fazer a chamada.",
    image_alt: "Conversa aberta com o ícone de chamada destacado no topo direito."
  },
  {
    id: "832e98ac-7643-47e1-95b8-5c5369bc66c1",
    title: "Permita o microfone",
    instruction: "Se o celular perguntar, toque em 'Durante o uso do app' para liberar a sua voz.",
    image_alt: "Aviso de permissão solicitando acesso ao microfone do celular."
  },
  {
    id: "ad1f6aa9-2607-4d02-b1dd-a75e04fdc08f",
    title: "Encerre a chamada",
    instruction: "Quando terminar de conversar, toque no botão vermelho redondo para desligar.",
    image_alt: "Tela de chamada em andamento com o botão vermelho de desligar."
  },

  // 3. BLOQUEAR UM CONTATO NO WHATSAPP
  // Android
  {
    id: "c2205940-48be-46db-b2b5-f4b11975924b",
    title: "Abra a conversa",
    instruction: "Toque na conversa da pessoa ou número que você deseja bloquear.",
    image_alt: "Lista de conversas com o contato que será bloqueado."
  },
  {
    id: "858e4cb2-72f1-4180-ae79-c293c72ead57",
    title: "Abra os dados do contato",
    instruction: "Toque no nome ou na foto da pessoa no topo da tela para abrir os detalhes.",
    image_alt: "Topo da conversa com o nome do contato em destaque."
  },
  {
    id: "59d19cbc-21b5-4c60-b0f2-f9c5113b4dfd",
    title: "Role até o final",
    instruction: "Desça a página de dados do contato até encontrar a opção 'Bloquear contato'.",
    image_alt: "Fim da página de detalhes do contato com a opção de bloqueio visível."
  },
  {
    id: "445284fa-8e45-4c6f-8b5a-c8de990f3dfc",
    title: "Selecione Bloquear",
    instruction: "Toque em 'Bloquear contato' na lista de opções em vermelho.",
    image_alt: "Opções de bloqueio destacando o botão Bloquear."
  },
  {
    id: "3673f0cd-9038-45ba-bd1c-69a84e2f4ffe",
    title: "Confirme o bloqueio",
    instruction: "Toque em Bloquear para confirmar. A pessoa não poderá mais te ligar ou mandar mensagens.",
    image_alt: "Confirmação de bloqueio do contato."
  },
  // iOS
  {
    id: "2fdc4a5d-2823-4f53-9c1b-f72a7071b9ae",
    title: "Abra a conversa",
    instruction: "Toque na conversa da pessoa ou número que você deseja bloquear.",
    image_alt: "Lista de conversas com o contato que será bloqueado."
  },
  {
    id: "740fe9e1-2e8c-4585-a27f-188cb735a5a3",
    title: "Abra os dados do contato",
    instruction: "Toque no nome ou na foto da pessoa no topo da tela para abrir os detalhes.",
    image_alt: "Topo da conversa com o nome do contato em destaque."
  },
  {
    id: "36453c62-3a8e-4ced-bcd4-1f342bd5a517",
    title: "Role até o final",
    instruction: "Desça a página de dados do contato até encontrar a opção 'Bloquear contato'.",
    image_alt: "Fim da página de detalhes do contato com a opção de bloqueio visível."
  },
  {
    id: "eb491ef9-8894-48ec-83dc-8fa4b7a9dbc7",
    title: "Selecione Bloquear",
    instruction: "Toque em 'Bloquear contato' na lista de opções em vermelho.",
    image_alt: "Opções de bloqueio destacando o botão Bloquear."
  },
  {
    id: "6bd8b6ba-5847-4866-85e9-2637c22c5993",
    title: "Confirme o bloqueio",
    instruction: "Toque em Bloquear para confirmar. A pessoa não poderá mais te ligar ou mandar mensagens.",
    image_alt: "Confirmação de bloqueio do contato."
  }
];

async function run() {
  console.log("Atualizando passos no Supabase...");
  for (const step of updates) {
    const { error } = await supabase
      .from("steps")
      .update({
        title: step.title,
        instruction: step.instruction,
        image_alt: step.image_alt,
        updated_at: new Date().toISOString()
      })
      .eq("id", step.id);

    if (error) {
      console.error(`Erro ao atualizar passo ${step.id}:`, error.message);
    } else {
      console.log(`✓ Passo atualizado: [${step.title}]`);
    }
  }

  // Corrigir a imagem do passo 5 de bloquear-contato-whatsapp para usar a imagem limpa do passo 4
  console.log("\nAtualizando imagens do passo 5 de bloquear-contato-whatsapp...");
  const { error: errAndroidImg } = await supabase
    .from("guide_public_images")
    .update({
      storage_key: "public/bloquear-contato-whatsapp/sem-aplicativo/android/editorial-bloquear-contato-whatsapp-android-4/9c8565d9-7ada-4a33-aff6-6be4a5377836.png"
    })
    .eq("id", "41a05926-d393-4922-b9f7-7aa04e1f60c8");

  if (errAndroidImg) {
    console.error("Erro ao atualizar imagem Android:", errAndroidImg.message);
  } else {
    console.log("✓ Imagem do passo 5 (Android) corrigida para imagem limpa sem caixa errada de denunciar.");
  }

  const { error: errIosImg } = await supabase
    .from("guide_public_images")
    .update({
      storage_key: "public/bloquear-contato-whatsapp/sem-aplicativo/ios/editorial-bloquear-contato-whatsapp-ios-4/e606822d-1fb9-4efd-96a0-1bbbf3abd6ba.jpg"
    })
    .eq("id", "86f69257-7e77-40d8-a950-311284cd086f");

  if (errIosImg) {
    console.error("Erro ao atualizar imagem iOS:", errIosImg.message);
  } else {
    console.log("✓ Imagem do passo 5 (iOS) corrigida para imagem limpa sem caixa errada de denunciar.");
  }

  console.log("\nAtualização concluída com sucesso!");
}

run();
