import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";
import { CartProvider } from "@/contexts/CartContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { VendorAuthProvider } from "@/contexts/VendorAuthContext";
import Index from "./pages/Index";
import CategoryPage from "./pages/CategoryPage";
import ProductPage from "./pages/ProductPage";
import AllProductsPage from "./pages/AllProductsPage";
import VendorShopPage from "./pages/VendorShopPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminHeroSlides from "./pages/admin/AdminHeroSlides";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminHomeSections from "./pages/admin/AdminHomeSections";
import AdminSectionsVisibility from "./pages/admin/AdminSectionsVisibility";
import AdminVendors from "./pages/admin/AdminVendors";
import AdminProductApprovals from "./pages/admin/AdminProductApprovals";
import AdminCategoryApprovals from "./pages/admin/AdminCategoryApprovals";
import AdminVendorMessages from "./pages/admin/AdminVendorMessages";
import AdminNavbarCategories from "./pages/admin/AdminNavbarCategories";
import AdminPageBuilder from "./pages/admin/AdminPageBuilder";
import AdminDesignSettings from "./pages/admin/AdminDesignSettings";
import AdminModules from "./pages/admin/AdminModules";
import AdminPaymentSettings from "./pages/admin/AdminPaymentSettings";
import { AdminRoute } from "./pages/admin/AdminRoute";
import VendorLogin from "./pages/vendor/VendorLogin";
import VendorDashboard from "./pages/vendor/VendorDashboard";
import VendorProducts from "./pages/vendor/VendorProducts";
import VendorCategories from "./pages/vendor/VendorCategories";
import VendorMessages from "./pages/vendor/VendorMessages";
import VendorOrders from "./pages/vendor/VendorOrders";
import { VendorRoute } from "./pages/vendor/VendorRoute";
import NotFound from "./pages/NotFound";
import InstallPage from "./pages/InstallPage";
import CustomPage from "./pages/CustomPage";

const queryClient = new QueryClient();

const App = () => (
  
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <VendorAuthProvider>
        <TooltipProvider>
          <CartProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
                {/* Client Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/products" element={<AllProductsPage />} />
                <Route path="/category/:slug" element={<CategoryPage />} />
                <Route path="/product/:id" element={<ProductPage />} />
                <Route path="/shop/:vendorId" element={<VendorShopPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/install" element={<InstallPage />} />
                
                {/* Vendor Routes */}
                <Route path="/vendor" element={<VendorLogin />} />
                <Route path="/vendor/dashboard" element={<VendorRoute><VendorDashboard /></VendorRoute>} />
                <Route path="/vendor/orders" element={<VendorRoute><VendorOrders /></VendorRoute>} />
                <Route path="/vendor/products" element={<VendorRoute><VendorProducts /></VendorRoute>} />
                <Route path="/vendor/categories" element={<VendorRoute><VendorCategories /></VendorRoute>} />
                <Route path="/vendor/messages" element={<VendorRoute><VendorMessages /></VendorRoute>} />
                
                {/* Redirect /login to /admin */}
                <Route path="/login" element={<AdminLogin />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLogin />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
                <Route path="/admin/categories" element={<AdminRoute><AdminCategories /></AdminRoute>} />
                <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
                <Route path="/admin/coupons" element={<AdminRoute><AdminCoupons /></AdminRoute>} />
                <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
                <Route path="/admin/hero" element={<AdminRoute><AdminHeroSlides /></AdminRoute>} />
                <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
                <Route path="/admin/home-sections" element={<AdminRoute><AdminHomeSections /></AdminRoute>} />
                <Route path="/admin/sections-visibility" element={<AdminRoute><AdminSectionsVisibility /></AdminRoute>} />
                <Route path="/admin/vendors" element={<AdminRoute><AdminVendors /></AdminRoute>} />
                <Route path="/admin/product-approvals" element={<AdminRoute><AdminProductApprovals /></AdminRoute>} />
                <Route path="/admin/category-approvals" element={<AdminRoute><AdminCategoryApprovals /></AdminRoute>} />
                <Route path="/admin/vendor-messages" element={<AdminRoute><AdminVendorMessages /></AdminRoute>} />
                <Route path="/admin/navbar-categories" element={<AdminRoute><AdminNavbarCategories /></AdminRoute>} />
                <Route path="/admin/pages" element={<AdminRoute><AdminPageBuilder /></AdminRoute>} />
                <Route path="/admin/design" element={<AdminRoute><AdminDesignSettings /></AdminRoute>} />
                <Route path="/admin/modules" element={<AdminRoute><AdminModules /></AdminRoute>} />
                <Route path="/admin/payment" element={<AdminRoute><AdminPaymentSettings /></AdminRoute>} />
                
                {/* Custom Pages */}
                <Route path="/page/:slug" element={<CustomPage />} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </TooltipProvider>
      </VendorAuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
