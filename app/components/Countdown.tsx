import { Text } from "@mantine/core";
import { DateTime } from "luxon";

import classes from "./Countdown.module.css";

export interface CountdownProps {
  deadline: string | DateTime;
  onComplete?: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const Countdown: React.FC<CountdownProps> = ({ deadline, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [prevTimeLeft, setPrevTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = DateTime.now();
      const target =
        typeof deadline === "string" ? DateTime.fromISO(deadline) : deadline;

      if (!target.isValid) return;

      const remainingMs = target.toMillis() - now.toMillis();
      if (remainingMs <= 0) {
        setPrevTimeLeft(timeLeft);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        onComplete?.();
        return;
      }

      // Compute discrete units to avoid fractional rollovers
      const totalSeconds = Math.floor(remainingMs / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      const next: TimeLeft = { days, hours, minutes, seconds };
      // Only update state when any unit actually changes
      if (
        next.days !== timeLeft.days ||
        next.hours !== timeLeft.hours ||
        next.minutes !== timeLeft.minutes ||
        next.seconds !== timeLeft.seconds
      ) {
        setPrevTimeLeft(timeLeft);
        setTimeLeft(next);
      }
    };

    // Initial compute
    calculateTimeLeft();

    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
    // Depend on deadline and current timeLeft snapshot so prev tracking works
  }, [deadline, timeLeft, onComplete]);

  const TimeUnit: React.FC<{
    value: number;
    label: string;
    isLarge?: boolean;
    prevValue: number;
  }> = ({ value, label, isLarge = false, prevValue }) => (
    <Box
      className={classes.timeUnit}
      data-large={isLarge}
      data-changed={value !== prevValue}
    >
      <Text className={classes.timeValue} size={isLarge ? "xl" : "lg"}>
        {value.toString().padStart(2, "0")}
      </Text>
      <Text className={classes.timeLabel} size="xs" c="dimmed">
        {label}
      </Text>
    </Box>
  );

  return (
    <Group gap="md" justify="center" className={classes.countdown}>
      <TimeUnit
        value={timeLeft.days}
        label="Days"
        isLarge
        prevValue={prevTimeLeft.days}
      />
      <TimeUnit
        value={timeLeft.hours}
        label="Hours"
        prevValue={prevTimeLeft.hours}
      />
      <TimeUnit
        value={timeLeft.minutes}
        label="Minutes"
        prevValue={prevTimeLeft.minutes}
      />
      <TimeUnit
        value={timeLeft.seconds}
        label="Seconds"
        prevValue={prevTimeLeft.seconds}
      />
    </Group>
  );
};

export default Countdown;
