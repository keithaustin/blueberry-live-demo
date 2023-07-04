'use client'

import React, { Key, useState } from 'react';
import RunFromForm, { getLog } from '../../middleware/blueberry';

export default function Home() {
  const [codeText, setCodeText] = useState<string>("");
  const [consoleLog, setConsoleLog] = useState(new Array);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    RunFromForm(codeText?.replaceAll("\r", ""));
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
          <textarea
            className="min-w-[400px] min-h-[300px] rounded-lg shadow-xl font-mono
              bg-teal-950/30 rounded-lg shadow-xl"
            value={codeText}
            onChange={(e) => setCodeText(e.target.value)}
            required
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
          p-4 overflow-y-auto rounded-lg flex flex-col-reverse shadow-xl font-mono">
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
