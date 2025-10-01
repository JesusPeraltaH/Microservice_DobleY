// src/app/sales/create/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { inventoryService, Product } from '@/services/inventoryService';
import { orderService } from '@/services/orderService';
import { MICROSERVICES } from '@/config/microservices';

interface CartItem {
  product: Product;
  quantity: number;
}

interface User {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  createdAt: string;
  name?: string; // Para compatibilidad con diferentes estructuras
}

export default function CreateSalePage() {
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [usersLoading, setUsersLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      // Cargar usuarios primero
      await fetchRegisteredUsers();
      // Luego cargar productos
      await fetchProducts();
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const productsData = await inventoryService.getProducts();
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchRegisteredUsers = async () => {
    try {
      setUsersLoading(true);
      console.log('Fetching users from:', `${process.env.NEXT_PUBLIC_USERS_SERVICE_URL}/api/users`);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_USERS_SERVICE_URL}/api/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const users = await response.json();
        console.log('Users fetched successfully:', users);
        
        // Normalizar la estructura de usuarios
        const normalizedUsers = users.map((user: any) => ({
          _id: user._id,
          firstName: user.firstName || user.name || '',
          lastName: user.lastName || '',
          email: user.email,
          createdAt: user.createdAt
        }));
        
        setRegisteredUsers(normalizedUsers);
      } else {
        console.error('Error response:', response.status, response.statusText);
        setRegisteredUsers(getSampleUsers());
      }
    } catch (error) {
      console.error('Error fetching users from microservice:', error);
      setRegisteredUsers(getSampleUsers());
    } finally {
      setUsersLoading(false);
    }
  };

  // Datos de prueba para desarrollo
  const getSampleUsers = (): User[] => {
    return [
      {
        _id: '1',
        firstName: 'Juan',
        lastName: 'Perez',
        email: 'juan@gmail.com',
        createdAt: '2024-01-01'
      },
      {
        _id: '2', 
        firstName: 'Pedrito',
        lastName: 'Sayxs',
        email: 'pedrito@gmail.com',
        createdAt: '2024-01-01'
      }
    ];
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product._id === product._id);

    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(cart.map(item =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      }
    } else {
      if (product.stock > 0) {
        setCart([...cart, { product, quantity: 1 }]);
      }
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product._id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const product = products.find(p => p._id === productId);
    if (product && quantity <= product.stock) {
      setCart(cart.map(item =>
        item.product._id === productId
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getDiscountAmount = () => {
    if (!appliedCoupon) return 0;
    const subtotal = getTotal();
    return (subtotal * appliedCoupon.discount) / 100;
  };

  const getFinalTotal = () => {
    const subtotal = getTotal();
    const discount = getDiscountAmount();
    return Math.max(0, subtotal - discount);
  };

  const handleUserSelect = (userEmail: string, userName: string) => {
    setCustomerEmail(userEmail);
    setCustomerName(userName);
    setUserSearchTerm(userEmail);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Por favor ingresa un código de cupón');
      return;
    }

    setCouponLoading(true);
    setCouponError('');

    try {
      // First validate the coupon
      const validateResponse = await fetch(`${MICROSERVICES.COUPONS}/api/coupons/validate/${couponCode.toUpperCase()}`);
      const validateResult = await validateResponse.json();

      if (!validateResult.valid) {
        setCouponError(validateResult.message || 'Cupón no válido');
        return;
      }

      // If validation passes, apply the coupon (increment usage count)
      const applyResponse = await fetch(`${MICROSERVICES.COUPONS}/api/coupons/apply/${couponCode.toUpperCase()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const applyResult = await applyResponse.json();

      if (applyResult.success) {
        setAppliedCoupon({
          code: validateResult.coupon.code,
          discount: validateResult.coupon.discount,
          id: validateResult.coupon._id || validateResult.coupon.id
        });
        setCouponCode('');
        setCouponError('');
      } else {
        setCouponError(applyResult.message || 'Error al aplicar el cupón');
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      setCouponError('Error de conexión al aplicar el cupón');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  // 🔥 NUEVA FUNCIÓN: Actualizar inventario
  const updateInventory = async (items: any[]) => {
    try {
      for (const item of items) {
        console.log('Actualizando inventario para:', item.productName, 'Cantidad:', item.quantity);
        
        // Llamar al servicio de inventario para actualizar el stock
        const response = await fetch(`${process.env.NEXT_PUBLIC_INVENTORY_SERVICE_URL}/api/products/${item.productId}/stock`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            quantity: item.quantity,
            operation: 'decrement' // Reducir el stock
          })
        });

        if (response.ok) {
          console.log('✅ Inventario actualizado para:', item.productName);
        } else {
          console.error('❌ Error actualizando inventario para:', item.productName);
        }
      }
    } catch (error) {
      console.error('Error actualizando inventario:', error);
    }
  };

  const handleCheckout = async () => {
  if (cart.length === 0) {
    alert('El carrito está vacío');
    return;
  }

  if (!customerName.trim()) {
    alert('Por favor selecciona un cliente de la lista');
    return;
  }

  // Verificar stock antes de proceder
  for (const item of cart) {
    if (item.quantity > item.product.stock) {
      alert(`Stock insuficiente para ${item.product.name}. Disponible: ${item.product.stock}, Solicitado: ${item.quantity}`);
      return;
    }
  }

  try {
    const orderData = {
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim() || 'no-email@microstore.com',
      items: cart.map(item => ({
        productId: item.product._id,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.product.price
      })),
      total: getTotal(),
      totalAfterDiscount: getFinalTotal(),
      discountApplied: getDiscountAmount(),
      couponCode: appliedCoupon?.code || null,
      couponId: appliedCoupon?.couponId || null,
      couponDiscount: appliedCoupon?.discount || null,
      status: 'completed',
      paymentMethod: 'cash',
      date: new Date().toISOString()
    };

    console.log('🚀 Iniciando proceso de venta...');
    console.log('📊 Datos de la orden:', orderData);

    // 🔥 ESTA ES LA LLAMADA IMPORTANTE
    // El order-service se encarga de TODO: crear orden + reducir inventario
    const result = await orderService.createOrder(orderData);
    
    console.log('✅ Venta completada exitosamente:', result);

    alert('¡Venta realizada con éxito! El inventario ha sido actualizado automáticamente.');
    
    // Limpiar el carrito y estado
    setCart([]);
    setCustomerName('');
    setCustomerEmail('');
    setUserSearchTerm('');
    setCouponCode('');
    setAppliedCoupon(null);
    setCouponError('');
    
    // Recargar productos para mostrar stock actualizado
    await fetchProducts();
    
    // Redirigir a órdenes después de 2 segundos
    setTimeout(() => {
      router.push('/orders');
    }, 2000);
    
  } catch (err: any) {
    console.error('💥 Error procesando venta:', err);
    alert(`Error al procesar la venta: ${err.message}`);
  }
};

  // 🔥 FILTRO CORREGIDO: Manejar propiedades undefined
  const filteredUsers = userSearchTerm 
    ? registeredUsers.filter(user => {
        const searchTermLower = userSearchTerm.toLowerCase();
        const email = user.email?.toLowerCase() || '';
        const firstName = user.firstName?.toLowerCase() || '';
        const lastName = user.lastName?.toLowerCase() || '';
        
        return email.includes(searchTermLower) ||
               firstName.includes(searchTermLower) ||
               lastName.includes(searchTermLower);
      })
    : registeredUsers;

  const filteredProducts = products.filter(product => {
    const searchTermLower = searchTerm.toLowerCase();
    const name = product.name?.toLowerCase() || '';
    const description = product.description?.toLowerCase() || '';
    
    return name.includes(searchTermLower) || description.includes(searchTermLower);
  });

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isAuthenticated={true} userEmail={user.email} showMobileMenu={false} />

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-black">Nueva Venta</h1>
          <button
            onClick={() => router.push('/sales')}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 text-sm font-medium"
          >
            Volver a Ventas
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel de Productos */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h2 className="text-lg font-semibold mb-4 text-black">Productos Disponibles</h2>

              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {filteredProducts.map(product => (
                  <div key={product._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md">
                    <h3 className="font-medium text-black">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-lg font-bold text-blue-600">${product.price}</span>
                        <span className="text-sm text-gray-500 ml-2">Stock: {product.stock}</span>
                      </div>
                      <button
                        onClick={() => addToCart(product)}
                        disabled={product.stock === 0}
                        className={`px-3 py-1 rounded text-sm ${product.stock === 0
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                      >
                        {product.stock === 0 ? 'Sin stock' : 'Agregar'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Panel del Carrito */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow sticky top-6">
              <h2 className="text-lg font-semibold mb-4 text-black">Carrito de Venta</h2>

              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay productos en el carrito</p>
              ) : (
                <>
                  <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                    {cart.map(item => (
                      <div key={item.product._id} className="flex justify-between items-center border-b pb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm text-black">{item.product.name}</h4>
                          <p className="text-gray-500 text-sm">${item.product.price} c/u</p>
                          <p className="text-xs text-gray-400">Stock disponible: {item.product.stock}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                            className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-black"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-black">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                            className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center disabled:opacity-50 text-black"
                          >
                            +
                          </button>
                          <span className="w-16 text-right font-medium text-black">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </span>
                          <button
                            onClick={() => removeFromCart(item.product._id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Lista de usuarios registrados */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-black mb-2">
                      Seleccionar cliente registrado:
                    </label>
                    
                    <input
                      type="text"
                      placeholder="Buscar por email, nombre o apellido..."
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-black mb-3"
                    />

                    {usersLoading ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-gray-600 text-sm mt-2">Cargando usuarios...</p>
                      </div>
                    ) : (
                      <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md">
                        {filteredUsers.length === 0 ? (
                          <p className="text-gray-500 text-sm text-center py-4">
                            {userSearchTerm ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
                          </p>
                        ) : (
                          <div className="divide-y divide-gray-200">
                            {filteredUsers.map((user) => (
                              <div
                                key={user._id}
                                className={`p-3 cursor-pointer hover:bg-gray-50 ${
                                  customerEmail === user.email ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                                }`}
                                onClick={() => handleUserSelect(
                                  user.email, 
                                  `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email
                                )}
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="text-sm font-medium text-black">
                                      {user.firstName && user.lastName 
                                        ? `${user.firstName} ${user.lastName}`
                                        : user.email
                                      }
                                    </p>
                                    <p className="text-xs text-gray-600">{user.email}</p>
                                  </div>
                                  {customerEmail === user.email && (
                                    <span className="text-green-600 text-sm font-medium">✓ Seleccionado</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Cupón */}
                  <div className="mb-4">
                    {appliedCoupon ? (
                      <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium text-green-800">
                              ✅ Cupón aplicado: {appliedCoupon.code}
                            </p>
                            <p className="text-sm text-green-700">
                              Descuento: {appliedCoupon.discount}%
                            </p>
                          </div>
                          <button
                            onClick={handleRemoveCoupon}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder="Código de cupón"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                          disabled={couponLoading}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm text-black disabled:opacity-50"
                        />
                        <button
                          onClick={handleApplyCoupon}
                          disabled={couponLoading || !couponCode.trim()}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
                        >
                          {couponLoading ? 'Aplicando...' : 'Aplicar'}
                        </button>
                      </div>
                    )}
                    
                    {couponError && (
                      <div className="mt-2 bg-red-50 border border-red-200 rounded-md p-2">
                        <p className="text-sm text-red-600">{couponError}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 border-t pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="text-gray-600">${getTotal().toFixed(2)}</span>
                    </div>
                    
                    {appliedCoupon && (
                      <>
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Descuento ({appliedCoupon.discount}%):</span>
                          <span>-${getDiscountAmount().toFixed(2)}</span>
                        </div>
                        <div className="border-t pt-2">
                          <div className="flex justify-between font-semibold text-lg">
                            <span className="text-black">Total:</span>
                            <span className="text-black">${getFinalTotal().toFixed(2)}</span>
                          </div>
                        </div>
                      </>
                    )}
                    
                    {!appliedCoupon && (
                      <div className="flex justify-between font-semibold text-lg">
                        <span className="text-black">Total:</span>
                        <span className="text-black">${getTotal().toFixed(2)}</span>
                      </div>
                    )}

                    {customerName && (
                      <div className="bg-green-50 border border-green-200 rounded-md p-3">
                        <p className="text-sm font-medium text-green-800">Cliente seleccionado:</p>
                        <p className="text-sm text-green-700">{customerName}</p>
                        <p className="text-xs text-green-600">{customerEmail}</p>
                      </div>
                    )}

                    <button
                      onClick={handleCheckout}
                      disabled={cart.length === 0 || !customerName.trim()}
                      className={`w-full py-2 rounded-md font-medium ${
                        cart.length === 0 || !customerName.trim()
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {cart.length === 0 
                        ? 'Carrito vacío' 
                        : !customerName.trim() 
                          ? 'Selecciona un cliente' 
                          : 'Procesar Venta'
                      }
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}