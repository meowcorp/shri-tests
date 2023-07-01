import React from "react";

import { render, within } from "@testing-library/react";
import {
  getCart,
  getPreloadedState,
  setupStore,
  wrapWithStoreProvider,
} from "./helpers/store";
import { ExampleApi } from "./__mocks__/api";
import { wrapWithNavigationProvider } from "./helpers/navigation";
import { Application } from "../../src/client/Application";
import {
  CURRENT_CHECKOUT_ID,
  DETAILS_PRODUCTS,
  MOCKED_CATALOG,
} from "./__mocks__/products";
import { getCartLabel } from "./helpers/helpers";
import userEvent from "@testing-library/user-event";

const mockPreloadState = () => {
  return getPreloadedState({
    products: MOCKED_CATALOG,
    details: DETAILS_PRODUCTS[0],
    cart: getCart([DETAILS_PRODUCTS[0], DETAILS_PRODUCTS[1]]),
  });
};
describe("Страница корзины", () => {
  afterEach(() => {
    window.localStorage.clear();
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

  it("Неккоректные данные не проходят валидацию в форме", async () => {
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

    const form = getByTestId("cartForm");
    const name = within(form).getByTestId("name") as HTMLInputElement;
    const phone = within(form).getByTestId("phone") as HTMLInputElement;
    const address = within(form).getByTestId("address") as HTMLInputElement;
    await event.type(name, " ");
    await event.type(phone, " ");
    await event.type(address, " ");

    await event.click(within(form).getByTestId("submit"));

    expect(name).toHaveClass("is-invalid");
    expect(phone).toHaveClass("is-invalid");
    expect(address).toHaveClass("is-invalid");
  });

  it("При корректных данных успешно создается заказ, в модальном окне выводится текущий номер заказа", async () => {
    const event = userEvent.setup();
    const fakeStore = setupStore(new ExampleApi(), undefined, {
      preloadedState: mockPreloadState(),
    });

    const { getByTestId, findByTestId } = render(
      wrapWithNavigationProvider(
        wrapWithStoreProvider(<Application />, { store: fakeStore }),
        { initialEntries: ["/cart"] }
      )
    );

    const form = getByTestId("cartForm");
    const name = within(form).getByTestId("name") as HTMLInputElement;
    const phone = within(form).getByTestId("phone") as HTMLInputElement;
    const address = within(form).getByTestId("address") as HTMLInputElement;
    await event.type(name, "Test name");
    await event.type(phone, "89015920000");
    await event.type(address, "Some address");

    await event.click(within(form).getByTestId("submit"));

    const alert = await findByTestId("orderAlert");

    expect(alert).toBeVisible();
    expect(alert).toHaveClass("alert-success");

    const orderID = await within(alert).findByTestId("orderID");
    expect(orderID).toHaveTextContent(CURRENT_CHECKOUT_ID.toString());
  });
});
