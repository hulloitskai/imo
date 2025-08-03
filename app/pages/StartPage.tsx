import {
  Accordion,
  List,
  Radio,
  Skeleton,
  Stack,
  Text,
  Title,
} from "@mantine/core";

import AppLayout from "~/components/AppLayout";
import { useOpenAI } from "~/helpers/openai";

import classes from "./StartPage.module.css";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface StartPageProps extends SharedPageProps {}

const StartPage: PageComponent<StartPageProps> = () => {
  const [exploreMessages, setExploreMessages] = useState<
    ChatMessage[] | undefined
  >();
  const [valuesChoices, setValuesChoices] = useState<
    Record<string, string> | undefined
  >();
  return exploreMessages === undefined ? (
    <ExploreComponent onCompleted={setExploreMessages} />
  ) : valuesChoices === undefined ? (
    <ValuesComponent {...{ exploreMessages }} onCompleted={setValuesChoices} />
  ) : (
    <ChallengeComponent {...{ exploreMessages, valuesChoices }} />
  );
};

StartPage.layout = page => (
  <AppLayout<StartPageProps>
    withContainer
    containerSize="sm"
    containerProps={{ pt: 0 }}
  >
    {page}
  </AppLayout>
);

export default StartPage;

interface ExploreComponentProps {
  onCompleted: (messages: ChatMessage[]) => void;
}

const ExploreComponent: FC<ExploreComponentProps> = ({ onCompleted }) => {
  const openai = useOpenAI();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const sendMessage = (content: string) => {
    if (!openai) {
      throw new Error("OpenAI client not ready");
    }
    setInput("");
    setMessages(prevMessages => {
      const newMessages: ChatMessage[] = [
        ...prevMessages,
        { role: "user", content },
      ];
      setSending(true);
      void openai.responses
        .create({
          prompt: {
            id: "pmpt_688f7b838bc881948f44796b2a2f346c06603bd4ac233e59",
          },
          input: newMessages.map(({ role, content }) => ({
            role,
            content,
          })),
        })
        .then(({ output_text }) => {
          setMessages(prevMessages => [
            ...prevMessages,
            { role: "assistant", content: output_text },
          ]);
        })
        .finally(() => {
          setSending(false);
        });
      return newMessages;
    });
  };

  return (
    <Stack>
      <Title size="h2" lh={1.3}>
        What&apos;s a challenge in your life that you&apos;d like to get clarity
        on?
      </Title>
      <Stack gap="sm">
        {messages.map(({ role, content }) => (
          <Text key={content} className={classes.message} mod={{ role }}>
            {content}
          </Text>
        ))}
        <Transition transition="pop" mounted={messages.length > 5}>
          {style => (
            <Button
              leftSection={<ContinueIcon />}
              style={[{ alignSelf: "center" }, style]}
              onClick={() => {
                onCompleted(messages);
              }}
            >
              I&apos;m done exploring the different aspects of my problem.
            </Button>
          )}
        </Transition>
        {!sending && (
          <Textarea
            autosize
            minRows={isEmpty(messages) ? 5 : 2}
            placeholder={
              isEmpty(messages)
                ? "I just moved to Toronto and I'm having trouble balancing my career and finding meaningful friendships. I always feel like I don't have enough time!"
                : "Write a response..."
            }
            value={input}
            onChange={({ currentTarget }) => setInput(currentTarget.value)}
            // Allow pressing Enter to send message if there are messages
            onKeyDown={e => {
              if (!isEmpty(messages) && e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
          />
        )}
        <Button
          leftSection={<SendIcon />}
          style={{ alignSelf: sending ? "center" : "flex-end" }}
          loading={sending}
          onClick={() => {
            sendMessage(input);
          }}
        >
          {isEmpty(messages) ? "Let's explore this issue" : "send"}
        </Button>
      </Stack>
    </Stack>
  );
};

interface ValuesComponentProps {
  exploreMessages: ChatMessage[];
  onCompleted: (valuesChoices: Record<string, string>) => void;
}

interface ValuesDiscoverQuestions {
  question: string;
  choices: string[];
}

const ValuesComponent: FC<ValuesComponentProps> = ({
  exploreMessages,
  onCompleted,
}) => {
  const openai = useOpenAI();
  const [questions, setQuestions] = useState<ValuesDiscoverQuestions[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const selectedChoices = useRef<Record<string, string>>({});
  const currentQuestion = questions[questionIndex];
  useEffect(() => {
    if (!openai) {
      throw new Error("OpenAI client not ready");
    }
    void openai.responses
      .create({
        prompt: {
          id: "pmpt_688f87bd27408197a3a62f7afd64d60d0c216644b938783c",
        },
        input: JSON.stringify({
          userProblemInterviewMessages: exploreMessages,
        }),
      })
      .then(({ output_text }) => {
        const { valuesDiscoveryQuestions } = JSON.parse(output_text);
        if (valuesDiscoveryQuestions) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          setQuestions(valuesDiscoveryQuestions);
        }
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Stack gap="sm">
      <Title size="h2" lh={1.3}>
        {currentQuestion
          ? "Let's find an approach that works for you"
          : "Analyzing your situation..."}
      </Title>
      {currentQuestion ? (
        <Stack gap="sm">
          <Text ff="heading">{currentQuestion.question}</Text>
          <Radio.Group>
            <Group wrap="wrap" align="start" gap="sm">
              {currentQuestion.choices.map((choice, i) => (
                <Radio.Card
                  key={i}
                  className={classes.valuesChoice}
                  onClick={() => {
                    selectedChoices.current[currentQuestion.question] = choice;
                    if (questionIndex === questions.length - 1) {
                      onCompleted(selectedChoices.current);
                    } else {
                      setQuestionIndex(prevIndex => prevIndex + 1);
                    }
                  }}
                >
                  {choice}
                </Radio.Card>
              ))}
            </Group>
          </Radio.Group>
          <Anchor
            component="button"
            c="dimmed"
            onClick={() => {
              if (questionIndex === questions.length - 1) {
                onCompleted(selectedChoices.current);
              } else {
                setQuestionIndex(prevIndex => prevIndex + 1);
              }
            }}
          >
            Skip this question
          </Anchor>
        </Stack>
      ) : (
        <Skeleton h={340} />
      )}
    </Stack>
  );
};

interface Challenge {
  reasoning: string;
  challenge_goal: string[];
  short_description: string;
  recommended_steps: string[];
}

interface ChallengeComponentProps {
  exploreMessages: ChatMessage[];
  valuesChoices: Record<string, string>;
}

const ChallengeComponent: FC<ChallengeComponentProps> = ({
  exploreMessages,
  valuesChoices,
}) => {
  const openai = useOpenAI();
  const [challenges, setChallenges] = useState<Challenge[]>();
  useEffect(() => {
    if (!openai) {
      throw new Error("OpenAI client not ready");
    }
    void openai.responses
      .create({
        prompt: {
          id: "pmpt_688f91907b2c8193babf232fa293a7bd0501849131e10741",
        },
        input: JSON.stringify({
          userProblemInterviewMessages: exploreMessages,
          valuesDiscoveryQuestions: valuesChoices,
        }),
      })
      .then(({ output_text }) => {
        const { challenges } = JSON.parse(output_text);
        if (challenges) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          setChallenges(challenges);
        }
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Stack gap="sm">
      <Title size="h2" lh={1.3}>
        {challenges
          ? "Here are your recommended challenges"
          : "Generating recommended challenges..."}
      </Title>
      {challenges ? (
        <Accordion variant="separated" defaultValue={null}>
          {challenges.map((challenge, i) => (
            <Accordion.Item key={i} value={String(i)}>
              <Accordion.Control
                ff="heading"
                styles={{ label: { fontWeight: 600 } }}
              >
                {challenge.challenge_goal}
              </Accordion.Control>
              <Accordion.Panel>
                <Stack gap="sm">
                  <Text>{challenge.short_description}</Text>
                  <div>
                    <Text ff="heading" fw={600} mb="xs">
                      Recommended steps:
                    </Text>
                    <List type="ordered">
                      {challenge.recommended_steps.map((step, j) => (
                        <List.Item key={j}>{step}</List.Item>
                      ))}
                    </List>
                  </div>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      ) : (
        <Skeleton h={340} />
      )}
    </Stack>
  );
};
