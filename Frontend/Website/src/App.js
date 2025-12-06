import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import ScrollToTop from "./components/ScrollToTop";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import LoadingFallback from "./components/LoadingFallback";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

const Hero = lazy(() => import("./pages/Hero"));
const About = lazy(() => import("./pages/About"));
const PcbDesign = lazy(() => import("./pages/PcbDesign"));
const PCBLayout = lazy(() => import("./pages/PCBLayout"));
const Fabrication = lazy(() => import("./pages/Fabrication"));
const Assembly = lazy(() => import("./pages/Assembly"));
const MechanicalDesign = lazy(() => import("./pages/MechanicalDesign"));
const Contact = lazy(() => import("./pages/Contact"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Profile = lazy(() => import("./pages/Profile"));
const Cart = lazy(() => import("./pages/Cart"));
const Orders = lazy(() => import("./pages/Orders"));

function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <ScrollToTop /> 
                <Suspense fallback={<LoadingFallback />}>
                    <Routes>
                        <Route path="/" element={<Hero />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/pcb-design" element={<PcbDesign />} />
                        <Route path="/pcb-layout" element={<PCBLayout />} />
                        <Route path="/fabrication" element={<Fabrication />} />
                        <Route path="/assembly" element={<Assembly />} />
                        <Route path="/mechanical-design" element={<MechanicalDesign />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                    </Routes>
                </Suspense>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;
