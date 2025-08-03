import { ModalsProvider } from "@mantine/modals";

import AppFlash from "./AppFlash";
// import ClarityTracking from "./ClarityTracking";
// import FullStoryTracking from "./FullStoryTracking";
import MiniProfilerPageTracking from "./MiniProfilerPageTracking";
import OpenAIProvider from "./OpenAIProvider";
import PageMeta from "./PageMeta";

// import SentryTracking from "./SentryTracking";
import "@fontsource-variable/manrope";
import "@fontsource-variable/bricolage-grotesque";

import "@mantine/core/styles.layer.css";

const PageLayout: FC<PropsWithChildren> = ({ children }) => (
  <>
    <PageMeta />
    <OpenAIProvider>
      <ModalsProvider modalProps={{ size: "md" }}>{children}</ModalsProvider>
    </OpenAIProvider>
    <AppFlash />
    {/* <SentryTracking /> */}
    {/* <FullStoryTracking /> */}
    {/* <ClarityTracking /> */}
    <MiniProfilerPageTracking />
  </>
);

export default PageLayout;
