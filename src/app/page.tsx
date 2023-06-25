'use client'

import React, { Key, useState } from 'react';
import RunFromForm, { getLog } from '../../middleware/blueberry';

export default function Home() {
  const [codeText, setCodeText] = useState("Code here");
  const [consoleLog, setConsoleLog] = useState(new Array);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    RunFromForm(codeText);
    setConsoleLog(getLog());
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <section className="input text-center">
        <form onSubmit={(e) => handleSubmit(e)}>
          <textarea
            className="bg-teal-950/50 min-w-[400px]"
            rows={8}
            value={codeText}
            name="code"
            onChange={(e) => {
                setCodeText(e.target.value)
              }
            }
            required
          />
          <br />
          <br />
          <button type="submit">Run</button>
        </form>
      </section>
      <section className="output">
        <div className="output-pane bg-teal-950/50 min-w-[400px] min-h-[240px]">
          {
            consoleLog.map((str: string, index: Key | null | undefined ) => {
              return <p key={index}>{str}</p>;
            })
          }
        </div>
      </section>
    </main>
  )
}
