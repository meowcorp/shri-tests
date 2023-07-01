import { wrapResponseData } from "../helpers/helpers";
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

export { ExampleApi };
