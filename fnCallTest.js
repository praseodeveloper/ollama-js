import { Ollama } from 'ollama';

async function main() {

  const messages = [
    {
      role: 'system',
      content: ` 
      You are a helpful assistant with access to the following functions. 
      Use them if required - 
       {
           "name": "order_pizza",
           "description": "Order a pizza with custom toppings",
           "parameters": {
               "type": "object",
               "properties": {
                   "size": {
                       "type": "string",
                       "description": "Size of the pizza (small, medium, large)"
                   },
                   "crust": {
                       "type": "string",
                       "description": "Type of crust (thin, regular, thick)"
                   },
                   "toppings": {
                       "type": "array",
                       "items": {
                           "type": "string"
                       },
                       "description": "List of toppings for the pizza"
                   },
                   "delivery_address": {
                       "type": "string",
                       "description": "Address where the pizza should be delivered"
                   }
               },
               "required": [
                   "size",
                   "crust",
                   "toppings",
                   "delivery_address"
               ]
           }
       }  
       """
      
      `
    },
    { role: 'user', content: `Can you deliver a 10" regular margherita pizza with extra olives and onions at 29, Chowrangee Street?` }
  ];

  const ollama = new Ollama({ host: 'http://localhost:11434' })
    const response = await ollama.chat({
      model: 'calebfahlgren/natural-functions',
      messages: messages
    })

    console.log(response);
}

main();
