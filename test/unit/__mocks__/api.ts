import { wrapResponseData } from "../helpers/helpers";
import { getCart } from "../helpers/store";
import {
  DETAILS_PRODUCTS,
  MOCKED_CATALOG,
  CURRENT_CHECKOUT_ID,
} from "./products";

const findProduct = (id: number) =>
  DETAILS_PRODUCTS.find((product) => product.id === id) ?? null;

const ExampleApi = jest.fn().mockImplementation(() => {
  return {
    getProducts: jest
      .fn()
      .mockResolvedValue(wrapResponseData({ data: MOCKED_CATALOG })),
    getProductById: (id: number) =>
      Promise.resolve(
        wrapResponseData({
          data: findProduct(id),
        })
      ),
    checkout: jest
      .fn()
      .mockResolvedValue(
        wrapResponseData({ data: { id: CURRENT_CHECKOUT_ID } })
      ),
  };
});

const CartApi = jest.fn().mockImplementation((initObject) => {
  let object = initObject || {};

  return {
    getState: jest.fn(() => object),
    setState: jest.fn((cart) => (object = cart)),
  };
});

export { ExampleApi, CartApi };
