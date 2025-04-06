import json
import ollama
import asyncio

def get_spouse_name(name: str) -> str:
    "Get the name of a person's spouse"
    names = {
        "Ranveer": "Deepika",
        "Aalia": "Ranbir",
        "Raja": "Rani"
    }
    return json.dumps(names.get(name.lower(), "NA"))

def order_pizza(arguments: object) -> str:
    return ("A " + arguments["size"] + " pizza has been ordered")

async def run(model: str, user_input: str):
    client = ollama.AsyncClient()
    # Initialize conversation with a user query
    messages = [
        {
            "role": "system",
            "content": ' \
                You are a helpful assistant with access to the following functions. Use them if required. \
                If a function call returns "NA", then attempt answering the same question using your knowledge. \
                {\
                    "name": "order_pizza",\
                    "description": "Order a pizza with custom toppings",\
                    "parameters": {\
                        "type": "object",\
                        "properties": {\
                            "size": {\
                                "type": "string",\
                                "description": "Size of the pizza (small, medium, large)"\
                            },\
                            "crust": {\
                                "type": "string",\
                                "description": "Type of crust (thin, regular, thick)"\
                            },\
                            "toppings": {\
                                "type": "array",\
                                "items": {\
                                    "type": "string"\
                                },\
                                "description": "List of toppings for the pizza"\
                            },\
                            "delivery_address": {\
                                "type": "string",\
                                "description": "Address where the pizza should be delivered"\
                            }\
                        },\
                        "required": [\
                            "size",\
                            "crust",\
                            "toppings",\
                            "delivery_address"\
                        ]\
                    }\
                },  \
                { \
                    "name": "get_spouse_name", \
                    "description": "Get the name of the spouse of a person", \
                    "parameters": { \
                        "type": "object", \
                        "properties": { \
                            "name": { \
                                "type": "string", \
                                "description": "The name of a person whose spouse needs to be identified.", \
                            }, \
                        },\
                        "required": ["name"]\
                    }\
                }'
        },
        {
            "role": "user",
            "content": user_input
        }
    ]

    # First API call: Send the query and function description to the model
    response = await client.chat(
        model=model,
        messages=messages
    )

    # Add the model's response to the conversation history
    messages.append(response["message"])

    # Check if the model decided to use the provided function
    response_content = response["message"].content
    if "<functioncall>" in response_content:
        print("Function called!")
        function_obj = response_content[14:]
        corrected_data = function_obj.replace("\'", "").replace("'", '"').replace('"{"', '{"').replace('"}"', '}')
        function_def = json.loads(corrected_data)
        if function_def["name"] == "order_pizza":
            result = order_pizza(function_def["arguments"])
            print(result)
            messages.append(
                {
                    "role": "tool",
                    "content": result,
                }
            )
        elif function_def["name"] == "get_spouse_name": 
            result = get_spouse_name(function_def["arguments"]["name"])
            print(result)
            messages.append({
                "role": "tool",
                "content": result
            })
        else: 
            print("Unknown function call detected!")
    else:
        print("\nThe model didn't use the function. Its response was:")
        print(response["message"]["content"])
        return


while True:
    user_input = input("\n Please ask=> ")
    if not user_input:
        user_input = "What is the capital of India?"
    if user_input.lower() == "/bye":
        break

    asyncio.run(run("calebfahlgren/natural-functions", user_input))
