import type { ComponentProps } from "react";

export const rootMeta = [
  { charSet: "utf-8" },
  {
    name: "viewport",
    content: "width=device-width, initial-scale=1",
  },
  {
    title: "Ore AI",
  },
  {
    name: "description",
    content: "Hello Ore AI",
  },
];

export function getRootLinks(appStylesheetHref: string): Array<ComponentProps<"link">> {
  return [
    {
      rel: "preconnect",
      href: "https://fonts.googleapis.com",
    },
    {
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      crossOrigin: "anonymous",
    },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap",
    },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block",
    },
    {
      rel: "stylesheet",
      href: appStylesheetHref,
    },
    {
      rel: "icon",
      href: "/favicon.ico",
    },
  ];
}

export const rootScripts = [{ src: "/theme-init.js" }];
