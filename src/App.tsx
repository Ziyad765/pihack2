import React, { useState, useEffect } from "react";

type Product = {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  basePrice: number;
  currentPrice: number;
  stock: number;
};

type User = {
  id: number;
  username: string;
  loyaltyPoints: number;
};

const initialProducts: Product[] = [
  {
    id: 1,
    name: "Awesome T-Shirt",
    description: "A really awesome T-shirt",
    imageUrl: "https://placehold.co/150x150",
    basePrice: 25.0,
    currentPrice: 25.0,
    stock: 50,
  },
  {
    id: 2,
    name: "Cool Mug",
    description: "A very cool mug",
    imageUrl: "https://placehold.co/150x150",
    basePrice: 15.0,
    currentPrice: 15.0,
    stock: 30,
  },
  {
    id: 3,
    name: "Stylish Hat",
    description: "A super stylish hat",
    imageUrl: "https://placehold.co/150x150",
    basePrice: 20.0,
    currentPrice: 20.0,
    stock: 20,
  },
  {
    id: 4,
    name: "Fancy Pants",
    description: "Some fancy pants",
    imageUrl: "https://placehold.co/150x150",
    basePrice: 50.0,
    currentPrice: 50.0,
    stock: 10,
  },
  {
    id: 5,
    name: "Sneaky Shoes",
    description: "Sneaky shoes",
    imageUrl: "https://placehold.co/150x150",
    basePrice: 75.0,
    currentPrice: 75.0,
    stock: 5,
  },
];

const initialUsers: User[] = [
  { id: 1, username: "user1", loyaltyPoints: 10 },
  { id: 2, username: "user2", loyaltyPoints: 25 },
];

const SmartCommercePlatform = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [cart, setCart] = useState<number[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [adminMode, setAdminMode] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginError, setLoginError] = useState("");
  const [restockNotification, setRestockNotification] = useState<string | null>(
    null
  );

  useEffect(() => {
    const calculateNewPrice = (product: Product): number => {
      const basePrice = product.basePrice;
      let priceChangeFactor = 1;

      const soldCount = initialProducts.find((p) => p.id === product.id)?.stock
        ? initialProducts.find((p) => p.id === product.id)?.stock! -
          product.stock
        : 0;

      if (soldCount > 0) {
        priceChangeFactor += soldCount * 0.0;
      }

      if (product.stock < 10) {
        priceChangeFactor += 0.2;
      }

      if (product.stock > 40) {
        priceChangeFactor -= 0.1;
      }

      return parseFloat((basePrice * priceChangeFactor).toFixed(2));
    };

    const updatePrices = () => {
      const updatedProducts = products.map((product) => {
        return { ...product, currentPrice: calculateNewPrice(product) };
      });
      setProducts(updatedProducts);
    };

    updatePrices();

    const intervalId = setInterval(updatePrices, 15000);

    return () => clearInterval(intervalId);
  }, [products]);

  useEffect(() => {
    if (adminMode) {
      // Check if any product stock is less than 10 and price is below $20
      const lowStockProducts = products.filter(
        (product) => product.stock < 10 && product.basePrice < 20
      );

      lowStockProducts.forEach((product) => {
        // Restock product with 10 units
        handleStockChange(product.id, product.stock + 10);
        setRestockNotification(`Product "${product.name}" has been restocked.`);
      });
    }
  }, [adminMode, products]);

  const handleLogin = () => {
    const user = users.find((u) => u.username === loginUsername);
    if (user) {
      setCurrentUser(user);
      setLoginError("");
    } else {
      setLoginError("Invalid username");
    }
    setLoginUsername("");
  };

  const handleAddToCart = (productId: number) => {
    setCart([...cart, productId]);
  };

  const handleRemoveFromCart = (productId: number) => {
    setCart(cart.filter((id) => id !== productId));
  };

  const calculateCartTotal = () => {
    let total = 0;
    cart.forEach((productId) => {
      const product = products.find((p) => p.id === productId);
      if (product) {
        total += product.currentPrice;
      }
    });
    return parseFloat(total.toFixed(2));
  };

  const calculateDiscountedTotal = () => {
    if (!currentUser) return calculateCartTotal();
    const discount = calculateCartTotal() * 0.05;
    return parseFloat((calculateCartTotal() - discount).toFixed(2));
  };

  const handleCheckout = () => {
    if (!currentUser) {
      alert("Please login to checkout");
      return;
    }

    if (cart.length === 0) {
      alert("No items in the cart.");
      return;
    }
    const updatedProducts = products.map((product) => {
      if (cart.includes(product.id)) {
        return { ...product, stock: product.stock - 1 };
      }
      return product;
    });
    setProducts(updatedProducts);

    const cartTotal = calculateCartTotal();
    const discount = cartTotal * 0.05;
    const updatedUsers = users.map((user) => {
      if (user.id === currentUser.id) {
        return { ...user, loyaltyPoints: user.loyaltyPoints + discount };
      }
      return user;
    });

    setUsers(updatedUsers);
    setCurrentUser(
      updatedUsers.find((user) => user.id === currentUser.id) || null
    );

    setCart([]);
    alert("Checkout Complete!");
  };

  const handleStockChange = (productId: number, newStock: number) => {
    const updatedProducts = products.map((product) => {
      if (product.id === productId) {
        return { ...product, stock: newStock };
      }
      return product;
    });
    setProducts(updatedProducts);
  };

  const handlePriceChange = (productId: number, newPrice: number) => {
    const updatedProducts = products.map((product) => {
      if (product.id === productId) {
        return { ...product, currentPrice: newPrice };
      }
      return product;
    });
    setProducts(updatedProducts);
  };

  const renderProductList = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white shadow-md rounded-lg p-4 flex flex-col"
          >
            <div className="flex justify-center">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-32 h-32 object-contain mb-2"
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-1">
              {product.name}
            </h3>
            <p className="text-gray-600 mb-2">{product.description}</p>
            <p className="text-green-600 font-semibold mb-2">
              Price: ${product.currentPrice}
            </p>
            <p className="text-gray-700 mb-2">Stock: {product.stock}</p>
            {currentUser && (
              <button
                onClick={() => handleAddToCart(product.id)}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-auto"
              >
                Add to Cart
              </button>
            )}
            {!currentUser && (
              <p className="mt-auto text-gray-500">Login to add to cart</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderAdminProductList = () => {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Stock</th>
              <th className="py-2 px-4 border-b">Current Price</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td className="py-2 px-4 border-b text-center">{product.id}</td>
                <td className="py-2 px-4 border-b text-center">
                  {product.name}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  <input
                    type="number"
                    className="border rounded px-2 py-1 w-16 text-center"
                    value={product.stock}
                    onChange={(e) =>
                      handleStockChange(product.id, parseInt(e.target.value))
                    }
                  />
                </td>
                <td className="py-2 px-4 border-b text-center">
                  <input
                    type="number"
                    className="border rounded px-2 py-1 w-20 text-center"
                    value={product.currentPrice}
                    onChange={(e) =>
                      handlePriceChange(product.id, parseFloat(e.target.value))
                    }
                  />
                </td>
                <td className="py-2 px-4 border-b text-center">
                  <button
                    onClick={() =>
                      handleStockChange(product.id, product.stock + 10)
                    }
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded mx-1"
                  >
                    + 10 stock
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderLogin = () => {
    return (
      <div className="flex flex-col p-4 border-2 border-gray-200 rounded-lg shadow-md space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-4">
          Login
        </h2>
        <input
          type="text"
          placeholder="Username"
          className="border rounded px-3 py-2"
          value={loginUsername}
          onChange={(e) => setLoginUsername(e.target.value)}
        />
        <button
          onClick={handleLogin}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Login
        </button>
        {loginError && <p className="text-red-500">{loginError}</p>}
      </div>
    );
  };

  const renderCart = () => {
    if (cart.length === 0) {
      return <p className="text-gray-500">Your cart is empty</p>;
    }
    return (
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Shopping Cart</h3>
        <ul>
          {cart.map((productId) => {
            const product = products.find((p) => p.id === productId);
            return (
              product && (
                <li
                  key={productId}
                  className="flex justify-between items-center py-2 border-b"
                >
                  <span className="text-gray-700">{product.name}</span>
                  <span className="text-gray-700">${product.currentPrice}</span>
                  <button
                    onClick={() => handleRemoveFromCart(product.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </li>
              )
            );
          })}
        </ul>
        <div className="mt-4">
          <div className="flex justify-between mb-2">
            <span className="font-semibold">Total:</span>
            <span className="text-gray-700">${calculateCartTotal()}</span>
          </div>
          {currentUser && (
            <div className="flex justify-between mb-2">
              <span className="font-semibold">Discounted Total:</span>
              <span className="text-green-600">
                ${calculateDiscountedTotal()}
              </span>
            </div>
          )}
          {currentUser && (
            <div className="text-sm text-gray-600 mb-2">
              Loyalty Points: {currentUser.loyaltyPoints}
            </div>
          )}
          <button
            onClick={handleCheckout}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Checkout
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Smart Commerce Platform
        </h1>
        <div>
          {currentUser ? (
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Welcome, {currentUser.username}
              </span>
              <button
                onClick={() => setCurrentUser(null)}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
              >
                Logout
              </button>
              <button
                onClick={() => setAdminMode(!adminMode)}
                className="bg-gray-300 hover:bg-gray-400 px-3 py-1 rounded"
              >
                {adminMode ? "User Mode" : "Admin Mode"}
              </button>
            </div>
          ) : (
            renderLogin()
          )}
        </div>
      </div>
      {adminMode && restockNotification && (
        <div className="bg-green-500 text-white p-4 mb-4 rounded-lg">
          {restockNotification}
        </div>
      )}
      {adminMode ? renderAdminProductList() : renderProductList()}
      {currentUser && !adminMode && (
        <div className="flex flex-col md:flex-row mt-8 justify-end ">
          {renderCart()}
        </div>
      )}
    </div>
  );
};

export default SmartCommercePlatform;
