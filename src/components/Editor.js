import React, { useEffect, useRef } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import ACTIONS from '../Actions';

const programmaticChange = Symbol('programmaticChange');

function Editor({ socketRef, roomId, onCodeChange}) {
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
              onCodeChange(code);
              // console.log('Code changed:', code);

              update.transactions.forEach(transaction => {
                // Check for the custom symbol to identify the source of changes
                const isProgrammatic = transaction.annotations.some(
                  annotation => annotation === programmaticChange
                );
                if (!isProgrammatic) {
                  // console.log('Change source:', isProgrammatic ? 'Programmatic' : 'User');
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
        // console.log("Updating document with content:", newContent);
        view.dispatch({
          changes: { from: 0, to: view.state.doc.length, insert: newContent },
          annotations: [programmaticChange],
        });
      };

      if(socketRef.current){
        socketRef.current.on(ACTIONS.CODE_CHANGE,({ code }) => {
          if (code != null) {
            updateDoc(code);
          } else {
            console.log("Received null or undefined code.");
          }
        });
      } else {
        console.error('Socket is not initialized.');
      }

      return () => {
        view.destroy();
      };
    }

    init();

    return () => {
      socketRef.current.off(ACTIONS.CODE_CHANGE);
    }

  }, [socketRef, roomId]);

  return (
    <div ref={editorRef}></div>
  );
}

export default Editor;
