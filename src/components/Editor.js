import React, { useEffect, useRef } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import ACTIONS from '../Actions';
import { Socket } from 'socket.io-client';

const programmaticChange = Symbol('programmaticChange');

function Editor({ socketRef, roomId }) {
  const editorRef = useRef(null);
  useEffect(() => {
    const init = async () => {
      const startState = EditorState.create({
        doc: `console.log('hello')`,
        extensions: [
          basicSetup,
          javascript(),
          oneDark,
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              const code = update.state.doc.toString();
              console.log('Code changed:', code);

              update.transactions.forEach(transaction => {
                // Check for the custom symbol to identify the source of changes
                const isProgrammatic = transaction.annotations.some(annotation => annotation === programmaticChange);
                if (!isProgrammatic) {
                  console.log('Change source:', isProgrammatic ? 'Programmatic' : 'User');
                  socketRef.current.emit(ACTIONS.CODE_CHANGE, {
                    roomId,
                    code,
                  });
                }
              });
            }
          })
        ]
      });

      const view = new EditorView({
        state: startState,
        parent: editorRef.current,
      });

      // Update the document content after initialization
      const updateDoc = (newContent) => {
        view.dispatch({
          changes: { from: 0, to: view.state.doc.length, insert: newContent },
          annotations: programmaticChange.valueOf('programmaticChange'),
        });
      };

      // socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
      //   if (code != null) {
      //     updateDoc(code);
      //   }
      // });

      return () => {
        view.destroy();
      };
    }

    init();

  }, []);



  return (
    <div ref={editorRef}></div>
  );
}

export default Editor;
