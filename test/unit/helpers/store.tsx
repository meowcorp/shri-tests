import React from "react";

import { Provider } from "react-redux";
import { CartApi, ExampleApi } from "../../../src/client/api";
import { Store, createStore, applyMiddleware, PreloadedState } from "redux";
import constants from "./constants";
import { createEpicMiddleware } from "redux-observable";

import {
  Action,
  ApplicationState,
  EpicDeps,
  rootEpic,
  createRootReducer,
} from "../../../src/client/store";
import { CartItem, CartState, Product } from "../../../src/common/types";

export const setupStore = (
  api = new ExampleApi(constants.BASE_NAME),
  cart = new CartApi(),
  { preloadedState }: { preloadedState?: PreloadedState<ApplicationState> } = {}
) => {
  const rootReducer = createRootReducer({
    cart: cart.getState(),
  });

  const epicMiddleware = createEpicMiddleware<
    Action,
    Action,
    ApplicationState,
    EpicDeps
  >({
    dependencies: { api, cart },
  });

  const store = createStore(
    rootReducer,
    preloadedState,
    applyMiddleware(epicMiddleware)
  );

  epicMiddleware.run(rootEpic);

  return store;
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

export const getCart = (products: Product[], count = 1): CartState => {
  const cartObject = {};
  products.forEach((product) => {
    cartObject[product.id] = {
      name: product.name,
      price: product.price,
      count: count,
    };
  });

  return cartObject;
};

interface PreloadedStateProps {
  cart: ApplicationState["cart"];
  products?: ApplicationState["products"];
  details: ApplicationState["details"];
}
export const getPreloadedState = ({
  products,
  details,
  cart,
}: PreloadedStateProps): ApplicationState => {
  return {
    products: products,
    details: details,
    cart: cart,
  };
};
