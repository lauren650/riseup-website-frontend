"use client";

export function ScrollToFormButton() {
  const handleClick = () => {
    document
      .getElementById("interest-form")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <button
      onClick={handleClick}
      className="rounded-full bg-accent px-8 py-4 text-lg font-semibold text-white transition-opacity hover:opacity-90"
    >
      Express Your Interest
    </button>
  );
}
