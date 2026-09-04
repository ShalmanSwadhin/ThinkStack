export const CODE_LANGUAGES = [
  { id: 'pseudocode', label: 'Pseudo Code', monaco: 'plaintext' },
  { id: 'c', label: 'C', monaco: 'c' },
  { id: 'cpp', label: 'C++', monaco: 'cpp' },
  { id: 'java', label: 'Java', monaco: 'java' },
  { id: 'python', label: 'Python', monaco: 'python' },
  { id: 'javascript', label: 'JavaScript', monaco: 'javascript' },
  { id: 'csharp', label: 'C#', monaco: 'csharp' },
  { id: 'go', label: 'Go', monaco: 'go' },
  { id: 'rust', label: 'Rust', monaco: 'rust' },
  { id: 'kotlin', label: 'Kotlin', monaco: 'kotlin' },
];

export const DEFAULT_CODE_LANGUAGE = 'python';

export const getMonacoLanguage = (languageId) =>
  CODE_LANGUAGES.find((lang) => lang.id === languageId)?.monaco ?? 'plaintext';

export default { CODE_LANGUAGES, DEFAULT_CODE_LANGUAGE, getMonacoLanguage };
