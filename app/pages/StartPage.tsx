import {
  Accordion,
  type ButtonProps,
  List,
  Radio,
  Skeleton,
  Stack,
  Text,
  Title,
} from "@mantine/core";

import AppLayout from "~/components/AppLayout";
import { type Quest } from "~/types";

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
    <ExploreComponent
      onCompleted={messages => {
        setExploreMessages(messages);
        scrollTo({ top: 0 });
      }}
    />
  ) : valuesChoices === undefined ? (
    <ValuesComponent
      {...{ exploreMessages }}
      onCompleted={valuesChoices => {
        setValuesChoices(valuesChoices);
        scrollTo({ top: 0 });
      }}
    />
  ) : (
    <QuestComponent {...{ exploreMessages, valuesChoices }} />
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
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const sendMessage = (content: string) => {
    setInput("");
    setMessages(prevMessages => {
      const newMessages: ChatMessage[] = [
        ...prevMessages,
        { role: "user", content },
      ];
      setSending(true);
      void fetchRoute<{ outputText: string }>(routes.openai.exploreChat, {
        descriptor: "send message",
        data: {
          messages: newMessages,
        },
      })
        .then(({ outputText }) => {
          setMessages(prevMessages => [
            ...prevMessages,
            { role: "assistant", content: outputText },
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
        <Transition transition="pop" mounted={messages.length > 3}>
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
  const [questions, setQuestions] = useState<ValuesDiscoverQuestions[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const selectedChoices = useRef<Record<string, string>>({});
  const currentQuestion = questions[questionIndex];
  useEffect(() => {
    void fetchRoute<{ valuesDiscoveryQuestions: ValuesDiscoverQuestions[] }>(
      routes.openai.generateValuesQuestions,
      {
        descriptor: "generate values questions",
        data: {
          user_problem_interview_messages: exploreMessages,
        },
      },
    ).then(({ valuesDiscoveryQuestions }) => {
      setQuestions(valuesDiscoveryQuestions);
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
      <Group gap={10} justify="center" mt="xl">
        {questions.map((_, i) => (
          <Box
            className={classes.valuesProgressDot}
            mod={{ completed: i <= questionIndex }}
          />
        ))}
      </Group>
    </Stack>
  );
};

interface Challenge {
  reasoning: string;
  challenge_goal: string;
  short_description: string;
  recommended_steps: string[];
}

interface QuestComponentProps {
  exploreMessages: ChatMessage[];
  valuesChoices: Record<string, string>;
}

const QuestComponent: FC<QuestComponentProps> = ({
  exploreMessages,
  valuesChoices,
}) => {
  const [challenges, setChallenges] = useState<Challenge[]>();
  useEffect(() => {
    void fetchRoute<{ challenges: Challenge[] }>(
      routes.openai.generateChallenges,
      {
        descriptor: "generate challenges",
        data: {
          user_problem_interview_messages: exploreMessages,
          values_discovery_questions: valuesChoices,
        },
      },
    ).then(({ challenges }) => {
      setChallenges(challenges);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // == Create quest
  const { trigger: triggerCreate, mutating: creatingQuest } = useRouteMutation<{
    quest: Quest;
    ownershipToken: string;
  }>(routes.quests.create, {
    descriptor: "create quest",
    serializeData: quest => ({ quest }),
    onSuccess: ({ quest, ownershipToken }) => {
      const questPath = routes.quests.show.path({
        id: quest.id,
        query: {
          ownership_token: ownershipToken,
        },
      });
      router.visit(questPath);
    },
  });
  const [selectedChallengeIndex, setSelectedChallengeIndex] =
    useState<number>();

  return (
    <Stack gap="sm">
      <Title size="h2" lh={1.3}>
        {challenges
          ? "Here are your recommended quests"
          : "Generating recommended quests..."}
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
                <QuestAccordionPanelContent
                  {...{ challenge }}
                  buttonProps={{
                    disabled: creatingQuest && selectedChallengeIndex !== i,
                    loading: creatingQuest && selectedChallengeIndex === i,
                    onClick: () => {
                      setSelectedChallengeIndex(i);
                      const today = DateTime.local();
                      const deadline = today.plus({ weeks: 1 }).set({
                        hour: 20,
                        minute: 0,
                        second: 0,
                        millisecond: 0,
                      });
                      void triggerCreate({
                        name: challenge.challenge_goal,
                        description: challenge.short_description,
                        deadline: deadline.toISO(),
                        milestones_attributes: challenge.recommended_steps.map(
                          (step, j) => ({
                            number: j + 1,
                            description: step,
                          }),
                        ),
                      });
                    },
                  }}
                />
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

interface QuestAccordionPanelContentProps {
  challenge: Challenge;
  buttonProps: ButtonProps & ComponentPropsWithoutRef<"button">;
}

const QuestAccordionPanelContent: FC<QuestAccordionPanelContentProps> = ({
  challenge,
  buttonProps,
}) => {
  return (
    <Stack gap="sm">
      <Text>{challenge.short_description}</Text>
      <Text ff="heading" fw={600} mb="xs">
        Recommended steps:
      </Text>
      <List type="ordered">
        {challenge.recommended_steps.map((step, j) => (
          <List.Item key={j}>{step}</List.Item>
        ))}
      </List>
      <Button leftSection={<SuccessIcon />} {...buttonProps}>
        Select this quest
      </Button>
    </Stack>
  );
};
