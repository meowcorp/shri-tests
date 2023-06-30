import React from "react";

import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Application } from "../../src/client/Application";
import { trimBaseUrl, wrapWithProvider } from "./helpers/helpers";
import constants from "./helpers/constants";

describe("Общие требования", () => {
  it("В шапке отображаются ссылки на страницы магазина, а также ссылка на корзину", async () => {
    const { getByTestId } = render(wrapWithProvider(<Application />));

    const navbarLinks = (await getByTestId("navbar")) as HTMLDivElement;
    navbarLinks.querySelectorAll("a").forEach((element) => {
      expect(constants.NAV_LINKS).toContain(
        trimBaseUrl(element.href).split("/").at(-1)
      );
    });
  });

  it("Название магазина в шапке должно быть ссылкой на главную страницу", async () => {
    const { getByTestId } = render(wrapWithProvider(<Application />));

    const logoLink = (await getByTestId("logo")) as HTMLLinkElement;
    expect(trimBaseUrl(logoLink.href)).toBe("/");
  });

  it.skip("Гамбургер открывается при нажатии на него и закрывается при выборе элемента", async () => {
    // на перенос в гермиону

    const buttonEvent = userEvent.setup();

    const { getByLabelText, getByTestId, getByRole } = render(
      wrapWithProvider(<Application />)
    );

    await buttonEvent.click(getByLabelText("Toggle navigation"));
    expect(await getByTestId("navbar")).not.toHaveClass("collapse");
    await buttonEvent.click(getByRole("link", { current: "page" }));

    await waitFor(() => {
      expect(getByTestId("navbar")).toHaveClass("collapse");
    });
  });
});
