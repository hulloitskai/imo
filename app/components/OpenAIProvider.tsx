import OpenAI from "openai";

import { OpenAIContext } from "~/helpers/openai";

export interface OpenAIProviderProps extends PropsWithChildren {}

const OpenAIProvider: FC<OpenAIProviderProps> = ({ children }) => {
  const [client, setClient] = useState<OpenAI | undefined>();
  useEffect(() => {
    const apiKey = getMeta("openai-api-key");
    if (apiKey) {
      const client = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true,
      });
      setClient(client);
    }
  }, []);
  return (
    <OpenAIContext.Provider value={client}>{children}</OpenAIContext.Provider>
  );
};

export default OpenAIProvider;
