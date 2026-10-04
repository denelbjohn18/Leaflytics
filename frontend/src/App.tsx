import { AnimatePresence,motion } from 'framer-motion';
import { Outlet,useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
export default function App(){const location=useLocation();return <div className="app-shell"><Sidebar/><main className="page-main"><AnimatePresence mode="wait"><motion.div key={location.pathname} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:.18}}><Outlet/></motion.div></AnimatePresence></main><footer className="site-footer"><span>Leaflytics / Plant intelligence</span><span>Built for a closer look at the natural world.</span><span>RESEARCH MODEL · V1.0</span></footer></div>}
