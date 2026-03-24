import type { Preview } from "@storybook/react-vite";
import React from "react";
import "../src/styles.css";
import "../src/themes/violet.css";
import "../src/themes/amber.css";
import "../src/themes/teal.css";

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "Global theme",
      toolbar: {
        title: "Theme",
        icon: "paintbrush",
        items: [
          { value: "violet", title: "Violet", right: "🟣" },
          { value: "amber",  title: "Amber",  right: "🟡" },
          { value: "teal",   title: "Teal",   right: "🟢" },
        ],
        dynamicTitle: true,
      },
    },
  },

  initialGlobals: {
    theme: "violet",
  },

  decorators: [
    (Story, context) => {
      document.documentElement.setAttribute(
        "data-theme",
        context.globals.theme ?? "violet"
      );
      return React.createElement(Story);
    },
  ],

  parameters: {
    a11y: { test: "todo" },
    backgrounds: { disable: true },
    layout: "centered",
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: [
          "Components",
          ["Badge", "Button", "StatCard", "DataTable", "DataGrid"],
        ],
      },
    },
  },
};

export default preview;