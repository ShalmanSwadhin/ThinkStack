/**
 * Monaco injects hidden <textarea> elements for keyboard/IME input.
 * Browsers flag them without id/name — label them after mount.
 */
export function labelMonacoFormFields(container, prefix = 'monaco') {
  if (!container) return;

  container.querySelectorAll('textarea').forEach((field, index) => {
    const role = field.classList.contains('ime-text-area') ? 'ime' : 'input';
    const id = `${prefix}-${role}-${index}`;
    if (!field.id) field.id = id;
    if (!field.name) field.name = id;
  });
}

export function createMonacoMountHandler(prefix, onReady) {
  return (editor, monaco) => {
    const container = editor.getContainerDomNode();
    labelMonacoFormFields(container, prefix);

    // IME textarea is sometimes inserted after the first paint.
    requestAnimationFrame(() => labelMonacoFormFields(container, prefix));

    const observer = new MutationObserver(() => {
      labelMonacoFormFields(container, prefix);
    });
    observer.observe(container, { childList: true, subtree: true });
    window.setTimeout(() => observer.disconnect(), 3000);

    onReady?.(editor, monaco);
  };
}

export function syncMonacoModel(editor, monaco, { language, source }) {
  if (!editor || !monaco) return;

  const model = editor.getModel();
  if (!model) return;

  if (language) {
    monaco.editor.setModelLanguage(model, language);
  }

  const nextSource = source ?? '';
  if (model.getValue() !== nextSource) {
    editor.setValue(nextSource);
  }
}

function isMonacoCanceledError(value) {
  if (!value) return false;
  if (value === 'Canceled') return true;
  if (typeof value === 'string' && value.includes('Canceled')) return true;
  if (value?.name === 'Canceled') return true;
  if (value?.message === 'Canceled') return true;
  return false;
}

/** Suppress benign Monaco "Canceled" noise when focus moves (e.g. notification clicks). */
export function installMonacoCanceledErrorFilter() {
  if (typeof window === 'undefined' || window.__thinkstackMonacoFilter) return;
  window.__thinkstackMonacoFilter = true;

  window.addEventListener('unhandledrejection', (event) => {
    if (isMonacoCanceledError(event.reason)) {
      event.preventDefault();
    }
  });

  const originalConsoleError = console.error;
  console.error = (...args) => {
    if (args.some(isMonacoCanceledError)) return;
    originalConsoleError.apply(console, args);
  };
}

export function disposeMonacoEditor(editor) {
  if (!editor) return;
  try {
    editor.dispose();
  } catch {
    // Editor may already be disposed during route changes.
  }
}
