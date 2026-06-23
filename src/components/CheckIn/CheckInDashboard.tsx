import React from 'react';

const CheckInDashboard: React.FC = () => {
    return (
        <>
            

<aside className="w-72 h-screen fixed left-0 top-0 bg-surface shadow-sm flex flex-col py-8 px-4 z-50">
<div className="flex items-center gap-3 px-4 mb-10">
<div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center">
<span className="material-symbols-outlined text-white" style="font-variation-settings: 'FILL' 1">event_seat</span>
</div>
<div>
<h1 className="text-headline-md font-headline-md font-bold text-primary">EventHub360</h1>
<p className="text-xs text-on-surface-variant tracking-wider uppercase font-semibold">Hospitality Suite</p>
</div>
</div>
<nav className="flex-1 space-y-2">
<a className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-surface-container-low transition-colors text-on-surface-variant group" href="#">
<span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
<span className="font-medium">Dashboard</span>
</a>
<a className="flex items-center gap-4 px-4 py-3 rounded-xl text-primary font-bold border-r-4 border-primary bg-surface-container-low" href="#">
<span className="material-symbols-outlined" data-icon="qr_code_scanner">qr_code_scanner</span>
<span className="font-medium">QR Scanner</span>
</a>
<a className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-surface-container-low transition-colors text-on-surface-variant group" href="#">
<span className="material-symbols-outlined" data-icon="group">group</span>
<span className="font-medium">Guest List</span>
</a>
<a className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-surface-container-low transition-colors text-on-surface-variant group" href="#">
<span className="material-symbols-outlined" data-icon="layers">layers</span>
<span className="font-medium">Floor Plan</span>
</a>
<a className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-surface-container-low transition-colors text-on-surface-variant group" href="#">
<span className="material-symbols-outlined" data-icon="leaderboard">leaderboard</span>
<span className="font-medium">Analytics</span>
</a>
<a className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-surface-container-low transition-colors text-on-surface-variant group" href="#">
<span className="material-symbols-outlined" data-icon="settings">settings</span>
<span className="font-medium">Settings</span>
</a>
</nav>
<div className="px-4 mb-4">
<button className="w-full py-3 bg-primary-container text-white rounded-xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-md flex items-center justify-center gap-2">
<span className="material-symbols-outlined">add</span>
                New Event
            </button>
</div>
<div className="pt-6 border-t border-border-gray">
<a className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-surface-container-low transition-colors text-on-surface-variant" href="#">
<span className="material-symbols-outlined" data-icon="help">help</span>
<span className="font-medium">Support</span>
</a>
<a className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-surface-container-low transition-colors text-error" href="#">
<span className="material-symbols-outlined" data-icon="logout">logout</span>
<span className="font-medium">Logout</span>
</a>
</div>
</aside>

<main className="ml-72 min-h-screen">

<header className="flex justify-between items-center h-20 px-8 sticky top-0 z-40 backdrop-blur-md bg-white/60 border-b border-border-gray">
<div className="flex items-center gap-8">
<h2 className="font-headline-md text-headline-md text-primary font-bold">Check-in Dashboard</h2>
<nav className="hidden md:flex gap-6">
<a className="text-primary border-b-2 border-primary pb-1 font-label-md text-label-md" href="#">Live View</a>
<a className="text-on-surface-variant hover:text-primary transition-all font-label-md text-label-md" href="#">History</a>
<a className="text-on-surface-variant hover:text-primary transition-all font-label-md text-label-md" href="#">Staff</a>
</nav>
</div>
<div className="flex items-center gap-6">
<div className="relative w-64">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
<input className="w-full pl-10 pr-4 py-2 bg-background-alt border-none rounded-full text-sm focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all" placeholder="Search guests..." type="text"/>
</div>
<div className="flex items-center gap-2">
<button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors relative">
<span className="material-symbols-outlined" data-icon="notifications">notifications</span>
<span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full"></span>
</button>
<button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors">
<span className="material-symbols-outlined" data-icon="help_outline">help_outline</span>
</button>
</div>
<div className="h-10 w-px bg-border-gray mx-2"></div>
<div className="flex items-center gap-3">
<div className="text-right hidden lg:block">
<p className="text-sm font-bold">Julian Rossi</p>
<p className="text-xs text-on-surface-variant">Event Manager</p>
</div>
<div className="w-10 h-10 rounded-full border-2 border-primary-fixed overflow-hidden">
<img className="w-full h-full object-cover" data-alt="Professional headshot of a premium hospitality event manager, wearing a charcoal tailored suit, smiling warmly against a soft-focus luxury hotel lobby background. The lighting is soft and cinematic, with warm golden tones reflecting a boutique brand aesthetic." src="https://lh3.googleusercontent.com/aida-public/AB6AXuATm5r5EdjLf0q2o2-Ua42PFCZGDFI2aYlksyh_3yLwgTokb4tQnaVK6axCiLcEd3rGB7y76YriEzW2jxL9VpFEYI3vjSeCYC4nFFjKFZdO8F2cn0YbFRpSrzdtHmuR46UsQt6MEHzYG0nYoUm4mCCCLQNmpRGEEExkhT6TxC_jM5FWIRYztiEtGXAw0cn8XUZESMP3pCLIf0UI-aI8RBSUwZBLfMftmx-Ir1w687I7XdAyUwyg274xf--5s-uhH-R3L3VhA_Kj1MI"/>
</div>
</div>
</div>
</header>
<div className="p-8 max-w-[1440px] mx-auto space-y-8">

<section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
<div className="bg-white p-6 rounded-[24px] shadow-sm border border-border-gray hover:shadow-md transition-shadow">
<div className="flex justify-between items-start mb-4">
<div className="p-3 bg-surface-container-low rounded-xl text-primary">
<span className="material-symbols-outlined">group</span>
</div>
<span className="text-xs font-bold text-emerald-green bg-emerald-green/10 px-2 py-1 rounded-full">+12%</span>
</div>
<p className="text-on-surface-variant text-label-sm uppercase tracking-wider mb-1">Total Expected</p>
<h3 className="text-headline-lg font-headline-lg text-on-surface">2,450</h3>
</div>
<div className="bg-white p-6 rounded-[24px] shadow-sm border border-border-gray hover:shadow-md transition-shadow">
<div className="flex justify-between items-start mb-4">
<div className="p-3 bg-surface-container-low rounded-xl text-sunset-orange">
<span className="material-symbols-outlined">how_to_reg</span>
</div>
<div className="flex -space-x-2">
<div className="w-6 h-6 rounded-full border-2 border-white bg-surface-container"></div>
<div className="w-6 h-6 rounded-full border-2 border-white bg-surface-container-high"></div>
</div>
</div>
<p className="text-on-surface-variant text-label-sm uppercase tracking-wider mb-1">Current Attendance</p>
<div className="flex items-end gap-2">
<h3 className="text-headline-lg font-headline-lg text-on-surface">68%</h3>
<p className="text-sm text-on-surface-variant mb-1.5">(1,668 guests)</p>
</div>
</div>
<div className="bg-white p-6 rounded-[24px] shadow-sm border border-border-gray hover:shadow-md transition-shadow">
<div className="flex justify-between items-start mb-4">
<div className="p-3 bg-surface-container-low rounded-xl text-secondary">
<span className="material-symbols-outlined">stars</span>
</div>
<span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
</div>
<p className="text-on-surface-variant text-label-sm uppercase tracking-wider mb-1">VIPs On-Site</p>
<h3 className="text-headline-lg font-headline-lg text-on-surface">142<span className="text-on-surface-variant text-body-lg">/180</span></h3>
</div>
<div className="bg-white p-6 rounded-[24px] shadow-sm border border-border-gray hover:shadow-md transition-shadow">
<div className="flex justify-between items-start mb-4">
<div className="p-3 bg-surface-container-low rounded-xl text-tertiary">
<span className="material-symbols-outlined">speed</span>
</div>
<span className="text-xs font-bold text-on-surface-variant">Real-time</span>
</div>
<p className="text-on-surface-variant text-label-sm uppercase tracking-wider mb-1">Peak Flow Rate</p>
<h3 className="text-headline-lg font-headline-lg text-on-surface">18 <span className="text-on-surface-variant text-body-lg">p/min</span></h3>
</div>
</section>

<div className="grid grid-cols-12 gap-8">

<div className="col-span-12 lg:col-span-4 space-y-8">

<section className="bg-white p-6 rounded-[24px] shadow-sm border border-border-gray overflow-hidden">
<div className="flex justify-between items-center mb-6">
<h4 className="font-headline-md text-headline-md">Live QR Scanner</h4>
<span className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-green/10 text-emerald-green text-xs font-bold">
<span className="w-2 h-2 rounded-full bg-emerald-green animate-ping"></span> Active
                            </span>
</div>
<div className="relative aspect-square w-full bg-black rounded-2xl overflow-hidden mb-6 border-4 border-white shadow-inner group">

<div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
<div className="absolute inset-8 border-2 border-white/30 rounded-3xl flex items-center justify-center">
<div className="w-48 h-48 border-2 border-dashed border-white/50 rounded-2xl"></div>
</div>
<div className="scanning-line absolute w-full z-10"></div>

<div className="absolute inset-0 bg-emerald-green/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
<div className="bg-white p-4 rounded-full pulse-success">
<span className="material-symbols-outlined text-emerald-green text-4xl">check_circle</span>
</div>
</div>
</div>
<div className="space-y-4">
<button className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg flex items-center justify-center gap-2">
<span className="material-symbols-outlined">qr_code_2</span>
                                Rescan QR Code
                            </button>
<button className="w-full py-4 bg-background-alt text-on-surface font-semibold rounded-xl hover:bg-surface-container transition-all flex items-center justify-center gap-2">
<span className="material-symbols-outlined">keyboard</span>
                                Manual Check-in
                            </button>
</div>
</section>

<section className="bg-white p-6 rounded-[24px] shadow-sm border border-border-gray">
<h4 className="font-headline-md text-headline-md mb-6">VIP Arrival Alerts</h4>
<div className="space-y-4">
<div className="flex items-center gap-4 p-4 rounded-2xl bg-secondary-container/20 border border-secondary-container/30">
<div className="w-12 h-12 rounded-full bg-white border border-secondary flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-secondary">workspace_premium</span>
</div>
<div className="flex-1">
<div className="flex justify-between items-start">
<h5 className="font-bold text-sm">Elena Valance</h5>
<span className="text-[10px] bg-secondary text-white px-2 py-0.5 rounded-full uppercase font-bold">Platinum</span>
</div>
<p className="text-xs text-on-surface-variant">Table 12 • Main Hallway Entrance</p>
<p className="text-[10px] text-on-surface-variant mt-1 italic">Arrived 2m ago</p>
</div>
</div>
<div className="flex items-center gap-4 p-4 rounded-2xl border border-border-gray">
<div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-on-surface-variant">person</span>
</div>
<div className="flex-1">
<div className="flex justify-between items-start">
<h5 className="font-bold text-sm">Sir Richard Branson</h5>
<span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full uppercase font-bold">Keynote</span>
</div>
<p className="text-xs text-on-surface-variant">Green Room • VIP Gate</p>
<p className="text-[10px] text-on-surface-variant mt-1 italic">Arrived 5m ago</p>
</div>
</div>
<div className="flex items-center gap-4 p-4 rounded-2xl border border-border-gray">
<div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-on-surface-variant">person</span>
</div>
<div className="flex-1">
<div className="flex justify-between items-start">
<h5 className="font-bold text-sm">Aria Chen</h5>
<span className="text-[10px] bg-tertiary text-white px-2 py-0.5 rounded-full uppercase font-bold">Gold</span>
</div>
<p className="text-xs text-on-surface-variant">Table 04 • North Gate</p>
<p className="text-[10px] text-on-surface-variant mt-1 italic">Arrived 12m ago</p>
</div>
</div>
</div>
</section>
</div>

<div className="col-span-12 lg:col-span-8 space-y-8">

<section className="bg-white p-6 rounded-[24px] shadow-sm border border-border-gray">
<div className="flex justify-between items-center mb-8">
<div>
<h4 className="font-headline-md text-headline-md">Check-in Trend</h4>
<p className="text-body-sm text-on-surface-variant">Velocity tracking for peak management</p>
</div>
<div className="flex gap-2">
<button className="px-4 py-1.5 text-xs font-bold bg-surface-container rounded-full">Hourly</button>
<button className="px-4 py-1.5 text-xs font-bold text-on-surface-variant hover:bg-surface-container transition-colors rounded-full">Real-time</button>
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
<div className="md:col-span-3 h-64 relative">

<div className="absolute inset-0 flex items-end justify-between gap-1 px-4">
<div className="w-full bg-primary/10 rounded-t-lg transition-all hover:bg-primary/30" style="height: 30%"></div>
<div className="w-full bg-primary/10 rounded-t-lg transition-all hover:bg-primary/30" style="height: 45%"></div>
<div className="w-full bg-primary/10 rounded-t-lg transition-all hover:bg-primary/30" style="height: 60%"></div>
<div className="w-full bg-primary/10 rounded-t-lg transition-all hover:bg-primary/30" style="height: 85%"></div>
<div className="w-full bg-primary/20 rounded-t-lg transition-all hover:bg-primary/40 border-t-2 border-primary" style="height: 100%"></div>
<div className="w-full bg-primary/20 rounded-t-lg transition-all hover:bg-primary/40 border-t-2 border-primary" style="height: 90%"></div>
<div className="w-full bg-primary/10 rounded-t-lg transition-all hover:bg-primary/30" style="height: 50%"></div>
<div className="w-full bg-primary/10 rounded-t-lg transition-all hover:bg-primary/30" style="height: 35%"></div>
</div>
<div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
<div className="w-full h-px border-b border-dashed border-border-gray"></div>
<div className="w-full h-px border-b border-dashed border-border-gray"></div>
<div className="w-full h-px border-b border-dashed border-border-gray"></div>
<div className="w-full h-px border-b border-dashed border-border-gray"></div>
</div>
</div>
<div className="flex flex-col items-center justify-center p-6 bg-background-alt rounded-3xl border border-border-gray">
<div className="relative w-32 h-32 flex items-center justify-center mb-4">
<svg className="w-full h-full -rotate-90">
<circle className="text-surface-container-high" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" stroke-width="12"></circle>
<circle className="text-primary" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" stroke-dasharray="364" stroke-dashoffset="116" stroke-linecap="round" stroke-width="12"></circle>
</svg>
<div className="absolute inset-0 flex flex-col items-center justify-center">
<span className="text-2xl font-bold">68%</span>
<span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-tighter">Capacity</span>
</div>
</div>
<p className="text-center text-xs font-medium text-on-surface-variant">Estimated completion by 20:30</p>
</div>
</div>
</section>

<section className="grid grid-cols-1 md:grid-cols-3 gap-6">
<div className="bg-white p-5 rounded-[24px] border border-border-gray flex items-center gap-4">
<div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center">
<span className="material-symbols-outlined text-primary">gate</span>
</div>
<div>
<p className="text-xs font-bold text-on-surface-variant uppercase mb-1">North Gate</p>
<div className="flex items-center gap-3">
<h5 className="text-xl font-bold">412</h5>
<span className="text-[10px] text-emerald-green font-bold">Clear Flow</span>
</div>
</div>
</div>
<div className="bg-white p-5 rounded-[24px] border border-border-gray flex items-center gap-4">
<div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center">
<span className="material-symbols-outlined text-sunset-orange">meeting_room</span>
</div>
<div>
<p className="text-xs font-bold text-on-surface-variant uppercase mb-1">Main Ballroom</p>
<div className="flex items-center gap-3">
<h5 className="text-xl font-bold">894</h5>
<span className="text-[10px] text-error font-bold">Queuing (12m)</span>
</div>
</div>
</div>
<div className="bg-white p-5 rounded-[24px] border border-border-gray flex items-center gap-4">
<div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center">
<span className="material-symbols-outlined text-secondary">local_bar</span>
</div>
<div>
<p className="text-xs font-bold text-on-surface-variant uppercase mb-1">VIP Lounge</p>
<div className="flex items-center gap-3">
<h5 className="text-xl font-bold">142</h5>
<span className="text-[10px] text-emerald-green font-bold">Fast Lane</span>
</div>
</div>
</div>
</section>

<section className="bg-white rounded-[24px] shadow-sm border border-border-gray overflow-hidden">
<div className="px-6 py-6 border-b border-border-gray flex justify-between items-center">
<h4 className="font-headline-md text-headline-md">Recent Check-ins</h4>
<button className="text-sm font-bold text-primary hover:underline">View All Logs</button>
</div>
<div className="overflow-x-auto">
<table className="w-full text-left">
<thead className="bg-background-alt text-on-surface-variant text-label-sm uppercase">
<tr>
<th className="px-6 py-4">Guest Name</th>
<th className="px-6 py-4">Check-in Time</th>
<th className="px-6 py-4">Entrance</th>
<th className="px-6 py-4">Status</th>
<th className="px-6 py-4 text-right">Actions</th>
</tr>
</thead>
<tbody className="divide-y divide-border-gray">
<tr className="hover:bg-surface-container-low transition-colors">
<td className="px-6 py-4">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-bold text-xs">MW</div>
<span className="font-semibold text-sm">Marcus Wright</span>
</div>
</td>
<td className="px-6 py-4 text-sm text-on-surface-variant">19:42:01</td>
<td className="px-6 py-4 text-sm">Main Ballroom</td>
<td className="px-6 py-4">
<span className="px-3 py-1 rounded-full bg-emerald-green/10 text-emerald-green text-[10px] font-bold uppercase">Success</span>
</td>
<td className="px-6 py-4 text-right">
<button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-lg">
<span className="material-symbols-outlined text-sm">more_vert</span>
</button>
</td>
</tr>
<tr className="hover:bg-surface-container-low transition-colors">
<td className="px-6 py-4">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-full bg-surface-dim text-on-surface flex items-center justify-center font-bold text-xs">SK</div>
<span className="font-semibold text-sm">Sarah Koenig</span>
</div>
</td>
<td className="px-6 py-4 text-sm text-on-surface-variant">19:41:45</td>
<td className="px-6 py-4 text-sm">North Gate</td>
<td className="px-6 py-4">
<span className="px-3 py-1 rounded-full bg-emerald-green/10 text-emerald-green text-[10px] font-bold uppercase">Success</span>
</td>
<td className="px-6 py-4 text-right">
<button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-lg">
<span className="material-symbols-outlined text-sm">more_vert</span>
</button>
</td>
</tr>
<tr className="hover:bg-surface-container-low transition-colors">
<td className="px-6 py-4">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-full bg-error-container text-error flex items-center justify-center font-bold text-xs">JR</div>
<span className="font-semibold text-sm">James Rockford</span>
</div>
</td>
<td className="px-6 py-4 text-sm text-on-surface-variant">19:40:58</td>
<td className="px-6 py-4 text-sm">Main Ballroom</td>
<td className="px-6 py-4">
<span className="px-3 py-1 rounded-full bg-error/10 text-error text-[10px] font-bold uppercase">Flagged</span>
</td>
<td className="px-6 py-4 text-right">
<button className="px-3 py-1.5 bg-primary text-white text-[10px] font-bold rounded-lg hover:opacity-90">Review</button>
</td>
</tr>
<tr className="hover:bg-surface-container-low transition-colors">
<td className="px-6 py-4">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-xs">LB</div>
<span className="font-semibold text-sm">Linda Blair</span>
</div>
</td>
<td className="px-6 py-4 text-sm text-on-surface-variant">19:39:12</td>
<td className="px-6 py-4 text-sm">VIP Lounge</td>
<td className="px-6 py-4">
<span className="px-3 py-1 rounded-full bg-emerald-green/10 text-emerald-green text-[10px] font-bold uppercase">Success</span>
</td>
<td className="px-6 py-4 text-right">
<button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-lg">
<span className="material-symbols-outlined text-sm">more_vert</span>
</button>
</td>
</tr>
</tbody>
</table>
</div>
</section>
</div>
</div>
</div>
</main>

<div className="fixed bottom-8 right-8 z-[100] space-y-4" id="toast-container"></div>


        </>
    );
};

export default CheckInDashboard;
