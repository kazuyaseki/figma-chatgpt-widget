const { widget } = figma;
const {
  AutoLayout,
  Ellipse,
  Frame,
  Image,
  Rectangle,
  SVG,
  Text,
  useSyncedState,
} = widget;

type Chat = { role: 'user' | 'assistant'; content: string };

function Widget() {
  const [chats, setChats] = useSyncedState<Chat[]>('chats', []);

  const askNewQuestion = async () => {
    await new Promise((resolve) => {
      figma.showUI(__html__, { height: 80 });
      figma.ui.postMessage({
        type: 'initPreviousMessages',
        chats,
      });
      figma.ui.on('message', (msg) => {
        if (msg.type === 'newChat') {
          setChats((current) => {
            return [
              ...current,
              { role: 'user', content: msg.userMessage },
              { role: 'assistant', content: msg.systemMessage },
            ];
          });
        }
      });
    });
  };

  return (
    <AutoLayout
      direction="vertical"
      horizontalAlignItems="start"
      verticalAlignItems="center"
      height="hug-contents"
      padding={8}
      fill="#FFFFFF"
      cornerRadius={8}
      spacing={24}
      width={400}
    >
      <AutoLayout
        direction="horizontal"
        horizontalAlignItems={'start'}
        verticalAlignItems="center"
        spacing={12}
      >
        <AutoLayout
          fill={'#198b8a)'}
          padding={{ vertical: 8, horizontal: 12 }}
          cornerRadius={4}
          onClick={() => {
            setChats([]);
          }}
        >
          <Text
            fontSize={18}
            horizontalAlignText="center"
            onClick={askNewQuestion}
            fill="#ffffff"
          >
            Ask new question
          </Text>
        </AutoLayout>

        <AutoLayout
          padding={{ vertical: 8, horizontal: 12 }}
          cornerRadius={4}
          onClick={() => {
            setChats([]);
          }}
        >
          <Text fontSize={18}>Reset</Text>
        </AutoLayout>
      </AutoLayout>
      <AutoLayout
        direction="vertical"
        horizontalAlignItems="start"
        verticalAlignItems="center"
        height="hug-contents"
        spacing={8}
      >
        {chats.map((chat) => {
          const isUser = chat.role === 'user';

          return (
            <AutoLayout
              horizontalAlignItems={isUser ? 'end' : 'start'}
              width={384}
            >
              <AutoLayout
                padding={{ vertical: 8, horizontal: 12 }}
                cornerRadius={12}
                fill={isUser ? '#198b8a' : '#f0f0f0'}
              >
                <Text
                  fontSize={16}
                  horizontalAlignText={isUser ? 'right' : 'left'}
                  fill={chat.role === 'user' ? '#fff' : '#333'}
                  width={chat.content.length > 20 ? 360 : 'hug-contents'}
                >
                  {chat.content.trim()}
                </Text>
              </AutoLayout>
            </AutoLayout>
          );
        })}
      </AutoLayout>
    </AutoLayout>
  );
}
widget.register(Widget);
