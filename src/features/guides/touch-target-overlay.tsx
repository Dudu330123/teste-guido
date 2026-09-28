import type { TouchTarget } from "@/types/content";

function isValid(target: TouchTarget) {
  return target.left >= 0 && target.top >= 0 && target.width > 0 && target.height > 0
    && target.left + target.width <= 100 && target.top + target.height <= 100;
}

const positionClasses: Record<NonNullable<TouchTarget["labelPosition"]>, string> = {
  bottom: "left-1/2 top-[calc(100%+0.5rem)] -translate-x-1/2",
  top: "bottom-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2",
  left: "right-[calc(100%+0.5rem)] top-1/2 -translate-y-1/2",
  right: "left-[calc(100%+0.5rem)] top-1/2 -translate-y-1/2",
};

/** Só orienta visualmente; não é um controle e não recebe eventos do ponteiro. */
export function TouchTargetOverlay({ touchTarget }: { touchTarget: TouchTarget }) {
  if (!isValid(touchTarget)) return null;
  const position = touchTarget.labelPosition ?? "bottom";
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20">
      <div
        className="absolute rounded-xl border-[3.5px] border-[#f5c542] shadow-[0_0_0_4px_rgba(26,94,181,0.7),0_0_15px_rgba(245,197,66,0.6)] animate-pulse"
        style={{
          left: `${touchTarget.left}%`,
          top: `${touchTarget.top}%`,
          width: `${touchTarget.width}%`,
          height: `${touchTarget.height}%`,
        }}
      >
        <span className={`absolute whitespace-nowrap rounded-full bg-[#f5c542] px-3 py-1 text-xs font-black text-[#17263a] shadow-lg flex items-center gap-1 ${positionClasses[position]}`}>
          👉 {touchTarget.label ?? "Toque aqui"}
        </span>
      </div>
    </div>
  );
}
