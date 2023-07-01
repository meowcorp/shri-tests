import React from "react";

import {
  Matcher,
  MatcherOptions,
  render,
  within,
} from "@testing-library/react";
import {
  getCart,
  getPreloadedState,
  setupStore,
  wrapWithStoreProvider,
} from "./helpers/store";
import { CartApi, ExampleApi } from "./__mocks__/api";
import { wrapWithNavigationProvider } from "./helpers/navigation";
import { Application } from "../../src/client/Application";
import {
  CURRENT_CHECKOUT_ID,
  DETAILS_PRODUCTS,
  MOCKED_CATALOG,
} from "./__mocks__/products";
import { getCartLabel } from "./helpers/helpers";
import userEvent from "@testing-library/user-event";
import { UserEvent } from "@testing-library/user-event/dist/types/setup/setup";
import { clearCart } from "../../src/client/store";

const mockPreloadState = () => {
  return getPreloadedState({
    products: MOCKED_CATALOG,
    details: DETAILS_PRODUCTS[0],
    cart: getCart([DETAILS_PRODUCTS[0], DETAILS_PRODUCTS[1]]),
  });
};

type GetByTestId = (
  id: Matcher,
  options?: MatcherOptions | undefined
) => HTMLElement;

const fillFormAndSubmit = async (
  getByTestId: GetByTestId,
  event: UserEvent,
  { name, phone, address }: { name: string; phone: string; address: string }
) => {
  const form = getByTestId("cartForm");
  await event.type(within(form).getByTestId("name"), name);
  await event.type(within(form).getByTestId("phone"), phone);
  await event.type(within(form).getByTestId("address"), address);

  await event.click(within(form).getByTestId("submit"));

  return {
    name: within(form).getByTestId("name"),
    phone: within(form).getByTestId("phone"),
    address: within(form).getByTestId("address"),
    submit: within(form).getByTestId("submit"),
    form,
  };
};

describe("Страница корзины", () => {
  afterEach(() => {
    window.localStorage.clear();
    jest.clearAllMocks();
  });

  it("В шапке рядом со ссылкой на корзину должно отображаться количество не повторяющихся товаров в ней", async () => {
    const fakeStore = setupStore(new ExampleApi(), undefined, {
      preloadedState: mockPreloadState(),
    });

    const { getByTestId } = render(
      wrapWithNavigationProvider(
        wrapWithStoreProvider(<Application />, { store: fakeStore }),
        { initialEntries: ["/cart"] }
      )
    );

    const cartLink = getByTestId("cartLink");
    expect(cartLink.textContent).toEqual(getCartLabel(2));
  });

  it('В корзине должна быть кнопка "очистить корзину", по нажатию на которую все товары должны удаляться', async () => {
    const buttonEvent = userEvent.setup();
    const fakeStore = setupStore(new ExampleApi(), undefined, {
      preloadedState: mockPreloadState(),
    });

    const { getByTestId } = render(
      wrapWithNavigationProvider(
        wrapWithStoreProvider(<Application />, { store: fakeStore }),
        { initialEntries: ["/cart"] }
      )
    );

    const clearShoppingCart = getByTestId("clearShoppingCart");

    expect(clearShoppingCart).toBeVisible();

    await buttonEvent.click(clearShoppingCart);

    expect(fakeStore.getState().cart).toStrictEqual({});
  });

  it("Очищенная корзина сохраняет свое состояние при перезагрузках страницы", async () => {
    const product = DETAILS_PRODUCTS[0];
    const cart = getCart([product]);
    const cartApiInstance = new CartApi(cart);

    const fakeStore = setupStore(new ExampleApi(), cartApiInstance);

    fakeStore.dispatch(clearCart());

    const newFakeStore = setupStore(new ExampleApi(), cartApiInstance);

    expect(newFakeStore.getState().cart).toStrictEqual({});
  });

  it("После оформления форма заказа пропадает", async () => {
    const event = userEvent.setup();
    const fakeStore = setupStore(new ExampleApi(), undefined, {
      preloadedState: mockPreloadState(),
    });

    const { getByTestId } = render(
      wrapWithNavigationProvider(
        wrapWithStoreProvider(<Application />, { store: fakeStore }),
        { initialEntries: ["/cart"] }
      )
    );

    const { form } = await fillFormAndSubmit(getByTestId, event, {
      name: "Test name",
      phone: "89015920000",
      address: "Some address",
    });

    expect(form).not.toBeVisible();
  });

  it("Уведомление об успешном оформление имеет успешный статус", async () => {
    const fakeStore = setupStore(new ExampleApi(), undefined, {
      preloadedState: getPreloadedState({
        products: MOCKED_CATALOG,
        details: DETAILS_PRODUCTS[0],
        cart: [],
        latestOrderId: CURRENT_CHECKOUT_ID,
      }),
    });

    const { findByTestId } = render(
      wrapWithNavigationProvider(
        wrapWithStoreProvider(<Application />, { store: fakeStore }),
        { initialEntries: ["/cart"] }
      )
    );
    const alert = await findByTestId("orderAlert");
    expect(alert).toBeVisible();
    expect(alert).toHaveClass("alert-success");
  });

  it("Уведомление об успешном оформление содержит текущий номер заказа", async () => {
    const fakeStore = setupStore(new ExampleApi(), undefined, {
      preloadedState: getPreloadedState({
        products: MOCKED_CATALOG,
        details: DETAILS_PRODUCTS[0],
        cart: [],
        latestOrderId: CURRENT_CHECKOUT_ID,
      }),
    });

    const { findByTestId } = render(
      wrapWithNavigationProvider(
        wrapWithStoreProvider(<Application />, { store: fakeStore }),
        { initialEntries: ["/cart"] }
      )
    );
    const alert = await findByTestId("orderAlert");
    const orderID = await within(alert).findByTestId("orderID");
    expect(orderID).toHaveTextContent(CURRENT_CHECKOUT_ID.toString());
  });
});
