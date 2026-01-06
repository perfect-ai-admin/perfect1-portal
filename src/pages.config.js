import About from './pages/About';
import Contact from './pages/Contact';
import Home from './pages/Home';
import OsekPatur from './pages/OsekPatur';
import OsekPaturOnline from './pages/OsekPaturOnline';
import Pricing from './pages/Pricing';
import ProfessionLanding from './pages/ProfessionLanding';
import ProfessionPage from './pages/ProfessionPage';
import Professions from './pages/Professions';
import SEOOptimized from './pages/SEOOptimized';
import ServicePage from './pages/ServicePage';
import Services from './pages/Services';
import TechnicianLanding from './pages/TechnicianLanding';
import UrgentInvoice from './pages/UrgentInvoice';
import FreelancerLanding from './pages/FreelancerLanding';
import GraphicDesignerLanding from './pages/GraphicDesignerLanding';
import PhotographerLanding from './pages/PhotographerLanding';
import FitnessTrainerLanding from './pages/FitnessTrainerLanding';
import __Layout from './Layout.jsx';


export const PAGES = {
    "About": About,
    "Contact": Contact,
    "Home": Home,
    "OsekPatur": OsekPatur,
    "OsekPaturOnline": OsekPaturOnline,
    "Pricing": Pricing,
    "ProfessionLanding": ProfessionLanding,
    "ProfessionPage": ProfessionPage,
    "Professions": Professions,
    "SEOOptimized": SEOOptimized,
    "ServicePage": ServicePage,
    "Services": Services,
    "TechnicianLanding": TechnicianLanding,
    "UrgentInvoice": UrgentInvoice,
    "FreelancerLanding": FreelancerLanding,
    "GraphicDesignerLanding": GraphicDesignerLanding,
    "PhotographerLanding": PhotographerLanding,
    "FitnessTrainerLanding": FitnessTrainerLanding,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};