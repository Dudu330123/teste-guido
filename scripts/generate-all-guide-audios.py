#!/usr/bin/env python3
import asyncio
import os
import re
import sys
import edge_tts

VOICE = "pt-BR-FranciscaNeural"
RATE = "-6%"
OUTPUT_BASE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "audio", "guias")

def extract_scripts():
    admin_scripts_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "src", "data", "admin-guide-scripts.ts")
    with open(admin_scripts_path, "r", encoding="utf-8") as f:
        content = f.read()

    stop_step = {
        "title": "Confira e pare antes de confirmar",
        "instruction": "Confira os dados com calma. O roteiro termina antes de senha, biometria ou confirmação.",
        "warning": "O Guido nunca pede senha, código de segurança ou confirmação de uma transação."
    }

    # Match the scripts object
    match = re.search(r"const scripts: Record<string, EditorialStep\[\]> = \{([\s\S]*?^\};)", content, re.MULTILINE)
    if not match:
        raise ValueError("Could not find 'scripts' definition in admin-guide-scripts.ts")

    body = match.group(1)
    slug_blocks = re.findall(r"(?:\"|')?([a-zA-Z0-9_-]+)(?:\"|')?:\s*\[([\s\S]*?)\],", body)

    results = {}
    for slug, steps_raw in slug_blocks:
        step_items = []
        for part in re.split(r"\},|\}\s*$", steps_raw):
            part = part.strip()
            if not part:
                continue
            if "stopBeforeFinancialConfirmation" in part:
                step_items.append(stop_step)
            else:
                title_m = re.search(r'title:\s*"([^"]+)"', part)
                inst_m = re.search(r'instruction:\s*"([^"]+)"', part)
                warn_m = re.search(r'warning:\s*"([^"]+)"', part)
                if title_m and inst_m:
                    step_items.append({
                        "title": title_m.group(1),
                        "instruction": inst_m.group(1),
                        "warning": warn_m.group(1) if warn_m else None
                    })
        results[slug] = step_items
    return results

async def generate_step_audio(slug, order, step, sem, retries=3):
    async with sem:
        dir_path = os.path.join(OUTPUT_BASE_DIR, slug)
        os.makedirs(dir_path, exist_ok=True)
        file_path = os.path.join(dir_path, f"step-{order}.mp3")

        text = f"{step['title']}. {step['instruction']}"
        if step.get("warning"):
            text += f" Atenção: {step['warning']}"

        for attempt in range(retries):
            try:
                communicate = edge_tts.Communicate(text, VOICE, rate=RATE)
                await communicate.save(file_path)
                size_kb = os.path.getsize(file_path) / 1024
                print(f"[{slug}] Passo {order} OK: {file_path} ({size_kb:.1f} KB)")
                return True
            except Exception as e:
                print(f"[{slug}] Passo {order} tentativa {attempt + 1} falhou: {e}", file=sys.stderr)
                if attempt < retries - 1:
                    await asyncio.sleep(1.5)
                else:
                    print(f"ERRO CRÍTICO no passo {order} de {slug}", file=sys.stderr)
                    return False

async def main():
    print(f"Iniciando síntese de áudio com voz '{VOICE}' (taxa: {RATE})...")
    scripts = extract_scripts()
    print(f"Encontrados {len(scripts)} roteiros em admin-guide-scripts.ts.")

    sem = asyncio.Semaphore(4)
    tasks = []

    for slug, steps in scripts.items():
        for i, step in enumerate(steps, 1):
            tasks.append(generate_step_audio(slug, i, step, sem))

    results = await asyncio.gather(*tasks)
    success_count = sum(1 for r in results if r)
    print(f"\nFinalizado! {success_count}/{len(tasks)} arquivos de áudio gerados com sucesso.")

if __name__ == "__main__":
    asyncio.run(main())
