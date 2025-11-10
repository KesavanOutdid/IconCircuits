import { Routes, Route } from "react-router-dom";
import Hero from "./pages/Hero";
import About from "./pages/About";
import PcbDesign from "./pages/PcbDesign";
import Fabrication from "./pages/Fabrication";
import Contact from "./pages/Contact";
import ScrollToTop from "./components/ScrollToTop"; 

function App() {
    return (
        <>
            <ScrollToTop /> 
            <Routes>
                <Route path="/" element={<Hero />} />
                <Route path="/about" element={<About />} />
                <Route path="/pcb-design" element={<PcbDesign />} />
                <Route path="/fabrication" element={<Fabrication />} />
                <Route path="/contact" element={<Contact />} />
            </Routes>
        </>
    );
}

export default App;
