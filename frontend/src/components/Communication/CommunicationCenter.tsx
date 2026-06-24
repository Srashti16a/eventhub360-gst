import React from 'react';

const CommunicationCenter: React.FC = () => {
    return (
        <>
            

<aside className="h-screen w-64 fixed left-0 top-0 flex flex-col bg-surface-container-lowest dark:bg-inverse-surface border-r border-border-gray dark:border-outline-variant shadow-sm z-50">
<div className="flex flex-col h-full py-6">
<div className="px-6 mb-10">
<h1 className="font-headline-md text-headline-md font-bold text-primary dark:text-inverse-primary">EventHub360</h1>
<p className="font-body-sm text-body-sm text-on-surface-variant opacity-70">Enterprise Suite</p>
</div>
<nav className="flex-1 px-3 space-y-1">
<a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant dark:text-surface-variant hover:bg-surface-container-low transition-colors duration-200 rounded-xl group" href="#">
<span className="material-symbols-outlined group-hover:text-primary">dashboard</span>
<span className="font-label-md text-label-md">Dashboard</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant dark:text-surface-variant hover:bg-surface-container-low transition-colors duration-200 rounded-xl group" href="#">
<span className="material-symbols-outlined group-hover:text-primary">group</span>
<span className="font-label-md text-label-md">Guests</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant dark:text-surface-variant hover:bg-surface-container-low transition-colors duration-200 rounded-xl group" href="#">
<span className="material-symbols-outlined group-hover:text-primary">local_shipping</span>
<span className="font-label-md text-label-md">Logistics</span>
</a>

<a className="flex items-center gap-3 px-4 py-3 text-primary dark:text-inverse-primary bg-secondary-container/30 dark:bg-secondary-container/10 border-r-4 border-primary transition-transform active:scale-95 rounded-r-xl" href="#">
<span className="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">chat</span>
<span className="font-label-md text-label-md font-bold">Comm Center</span>
</a>
</nav>
<div className="px-6 mt-auto space-y-4">
<button className="coral-gradient w-full py-4 rounded-2xl text-white font-label-md flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] transition-transform">
<span className="material-symbols-outlined">add</span>
                    New Event
                </button>
<div className="pt-6 border-t border-border-gray">
<a className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:text-primary transition-colors" href="#">
<span className="material-symbols-outlined">settings</span>
<span className="font-label-md text-label-md">Settings</span>
</a>
<a className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:text-primary transition-colors mt-1" href="#">
<span className="material-symbols-outlined">help_outline</span>
<span className="font-label-md text-label-md">Support</span>
</a>
</div>
</div>
</div>
</aside>

<header className="fixed top-0 right-0 w-[calc(100%-16rem)] z-40 bg-off-white/80 dark:bg-on-surface/80 backdrop-blur-md border-b border-border-gray dark:border-outline-variant">
<div className="flex justify-between items-center h-16 px-8 ml-0">
<div className="flex items-center gap-8">
<h2 className="font-headline-md text-headline-md font-black text-primary">Communication Center</h2>
<div className="relative group">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">search</span>
<input className="bg-background-alt border-none rounded-full pl-10 pr-4 py-2 text-body-sm w-64 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all" placeholder="Search campaigns..." type="text"/>
</div>
</div>
<nav className="flex items-center gap-6">
<div className="flex items-center gap-6 mr-4">
<a className="text-primary dark:text-inverse-primary font-bold border-b-2 border-primary pb-1 font-body-sm" href="#">Inbox</a>
<a className="text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors font-body-sm" href="#">Broadcasts</a>
<a className="text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors font-body-sm" href="#">Templates</a>
</div>
<div className="flex items-center gap-3">
<button className="p-2 hover:bg-surface-container-low rounded-lg transition-colors relative">
<span className="material-symbols-outlined text-on-surface-variant">notifications</span>
<span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full"></span>
</button>
<button className="p-2 hover:bg-surface-container-low rounded-lg transition-colors">
<span className="material-symbols-outlined text-on-surface-variant">history</span>
</button>
<div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-fixed cursor-pointer">
<img className="w-full h-full object-cover" data-alt="A professional headshot of a sophisticated event manager in a high-end office environment. The person is smiling warmly, wearing smart business attire. The background is softly blurred with warm lighting and minimalist interior design, reflecting a premium hospitality service brand aesthetic." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGatDlxe8EGTCOffTf-MJrkIjZfo9w24X12R3ygYn-NsYBbCbjDia3xP1EJVi-3cyKTeAVdjs5GFf4gZKmjzS1wGVwQ-erwUwC_H2IkRZJlVWLWll17lz5H_Z6PcdddHZghrRu8rW1nZtIb3027flDPEIy2DGU7VgYouNp6SRgqhsrfwWYnSCk1eToV14RjiBUPiiTOYaANSpC33yffta7Fg2gIg3t70jf8EN0UmfCiSwSdIadhbpnApxxe1ytSqhUN8B9u8VGodM"/>
</div>
</div>
</nav>
</div>
</header>

<main className="ml-64 pt-24 pb-12 px-10">
<div className="max-w-[1440px] mx-auto space-y-10">

<section className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
<div className="bg-white p-6 rounded-[24px] card-shadow flex flex-col gap-2 relative overflow-hidden">
<div className="absolute -right-4 -top-4 opacity-10">
<span className="material-symbols-outlined text-8xl text-primary">analytics</span>
</div>
<span className="text-on-surface-variant font-label-md text-label-md uppercase tracking-wider">Overall Deliverability</span>
<h3 className="text-display-lg font-display-lg text-on-surface">98.4%</h3>
<div className="flex items-center gap-1 text-emerald-green">
<span className="material-symbols-outlined text-sm">trending_up</span>
<span className="text-label-sm font-label-sm">+2.1% from last month</span>
</div>
</div>
<div className="bg-white p-6 rounded-[24px] card-shadow flex flex-col gap-2 relative overflow-hidden">
<span className="text-on-surface-variant font-label-md text-label-md uppercase tracking-wider">Avg. Open Rate</span>
<h3 className="text-display-lg font-display-lg text-on-surface">42.8%</h3>
<div className="flex items-center gap-1 text-on-surface-variant opacity-60">
<span className="material-symbols-outlined text-sm">remove</span>
<span className="text-label-sm font-label-sm">Stable across channels</span>
</div>
</div>
<div className="bg-white p-6 rounded-[24px] card-shadow flex flex-col gap-2 relative overflow-hidden">
<span className="text-on-surface-variant font-label-md text-label-md uppercase tracking-wider">Active Campaigns</span>
<h3 className="text-display-lg font-display-lg text-on-surface">12</h3>
<div className="flex items-center gap-2">
<span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded text-label-sm">4 Drafts</span>
<span className="bg-primary-fixed text-on-primary-container px-2 py-0.5 rounded text-label-sm">2 Sending</span>
</div>
</div>

<div className="glass p-6 rounded-[24px] flex flex-col justify-between border-primary/20">
<div>
<h4 className="font-headline-md text-primary mb-1">New Campaign</h4>
<p className="text-body-sm text-on-surface-variant leading-tight">Engage your guests across any channel instantly.</p>
</div>
<button className="coral-gradient w-full py-3 rounded-xl text-white font-label-md flex items-center justify-center gap-2 mt-4">
<span className="material-symbols-outlined">rocket_launch</span>
                        Launch Now
                    </button>
</div>
</section>

<section className="grid grid-cols-12 gap-gutter">

<div className="col-span-12 lg:col-span-8 bg-white rounded-[24px] card-shadow p-8">
<div className="flex justify-between items-center mb-8">
<div>
<h3 className="font-headline-lg text-headline-lg text-on-surface">Recent Campaigns</h3>
<p className="text-body-md text-on-surface-variant">Manage and track your latest communications.</p>
</div>
<div className="flex gap-2">
<button className="px-4 py-2 bg-background-alt rounded-lg font-label-md text-on-surface hover:bg-surface-container transition-colors">Filter</button>
<button className="px-4 py-2 bg-background-alt rounded-lg font-label-md text-on-surface hover:bg-surface-container transition-colors">Export</button>
</div>
</div>
<div className="overflow-x-auto">
<table className="w-full text-left">
<thead className="border-b border-border-gray">
<tr>
<th className="pb-4 font-label-md text-on-surface-variant uppercase text-xs tracking-widest">Campaign Name</th>
<th className="pb-4 font-label-md text-on-surface-variant uppercase text-xs tracking-widest">Channel</th>
<th className="pb-4 font-label-md text-on-surface-variant uppercase text-xs tracking-widest">Status</th>
<th className="pb-4 font-label-md text-on-surface-variant uppercase text-xs tracking-widest">Metrics</th>
<th className="pb-4"></th>
</tr>
</thead>
<tbody className="divide-y divide-border-gray">

<tr className="group hover:bg-background-alt/50 transition-colors">
<td className="py-6">
<p className="font-label-md text-on-surface group-hover:text-primary transition-colors">Gala 2024 Final Invite</p>
<p className="text-body-sm text-on-surface-variant">Sent to VIP Members</p>
</td>
<td className="py-6">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-lg">mail</span>
<span className="text-body-sm">Email</span>
</div>
</td>
<td className="py-6">
<span className="px-3 py-1 rounded-full bg-emerald-green/10 text-emerald-green text-xs font-bold uppercase tracking-wider">Sent</span>
</td>
<td className="py-6">
<div className="flex items-center gap-4">
<div className="text-center">
<p className="text-xs text-on-surface-variant font-bold">89%</p>
<p className="text-[10px] text-on-surface-variant opacity-60">Open</p>
</div>
<div className="text-center">
<p className="text-xs text-on-surface-variant font-bold">12%</p>
<p className="text-[10px] text-on-surface-variant opacity-60">Click</p>
</div>
</div>
</td>
<td className="py-6 text-right">
<button className="p-2 hover:bg-white rounded-full transition-colors"><span className="material-symbols-outlined text-on-surface-variant">more_vert</span></button>
</td>
</tr>

<tr className="group hover:bg-background-alt/50 transition-colors">
<td className="py-6">
<p className="font-label-md text-on-surface">Security Briefing - Day 1</p>
<p className="text-body-sm text-on-surface-variant">Staff &amp; Security Group</p>
</td>
<td className="py-6">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-[#25D366] text-lg">chat</span>
<span className="text-body-sm">WhatsApp</span>
</div>
</td>
<td className="py-6">
<span className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold uppercase tracking-wider">Scheduled</span>
</td>
<td className="py-6">
<span className="text-body-sm text-on-surface-variant">Oct 24, 09:00 AM</span>
</td>
<td className="py-6 text-right">
<button className="p-2 hover:bg-white rounded-full transition-colors"><span className="material-symbols-outlined text-on-surface-variant">more_vert</span></button>
</td>
</tr>

<tr className="group hover:bg-background-alt/50 transition-colors">
<td className="py-6">
<p className="font-label-md text-on-surface">Urgent: Venue Shift Update</p>
<p className="text-body-sm text-on-surface-variant">All Registrants</p>
</td>
<td className="py-6">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-lg">sms</span>
<span className="text-body-sm">SMS</span>
</div>
</td>
<td className="py-6">
<span className="px-3 py-1 rounded-full bg-surface-container-highest text-on-surface-variant text-xs font-bold uppercase tracking-wider">Draft</span>
</td>
<td className="py-6">
<span className="text-body-sm text-on-surface-variant italic">N/A</span>
</td>
<td className="py-6 text-right">
<button className="p-2 hover:bg-white rounded-full transition-colors"><span className="material-symbols-outlined text-on-surface-variant">more_vert</span></button>
</td>
</tr>
</tbody>
</table>
</div>
</div>

<div className="col-span-12 lg:col-span-4 space-y-gutter">
<div className="bg-white rounded-[24px] card-shadow p-8 h-full">
<div className="flex items-center justify-between mb-6">
<h3 className="font-headline-md text-headline-md text-on-surface">Audience Segments</h3>
<button className="text-primary hover:underline font-label-sm text-label-sm">Manage</button>
</div>
<div className="space-y-4">
<div className="flex items-center justify-between p-4 bg-background-alt rounded-2xl group cursor-pointer hover:bg-primary/5 transition-all">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
<span className="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">star</span>
</div>
<div>
<p className="font-label-md text-on-surface">VIP Attendees</p>
<p className="text-body-sm text-on-surface-variant">1,240 members</p>
</div>
</div>
<span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform">chevron_right</span>
</div>
<div className="flex items-center justify-between p-4 bg-background-alt rounded-2xl group cursor-pointer hover:bg-primary/5 transition-all">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-secondary">
<span className="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">local_activity</span>
</div>
<div>
<p className="font-label-md text-on-surface">Early Birds</p>
<p className="text-body-sm text-on-surface-variant">3,892 members</p>
</div>
</div>
<span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform">chevron_right</span>
</div>
<div className="flex items-center justify-between p-4 bg-background-alt rounded-2xl group cursor-pointer hover:bg-primary/5 transition-all">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-full bg-tertiary-fixed flex items-center justify-center text-tertiary">
<span className="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">handshake</span>
</div>
<div>
<p className="font-label-md text-on-surface">Sponsors &amp; Partners</p>
<p className="text-body-sm text-on-surface-variant">142 members</p>
</div>
</div>
<span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform">chevron_right</span>
</div>
</div>

<div className="mt-8 pt-8 border-t border-border-gray">
<h4 className="font-label-md text-on-surface mb-4 uppercase tracking-widest text-xs">Campaign Calendar</h4>
<div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-on-surface-variant mb-2">
<span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
</div>
<div className="grid grid-cols-7 gap-2">

</div>
</div>
</div>
</div>
</section>

<section className="bg-white rounded-[24px] card-shadow overflow-hidden">
<div className="p-8 border-b border-border-gray flex justify-between items-center bg-surface-container-low/30">
<div>
<h3 className="font-headline-lg text-headline-lg text-on-surface">Channel Orchestration</h3>
<p className="text-body-md text-on-surface-variant">Real-time performance across communication mediums.</p>
</div>
<div className="flex gap-4">
<div className="flex items-center gap-2 px-3 py-1 rounded-full border border-border-gray text-xs font-label-md">
<div className="w-2 h-2 rounded-full bg-primary"></div> Email
                        </div>
<div className="flex items-center gap-2 px-3 py-1 rounded-full border border-border-gray text-xs font-label-md">
<div className="w-2 h-2 rounded-full bg-[#25D366]"></div> WhatsApp
                        </div>
<div className="flex items-center gap-2 px-3 py-1 rounded-full border border-border-gray text-xs font-label-md">
<div className="w-2 h-2 rounded-full bg-secondary"></div> SMS
                        </div>
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 divide-x divide-border-gray">

<div className="p-8 space-y-6">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary">mail</span>
<h4 className="font-headline-md">Email</h4>
</div>
<span className="text-emerald-green text-label-sm">+12% vs last wk</span>
</div>
<div className="h-32 w-full bg-background-alt rounded-2xl flex items-end p-4 gap-2">
<div className="w-full bg-primary/20 rounded-t h-[40%]"></div>
<div className="w-full bg-primary/40 rounded-t h-[60%]"></div>
<div className="w-full bg-primary/20 rounded-t h-[30%]"></div>
<div className="w-full bg-primary/80 rounded-t h-[80%]"></div>
<div className="w-full bg-primary rounded-t h-[95%]"></div>
</div>
<ul className="space-y-3">
<li className="flex justify-between text-body-sm"><span className="text-on-surface-variant">Delivery Rate</span> <span className="font-bold">99.2%</span></li>
<li className="flex justify-between text-body-sm"><span className="text-on-surface-variant">Bounce Rate</span> <span className="font-bold">0.4%</span></li>
</ul>
</div>

<div className="p-8 space-y-6">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-[#25D366]">chat</span>
<h4 className="font-headline-md">WhatsApp</h4>
</div>
<span className="text-emerald-green text-label-sm">+45% vs last wk</span>
</div>
<div className="h-32 w-full bg-background-alt rounded-2xl flex items-end p-4 gap-2">
<div className="w-full bg-[#25D366]/20 rounded-t h-[20%]"></div>
<div className="w-full bg-[#25D366]/40 rounded-t h-[40%]"></div>
<div className="w-full bg-[#25D366]/20 rounded-t h-[50%]"></div>
<div className="w-full bg-[#25D366]/80 rounded-t h-[70%]"></div>
<div className="w-full bg-[#25D366] rounded-t h-[85%]"></div>
</div>
<ul className="space-y-3">
<li className="flex justify-between text-body-sm"><span className="text-on-surface-variant">Avg. Response Time</span> <span className="font-bold">4.2m</span></li>
<li className="flex justify-between text-body-sm"><span className="text-on-surface-variant">Interactive Rate</span> <span className="font-bold">28.4%</span></li>
</ul>
</div>

<div className="p-8 space-y-6">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-secondary">sms</span>
<h4 className="font-headline-md">SMS</h4>
</div>
<span className="text-on-surface-variant opacity-60 text-label-sm">Flat</span>
</div>
<div className="h-32 w-full bg-background-alt rounded-2xl flex items-end p-4 gap-2">
<div className="w-full bg-secondary/20 rounded-t h-[30%]"></div>
<div className="w-full bg-secondary/40 rounded-t h-[35%]"></div>
<div className="w-full bg-secondary/20 rounded-t h-[40%]"></div>
<div className="w-full bg-secondary/80 rounded-t h-[32%]"></div>
<div className="w-full bg-secondary rounded-t h-[38%]"></div>
</div>
<ul className="space-y-3">
<li className="flex justify-between text-body-sm"><span className="text-on-surface-variant">Local Rate</span> <span className="font-bold">100%</span></li>
<li className="flex justify-between text-body-sm"><span className="text-on-surface-variant">Opt-out Rate</span> <span className="font-bold">0.12%</span></li>
</ul>
</div>
</div>
</section>
</div>
</main>

<button className="fixed bottom-8 right-8 coral-gradient w-16 h-16 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 active:scale-95 transition-all group z-50">
<span className="material-symbols-outlined text-3xl">send</span>
<div className="absolute right-20 bg-on-surface text-white px-4 py-2 rounded-lg text-sm font-label-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Broadcast Now
        </div>
</button>



        </>
    );
};

export default CommunicationCenter;
