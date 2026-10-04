import { ArrowUpRight, Leaf } from 'lucide-react';
import { NavLink } from 'react-router-dom';
const NAV = [{to:'/',label:'01 / Diagnose',end:true},{to:'/overview',label:'02 / The model',end:false},{to:'/metrics',label:'03 / Performance',end:false}];
export default function Sidebar(){return <header className="site-nav"><NavLink to="/" className="brand"><Leaf size={28} strokeWidth={1.3}/><span>Leaflytics<span className="brand-period">.</span></span></NavLink><nav aria-label="Main navigation">{NAV.map(n=><NavLink key={n.to} to={n.to} end={n.end} className={({isActive})=>isActive?'nav-item active':'nav-item'}>{n.label}</NavLink>)}</nav><span className="nav-meta">PLANT INTELLIGENCE <ArrowUpRight size={15}/></span></header>}
