import { CartProps } from "./pageobjects/cart";

export const MEDIUM_BREAKPOINT = 768;
export const BASE_HEIGHT = 934;

export const MOCKED_CART_FORM: CartProps = {
  name: "Test Name",
  phone: "89015920000",
  address: "Sample address",
};

export const changeToMobileWidth = (browser: WebdriverIO.Browser) => {
  return browser.setWindowSize(MEDIUM_BREAKPOINT, BASE_HEIGHT);
};
