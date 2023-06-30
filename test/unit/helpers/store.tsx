import React from "react";

import { Provider } from "react-redux";
import { CartApi, ExampleApi } from "../../../src/client/api";
import { initStore } from "../../../src/client/store";
import { Store } from "redux";
import constants from "./constants";

export const setupStore = () => {
  const api = new ExampleApi(constants.BASE_NAME);
  const cart = new CartApi();
  return initStore(api, cart);
};

interface StoreProviderProps {
  store?: Store;
}
export const wrapWithStoreProvider = (
  children: React.ReactChild,
  { store = setupStore() }: StoreProviderProps = {}
) => {
  return <Provider store={store}>{children}</Provider>;
};
