import React, { useEffect, useRef } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';

function Editor() {
    const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current) {
      const startState = EditorState.create({
        doc: '',
        extensions: [
          basicSetup,
          javascript(),
          oneDark,
        ]
      });

      const view = new EditorView({
        state: startState,
        parent: editorRef.current,
      });

      return () => {
        view.destroy();
      };
    }
  }, []);

  return (
    <div ref={editorRef}></div>
  );
}

export default Editor;
