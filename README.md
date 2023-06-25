## Blueberry Live Demo

This is a webapp running a modified version of my Blueberry language interpreter. Blueberry code is taken from the input on top, then when you hit "Run", the code is fed into the interpreter and run on the client side, and output is logged and displayed in the div underneath.

I wrote this app to showcase Blueberry in an interactive way. You can find the original interpreter source code at https://github.com/keithaustin/Blueberry.

This project was very interesting, as I went in with no idea what I was doing, beyond that running the interpreter shouldn't be difficult, as it's written in JavaScript, and I was trying to run it from a JS-based webapp. The confusing parts were running the interpreter on the client side, and logging the output to an HTML element. In the end, Next.js made it dead simple to run the interpreter client-side, requiring only that I add a 'use client' directive to the Home page, and the simplest method for console output ended up being to add an Array of log messages to the interpreter and get/update that data using React state.

As with all of my projects, I am open to feedback and suggestions. If you are interested in my other projects, check out my GitHub repositories or visit my portfolio site at https://keithaustin.dev/, where I have descriptions and live demos of a lot of my work!
