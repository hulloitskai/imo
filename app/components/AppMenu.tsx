import { Loader, Text } from "@mantine/core";

import MenuIcon from "~icons/heroicons/bars-3-20-solid";

import { useContact } from "~/helpers/contact";

import classes from "./AppMenu.module.css";

export interface AppMenuProps
  extends BoxProps,
    Omit<ComponentPropsWithoutRef<"div">, "style" | "children" | "onChange"> {}

const AppMenu: FC<AppMenuProps> = ({ ...otherProps }) => {
  const [opened, setOpened] = useState(false);

  // // == Link items
  // interface MenuLinkProps
  //   extends MenuItemProps,
  //     Omit<InertiaLinkProps, "color" | "style"> {}
  // const MenuLink: FC<MenuLinkProps> = props => (
  //   <Menu.Item component={Link} {...props} />
  // );

  return (
    <Menu
      position="bottom-end"
      trigger="click-hover"
      closeDelay={200}
      {...{ opened }}
      onChange={setOpened}
      offset={4}
      width={220}
      arrowPosition="center"
      className={classes.menu}
      {...otherProps}
    >
      <Menu.Target>
        <Badge
          className={classes.target}
          variant="default"
          size="lg"
          leftSection={<MenuIcon />}
        >
          menu
        </Badge>
      </Menu.Target>
      <Menu.Dropdown>
        {/* <Menu.Divider /> */}
        <ContactItem
          onClose={() => {
            setOpened(false);
          }}
        />
        <Menu.Divider />
        <ServerInfoItem />
      </Menu.Dropdown>
    </Menu>
  );
};

export default AppMenu;

interface ContactItemProps extends BoxProps {
  onClose: () => void;
}

const ContactItem: FC<ContactItemProps> = ({ onClose, ...otherProps }) => {
  const [contact, { loading }] = useContact({
    type: "sms",
    body: "i'm contacting u about imo! my name is ",
    onTriggered: onClose,
  });

  return (
    <Menu.Item
      leftSection={loading ? <Loader size={12} /> : <SendIcon />}
      closeMenuOnClick={false}
      onClick={() => {
        contact();
      }}
      {...otherProps}
    >
      contact the creator :)
    </Menu.Item>
  );
};

const ServerInfoItem: FC<BoxProps> = props => {
  const { data } = useRouteSWR<{ bootedAt: string }>(
    routes.healthcheckHealthchecks.check,
    {
      descriptor: "load server info",
    },
  );
  const { bootedAt } = data ?? {};

  return (
    <Menu.Item
      component="div"
      disabled
      className={classes.serverInfoItem}
      {...props}
    >
      server booted{" "}
      {bootedAt ? (
        <TimeAgo inherit>{bootedAt}</TimeAgo>
      ) : (
        <Skeleton
          display="inline-block"
          height="min-content"
          width="fit-content"
          lh={1}
          style={{ verticalAlign: "middle" }}
        >
          <Text span inherit inline display="inline-block">
            2 minutes ago
          </Text>
        </Skeleton>
      )}
    </Menu.Item>
  );
};
