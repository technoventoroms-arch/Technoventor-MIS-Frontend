import { CartItem } from "@/interfaces/cart";
import { useCartContext } from "@/providers/cart-provider";
import QuantityCounter from "@mono/shared_ui/components/shared/quantity-counter";
import { SiteHeader } from "@mono/shared_ui/components/shared/site-header";
import { Badge } from "@mono/shared_ui/components/ui/badge";
import { Button } from "@mono/shared_ui/components/ui/button";
import { Calendar } from "@mono/shared_ui/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@mono/shared_ui/components/ui/popover";
import { cn, debounce } from "@mono/shared_ui/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Trash } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import CartSummary from "./components/cart-summary";
import { useLabContext } from "@/providers/lab-provider";
import { routeConstants } from "@/constants/route.constants";
const UserCart = () => {
  const { cartItems, removeItemsFromCart, qunatityChange, dateChange } =
    useCartContext();
  const { baseUrl } = useLabContext();
  return (
    <>
      <SiteHeader title="My Cart" />
      <div className="@container/main flex flex-1 flex-col gap-2 p-2 px-4 overflow-hidden ">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-lg darK:text-accent">Your cart is empty.</p>
            <p className="text-lg darK:text-accent">
              Please add inventory items to checkout.
            </p>
            <Link to={`/${baseUrl}/${routeConstants.INVENTORY}`}>
              <Badge>Browse Inventory</Badge>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col-reverse lg:grid lg:grid-cols-[1fr_auto] gap-2 max-w-7xl sm:max-lg:overflow-auto lg:grid-rows-1 lg:max-h-full">
            <div className="flex flex-col lg:overflow-hidden">
              <div className="pb-2">
                <span className="text-lg font-bold">
                  Cart Items {cartItems.length ? `(${cartItems.length})` : ""}
                </span>
              </div>
              <ul className="flex-1 max-h-full lg:overflow-auto flex flex-col gap-2 w-full ">
                {cartItems.map((i) => (
                  <CartItemCard
                    item={i}
                    onRemove={removeItemsFromCart}
                    onQuantityChange={qunatityChange}
                    onDateChange={dateChange}
                  />
                ))}
              </ul>
            </div>
            <CartSummary />
          </div>
        )}
      </div>
    </>
  );
};
type CartItemCardProps = {
  item: CartItem;
  onRemove: (id: any) => void;
  onQuantityChange: (id: number, quantity: number) => void;
  onDateChange: (id: number, quantity?: Date) => void;
};
const CartItemCard = ({
  item,
  onRemove,
  onQuantityChange,
  onDateChange,
}: CartItemCardProps) => {
  const {
    cart_quantity,
    category,
    id,
    name,
    description,
    sku,
    type,
    returnDate,
    quantity,
    image_link,
  } = item;
  const [qtty, setQtty] = useState(cart_quantity);
  const handleQuantityChange = async (changedQty: number) => {
    try {
      await onQuantityChange(id, changedQty);
    } catch (error) {
      setQtty(cart_quantity);
    }
  };
  const updateQunatity = useMemo(() => {
    return debounce(handleQuantityChange);
  }, [cart_quantity]);

  return (
    <li
      role="group"
      aria-label={`Cart item: ${name}`}
      className="flex flex-col sm:flex-row gap-2 p-2 shadow-sm rounded border"
    >
      <div className="sm:h-auto md:h-40 sm:w-60">
        <img
          className="rounded-md h-full object-cover w-full"
          src={image_link}
        />
      </div>
      <div className="flex flex-wrap flex-1">
        <div className="lg:min-w-2xs lg:max-w-lg flex-1 space-y-1">
          <h2 className="text-lg font-semibold">{name}</h2>
          <p className="text-sm mb-2">{description}</p>
          <p className="text-xs ">
            SKU{" "}
            <Badge variant={"blue"} fontSize={"small"}>
              {sku}
            </Badge>
          </p>
          <p className="text-xs">
            Category
            <Badge fontSize={"small"} className="ml-2" variant={"yellow"}>
              {category.name}
            </Badge>
          </p>
          <div className="text-xs">
            Available :{" "}
            <Badge variant={"green"} fontSize={"small"}>
              {quantity}
            </Badge>
          </div>
          <Badge fontSize={"small"} variant={"pink"}>
            {type}
          </Badge>
        </div>
        <div className="mt-2 w-40 flex flex-col gap-2">
          <QuantityCounter
            onChange={(e) => {
              updateQunatity(e);
              setQtty(e);
            }}
            value={qtty}
            min={1}
            max={quantity}
          />
          {type == "REUSABLE" && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-auto pl-3 text-left font-normal",
                    !returnDate && "text-muted-foreground"
                  )}
                >
                  {returnDate ? (
                    format(returnDate, "PPP")
                  ) : (
                    <span>Return Date</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={returnDate}
                  onSelect={(d) => onDateChange(id, d)}
                  initialFocus
                  fromDate={new Date()}
                />
              </PopoverContent>
            </Popover>
          )}
          <Button
            onClick={() => onRemove(item)}
            type="button"
            aria-label={`Remove ${name} from cart`}
            variant={"destructive"}
          >
            <Trash /> <span>Remove</span>
          </Button>
        </div>
      </div>
    </li>
  );
};

export default UserCart;
