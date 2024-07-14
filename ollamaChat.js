import ollama from 'ollama';
import readline from 'readline';

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

const messages = [];

async function main() {
	rl.write("Enter your query. Type /reset to start a new conversation, /bye to exit");

	_readUserInput();

	rl.on("close", function () {
		rl.write("Bye! Have a great day!/n");
		process.exit(0);
	});
}

async function _readUserInput() {
	rl.write("\n\n");
	rl.question("You: ", async (userInput) => {
		try {
			if (userInput === "/bye") {
				rl.close();
			}
			else if (userInput === "/reset") {
				messages.length = 0;
				rl.write("System: Conversation history cleared!");
			}
			else {
				const message = { role: 'user', content: userInput };
				messages.push(message);
				const response = await ollama.chat({ model: 'llama3', messages: messages, stream: true });
				let cumulativeResponse = "";

				rl.write("AI: ");
				for await (const part of response) {
					const partialResponse = part.message.content;
					rl.write(partialResponse)
					cumulativeResponse = cumulativeResponse + partialResponse;
				}

				const reply = { role: 'assistant', content: cumulativeResponse };
				messages.push(reply);
			}
		} catch (err) {
			rl.write("System: Error occurred", err);
		} finally {
			_readUserInput();
		}
	});
}

main();
