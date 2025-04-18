# Open AI Realtime Demo

This project demonstrates how to use OpenAI's new Realtime API beta with audio streaming. When the user speaks, their audio is streamed to Open AI and Open AI's audio response is streamed back to the client.

Previously, achieving similar functionality required a multi-step process of transcribing audio to text, generating a response and converting that response to audio. With the new Realtime API, this process is significantly streamlined. Audio is streamed directly to and from OpenAI, eliminating intermediate steps and greatly reducing latency.

## Getting Started 🚀

### Prerequisites

- **Node.js**: Ensure you have Node.js installed (v16 or higher recommended).
- **pnpm**: Install pnpm as the package manager.
- **audio input**: uses the [mic](https://www.npmjs.com/package/mic) package to access the microphone. This requires that either [arecord](http://alsa-project.org/) (for Linux) or [sox](http://sox.sourceforge.net/) is configured.
- **audio output**: uses the [speaker](https://www.npmjs.com/package/speaker) package to play audio. It's output is backed by `mpg123's` audio output modules, which in turn use any number of audio backends commonly found on most operating systems.


### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/openai-realtime-demo.git
   cd openai-realtime-demo
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up your OpenAI API key:

   - Create a `.env` file in the project root.
   - Add your OpenAI API key:

     ```env
     OPENAI_API_KEY=your-api-key-here
     ```

### Running the Project

Start the development server with hot-reloading:

```bash
pnpm dev
```

Build the project for production:

```bash
pnpm build
```

Run the production build:

```bash
pnpm start
```

## How To Use It 🎤

Just start talking to it!

It has tools to support 2 specific scenarios:

- The current date and time
- Asking trivia questions

Ask about them! 🧑🏾‍🔬

When you're done, hit `Ctrl+C` to stop it.


## Project Structure 📁

```bash
ts-easy/
├── src/
│   └── main.ts      	# Entry point for the application
│   └── ...             # All other source files
│   └── openai/         # Open AI-specific code
│      └── tools/       # example tools for function calling
├── .vscode/
│   └── settings.json 	# VSCode workspace settings
│   └── extensions.json # Recommended VSCode extensions
├── eslint.config.mjs   # ESLint configuration
├── build.ts      	# Build configurations for tsup
├── .prettierrc      	# Prettier configuration
├── tsconfig.json    	# TypeScript configuration
├── package.json     	# Project metadata and scripts
└── pnpm-lock.yaml   	# Dependency lockfile
```

## How It Works 🛠️

The basic steps are:

1. Start web socket connection to Open AI.
2. Send an update message containing prompt instructions and available tools.
3. Capture audio input from microphone and serialize it to a string.
4. Send it to Open AI. Continue streaming input.
5. Handle audio response. Deserialize it and play the audio.

"Function calling"/"tools" adds additional steps. If the bot determines it should call a tool instead of return an audio response, the following steps are executed:

6. A response is returned indicating a tool should be called.
7. The code calls the tool.
8. The code sends the output of the tool to Open AI.
9. The code sends a message to Open AI indicating the tool output is complete.
10. Return back to #5.

## Contributing 🤝

Contributions are welcome! Feel free to open issues or submit pull requests to improve the project.

## License 📄

This project is licensed under the MIT License.
