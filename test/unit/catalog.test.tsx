import {
  getCart,
  getPreloadedState,
  setupStore,
  wrapWithStoreProvider,
} from "./helpers/store";
import React from "react";
import { render, waitFor, screen } from "@testing-library/react";
import { Catalog } from "../../src/client/pages/Catalog";
import { ExampleApi, MOCKED_PRODUCT, MOCKED_PRODUCTS } from "./__mocks__/api";
import { wrapWithNavigationProvider } from "./helpers/navigation";
import { formatPrice, trimBaseUrl } from "./helpers/helpers";
import { Application } from "../../src/client/Application";
import userEvent from "@testing-library/user-event";

const mockSinglePreloadState = () => {
  return getPreloadedState({
    products: MOCKED_PRODUCTS,
    details: MOCKED_PRODUCT,
    cart: getCart([MOCKED_PRODUCT]),
  });
};

describe("Страница каталога", () => {
  it("В каталоге должны отображаться товары, которые приходят с сервера", async () => {
    const fakeStore = setupStore(new ExampleApi());

    const { getByTestId } = render(
      wrapWithNavigationProvider(
        wrapWithStoreProvider(<Catalog />, { store: fakeStore })
      )
    );

    const catalogItemsContainer = await getByTestId("catalog-items");
    await waitFor(() => {
      expect(catalogItemsContainer.childElementCount).toBe(3);
    });
  });

  it("Для каждого товара в каталоге отображается название, цена и ссылка на страницу с подробной информацией о товаре", async () => {
    const fakeStore = setupStore(new ExampleApi());

    const { findByTestId } = render(
      wrapWithNavigationProvider(
        wrapWithStoreProvider(<Catalog />, { store: fakeStore })
      )
    );

    const catalogItemsContainer = (await findByTestId(
      "catalog-items"
    )) as HTMLDivElement;

    Array.prototype.forEach.call(
      catalogItemsContainer.children,
      (cart: HTMLDivElement, i: number) => {
        const product = MOCKED_PRODUCTS[i];

        const name = cart.querySelector(
          '[data-testid="name"]'
        ) as HTMLHeadingElement;
        expect(name.textContent).toEqual(product.name);

        const price = cart.querySelector(
          '[data-testid="price"]'
        ) as HTMLParagraphElement;

        expect(price.textContent).toEqual(`\$${product.price}`);

        const link = cart.querySelector(
          '[data-testid="link"]'
        ) as HTMLLinkElement;

        expect(trimBaseUrl(link.href)).toEqual(`/catalog/${product.id}`);
      }
    );
  });

  it('На странице с подробной информацией отображаются: цена, описание, название товара, материал и кнопка "Добавить в корзину"', async () => {
    const fakeStore = setupStore(new ExampleApi());

    const { findByTestId } = render(
      wrapWithNavigationProvider(
        wrapWithStoreProvider(<Application />, { store: fakeStore }),
        { initialEntries: ["/catalog/1"] }
      )
    );

    const name = await findByTestId("name");
    expect(name).toBeVisible();
    expect(name.textContent).toEqual(MOCKED_PRODUCT.name);

    const description = await findByTestId("description");
    expect(description).toBeVisible();
    expect(description.textContent).toEqual(MOCKED_PRODUCT.description);

    const price = await findByTestId("price");
    expect(price).toBeVisible();
    expect(price.textContent).toEqual(formatPrice(MOCKED_PRODUCT.price));

    const addToCart = await findByTestId("price");
    expect(addToCart).toBeVisible();

    const color = await findByTestId("color");
    expect(color).toBeVisible();
    expect(color.textContent).toEqual(MOCKED_PRODUCT.color);

    const material = await findByTestId("material");
    expect(material).toBeVisible();
    expect(material.textContent).toEqual(MOCKED_PRODUCT.material);
  });

  it("Если товар уже добавлен в корзину, в каталоге должно отображаться сообщение об этом", async () => {
    const fakeStore = setupStore(new ExampleApi(), undefined, {
      preloadedState: mockSinglePreloadState(),
    });

    const { findByTestId } = render(
      wrapWithNavigationProvider(
        wrapWithStoreProvider(<Catalog />, { store: fakeStore })
      )
    );

    const itemInCart = await findByTestId("itemInCart");
    expect(itemInCart).toBeVisible();
  });

  it("Если товар уже добавлен в корзину, на странице товара должно отображаться сообщение об этом", async () => {
    const fakeStore = setupStore(new ExampleApi(), undefined, {
      preloadedState: mockSinglePreloadState(),
    });

    const { findByTestId } = render(
      wrapWithNavigationProvider(
        wrapWithStoreProvider(<Application />, { store: fakeStore }),
        { initialEntries: [`/catalog/${MOCKED_PRODUCT.id}`] }
      )
    );

    const itemInCart = await findByTestId("itemInCart");
    expect(itemInCart).toBeVisible();
  });

  it("Если товар есть в корзине, то добавление его в корзину увеличит количество", async () => {
    const buttonEvent = userEvent.setup();

    const fakeStore = setupStore(new ExampleApi(), undefined, {
      preloadedState: mockSinglePreloadState(),
    });

    const { findByTestId } = render(
      wrapWithNavigationProvider(
        wrapWithStoreProvider(<Application />, { store: fakeStore }),
        { initialEntries: [`/catalog/${MOCKED_PRODUCT.id}`] }
      )
    );

    const addToCartButton = await findByTestId("addToCart");

    await buttonEvent.click(addToCartButton);

    expect(fakeStore.getState().cart[MOCKED_PRODUCT.id].count).toEqual(2);
  });
});
