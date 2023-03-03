import React, { useEffect, useRef, useState } from 'react';
import './App.css';

import { Input } from '@chakra-ui/react';
import { Button } from '@chakra-ui/react';
import { ChakraProvider } from '@chakra-ui/react';

const OPENAI_API_KEY = ''; // YOUR_OWN_OPENAI_API_KEY

async function fetchStream(stream: any) {
  const reader = stream.getReader();
  let charsReceived = 0;

  let chunks: Uint8Array = new Uint8Array([]);

  await reader
    .read()
    .then(function processText({
      done,
      value,
    }: {
      done: boolean;
      value: Uint8Array;
    }) {
      if (done) {
        console.log('Stream complete');
        return chunks;
      }
      charsReceived += value.length;
      const chunk = value;
      console.log(
        `Received ${charsReceived} characters so far. Current chunk = ${chunk}`
      );

      chunks = new Uint8Array([...chunks, ...chunk]);
      return reader.read().then(processText);
    });
  const decorder = new TextDecoder();
  const resultString = decorder.decode(chunks);

  const response = JSON.parse(resultString);
  return response;
}

type Chat = { role: 'user' | 'assistant'; content: string };

async function createCompletion(chat: string, previousChats: Chat[]) {
  const DEFAULT_PARAMS = {
    model: 'gpt-3.5-turbo',
    messages: [...previousChats, { role: 'user', content: chat }],
    temperature: 0,
  };
  const params_ = { ...DEFAULT_PARAMS };
  const result = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + String(OPENAI_API_KEY),
    },
    body: JSON.stringify(params_),
  });
  const stream = result.body;
  const output = await fetchStream(stream);

  const content = decodeURIComponent(output.choices[0].message.content);

  parent?.postMessage?.(
    {
      pluginMessage: {
        type: 'newChat',
        userMessage: chat,
        systemMessage: content,
      },
    },
    '*'
  );

  return content;
}

function App() {
  const [chat, setChat] = useState('');

  const previousChats = useRef<Chat[]>([]);

  useEffect(() => {
    onmessage = async (event) => {
      const type = event.data.pluginMessage.type;

      if (type === 'initPreviousMessages') {
        const { chats } = event.data.pluginMessage;
        previousChats.current = chats;
      }
    };
  }, []);

  return (
    <ChakraProvider>
      <div className="App">
        <Input
          placeholder="Ask anything"
          autoFocus
          value={chat}
          onChange={(e) => setChat(e.target.value)}
        />

        <Button
          colorScheme="teal"
          onClick={async () => {
            const result = await createCompletion(chat, previousChats.current);
            previousChats.current = [
              ...previousChats.current,
              { role: 'user', content: chat },
              { role: 'assistant', content: result },
            ];
            setChat('');
          }}
          disabled={chat.length === 0}
        >
          ask
        </Button>
      </div>
    </ChakraProvider>
  );
}

export default App;
