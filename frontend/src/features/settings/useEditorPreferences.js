import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../auth/authSlice';

export function selectEditorPreferences(state) {
  const preferences = state.auth.user?.preferences;
  return {
    fontSize: preferences?.editorFontSize ?? 14,
    tabSize: preferences?.editorTabSize ?? 4,
  };
}

export function useEditorPreferences() {
  const user = useSelector(selectCurrentUser);
  return {
    fontSize: user?.preferences?.editorFontSize ?? 14,
    tabSize: user?.preferences?.editorTabSize ?? 4,
  };
}

export default useEditorPreferences;
