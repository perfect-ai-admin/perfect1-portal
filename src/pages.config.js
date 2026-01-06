import About from './pages/About';
import Contact from './pages/Contact';
import Home from './pages/Home';
import Pricing from './pages/Pricing';
import ProfessionPage from './pages/ProfessionPage';
import Professions from './pages/Professions';
import ServicePage from './pages/ServicePage';
import Services from './pages/Services';
import ProfessionLanding from './pages/ProfessionLanding';
import SEOOptimized from './pages/SEOOptimized';
import __Layout from './Layout.jsx';


export const PAGES = {
    "About": About,
    "Contact": Contact,
    "Home": Home,
    "Pricing": Pricing,
    "ProfessionPage": ProfessionPage,
    "Professions": Professions,
    "ServicePage": ServicePage,
    "Services": Services,
    "ProfessionLanding": ProfessionLanding,
    "SEOOptimized": SEOOptimized,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};