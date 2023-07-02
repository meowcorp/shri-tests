/// <reference types='hermione' />

import { MOCKED_CART_FORM, changeToMobileWidth } from "./helpers";
import Cart from "./pageobjects/cart";
import Catalog from "./pageobjects/catalog";
import Product from "./pageobjects/product";

describe("Каталог", () => {
  it("Для каждого товара в каталоге отображается название, цена и ссылка на страницу с подробной информацией о товаре", async ({
    browser,
  }) => {
    const page = new Catalog(browser);

    await page.open();

    const { name, price, link } = await page.getProductCard(0);

    await expect(name).toBeDisplayed();
    await expect(price).toBeDisplayed();
    await expect(link).toBeDisplayed();
  });

  it("При оформлении нескольких заказов номер заказа увеличивается на +1", async ({
    browser,
  }) => {
    const product = new Product(browser);
    const cart = new Cart(browser);

    const buyProduct = async () => {
      await product.open("0");
      await product.addProductToCart();

      await cart.open();
      await cart.sendForm(MOCKED_CART_FORM);
    };

    await buyProduct();

    const orderId = await (await cart.orderID).getText();
    await buyProduct();
    const newOrderId = await (await cart.orderID).getText();

    await expect(cart.orderID).toHaveText((parseInt(orderId) + 1).toString());
  });

  it("При клике на карточку товара открывается страница с полной информацией по нему", async ({
    browser,
  }) => {
    const catalog = new Catalog(browser);

    await catalog.open();

    const { name, price, link } = await catalog.getProductCard(1);
    await link.click();

    const product = new Product(browser);
    expect(name).toHaveText(await (await product.name).getText());
    expect(price).toHaveText(await (await product.price).getText());
  });

  it("Страница товара соответствует дизайну", async ({ browser }) => {
    const product = new Product(browser);
    const productId = "0";

    await product.mockProductResponse(productId);
    await product.open(productId);

    (await product.productContainer).waitForExist();

    await product.productContainer.assertView("catalogLayout");
  });
});
