function renderInline(text) {
  return text.split(/(`[^`]+`)/g).map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={index}
          className="rounded bg-slate-100 px-1.5 py-0.5 text-sm text-brand-700 dark:bg-slate-800 dark:text-brand-300"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

export default function MarkdownContent({ content }) {
  if (!content) return null;

  const lines = content.split('\n');
  const blocks = [];
  let listItems = [];

  const flushList = () => {
    if (listItems.length === 0) return;
    blocks.push(
      <ul key={`list-${blocks.length}`} className="my-3 list-disc space-y-1 pl-6 text-slate-700 dark:text-slate-300">
        {listItems.map((item, index) => (
          <li key={index}>{renderInline(item)}</li>
        ))}
      </ul>
    );
    listItems = [];
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      return;
    }

    if (trimmed.startsWith('## ')) {
      flushList();
      blocks.push(
        <h3 key={`h3-${index}`} className="mb-2 mt-6 text-lg font-semibold text-slate-900 dark:text-white">
          {trimmed.slice(3)}
        </h3>
      );
      return;
    }

    if (trimmed.startsWith('### ')) {
      flushList();
      blocks.push(
        <h4 key={`h4-${index}`} className="mb-2 mt-4 text-base font-semibold text-slate-800 dark:text-slate-100">
          {trimmed.slice(4)}
        </h4>
      );
      return;
    }

    if (trimmed.startsWith('- ')) {
      listItems.push(trimmed.slice(2));
      return;
    }

    flushList();
    blocks.push(
      <p key={`p-${index}`} className="my-3 leading-relaxed text-slate-700 dark:text-slate-300">
        {renderInline(trimmed)}
      </p>
    );
  });

  flushList();

  return <div>{blocks}</div>;
}
