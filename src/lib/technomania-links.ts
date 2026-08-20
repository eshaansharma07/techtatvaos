"use client";

import { usePathname } from "next/navigation";

/**
 * Returns a function to resolve Technomania URLs correctly whether running
 * on the standalone subdomain (technomania.techtatva.in) or path route (/technomania).
 */
export function useTechnomaniaHref() {
  const pathname = usePathname() || "";
  const isPathMode = pathname.startsWith("/technomania");

  return (subpath: string) => {
    const cleanSubpath = subpath.startsWith("/") ? subpath : `/${subpath}`;
    if (cleanSubpath === "/" || cleanSubpath === "") {
      return isPathMode ? "/technomania" : "/";
    }
    return isPathMode ? `/technomania${cleanSubpath}` : cleanSubpath;
  };
}

/**
 * Static path resolver for server components where pathname prefix is known.
 */
export function getTmPath(subpath: string, basePath = "/technomania") {
  const cleanSubpath = subpath.startsWith("/") ? subpath : `/${subpath}`;
  if (cleanSubpath === "/" || cleanSubpath === "") {
    return basePath;
  }
  return `${basePath}${cleanSubpath}`;
}
