import { CartItem } from "@/interfaces/cart";
import { IInvntoryItem } from "@/interfaces/inventory";
import {
  addItemToCart,
  getCart,
  removeItemFromCart,
  updateItemInCartQty,
} from "@/services/cart.service";
import { getAxiosErrorMessage } from "@mono/shared_ui/lib/utils";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";

type CartContextType = {
  addItemsToCart: (IInvntoryItem: any) => void;
  removeItemsFromCart: (item: IInvntoryItem) => void;
  clearCart: () => void;
  cartItems: CartItem[];
  dateChange: (id: number, date?: Date) => void;
  qunatityChange: (id: number, qtty: number) => void;
};
const CartContext = createContext<CartContextType>({} as any);

export const useCartContext = () => useContext(CartContext);

const CartProvider = ({ children }: PropsWithChildren) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const addItemsToCart = async (item: IInvntoryItem) => {
    const prms = async () => {
      const res = await addItemToCart({
        payload: [{ cart_quantity: 1, item_id: item.id }],
      });
      if (!res.error) {
        const temp = [...cartItems];
        const existItem = temp.find((i) => i.id == item.id);
        if (existItem) {
          existItem.cart_quantity += 1;
        } else {
          temp.push({ ...item, cart_quantity: 1 });
        }
        setCartItems(temp);
      }
    };
    toast.promise(prms(), {
      loading: "Adding Items to Cart",
      success: "Successfully Added Item to Cart",
      error: getAxiosErrorMessage,
    });
  };
  const removeItemsFromCart = async (item: IInvntoryItem) => {
    const prms = async () => {
      const res = await removeItemFromCart(item.id);
      if (!res.error) {
        setCartItems(cartItems.filter((i) => i.id != item.id));
        toast.success("Succesfully removed item from cart");
      }
    };
    toast.promise(prms(), {
      loading: "Removing Items from Cart",
      success: "Successfully Removed Item from Cart",
      error: getAxiosErrorMessage,
    });
  };
  const clearCart = () => {
    setCartItems([]);
  };

  const qunatityChange = async (id: number, qtty: number) => {
    try {
      const prms = async () => {
        const res = await updateItemInCartQty({
          cart_quantity: qtty,
          item_id: id,
        });
        if (!res.error) {
          const temp = [...cartItems];
          const existItem = temp.find((i) => i.id == id);
          if (existItem) {
            existItem.cart_quantity = qtty;
          }
          setCartItems(temp);
        }
      };
      await toast
        .promise(prms(), {
          loading: "Updating Qunatity",
          success: "Successfully updated Qunatity",
          error: getAxiosErrorMessage,
        })
        .unwrap();
    } catch (error) {
      throw error;
    }
  };
  const dateChange = (id: number, date?: Date) => {
    const temp = [...cartItems];
    const existItem = temp.find((i) => i.id == id);
    if (existItem) {
      existItem.returnDate = date;
    }
    setCartItems(temp);
  };
  const getCartItems = async () => {
    try {
      const res = await getCart();
      if (!res.error) {
        setCartItems(res.data || []);
      }
    } catch (error) {
      toast.error(getAxiosErrorMessage(error));
    }
  };
  useEffect(() => {
    getCartItems();
  }, []);
  return (
    <CartContext.Provider
      value={{
        addItemsToCart,
        removeItemsFromCart,
        clearCart,
        cartItems,
        qunatityChange,
        dateChange,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
export default CartProvider;
