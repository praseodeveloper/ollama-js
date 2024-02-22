import { Ollama } from 'ollama';

async function main() {
  const aArgs = process.argv;
  if (aArgs.length < 3) {
    console.error("No prompt supplied. Invoke the app again with the prompt in quotes.");
    return;
  }

  const messages = [
    {
      role: 'system',
      content: ` 
      You are a helpful AI query assistant whose job is to map user query to the tools defined below in JSON format
      {
        "supported_tools": [ 
          { "name" : "getWeather", "parameters" : { "city" : "string" , "tempUnit" : "<celsius> or <fahrenheit>" } },
          { "name" : "getSharePrice", "parameters" : {"symbol": "string" }}
        ]
      }

    You must follow these instructions:
    Always select one or more of the above tools based on the user query
    If a tool is found in the supported list of tools, you must respond in JSON format consisting of an array matching the following schema for each input:
    {
       "tools": [{
            "tool": "<name of the selected tool>",
            "parameters": <parameters for the selected tool based on the schema>
       }]
    }
    If a tool is not found in the supported list of tools, ignore that part of the user query
    If there are multiple tools required, you must respond with a list of tools in a JSON array
    If there is no tool that matches the user request, you must respond with empty JSON array
    Do not add any additional Notes or explanations
    `
    },
    { role: 'user', content: aArgs[2] }
  ];

  const ollama = new Ollama({ host: 'http://localhost:11434' })
  const response = await ollama.chat({
    model: 'mistral',
    messages: messages
  })

  console.log(response);

  // Process the response and call my own getWeather function
  if (response && response.message && response.message.content) {
    const modelResponse = JSON.parse(response.message.content);
    if (modelResponse && modelResponse.tools) {
      modelResponse.tools.forEach(toolItem => {
        switch (toolItem.tool) {
          case 'getWeather':
            console.log(get_weather(toolItem.parameters.city, toolItem.parameters.tempUnit));
        }
      });
    }

  }
}


function get_weather(city, unit) {
  console.log(city);
  console.log(unit);
  unit = unit ?? "C";
  if (unit.toLowerCase().includes("celsius")) {
    unit = "C";
  } else if (unit.toLowerCase().includes("fahrenheit")) {
    unit = "F";
  }

  return "25 " + unit;
}

main();
