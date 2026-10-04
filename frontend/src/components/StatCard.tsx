import { HTMLAttributes } from 'react';
import { LucideIcon } from 'lucide-react';
type Props=HTMLAttributes<HTMLDivElement>&{label:string;value:string|number;subtext?:string;unit?:string;icon?:LucideIcon;accent?:string};
export default function StatCard({label,value,subtext,unit,icon:Icon,accent:_,className='',...rest}:Props){return <div {...rest} className={`stat-card ${className}`}><div className="stat-label">{label}{Icon&&<Icon size={15} strokeWidth={1.4}/>}</div><p className="stat-value">{value}<span>{unit}</span></p>{subtext&&<p>{subtext}</p>}</div>}
