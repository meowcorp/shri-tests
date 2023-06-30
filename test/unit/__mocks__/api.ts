import { wrapResponseData } from "../helpers/helpers";

const MOCKED_PRODUCTS = [
  { id: 0, name: "Handcrafted Pizza", price: 253 },
  { id: 1, name: "Awesome Tuna", price: 694 },
  { id: 2, name: "Generic Fish", price: 763 },
];

const MOCKED_PRODUCT = {
  id: 1,
  name: "Fantastic Hat",
  description:
    "Ergonomic executive chair upholstered in bonded black leather and PVC padded seat and back for all-day comfort and support",
  price: 333,
  color: "black",
  material: "Wooden",
};

const ExampleApi = jest.fn().mockImplementation(() => {
  return {
    getProducts: jest
      .fn()
      .mockResolvedValue(wrapResponseData({ data: MOCKED_PRODUCTS })),
    getProductById: (id: string) =>
      jest.fn().mockResolvedValue(
        wrapResponseData({
          data: id === MOCKED_PRODUCT.id.toString() ? MOCKED_PRODUCTS : null,
        })
      ),
  };
});

export { ExampleApi, MOCKED_PRODUCTS, MOCKED_PRODUCT };
