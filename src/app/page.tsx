'use client'

import React, { Key, useState } from 'react';
import Editor, { loader } from '@monaco-editor/react';
import RunFromForm, { getLog } from '../../middleware/blueberry';

loader.init().then((monaco) => {
  monaco.languages.register({ id: 'blueberry' });

  let keywords = ['if', 'else', 'func', 'true', 'false', 'while'];

  monaco.languages.setMonarchTokensProvider('blueberry', {
    keywords,
    tokenizer: {
      root: [
        [/@?[a-zA-Z][\w$]*/, {
          cases: {
            '@keywords': 'keyword',
            '@default': 'variable',
          }
        }],
        [/[{}()\[\]]/, 'brackets'],
        [/d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
        [/\d+/, 'number'],
        [/[;,.]/, 'delimiter'],
        [/".*?"/, 'string'],
        [/#[A-Za-z][\w$]*/, 'comment'],
      ],
    }
  });

  monaco.editor.defineTheme('blueberry', {
    base: 'vs-dark',
    rules: [
      { token: '', foreground: '#ffffff' },
      { token: 'keyword', foreground: '#ff6600', fontStyle: 'bold' },
      { token: 'comment', foreground: '#00af00' },
      { token: 'string', foreground: '#009966' },
      { token: 'variable', foreground: '#a0a0ff' },
    ],
    inherit: true,
    colors: { 
      "editor.background": '#042f2e2d',
    },
  });

});

export default function Home() {
  const [codeText, setCodeText] = useState<string | undefined>("");
  const [consoleLog, setConsoleLog] = useState(new Array);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    RunFromForm(codeText);
    setConsoleLog(getLog());
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8
      bg-gradient-to-br from-neutral-950 from-50% to-indigo-900">
      <section className="title text-2xl font-semibold text-center mb-8">
        <h1>Blueberry</h1>
      </section>
      <section className="input text-center mb-4">
        <form onSubmit={(e) => handleSubmit(e)}>
          <Editor
            className="min-w-[400px] min-h-[300px] rounded-lg shadow-xl"
            defaultLanguage="blueberry"
            language="blueberry"
            defaultValue={codeText}
            onChange={(text) => setCodeText(text)}
            theme="blueberry"
          />
          <br />
          <br />
          <button className="rounded-lg bg-sky-500 hover:bg-sky-800 px-4 py-2"
            type="submit">
            Run
          </button>
        </form>
      </section>
      <section className="output">
        <div className="output-pane bg-teal-950/30 min-w-[400px] min-h-[144px] max-h-[280px]
          p-4 overflow-y-auto flex flex-col-reverse shadow-xl">
          {
            consoleLog.slice(0).reverse().map((str: string, index: Key | null | undefined) => {
              return <div key={index}>{str}</div>;
            })
          }
        </div>
      </section>
    </main>
  )
}
