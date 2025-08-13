import { Badge, Card, List, Stack, Text, Title } from "@mantine/core";
import { DateTime } from "luxon";

import CalendarIcon from "~icons/heroicons/calendar-20-solid";
import ShareIcon from "~icons/heroicons/share-20-solid";

import AppLayout from "~/components/AppLayout";
import Countdown from "~/components/Countdown";
import Time from "~/components/Time";
import { type Milestone, type Quest } from "~/types";

export interface QuestPageProps extends SharedPageProps {
  quest: Quest;
  milestones: Milestone[];
  ownershipToken: string | null;
}

const QuestPage: PageComponent<QuestPageProps> = ({
  quest,
  milestones,
  ownershipToken,
}) => {
  return (
    <Stack>
      <Stack gap={8}>
        <Title size="h2" lh={1.2}>
          {quest.name}
        </Title>
        <Text c="dimmed">{quest.description}</Text>
        {/* <Badge size="md" variant="outline">
          <Time format={DateTime.DATETIME_MED}>{quest.deadline}</Time>
        </Badge> */}
      </Stack>
      <Card withBorder>
        <Stack align="center" gap={8}>
          <Stack align="center" gap={4}>
            <Text>you have</Text>
            <Countdown deadline={quest.deadline} />
          </Stack>
          <Text>to complete your quest</Text>
          <Badge leftSection={<CalendarIcon />}>
            <Time format={DateTime.DATETIME_MED} inherit>
              {quest.deadline}
            </Time>
          </Badge>
        </Stack>
      </Card>
      <Box>
        <Title order={2} size="h3">
          Milestones
        </Title>
        <List>
          {milestones.map(milestone => (
            <List.Item
              key={milestone.id}
              icon={<Checkbox checked={milestone.completed} />}
            >
              {milestone.description}
            </List.Item>
          ))}
        </List>
      </Box>
      <Box>
        <Title order={2} size="h3">
          Accountability
        </Title>
        <Card withBorder>
          <Stack align="center" gap={8} ta="center">
            <Text maw={340}>
              Share this page with a friend so they can help you stay
              accountable :)
            </Text>
            <Button
              leftSection={<ShareIcon />}
              onClick={() => {
                const url = new URL(location.href);
                url.search = "";
                const text = `help me stay accountable: ${url.toString()}`;
                navigator.share({ text }).catch(error => {
                  if (error instanceof Error) {
                    if (error.name === "AbortError") {
                      return;
                    }
                    toast.error(`Failed to share`, {
                      description: error.message,
                    });
                  }
                  console.error("Failed to share", error);
                });
              }}
            >
              Share
            </Button>
          </Stack>
        </Card>
      </Box>
    </Stack>
  );
};

QuestPage.layout = page => (
  <AppLayout<QuestPageProps>
    title={({ quest }) => quest.name}
    withContainer
    containerSize="sm"
    containerProps={{ pt: 0 }}
  >
    {page}
  </AppLayout>
);

export default QuestPage;
