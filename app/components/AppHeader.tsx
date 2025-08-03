import { AppShell, type AppShellHeaderProps } from "@mantine/core";

import AppMenu from "./AppMenu";

import classes from "./AppHeader.module.css";

export interface AppHeaderProps extends Omit<AppShellHeaderProps, "children"> {
  logoHref?: string;
}

const AppHeader = forwardRef<HTMLDivElement, AppHeaderProps>(
  ({ className, logoHref, ...otherProps }, ref) => (
    <AppShell.Header
      {...{ ref }}
      px={8}
      className={cn("AppHeader", classes.header, className)}
      {...otherProps}
    >
      <Group justify="space-between" gap={8} h="100%">
        <Box />
        <Button
          component={Link}
          href={logoHref ?? routes.start.show.path()}
          variant="subtle"
          size="compact-md"
          className={classes.logoButton}
        >
          imo
        </Button>
        <AppMenu className={classes.menu} />
      </Group>
    </AppShell.Header>
  ),
);

export default AppHeader;
