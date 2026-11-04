"use client";

const colors = [
  "#FFFFFF",
  "#FFF0F5",
  "#F8D7E3",
  "#F4C2C2",
  "#E8B4A0",
  "#E8D5B5",
  "#D7E8D4",
  "#C9DDF0",
  "#D8C9EA",
  "#D9D9D9",
];

/**
 * @param {object} props
 * @param {string} props.backgroundColor
 * @param {(color: string) => void} props.setBackgroundColor
 */
export default function ColorWheel({ backgroundColor, setBackgroundColor }) {
  return (
    <div className="w-full max-w-[500px]">
      <h3 className="mb-3 text-lg font-semibold">Paper color</h3>

      <div className="flex flex-wrap gap-3">
        {colors.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => setBackgroundColor(color)}
            aria-label={`Choose ${color}`}
            aria-pressed={backgroundColor === color}
            title={color}
            className={`h-9 w-9 rounded-full border transition hover:scale-110 ${
              backgroundColor === color
                ? "border-[var(--color-primary-dark)] ring-2 ring-[var(--color-primary-dark)] ring-offset-2"
                : "border-[var(--color-border)]"
            }`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      <div className="mt-5 flex items-center gap-3">
        <label
          htmlFor="custom-color"
          className="text-sm text-[var(--color-text-light)]"
        >
          Custom color
        </label>

        <input
          id="custom-color"
          type="color"
          value={backgroundColor}
          onChange={(event) => setBackgroundColor(event.target.value)}
          className="h-9 w-12 cursor-pointer rounded border-0 bg-transparent"
        />
      </div>
    </div>
  );
}
