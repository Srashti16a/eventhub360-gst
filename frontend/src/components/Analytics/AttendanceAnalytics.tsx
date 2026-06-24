import React from 'react';

const AttendanceAnalytics: React.FC = () => {
    return (
        <>
            

<aside className="h-screen w-64 fixed left-0 top-0 bg-surface-container-lowest dark:bg-inverse-surface shadow-[4px_0_20px_0_rgba(31,41,55,0.05)] border-r border-border-gray flex flex-col py-base z-50">
<div className="px-6 mb-10 flex flex-col gap-1">
<h1 className="font-headline-md text-headline-md font-bold text-primary dark:text-inverse-primary tracking-tight">EventPro</h1>
<span className="font-label-md text-label-md text-on-surface-variant opacity-70">Enterprise Suite</span>
</div>
<nav className="flex-1 px-4 flex flex-col gap-2">
<a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant dark:text-surface-variant hover:text-primary transition-all duration-200 hover:bg-surface-container-high rounded-lg" href="#">
<span className="material-symbols-outlined">dashboard</span>
<span className="font-label-md text-label-md">Dashboard</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant dark:text-surface-variant hover:text-primary transition-all duration-200 hover:bg-surface-container-high rounded-lg" href="#">
<span className="material-symbols-outlined">group</span>
<span className="font-label-md text-label-md">Guests</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant dark:text-surface-variant hover:text-primary transition-all duration-200 hover:bg-surface-container-high rounded-lg" href="#">
<span className="material-symbols-outlined">local_shipping</span>
<span className="font-label-md text-label-md">Logistics</span>
</a>

<a className="flex items-center gap-3 px-4 py-3 text-primary dark:text-inverse-primary bg-surface-container dark:bg-surface-variant rounded-lg font-bold scale-102 transition-transform duration-200" href="#">
<span className="material-symbols-outlined">analytics</span>
<span className="font-label-md text-label-md">Analytics</span>
</a>
</nav>
<div className="px-4 mt-auto border-t border-border-gray pt-4 flex flex-col gap-2">
<button className="w-full py-3 px-4 bg-primary-container text-on-primary font-bold rounded-lg mb-4 hover:opacity-90 transition-all flex items-center justify-center gap-2">
<span className="material-symbols-outlined text-[20px]">add</span>
<span className="font-label-md text-label-md">New Event</span>
</button>
<a className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:text-primary transition-colors" href="#">
<span className="material-symbols-outlined">settings</span>
<span className="font-label-md text-label-md">Settings</span>
</a>
<a className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:text-primary transition-colors" href="#">
<span className="material-symbols-outlined">help_outline</span>
<span className="font-label-md text-label-md">Support</span>
</a>
</div>
</aside>

<header className="flex justify-between items-center h-16 px-gutter ml-64 w-[calc(100%-16rem)] sticky top-0 z-40 backdrop-blur-xl bg-white/60 dark:bg-inverse-surface/60 border-b border-border-gray">
<div className="flex items-center gap-8">
<h2 className="font-headline-md text-headline-md font-bold text-on-surface dark:text-inverse-on-surface">Attendance Analytics</h2>
<div className="hidden lg:flex items-center bg-background-alt rounded-lg px-3 py-1.5 border-none focus-within:ring-2 focus-within:ring-primary/20 transition-all w-64">
<span className="material-symbols-outlined text-on-surface-variant text-[20px]">search</span>
<input className="bg-transparent border-none focus:ring-0 text-body-sm w-full" placeholder="Search insights..." type="text"/>
</div>
</div>
<div className="flex items-center gap-6">
<div className="flex items-center gap-4 border-r border-border-gray pr-6">
<button className="text-on-surface-variant hover:bg-surface-container-low p-2 rounded-full transition-colors relative">
<span className="material-symbols-outlined">notifications</span>
<span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full"></span>
</button>
<button className="text-on-surface-variant hover:bg-surface-container-low p-2 rounded-full transition-colors">
<span className="material-symbols-outlined">help</span>
</button>
</div>
<div className="flex items-center gap-3">
<button className="font-label-md text-label-md px-4 py-2 text-on-surface-variant hover:text-primary transition-colors">Export</button>
<button className="font-label-md text-label-md px-5 py-2 bg-primary text-white rounded-lg shadow-sm hover:scale-105 active:scale-95 transition-all">Check-in</button>
<div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm ml-2 cursor-pointer">
<img className="w-full h-full object-cover" data-alt="A professional headshot of a female event executive with warm lighting, wearing a chic beige blazer, in a high-end minimalist office setting with a background of blurred soft architectural lines. The aesthetic is clean, light-mode, and sophisticated." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCZhJ806_BDQZ0g9fjJLvIDJzQfBnBFFYuufvzEayr9GYxTitZC-tpjoj7gF9g4k0fmvprZiPVpSG2rkGiBc5GmFFV1CPF5Pq4LcrYd0kAABlZsGPVoARuJJuGeVaHQgT3xS-2eJxRLJHC4Wjrfrti_4ocJ5D-PHKg0rcSS-ALVTpmPc--RTtpgyIrH1_aZBpAI0EZDTVkjp-CvArklCWmWwHMtbmTwpmBGClIQfO0OdV_jtHsHiBmQPdUE85vWuFWE850Bw-HrGFY"/>
</div>
</div>
</div>
</header>

<main className="ml-64 p-gutter pt-8 max-w-[1440px] mx-auto min-h-[calc(100vh-64px)]">

<section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-gutter">

<div className="bg-white p-6 rounded-lg shadow-[0_4px_20px_rgba(31,41,55,0.05)] border border-border-gray flex flex-col gap-2 group hover:translate-y-[-2px] transition-all duration-300">
<div className="flex justify-between items-start">
<span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest opacity-60">Total Expected</span>
<div className="bg-surface-container-low p-2 rounded-lg text-primary">
<span className="material-symbols-outlined text-[20px]">group_add</span>
</div>
</div>
<div className="flex flex-col">
<span className="font-headline-lg text-headline-lg text-on-surface font-extrabold">2,450</span>
<div className="flex items-center gap-1 text-emerald-green">
<span className="material-symbols-outlined text-[16px]">trending_up</span>
<span className="font-label-sm text-label-sm">+12% vs last event</span>
</div>
</div>
</div>

<div className="bg-white p-6 rounded-lg shadow-[0_4px_20px_rgba(31,41,55,0.05)] border border-border-gray flex flex-col gap-2 group hover:translate-y-[-2px] transition-all duration-300">
<div className="flex justify-between items-start">
<span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest opacity-60">Current Check-ins</span>
<div className="bg-primary-container/10 p-2 rounded-lg text-primary">
<span className="material-symbols-outlined text-[20px]">how_to_reg</span>
</div>
</div>
<div className="flex flex-col">
<span className="font-headline-lg text-headline-lg text-on-surface font-extrabold">1,892</span>
<div className="w-full bg-surface-variant h-1.5 rounded-full mt-2 overflow-hidden">
<div className="bg-primary h-full w-[77%]"></div>
</div>
<span className="font-label-sm text-label-sm mt-1 text-on-surface-variant">77% Attendance Rate</span>
</div>
</div>

<div className="bg-white p-6 rounded-lg shadow-[0_4px_20px_rgba(31,41,55,0.05)] border border-border-gray flex flex-col gap-2 group hover:translate-y-[-2px] transition-all duration-300">
<div className="flex justify-between items-start">
<span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest opacity-60">No-Show Rate</span>
<div className="bg-error-container/20 p-2 rounded-lg text-error">
<span className="material-symbols-outlined text-[20px]">person_off</span>
</div>
</div>
<div className="flex flex-col">
<span className="font-headline-lg text-headline-lg text-on-surface font-extrabold">4.2%</span>
<div className="flex items-center gap-1 text-emerald-green">
<span className="material-symbols-outlined text-[16px]">trending_down</span>
<span className="font-label-sm text-label-sm">-1.5% lower than average</span>
</div>
</div>
</div>

<div className="bg-white p-6 rounded-lg shadow-[0_4px_20px_rgba(31,41,55,0.05)] border border-border-gray flex flex-col gap-2 group hover:translate-y-[-2px] transition-all duration-300">
<div className="flex justify-between items-start">
<span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest opacity-60">Peak Arrival Time</span>
<div className="bg-secondary-container/20 p-2 rounded-lg text-secondary">
<span className="material-symbols-outlined text-[20px]">schedule</span>
</div>
</div>
<div className="flex flex-col">
<span className="font-headline-lg text-headline-lg text-on-surface font-extrabold">09:15 AM</span>
<span className="font-label-sm text-label-sm text-on-surface-variant">Gate A (Main Entrance)</span>
</div>
</div>
</section>

<div className="bento-grid mb-gutter">

<div className="col-span-12 lg:col-span-8 bg-white p-8 rounded-lg shadow-[0_4px_20px_rgba(31,41,55,0.05)] border border-border-gray">
<div className="flex justify-between items-center mb-8">
<div>
<h3 className="font-headline-md text-headline-md font-bold text-on-surface">Attendance Trends</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant">Real-time check-in volume throughout the event duration</p>
</div>
<div className="flex bg-background-alt p-1 rounded-lg">
<button className="px-4 py-1.5 text-label-sm text-on-surface-variant bg-white rounded shadow-sm">Hourly</button>
<button className="px-4 py-1.5 text-label-sm text-on-surface-variant">Daily</button>
</div>
</div>
<div className="h-[340px] w-full relative flex items-end gap-2 px-4 border-b border-l border-border-gray pb-4 pl-4">

<div className="flex-1 bg-primary/20 h-[30%] rounded-t-sm group relative">
<div className="absolute bottom-full left-1/2 -translate-x-1/2 bg-inverse-surface text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">08:00</div>
</div>
<div className="flex-1 bg-primary/30 h-[45%] rounded-t-sm group relative"></div>
<div className="flex-1 bg-primary/40 h-[65%] rounded-t-sm group relative"></div>
<div className="flex-1 bg-primary/60 h-[95%] rounded-t-sm group relative"></div>
<div className="flex-1 bg-primary h-[100%] rounded-t-sm group relative">
<div className="absolute -top-4 left-1/2 -translate-x-1/2 font-bold text-primary text-[11px]">PEAK</div>
</div>
<div className="flex-1 bg-primary/80 h-[80%] rounded-t-sm group relative"></div>
<div className="flex-1 bg-primary/60 h-[55%] rounded-t-sm group relative"></div>
<div className="flex-1 bg-primary/40 h-[40%] rounded-t-sm group relative"></div>
<div className="flex-1 bg-primary/20 h-[25%] rounded-t-sm group relative"></div>
<div className="flex-1 bg-primary/10 h-[15%] rounded-t-sm group relative"></div>
<div className="flex-1 bg-primary/5 h-[10%] rounded-t-sm group relative"></div>
<div className="flex-1 bg-primary/5 h-[8%] rounded-t-sm group relative"></div>
</div>
<div className="flex justify-between px-4 pt-4 text-label-sm text-on-surface-variant opacity-60">
<span>08:00 AM</span>
<span>10:00 AM</span>
<span>12:00 PM</span>
<span>02:00 PM</span>
<span>04:00 PM</span>
<span>06:00 PM</span>
</div>
</div>

<div className="col-span-12 lg:col-span-4 glass-panel p-8 rounded-lg border border-primary/20 relative overflow-hidden">
<div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
<div className="flex items-center gap-3 mb-6">
<span className="material-symbols-outlined text-primary" style="font-variation-settings: 'FILL' 1;">auto_awesome</span>
<h3 className="font-headline-md text-headline-md font-bold text-on-surface">Concierge Insights</h3>
</div>
<div className="space-y-6 relative z-10">
<div className="bg-white/40 p-4 rounded-lg border border-white/60">
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                            "Check-ins are <span className="text-primary font-bold">15% higher</span> than the same time yesterday. Early arrivals peaked at 09:15 AM, primarily at the <span className="italic">East Wing Entrance</span>."
                        </p>
</div>
<div className="space-y-4">
<div className="flex items-start gap-3">
<div className="w-2 h-2 rounded-full bg-emerald-green mt-2"></div>
<p className="font-body-sm text-body-sm text-on-surface">VIP attendance is currently at 94%, exceeding projected targets.</p>
</div>
<div className="flex items-start gap-3">
<div className="w-2 h-2 rounded-full bg-sunset-orange mt-2"></div>
<p className="font-body-sm text-body-sm text-on-surface">Wait times at Gate B are increasing; consider re-routing standard guests.</p>
</div>
<div className="flex items-start gap-3">
<div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
<p className="font-body-sm text-body-sm text-on-surface">No-show rate remains extremely low at 4.2%.</p>
</div>
</div>
<button className="w-full mt-4 py-3 bg-white text-on-surface font-bold rounded-lg border border-border-gray hover:bg-background transition-colors flex items-center justify-center gap-2">
<span>View Full Report</span>
<span className="material-symbols-outlined text-[18px]">arrow_forward</span>
</button>
</div>
</div>

<div className="col-span-12 lg:col-span-3 bg-white p-6 rounded-lg shadow-[0_4px_20px_rgba(31,41,55,0.05)] border border-border-gray">
<h3 className="font-label-md text-label-md font-bold text-on-surface-variant uppercase tracking-widest mb-8">RSVP Funnel</h3>
<div className="flex flex-col gap-3">
<div className="flex items-center gap-4">
<div className="w-12 text-label-sm font-bold text-on-surface-variant">5.0k</div>
<div className="flex-1 h-12 bg-surface-container-high rounded-r-lg flex items-center px-4 relative overflow-hidden">
<div className="absolute left-0 top-0 h-full w-[100%] bg-primary/20"></div>
<span className="font-label-md text-label-md z-10">Invitations</span>
</div>
</div>
<div className="flex items-center gap-4">
<div className="w-12 text-label-sm font-bold text-on-surface-variant">4.2k</div>
<div className="flex-1 h-12 bg-surface-container-high rounded-r-lg flex items-center px-4 relative overflow-hidden">
<div className="absolute left-0 top-0 h-full w-[84%] bg-primary/30"></div>
<span className="font-label-md text-label-md z-10">Opened</span>
</div>
</div>
<div className="flex items-center gap-4">
<div className="w-12 text-label-sm font-bold text-on-surface-variant">3.1k</div>
<div className="flex-1 h-12 bg-surface-container-high rounded-r-lg flex items-center px-4 relative overflow-hidden">
<div className="absolute left-0 top-0 h-full w-[62%] bg-primary/40"></div>
<span className="font-label-md text-label-md z-10">Clicked</span>
</div>
</div>
<div className="flex items-center gap-4">
<div className="w-12 text-label-sm font-bold text-on-surface-variant">2.4k</div>
<div className="flex-1 h-12 bg-surface-container-high rounded-r-lg flex items-center px-4 relative overflow-hidden">
<div className="absolute left-0 top-0 h-full w-[48%] bg-primary/60"></div>
<span className="font-label-md text-label-md z-10">RSVP Confirmed</span>
</div>
</div>
<div className="flex items-center gap-4">
<div className="w-12 text-label-sm font-bold text-on-surface-variant">1.9k</div>
<div className="flex-1 h-12 bg-surface-container-high rounded-r-lg flex items-center px-4 relative overflow-hidden">
<div className="absolute left-0 top-0 h-full w-[38%] bg-primary"></div>
<span className="font-label-md text-label-md z-10 text-white">Attended</span>
</div>
</div>
</div>
</div>

<div className="col-span-12 lg:col-span-6 bg-white p-6 rounded-lg shadow-[0_4px_20px_rgba(31,41,55,0.05)] border border-border-gray">
<div className="flex justify-between items-center mb-6">
<h3 className="font-label-md text-label-md font-bold text-on-surface-variant uppercase tracking-widest">Arrival Heatmap</h3>
<div className="flex items-center gap-4">
<div className="flex items-center gap-1.5">
<div className="w-3 h-3 bg-primary/10 rounded-sm"></div>
<span className="text-[10px] text-on-surface-variant">Low</span>
</div>
<div className="flex items-center gap-1.5">
<div className="w-3 h-3 bg-primary rounded-sm"></div>
<span className="text-[10px] text-on-surface-variant">Peak</span>
</div>
</div>
</div>
<div className="overflow-x-auto">
<table className="w-full border-separate border-spacing-1.5">
<thead>
<tr>
<th className="w-20"></th>
<th className="text-label-sm text-on-surface-variant font-medium py-2">08:00</th>
<th className="text-label-sm text-on-surface-variant font-medium py-2">09:00</th>
<th className="text-label-sm text-on-surface-variant font-medium py-2">10:00</th>
<th className="text-label-sm text-on-surface-variant font-medium py-2">11:00</th>
<th className="text-label-sm text-on-surface-variant font-medium py-2">12:00</th>
<th className="text-label-sm text-on-surface-variant font-medium py-2">13:00</th>
</tr>
</thead>
<tbody>
<tr>
<td className="text-label-sm font-bold text-on-surface pr-4">Gate A</td>
<td className="bg-primary/20 h-10 rounded-sm"></td>
<td className="bg-primary h-10 rounded-sm"></td>
<td className="bg-primary/80 h-10 rounded-sm"></td>
<td className="bg-primary/40 h-10 rounded-sm"></td>
<td className="bg-primary/10 h-10 rounded-sm"></td>
<td className="bg-primary/5 h-10 rounded-sm"></td>
</tr>
<tr>
<td className="text-label-sm font-bold text-on-surface pr-4">Gate B</td>
<td className="bg-primary/10 h-10 rounded-sm"></td>
<td className="bg-primary/40 h-10 rounded-sm"></td>
<td className="bg-primary/90 h-10 rounded-sm"></td>
<td className="bg-primary/60 h-10 rounded-sm"></td>
<td className="bg-primary/20 h-10 rounded-sm"></td>
<td className="bg-primary/10 h-10 rounded-sm"></td>
</tr>
<tr>
<td className="text-label-sm font-bold text-on-surface pr-4">VIP Entr.</td>
<td className="bg-primary/40 h-10 rounded-sm"></td>
<td className="bg-primary/60 h-10 rounded-sm"></td>
<td className="bg-primary/30 h-10 rounded-sm"></td>
<td className="bg-primary/10 h-10 rounded-sm"></td>
<td className="bg-primary/5 h-10 rounded-sm"></td>
<td className="bg-primary/5 h-10 rounded-sm"></td>
</tr>
<tr>
<td className="text-label-sm font-bold text-on-surface pr-4">South G.</td>
<td className="bg-primary/5 h-10 rounded-sm"></td>
<td className="bg-primary/10 h-10 rounded-sm"></td>
<td className="bg-primary/20 h-10 rounded-sm"></td>
<td className="bg-primary/80 h-10 rounded-sm"></td>
<td className="bg-primary/40 h-10 rounded-sm"></td>
<td className="bg-primary/20 h-10 rounded-sm"></td>
</tr>
</tbody>
</table>
</div>
</div>

<div className="col-span-12 lg:col-span-3 bg-white p-6 rounded-lg shadow-[0_4px_20px_rgba(31,41,55,0.05)] border border-border-gray">
<h3 className="font-label-md text-label-md font-bold text-on-surface-variant uppercase tracking-widest mb-6">Guest Breakdown</h3>
<div className="flex flex-col items-center">
<div className="relative w-40 h-40 mb-8">

<div className="absolute inset-0 rounded-full border-[12px] border-primary" style="clip-path: polygon(50% 50%, 50% 0, 100% 0, 100% 100%, 0 100%, 0 40%);"></div>
<div className="absolute inset-0 rounded-full border-[12px] border-sunset-orange" style="clip-path: polygon(50% 50%, 0 40%, 0 0, 50% 0);"></div>
<div className="absolute inset-2 bg-white rounded-full flex flex-col items-center justify-center">
<span className="text-headline-md font-bold">1,892</span>
<span className="text-[10px] text-on-surface-variant uppercase">Total</span>
</div>
</div>
<div className="w-full space-y-3">
<div className="flex justify-between items-center">
<div className="flex items-center gap-2">
<div className="w-3 h-3 rounded-full bg-primary"></div>
<span className="text-body-sm">Standard</span>
</div>
<span className="text-label-md font-bold">65%</span>
</div>
<div className="flex justify-between items-center">
<div className="flex items-center gap-2">
<div className="w-3 h-3 rounded-full bg-sunset-orange"></div>
<span className="text-body-sm">VIP</span>
</div>
<span className="text-label-md font-bold">25%</span>
</div>
<div className="flex justify-between items-center">
<div className="flex items-center gap-2">
<div className="w-3 h-3 rounded-full bg-surface-dim"></div>
<span className="text-body-sm">Speakers</span>
</div>
<span className="text-label-md font-bold">10%</span>
</div>
</div>
</div>
</div>

<div className="col-span-12 bg-white p-8 rounded-lg shadow-[0_4px_20px_rgba(31,41,55,0.05)] border border-border-gray">
<h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-8">No-Show Deep Dive</h3>
<div className="grid grid-cols-1 md:grid-cols-3 gap-12">
<div className="space-y-4">
<div className="flex justify-between items-end border-b border-border-gray pb-2">
<span className="font-label-md text-label-md text-on-surface-variant uppercase">By Category</span>
<span className="text-error font-bold">88 Pending</span>
</div>
<div className="space-y-4">
<div className="flex flex-col gap-1.5">
<div className="flex justify-between text-label-sm">
<span>VIP Guests</span>
<span className="font-bold">6 / 480</span>
</div>
<div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
<div className="h-full bg-primary w-[1.2%]"></div>
</div>
</div>
<div className="flex flex-col gap-1.5">
<div className="flex justify-between text-label-sm">
<span>Standard Guests</span>
<span className="font-bold">72 / 1,800</span>
</div>
<div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
<div className="h-full bg-primary w-[4%]"></div>
</div>
</div>
<div className="flex flex-col gap-1.5">
<div className="flex justify-between text-label-sm">
<span>Speakers/Media</span>
<span className="font-bold">10 / 170</span>
</div>
<div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
<div className="h-full bg-primary w-[5.8%]"></div>
</div>
</div>
</div>
</div>
<div className="col-span-2">
<div className="bg-background-alt rounded-lg p-6 flex items-start gap-6">
<div className="bg-white p-4 rounded-lg shadow-sm border border-border-gray shrink-0">
<span className="material-symbols-outlined text-[40px] text-primary" style="font-variation-settings: 'FILL' 1;">groups</span>
</div>
<div className="flex-1">
<h4 className="font-label-md text-label-md font-bold text-on-surface mb-2">Guest Group Correlation</h4>
<p className="font-body-sm text-body-sm text-on-surface-variant mb-4">No-shows are highly correlated with the "Out-of-Town" guest segment. 45% of pending check-ins are from domestic travelers arriving by train.</p>
<div className="flex gap-2">
<span className="px-3 py-1 bg-white border border-border-gray rounded-full text-[11px] font-bold">TRAVEL DELAYS</span>
<span className="px-3 py-1 bg-white border border-border-gray rounded-full text-[11px] font-bold">NON-VIP</span>
<span className="px-3 py-1 bg-white border border-border-gray rounded-full text-[11px] font-bold text-primary">ACTION RECOMMENDED</span>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</main>


        </>
    );
};

export default AttendanceAnalytics;
