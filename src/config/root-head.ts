import type { ComponentProps } from "react";

export const rootMeta = [
  { charSet: "utf-8" },
  {
    content: "width=device-width, initial-scale=1",
    name: "viewport",
  },
  {
    title: "Ore AI",
  },
  {
    content: "Hello Ore AI",
    name: "description",
  },
];

export function getRootLinks(appStylesheetHref: string): ComponentProps<"link">[] {
  return [
    {
      href: "https://fonts.googleapis.com",
      rel: "preconnect",
    },
    {
      crossOrigin: "anonymous",
      href: "https://fonts.gstatic.com",
      rel: "preconnect",
    },
    {
      href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap",
      rel: "stylesheet",
    },
    {
      href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block",
      rel: "stylesheet",
    },
    {
      href: appStylesheetHref,
      rel: "stylesheet",
    },
    {
      href: "/favicon.ico",
      rel: "icon",
    },
  ];
}

export const rootScripts = [{ src: "/theme-init.js" }];
