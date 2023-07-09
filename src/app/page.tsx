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
      <section className="input text-center mb-4 min-w-[95%]">
        <form onSubmit={(e) => handleSubmit(e)}>
          <textarea
            className="rounded-lg shadow-xl font-mono min-h-[300px] min-w-[340px]
              md:min-w-[440px] lg:min-w-[640px] md:min-h-[400px] lg:min-h-[500px]
              bg-teal-950/30 rounded-lg shadow-xl focus:outline-none p-2"
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
      <section className="output mb-4">
        <div className="output-pane bg-teal-950/30 min-h-[144px] max-h-[280px]
          min-w-[340px] md:min-w-[440px] lg:min-w-[640px] md:min-h-[244px] lg:min-h-[344px]
          p-4 overflow-y-auto rounded-lg flex flex-col-reverse shadow-xl font-mono">
          {
            consoleLog.slice(0).reverse().map((str: string, index: Key | null | undefined) => {
              return <div key={index}>{str}</div>;
            })
          }
        </div>
      </section>
      <section className="footer text-center">
        Blueberry Interpreter Source:&nbsp;
        <br />
        <a href="https://github.com/keithaustin/Blueberry"
          className="font-semibold underline hover:no-underline">View on Github</a>
        <br />
        <br />
        Live Demo Source:&nbsp;
        <br />
        <a href="https://github.com/keithaustin/blueberry-live-demo"
          className="font-semibold underline hover:no-underline">View on Github</a>
      </section>
    </main>
  )
}
