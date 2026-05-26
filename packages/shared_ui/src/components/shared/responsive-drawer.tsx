import { useIsMobile } from "@mono/shared_ui/hooks/use-mobile";
import { XIcon } from "lucide-react";
import { ComponentProps } from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import {
  Drawer,
  DrawerClose,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";

const ResponsiveDrawer = ({
  children,
  direction = "right",
  ...props
}: ComponentProps<typeof DrawerPrimitive.Root>) => {
  const isMobile = useIsMobile();
  return (
    <Drawer {...props} direction={isMobile ? "bottom" : direction}>
      {children}
    </Drawer>
  );
};

type Props = {
  title: string;
  description: string;
};
const ResponsiveDrawerHeader = ({ title, description }: Props) => {
  const isMobile = useIsMobile();

  return (
    <DrawerHeader>
      <DrawerTitle className="flex justify-between gap-2">
        <div>{title}</div>
        {!isMobile && (
          <DrawerClose className="cursor-pointer">
            <XIcon className="size-4" />
            <span className="sr-only">Close drawer</span>
          </DrawerClose>
        )}
      </DrawerTitle>
      <DrawerDescription className="sr-only">{description}</DrawerDescription>
    </DrawerHeader>
  );
};

ResponsiveDrawer.Header = ResponsiveDrawerHeader;

export default ResponsiveDrawer;
