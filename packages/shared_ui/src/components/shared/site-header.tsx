import { PropsWithChildren, ReactNode, useMemo } from "react";
import { SidebarTrigger } from "../ui/sidebar";
import { Separator } from "../ui/separator";
import { NavLink } from "react-router-dom";
import { Skeleton } from "../ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";

type SiteHeaderProps = {
  title?: string;
  breadCrumbs?: { title: ReactNode; url: string; loading?: boolean }[];
  showSidebarTrigger?: boolean;
};
export function SiteHeader({
  children,
  title,
  breadCrumbs,
  showSidebarTrigger = true,
}: PropsWithChildren<SiteHeaderProps>) {
  const links = useMemo(() => {
    return breadCrumbs?.map((i, idx) => {
      const Component =
        idx == breadCrumbs.length - 1 ? BreadcrumbPage : BreadcrumbItem;
      return (
        <>
          {i?.loading ? (
            <Skeleton key={idx} className="w-24 h-5 " />
          ) : (
            <Component key={idx}>
              <NavLink className="text-base font-medium" to={i.url}>
                {i.title}
                <span className="sr-only">Link to {i.url}</span>
              </NavLink>
            </Component>
          )}
          {idx != breadCrumbs.length - 1 && <BreadcrumbSeparator />}
        </>
      );
    });
  }, [breadCrumbs]);
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 py-2 px-4 lg:gap-2 lg:px-6">
        {showSidebarTrigger && <SidebarTrigger className="-ml-1" />}
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />

        {!links?.length && title && (
          <h1 className="text-base font-medium">{title}</h1>
        )}
        {!!links?.length && (
          <Breadcrumb>
            <BreadcrumbList>{links}</BreadcrumbList>
          </Breadcrumb>
        )}
        <div className="ml-auto flex items-center gap-2">{children}</div>
      </div>
    </header>
  );
}
