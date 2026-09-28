import type { OperatingSystem, TouchTarget } from "@/types/content";

/**
 * Mapeamento de alvos de toque destacados em amarelo ("Toque aqui 👉")
 * para orientar visualmente o usuário sobre o botão exato da captura de tela.
 */
export const guideTouchTargets: Record<string, Record<number, TouchTarget>> = {
  "fazer-chamada-whatsapp": {
    // Passo 1: Ícone WhatsApp na tela inicial
    1: {
      left: 27,
      top: 36,
      width: 21,
      height: 11,
      label: "Toque no WhatsApp",
      labelPosition: "bottom",
    },
    // Passo 2: Conversa na lista
    2: {
      left: 0,
      top: 29,
      width: 100,
      height: 8.8,
      label: "Escolha o contato",
      labelPosition: "bottom",
    },
    // Passo 3: Ícone do telefone no topo direito
    3: {
      left: 76,
      top: 5.2,
      width: 13,
      height: 4.8,
      label: "Toque para ligar",
      labelPosition: "bottom",
    },
    // Passo 4: Permissão de microfone "Durante o uso do app"
    4: {
      left: 17,
      top: 53.5,
      width: 66,
      height: 5.5,
      label: "Permitir microfone",
      labelPosition: "bottom",
    },
    // Passo 5: Botão vermelho redondo de desligar chamada
    5: {
      left: 42,
      top: 82,
      width: 16,
      height: 7.5,
      label: "Encerrar chamada",
      labelPosition: "top",
    },
  },

  "enviar-audio-whatsapp": {
    // Passo 1: Ícone WhatsApp na tela inicial
    1: {
      left: 27,
      top: 36,
      width: 21,
      height: 11,
      label: "Toque no WhatsApp",
      labelPosition: "bottom",
    },
    // Passo 2: Conversa na lista
    2: {
      left: 0,
      top: 29,
      width: 100,
      height: 8.8,
      label: "Escolha a conversa",
      labelPosition: "bottom",
    },
    // Passo 3: Botão verde de microfone no canto inferior direito
    3: {
      left: 84,
      top: 84,
      width: 15,
      height: 8.2,
      label: "Segure o microfone",
      labelPosition: "top",
    },
    // Passo 4: Barra de gravação ativa com contador de segundos
    4: {
      left: 2,
      top: 75,
      width: 96,
      height: 21,
      label: "Fale sua mensagem",
      labelPosition: "top",
    },
    // Passo 5: Balão do áudio enviado
    5: {
      left: 15,
      top: 66.5,
      width: 82,
      height: 9,
      label: "Áudio enviado!",
      labelPosition: "top",
    },
  },

  "bloquear-contato-whatsapp": {
    // Passo 1: Conversa na lista
    1: {
      left: 0,
      top: 29,
      width: 100,
      height: 8.8,
      label: "Abra a conversa",
      labelPosition: "bottom",
    },
    // Passo 2: Foto/nome do contato no topo
    2: {
      left: 4,
      top: 4.8,
      width: 20,
      height: 7,
      label: "Toque no nome",
      labelPosition: "bottom",
    },
    // Passo 3: Opção Bloquear contato no rodapé da tela
    3: {
      left: 4,
      top: 87.5,
      width: 92,
      height: 5.5,
      label: "Bloquear contato",
      labelPosition: "top",
    },
    // Passo 4: Opção Bloquear Lucas Santos
    4: {
      left: 4,
      top: 76,
      width: 92,
      height: 6,
      label: "Bloquear contato",
      labelPosition: "top",
    },
    // Passo 5: Confirmação do bloqueio
    5: {
      left: 4,
      top: 76,
      width: 92,
      height: 6,
      label: "Confirmar bloqueio",
      labelPosition: "top",
    },
  },
};

export function getGuideTouchTarget(
  guideSlug: string,
  stepOrder: number,
  _os?: OperatingSystem,
): TouchTarget | undefined {
  return guideTouchTargets[guideSlug]?.[stepOrder];
}
