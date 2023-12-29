import { render, waitFor } from "@testing-library/react";
import App from "./App";

test("Renders without crashing", async () => {
  // @ts-expect-error
  global.gapi = {
    load(apiName, callback) {
      // We don't mock the gapi client object fully because we don't use most other functions
      // @ts-expect-error
      global.gapi.client = {
        init(config) {
          return new Promise((resolve) => resolve());
        },
        load(url) {
          return new Promise((resolve) => resolve());
        },
      };

      if (typeof callback === "object") {
        callback.callback();
      } else {
        callback();
      }
    },
  };

  // Promises that intentionally don't resolve so that the app will not progress and change state further, which causes warnings
  (window as any).gapiLoadPromise = new Promise<void>((resolve) => {});
  (window as any).gisLoadPromise = new Promise<void>((resolve) => {});

  const { getByText } = render(<App />);

  await waitFor(() => {
    expect(getByText("Remove Unavailable Videos")).toBeInTheDocument();
  });
});
