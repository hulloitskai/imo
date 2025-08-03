import {
  AppShell,
  type AppShellProps,
  Breadcrumbs,
  type ContainerProps,
  type MantineSize,
} from "@mantine/core";

import {
  type DynamicProp,
  resolveDynamicProp,
  useResolveDynamicProp,
} from "~/helpers/appLayout";
import { useAutoClearColorScheme } from "~/helpers/mantine";
import { CONFETTI_CANVAS_ID, SMOKE_CANVAS_ID } from "~/helpers/particles";

import AppHeader, { type AppHeaderProps } from "./AppHeader";
import AppMeta, { type AppMetaProps } from "./AppMeta";
import PageContainer from "./PageContainer";
import PageLayout from "./PageLayout";

import classes from "./AppLayout.module.css";

export interface AppLayoutProps<PageProps extends SharedPageProps>
  extends Omit<
      AppMetaProps,
      "title" | "description" | "imageUrl" | "manifestUrl" | "pwaScope"
    >,
    Omit<AppInnerProps, "breadcrumbs" | "logoHref"> {
  title?: DynamicProp<PageProps, AppMetaProps["title"]>;
  description?: DynamicProp<PageProps, AppMetaProps["description"]>;
  breadcrumbs?: DynamicProp<PageProps, (AppBreadcrumb | null | false)[]>;
  withContainer?: boolean;
  containerSize?: MantineSize | (string & {}) | number;
  containerProps?: ContainerProps;
  withGutter?: boolean;
  gutterSize?: MantineSize | (string & {}) | number;
  logoHref?: DynamicProp<PageProps, AppHeaderProps["logoHref"]>;
  imageUrl?: DynamicProp<PageProps, AppMetaProps["imageUrl"]>;
  manifestUrl?: DynamicProp<PageProps, AppMetaProps["manifestUrl"]>;
  pwaScope?: DynamicProp<PageProps, AppMetaProps["pwaScope"]>;
}

export interface AppBreadcrumb {
  title: string;
  href: string;
}

const LAYOUT_WITH_BORDER = false;

const AppLayout = <PageProps extends SharedPageProps = SharedPageProps>({
  title: titleProp,
  description: descriptionProp,
  imageUrl: imageUrlProp,
  noIndex,
  breadcrumbs: breadcrumbsProp,
  logoHref: logoHrefProp,
  manifestUrl: manifestUrlProp,
  pwaScope: pwaScopeProp,
  ...appShellProps
}: AppLayoutProps<PageProps>) => {
  // == Meta
  const title = useResolveDynamicProp(titleProp);
  const description = useResolveDynamicProp(descriptionProp);
  const imageUrl = useResolveDynamicProp(imageUrlProp);
  const manifestUrl = useResolveDynamicProp(manifestUrlProp);
  const pwaScope = useResolveDynamicProp(pwaScopeProp);

  // == Breadcrumbs
  const page = usePage<PageProps>();
  const breadcrumbs = useMemo<AppBreadcrumb[]>(() => {
    return breadcrumbsProp
      ? resolveDynamicProp(breadcrumbsProp, page).filter(x => !!x)
      : [];
  }, [breadcrumbsProp, page]);

  // == Header
  const logoHref = useResolveDynamicProp(logoHrefProp);

  return (
    <>
      <AppMeta
        {...{ title, description, imageUrl, noIndex, manifestUrl, pwaScope }}
      />
      <PageLayout>
        <AppInner {...{ breadcrumbs, logoHref }} {...appShellProps} />
      </PageLayout>
    </>
  );
};

export default AppLayout;

interface AppInnerProps extends Omit<AppShellProps, "title"> {
  breadcrumbs: AppBreadcrumb[];
  withContainer?: boolean;
  containerSize?: MantineSize | (string & {}) | number;
  containerProps?: ContainerProps;
  withGutter?: boolean;
  gutterSize?: MantineSize | (string & {}) | number;
  logoHref?: AppHeaderProps["logoHref"];
}

const AppInner: FC<AppInnerProps> = ({
  children,
  breadcrumbs,
  withContainer,
  containerSize,
  containerProps,
  withGutter,
  gutterSize,
  logoHref,
  padding,
  pt,
  pb,
  pr,
  pl,
  py,
  px,
  p,
  ...otherProps
}) => {
  // == Track visit and reregister push subscriptions
  useAutoClearColorScheme(); // TODO: Remove after May 29, 2025

  // == Container and main
  const { style: containerStyle, ...otherContainerProps } =
    containerProps ?? {};
  const main = withContainer ? (
    <PageContainer
      size={containerSize ?? containerProps?.size}
      {...{ withGutter, gutterSize }}
      style={[
        { flexGrow: 1, display: "flex", flexDirection: "column" },
        containerStyle,
      ]}
      {...otherContainerProps}
    >
      {children}
    </PageContainer>
  ) : (
    children
  );

  return (
    <>
      <AppShell
        withBorder={LAYOUT_WITH_BORDER}
        header={{ height: 46 }}
        footer={{ height: "var(--mantine-spacing-md)" }}
        padding={padding ?? (withContainer ? undefined : "md")}
        classNames={{ root: classes.shell, header: classes.header }}
        data-vaul-drawer-wrapper
        {...otherProps}
      >
        <AppHeader {...{ logoHref }} />
        <AppShell.Main
          className={classes.main}
          {...{ pt, pb, pr, pl, py, px, p }}
        >
          {!isEmpty(breadcrumbs) && (
            <Breadcrumbs
              mx={10}
              mt={6}
              classNames={{
                root: classes.breadcrumb,
                separator: classes.breadcrumbSeparator,
              }}
            >
              {breadcrumbs.map(({ title, href }, index) => (
                <Anchor component={Link} href={href} key={index} size="sm">
                  {title}
                </Anchor>
              ))}
            </Breadcrumbs>
          )}
          {main}
        </AppShell.Main>
        <footer className={classes.footer} />
      </AppShell>
      <canvas id={SMOKE_CANVAS_ID} className={classes.particleCanvas} />
      <canvas id={CONFETTI_CANVAS_ID} className={classes.particleCanvas} />
    </>
  );
};
