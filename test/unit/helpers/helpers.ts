import constants from "./constants";
import { wrapWithNavigationProvider } from "./navigation";
import { wrapWithStoreProvider } from "./store";

export const wrapWithProvider = (children: React.ReactChild) => {
  return wrapWithNavigationProvider(wrapWithStoreProvider(children));
};

export const trimBaseUrl = (path: string) => {
  return path.replace(constants.BASE_URL, "");
};

export const wrapResponseData = <T>({
  data,
  status = 200,
}: {
  data: T;
  status?: number;
}) => {
  return {
    status,
    data,
  };
};
