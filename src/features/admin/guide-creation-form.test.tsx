import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GuideCreationForm } from "./guide-creation-form";

describe("formulário de criação de guias", () => {
  afterEach(() => vi.unstubAllGlobals());

  const guideSummary = () => within(screen.getByRole("complementary", { name: "Resumo atual do guia" }));

  it("envia o roteiro para a API como um novo rascunho", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          tutorialId: "00000000-0000-4000-8000-000000000001",
          slug: "consultar-saldo",
          guideVersionIds: {
            android: "00000000-0000-4000-8000-000000000002",
            ios: "00000000-0000-4000-8000-000000000003",
          },
          stepCount: 1,
        },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    render(<GuideCreationForm applications={[{ slug: "caixa", name: "Caixa", category: "Bancos" }]} />);
    await user.type(screen.getByRole("textbox", { name: "Nome do guia" }), "Consultar saldo");
    await user.type(screen.getByRole("textbox", { name: "Descrição" }), "Aprenda a localizar o saldo.");
    await user.type(screen.getByRole("textbox", { name: "Título do passo" }), "Abra o aplicativo");
    await user.type(screen.getByRole("textbox", { name: "Instrução" }), "Toque no aplicativo oficial.");
    await user.click(screen.getByRole("button", { name: "Criar guia como rascunho" }));

    expect(fetchMock).toHaveBeenCalledWith("/api/admin/guides", expect.objectContaining({ method: "POST" }));
    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const body = JSON.parse(String(request.body)) as { applicationSlug: string; slug: string; steps: Array<{ title: string; imageAlt: string }> };
    expect(body.applicationSlug).toBe("caixa");
    expect(body.slug).toBe("consultar-saldo");
    expect(body.steps[0]?.title).toBe("Abra o aplicativo");
    expect(body.steps[0]?.imageAlt).toContain("passo 1: Abra o aplicativo");
    expect(await screen.findByText(/Guia criado como rascunho/)).toBeVisible();
    expect(screen.getByRole("link", { name: "Adicionar prints ao guia" })).toHaveAttribute("href", "#prints-dos-guias");
  }, 15000);

  it("valida a prévia local sem chamar a API", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    render(<GuideCreationForm applications={[{ slug: "caixa", name: "Caixa", category: "Bancos" }]} previewOnly />);
    await user.type(screen.getByRole("textbox", { name: "Nome do guia" }), "Consultar saldo");
    await user.type(screen.getByRole("textbox", { name: "Descrição" }), "Aprenda a localizar o saldo.");
    await user.type(screen.getByRole("textbox", { name: "Título do passo" }), "Abra o aplicativo");
    await user.type(screen.getByRole("textbox", { name: "Instrução" }), "Toque no aplicativo oficial.");
    await user.click(screen.getByRole("button", { name: "Salvar rascunho local" }));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(await screen.findByText(/Rascunho local validado/)).toBeVisible();
    expect(screen.getByText(/Nada foi enviado ao servidor/)).toBeVisible();
  }, 15000);

  it("permite validar localmente um aplicativo novo sem chamar a API", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    render(<GuideCreationForm applications={[{ slug: "caixa", name: "Caixa", category: "Bancos" }]} previewOnly />);
    await user.click(screen.getByRole("radio", { name: /Cadastrar novo aplicativo/ }));
    await user.type(screen.getByRole("textbox", { name: "Nome do aplicativo" }), "Banco Aurora");
    await user.selectOptions(screen.getByRole("combobox", { name: "Nicho existente" }), "preview-bancos");
    await user.type(screen.getByRole("textbox", { name: "Descrição do aplicativo" }), "Serviços bancários educativos.");
    await user.type(screen.getByRole("textbox", { name: "Nome do guia" }), "Consultar saldo");
    await user.type(screen.getByRole("textbox", { name: "Descrição" }), "Aprenda a localizar o saldo.");
    await user.type(screen.getByRole("textbox", { name: "Título do passo" }), "Abra o aplicativo");
    await user.type(screen.getByRole("textbox", { name: "Instrução" }), "Toque no aplicativo oficial.");
    await user.click(screen.getByRole("button", { name: "Salvar rascunho local" }));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(await screen.findByText(/Aplicativo: Banco Aurora/)).toBeVisible();
  }, 15000);

  it("mostra o campo de logotipo somente ao cadastrar um aplicativo novo", async () => {
    const user = userEvent.setup();
    render(<GuideCreationForm applications={[{ slug: "caixa", name: "Caixa", category: "Bancos" }]} previewOnly />);

    expect(screen.queryByLabelText(/Escolher logotipo/)).not.toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: /Cadastrar novo aplicativo/ }));

    expect(screen.getByLabelText(/Escolher logotipo/)).toHaveAttribute(
      "accept",
      "image/png,image/jpeg,image/webp",
    );
    expect(screen.getByText(/não é enviada ao servidor/)).toBeVisible();
  });

  it("oferece upload direto do print sem pedir uma descrição duplicada", () => {
    render(<GuideCreationForm applications={[{ slug: "caixa", name: "Caixa", category: "Bancos" }]} previewOnly />);

    expect(screen.getByLabelText(/Escolher print/)).toHaveAttribute(
      "accept",
      "image/png,image/jpeg,image/webp",
    );
    expect(screen.queryByRole("textbox", { name: "Descrição da imagem esperada" })).not.toBeInTheDocument();
    expect(screen.getByText(/texto alternativo.*automaticamente/i)).toBeVisible();
  });

  it("cria 1, 2 e 50 editores sem perder a etapa existente", async () => {
    const user = userEvent.setup();
    render(<GuideCreationForm applications={[{ slug: "caixa", name: "Caixa", category: "Bancos" }]} previewOnly />);

    const count = screen.getByRole("spinbutton", { name: "Número de etapas" });
    expect(count).toHaveValue(1);
    await user.clear(count);
    await user.type(count, "2");
    await user.tab();
    expect(guideSummary().getByText("2 etapas do roteiro")).toBeVisible();
    expect(screen.getByText("Passo 2")).toBeVisible();

    const titles = screen.getAllByRole("textbox", { name: "Título do passo" });
    await user.type(titles[1]!, "Segunda etapa");
    await user.click(screen.getByRole("button", { name: /Adicionar etapa/ }));
    expect(guideSummary().getByText("3 etapas do roteiro")).toBeVisible();
    expect(screen.getAllByRole("textbox", { name: "Título do passo" })).toHaveLength(3);

    await user.click(screen.getByRole("button", { name: /Remover última etapa/ }));
    expect(guideSummary().getByText("2 etapas do roteiro")).toBeVisible();
    expect(screen.getAllByRole("textbox", { name: "Título do passo" })[1]).toHaveValue("Segunda etapa");

    await user.clear(count);
    await user.type(count, "50");
    await user.tab();
    expect(guideSummary().getByText("50 etapas do roteiro")).toBeVisible();
    expect(screen.getAllByRole("textbox", { name: "Título do passo" })).toHaveLength(50);
  }, 15000);

  it("bloqueia quantidades fora de 1 a 50", async () => {
    const user = userEvent.setup();
    render(<GuideCreationForm applications={[{ slug: "caixa", name: "Caixa", category: "Bancos" }]} previewOnly />);
    const count = screen.getByRole("spinbutton", { name: "Número de etapas" });

    await user.clear(count);
    await user.type(count, "0");
    await user.tab();
    expect(screen.getByText("Escolha entre 1 e 50 etapas.")).toBeVisible();
    expect(guideSummary().getByText("1 etapa do roteiro")).toBeVisible();

    await user.clear(count);
    await user.type(count, "51");
    await user.tab();
    expect(screen.getByText("Escolha entre 1 e 50 etapas.")).toBeVisible();
    expect(guideSummary().getByText("1 etapa do roteiro")).toBeVisible();
  });

  it("pede confirmação antes de descartar etapas preenchidas", async () => {
    const user = userEvent.setup();
    render(<GuideCreationForm applications={[{ slug: "caixa", name: "Caixa", category: "Bancos" }]} previewOnly />);
    const count = screen.getByRole("spinbutton", { name: "Número de etapas" });
    await user.clear(count);
    await user.type(count, "2");
    await user.tab();
    await user.type(screen.getAllByRole("textbox", { name: "Título do passo" })[1]!, "Não descartar");

    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    await user.clear(count);
    await user.type(count, "1");
    await user.tab();
    expect(confirm).toHaveBeenCalledWith(expect.stringContaining("Remover as últimas etapas"));
    expect(guideSummary().getByText("2 etapas do roteiro")).toBeVisible();
    expect(screen.getAllByRole("textbox", { name: "Título do passo" })[1]).toHaveValue("Não descartar");

    confirm.mockReturnValue(true);
    await user.clear(count);
    await user.type(count, "1");
    await user.tab();
    expect(guideSummary().getByText("1 etapa do roteiro")).toBeVisible();
    expect(screen.queryByDisplayValue("Não descartar")).not.toBeInTheDocument();
  }, 15000);

  it("mostra validação inline para campos vazios do passo", async () => {
    const user = userEvent.setup();
    render(<GuideCreationForm applications={[{ slug: "caixa", name: "Caixa", category: "Bancos" }]} previewOnly />);
    await user.click(screen.getByRole("button", { name: "Salvar rascunho local" }));

    expect(screen.getByText("Informe o título do passo.")).toBeVisible();
    expect(screen.getByRole("textbox", { name: /Título do passo/ })).toHaveAttribute("aria-invalid", "true");
  });

  it("permite pré-visualizar um aplicativo novo mesmo sem aplicativos cadastrados", async () => {
    const user = userEvent.setup();
    render(
      <GuideCreationForm
        applications={[]}
        categories={[{ id: "00000000-0000-4000-8000-000000000010", name: "Serviços financeiros" }]}
        previewOnly
      />,
    );

    await user.click(screen.getByRole("radio", { name: /Cadastrar novo aplicativo/ }));
    await user.type(screen.getByRole("textbox", { name: "Nome do aplicativo" }), "Banco Aurora");
    await user.type(screen.getByRole("textbox", { name: "Descrição do aplicativo" }), "Serviços bancários educativos.");
    await user.type(screen.getByRole("textbox", { name: "Nome do guia" }), "Consultar saldo");
    await user.type(screen.getByRole("textbox", { name: "Descrição" }), "Aprenda a localizar o saldo.");
    await user.type(screen.getByRole("textbox", { name: "Título do passo" }), "Abra o aplicativo");
    await user.type(screen.getByRole("textbox", { name: "Instrução" }), "Toque no aplicativo oficial.");
    const submit = screen.getByRole("button", { name: "Salvar rascunho local" });
    expect(submit).toBeEnabled();
    await user.click(submit);

    expect(await screen.findByText(/Aplicativo: Banco Aurora/)).toBeVisible();
  }, 15000);

  it("preserva o formulário quando a criação falha por rede", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("Falha de rede"));
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    render(<GuideCreationForm applications={[{ slug: "caixa", name: "Caixa", category: "Bancos" }]} />);
    await user.type(screen.getByRole("textbox", { name: "Nome do guia" }), "Consultar saldo");
    await user.type(screen.getByRole("textbox", { name: "Descrição" }), "Aprenda a localizar o saldo.");
    await user.type(screen.getByRole("textbox", { name: "Título do passo" }), "Abra o aplicativo");
    await user.type(screen.getByRole("textbox", { name: "Instrução" }), "Toque no aplicativo oficial.");
    await user.click(screen.getByRole("button", { name: "Criar guia como rascunho" }));

    expect(await screen.findByText("Falha de rede")).toBeVisible();
    expect(screen.getByRole("textbox", { name: "Nome do guia" })).toHaveValue("Consultar saldo");
    expect(screen.getByRole("textbox", { name: "Título do passo" })).toHaveValue("Abra o aplicativo");
    expect(screen.getByRole("button", { name: "Criar guia como rascunho" })).toBeEnabled();
  }, 15000);

  it("impede enviar um slug de guia já existente", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    render(
      <GuideCreationForm
        applications={[{ slug: "caixa", name: "Caixa", category: "Bancos" }]}
        existingGuideSlugs={["consultar-saldo"]}
        previewOnly
      />,
    );
    await user.type(screen.getByRole("textbox", { name: "Nome do guia" }), "Consultar saldo");
    await user.type(screen.getByRole("textbox", { name: "Descrição" }), "Aprenda a localizar o saldo.");
    await user.type(screen.getByRole("textbox", { name: "Título do passo" }), "Abra o aplicativo");
    await user.type(screen.getByRole("textbox", { name: "Instrução" }), "Toque no aplicativo oficial.");
    await user.click(screen.getByRole("button", { name: "Salvar rascunho local" }));

    expect(await screen.findByText(/Já existe um guia com este identificador/, { selector: "p.guide-editor-feedback" })).toBeVisible();
    expect(fetchMock).not.toHaveBeenCalled();
  }, 15000);
});
