export default function LegalFooter() {
  return (
    <footer className="w-full text-xs text-gray-500 px-4 py-3 border-t border-gray-800 bg-gray-900 mt-auto">
      <div className="max-w-7xl mx-auto">
        <p>
          This website uses content from the SRD and is licensed under the{" "}
          <a
            href="https://media.wizards.com/2016/downloads/DND/SRD-OGL_V5.1.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300"
          >
            Open Gaming License Version 1.0a
          </a>
        </p>
        <p className="mt-1">
          Dungeons & Dragons, D&D, their respective logos, and all Wizards titles
          and characters are property of Wizards of the Coast LLC in the U.S.A. and
          other countries. ©2024 Wizards.
        </p>
      </div>
    </footer>
  );
}
