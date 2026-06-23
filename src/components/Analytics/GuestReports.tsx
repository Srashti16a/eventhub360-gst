import React from 'react';

const GuestReports: React.FC = () => {
    return (
        <>
            

<div className="flex h-screen overflow-hidden">

<aside className="docked left-0 h-full w-64 rounded-r-2xl bg-surface-container-lowest shadow-sm flex flex-col py-gutter border-r border-border-gray z-50">
<div className="px-6 mb-10">
<h1 className="font-headline-md text-headline-md font-bold text-primary">EventHub360</h1>
<p className="font-label-sm text-label-sm text-on-surface-variant/70 tracking-wider uppercase">The Digital Concierge</p>
</div>
<nav className="flex-1 space-y-1">
<a className="flex items-center px-6 py-3 text-on-surface-variant hover:bg-surface-container transition-all duration-200 group" href="#">
<span className="material-symbols-outlined mr-3 group-hover:scale-110 transition-transform">dashboard</span>
<span className="font-label-md text-label-md">Dashboard</span>
</a>
<a className="flex items-center px-6 py-3 text-on-surface-variant hover:bg-surface-container transition-all duration-200 group" href="#">
<span className="material-symbols-outlined mr-3 group-hover:scale-110 transition-transform">groups</span>
<span className="font-label-md text-label-md">CRM</span>
</a>
<a className="flex items-center px-6 py-3 text-primary font-bold border-r-4 border-primary bg-primary-container/10 transition-all duration-200 group" href="#">
<span className="material-symbols-outlined mr-3 group-hover:scale-110 transition-transform">person_book</span>
<span className="font-label-md text-label-md">Guests</span>
</a>
<a className="flex items-center px-6 py-3 text-on-surface-variant hover:bg-surface-container transition-all duration-200 group" href="#">
<span className="material-symbols-outlined mr-3 group-hover:scale-110 transition-transform">inventory_2</span>
<span className="font-label-md text-label-md">Logistics</span>
</a>
<a className="flex items-center px-6 py-3 text-on-surface-variant hover:bg-surface-container transition-all duration-200 group" href="#">
<span className="material-symbols-outlined mr-3 group-hover:scale-110 transition-transform">chat</span>
<span className="font-label-md text-label-md">Communications</span>
</a>
</nav>
<div className="px-6 mt-auto space-y-4">
<button className="w-full py-3 bg-gradient-to-r from-primary-container to-sunset-orange text-white rounded-xl font-label-md text-label-md shadow-md hover:scale-[1.02] transition-transform active:scale-[0.98]">
                    New Event
                </button>
<div className="pt-4 border-t border-border-gray">
<a className="flex items-center py-2 text-on-surface-variant hover:text-primary transition-colors" href="#">
<span className="material-symbols-outlined mr-3 text-[20px]">settings</span>
<span className="font-label-md text-label-md">Settings</span>
</a>
<a className="flex items-center py-2 text-on-surface-variant hover:text-primary transition-colors" href="#">
<span className="material-symbols-outlined mr-3 text-[20px]">help</span>
<span className="font-label-md text-label-md">Support</span>
</a>
</div>
</div>
</aside>

<main className="flex-1 flex flex-col min-w-0 bg-off-white overflow-hidden relative">

<header className="flex justify-between items-center h-16 px-container-margin w-full sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-border-gray">
<div className="flex items-center flex-1 max-w-xl">
<div className="relative w-full group">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">search</span>
<input className="w-full bg-background-alt border-none rounded-full py-2 pl-10 pr-4 text-body-sm font-body-sm focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all outline-none" placeholder="Search reports, guests, or events..." type="text"/>
</div>
</div>
<div className="flex items-center space-x-6 ml-gutter">
<div className="flex items-center space-x-3">
<button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">notifications</button>
<button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">apps</button>
</div>
<div className="h-8 w-[1px] bg-border-gray"></div>
<div className="flex items-center space-x-3 cursor-pointer group">
<div className="text-right">
<p className="font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors">Julianne Moore</p>
<p className="font-body-sm text-[10px] text-on-surface-variant/70 uppercase tracking-tighter">Event Director</p>
</div>
<img className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover" data-alt="A professional headshot of a sophisticated event director in her late 30s, featuring soft studio lighting and a clean, high-end professional background. The aesthetic is modern and polished, matching a luxury hospitality brand's visual identity." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAmTOMuTlnmnV6WHVIOgzNRU7r7w0k-3_mLKVWabZUCAdvD-2b4BhH7LJCQkgQBSnemJVZdJxEiXG6yf_mQ7bruHBsPmVfrXeVt7k9ZivswCkXfYzw-4sSo00lyUrRQHdE67n5xy02LiKNGP1ZnMrtx-V2VrcQO80Dkkrh12x-TELzbKmkqTw35mauxpTUAxu328eXlEsUVtvli59iyhBkiZqvKOnOXjqWyLicBof5euy106hszud8rChPKZ4DTHxOwB8xSSA_n8sw"/>
</div>
</div>
</header>

<div className="flex-1 overflow-y-auto p-container-margin space-y-gutter pb-20">

<div className="flex flex-col md:flex-row md:items-end justify-between gap-gutter">
<div>
<nav className="flex items-center text-on-surface-variant/60 font-label-sm text-label-sm mb-1">
<span>Guests</span>
<span className="material-symbols-outlined text-[16px] mx-1">chevron_right</span>
<span className="text-primary font-semibold">Reports</span>
</nav>
<h2 className="font-headline-lg text-headline-lg text-on-surface">Guest Analytics &amp; Reporting</h2>
</div>
<div className="flex items-center gap-3">
<button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border-gray bg-white font-label-md text-label-md text-on-surface hover:bg-surface transition-all active:scale-95">
<span className="material-symbols-outlined text-[20px]">description</span>
                            Export as PDF
                        </button>
<button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-container text-white font-label-md text-label-md shadow-md hover:scale-105 transition-all active:scale-95">
<span className="material-symbols-outlined text-[20px]">table_chart</span>
                            Export as Excel
                        </button>
</div>
</div>

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
<div className="bg-white p-6 rounded-2xl border border-border-gray card-shadow flex items-center justify-between">
<div>
<p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Reports Generated</p>
<h3 className="font-headline-md text-headline-md text-on-surface">1,284</h3>
<span className="text-emerald-green font-label-sm flex items-center mt-1">
<span className="material-symbols-outlined text-[14px] mr-1">trending_up</span> +12%
                            </span>
</div>
<div className="p-3 bg-primary-container/5 rounded-xl">
<span className="material-symbols-outlined text-primary text-[32px]">analytics</span>
</div>
</div>
<div className="bg-white p-6 rounded-2xl border border-border-gray card-shadow flex items-center justify-between">
<div>
<p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Avg. Attendance</p>
<h3 className="font-headline-md text-headline-md text-on-surface">94.2%</h3>
<span className="text-emerald-green font-label-sm flex items-center mt-1">
<span className="material-symbols-outlined text-[14px] mr-1">trending_up</span> +2.1%
                            </span>
</div>
<div className="p-3 bg-secondary-container/10 rounded-xl">
<span className="material-symbols-outlined text-secondary text-[32px]">event_available</span>
</div>
</div>
<div className="bg-white p-6 rounded-2xl border border-border-gray card-shadow flex items-center justify-between">
<div>
<p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Satisfaction Score</p>
<h3 className="font-headline-md text-headline-md text-on-surface">4.8<span className="text-body-sm text-on-surface-variant/50">/5.0</span></h3>
<span className="text-on-surface-variant font-label-sm flex items-center mt-1">
<span className="material-symbols-outlined text-[14px] mr-1">horizontal_rule</span> Steady
                            </span>
</div>
<div className="p-3 bg-tertiary-container/10 rounded-xl">
<span className="material-symbols-outlined text-tertiary text-[32px]">star</span>
</div>
</div>
<div className="bg-white p-6 rounded-2xl border border-border-gray card-shadow flex items-center justify-between">
<div>
<p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Unique Data Points</p>
<h3 className="font-headline-md text-headline-md text-on-surface">45.2k</h3>
<span className="text-emerald-green font-label-sm flex items-center mt-1">
<span className="material-symbols-outlined text-[14px] mr-1">trending_up</span> +8%
                            </span>
</div>
<div className="p-3 bg-emerald-green/5 rounded-xl">
<span className="material-symbols-outlined text-emerald-green text-[32px]">data_exploration</span>
</div>
</div>
</div>

<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
<div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-border-gray card-shadow h-72 flex flex-col">
<div className="flex justify-between items-center mb-6">
<h4 className="font-headline-md text-[18px] text-on-surface">Attendance Trends</h4>
<div className="flex items-center bg-background-alt rounded-lg p-1">
<button className="px-3 py-1 bg-white rounded shadow-sm font-label-sm text-label-sm">Daily</button>
<button className="px-3 py-1 font-label-sm text-label-sm text-on-surface-variant">Weekly</button>
</div>
</div>
<div className="flex-1 flex items-end gap-3 pb-2">

<div className="flex-1 flex flex-col items-center gap-2 group">
<div className="w-full bg-primary-container/20 rounded-t-lg transition-all h-[40%] group-hover:bg-primary-container/40"></div>
<span className="text-[10px] font-label-sm text-on-surface-variant">Mon</span>
</div>
<div className="flex-1 flex flex-col items-center gap-2 group">
<div className="w-full bg-primary-container/20 rounded-t-lg transition-all h-[60%] group-hover:bg-primary-container/40"></div>
<span className="text-[10px] font-label-sm text-on-surface-variant">Tue</span>
</div>
<div className="flex-1 flex flex-col items-center gap-2 group">
<div className="w-full bg-primary-container/40 rounded-t-lg transition-all h-[85%] group-hover:bg-primary-container/60"></div>
<span className="text-[10px] font-label-sm text-on-surface-variant">Wed</span>
</div>
<div className="flex-1 flex flex-col items-center gap-2 group">
<div className="w-full bg-primary-container/20 rounded-t-lg transition-all h-[55%] group-hover:bg-primary-container/40"></div>
<span className="text-[10px] font-label-sm text-on-surface-variant">Thu</span>
</div>
<div className="flex-1 flex flex-col items-center gap-2 group">
<div className="w-full bg-primary-container/20 rounded-t-lg transition-all h-[70%] group-hover:bg-primary-container/40"></div>
<span className="text-[10px] font-label-sm text-on-surface-variant">Fri</span>
</div>
<div className="flex-1 flex flex-col items-center gap-2 group">
<div className="w-full bg-primary-container/80 rounded-t-lg transition-all h-[95%]"></div>
<span className="text-[10px] font-label-sm text-on-surface-variant">Sat</span>
</div>
<div className="flex-1 flex flex-col items-center gap-2 group">
<div className="w-full bg-primary-container/20 rounded-t-lg transition-all h-[30%] group-hover:bg-primary-container/40"></div>
<span className="text-[10px] font-label-sm text-on-surface-variant">Sun</span>
</div>
</div>
</div>
<div className="bg-white p-6 rounded-2xl border border-border-gray card-shadow h-72 flex flex-col">
<h4 className="font-headline-md text-[18px] text-on-surface mb-6">Guest Categories</h4>
<div className="flex-1 flex items-center justify-center relative">
<div className="w-32 h-32 rounded-full border-[12px] border-primary border-r-tertiary-container border-b-secondary-container relative"></div>
<div className="absolute inset-0 flex flex-col items-center justify-center">
<span className="font-headline-md text-headline-md text-on-surface">3</span>
<span className="text-[10px] text-on-surface-variant uppercase tracking-tighter">Tiers</span>
</div>
</div>
<div className="mt-4 grid grid-cols-3 gap-2">
<div className="flex flex-col items-center">
<div className="w-2 h-2 rounded-full bg-primary mb-1"></div>
<span className="text-[10px] font-label-sm text-on-surface-variant">VIP</span>
</div>
<div className="flex flex-col items-center">
<div className="w-2 h-2 rounded-full bg-tertiary-container mb-1"></div>
<span className="text-[10px] font-label-sm text-on-surface-variant">Speaker</span>
</div>
<div className="flex flex-col items-center">
<div className="w-2 h-2 rounded-full bg-secondary-container mb-1"></div>
<span className="text-[10px] font-label-sm text-on-surface-variant">Standard</span>
</div>
</div>
</div>
</div>

<div className="flex flex-col xl:flex-row gap-6 h-[700px]">

<div className="w-full xl:w-72 flex flex-col gap-6 shrink-0">

<div className="bg-white rounded-2xl border border-border-gray card-shadow flex-1 flex flex-col overflow-hidden">
<div className="p-4 border-b border-border-gray bg-background-alt/30">
<h4 className="font-label-md text-label-md text-on-surface flex items-center">
<span className="material-symbols-outlined text-[20px] mr-2">view_column</span>
                                    Columns &amp; Data
                                </h4>
</div>
<div className="p-4 overflow-y-auto space-y-2">
<div className="group flex items-center justify-between p-3 bg-background-alt rounded-xl border border-transparent hover:border-primary-container/30 cursor-grab active:cursor-grabbing transition-all">
<div className="flex items-center">
<span className="material-symbols-outlined text-on-surface-variant/40 mr-2">drag_indicator</span>
<span className="font-body-sm text-body-sm text-on-surface">Guest Name</span>
</div>
<span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
</div>
<div className="group flex items-center justify-between p-3 bg-background-alt rounded-xl border border-transparent hover:border-primary-container/30 cursor-grab active:cursor-grabbing transition-all">
<div className="flex items-center">
<span className="material-symbols-outlined text-on-surface-variant/40 mr-2">drag_indicator</span>
<span className="font-body-sm text-body-sm text-on-surface">Email Address</span>
</div>
<span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
</div>
<div className="group flex items-center justify-between p-3 bg-background-alt rounded-xl border border-transparent hover:border-primary-container/30 cursor-grab active:cursor-grabbing transition-all">
<div className="flex items-center">
<span className="material-symbols-outlined text-on-surface-variant/40 mr-2">drag_indicator</span>
<span className="font-body-sm text-body-sm text-on-surface">RSVP Status</span>
</div>
<span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
</div>
<div className="group flex items-center justify-between p-3 bg-white rounded-xl border border-border-gray hover:border-primary-container/30 cursor-grab active:cursor-grabbing transition-all">
<div className="flex items-center">
<span className="material-symbols-outlined text-on-surface-variant/40 mr-2">drag_indicator</span>
<span className="font-body-sm text-body-sm text-on-surface">Meal Preference</span>
</div>
<span className="material-symbols-outlined text-on-surface-variant/30 text-[18px]">add_circle</span>
</div>
<div className="group flex items-center justify-between p-3 bg-white rounded-xl border border-border-gray hover:border-primary-container/30 cursor-grab active:cursor-grabbing transition-all">
<div className="flex items-center">
<span className="material-symbols-outlined text-on-surface-variant/40 mr-2">drag_indicator</span>
<span className="font-body-sm text-body-sm text-on-surface">Hotel Selection</span>
</div>
<span className="material-symbols-outlined text-on-surface-variant/30 text-[18px]">add_circle</span>
</div>
<div className="group flex items-center justify-between p-3 bg-white rounded-xl border border-border-gray hover:border-primary-container/30 cursor-grab active:cursor-grabbing transition-all">
<div className="flex items-center">
<span className="material-symbols-outlined text-on-surface-variant/40 mr-2">drag_indicator</span>
<span className="font-body-sm text-body-sm text-on-surface">Check-in Time</span>
</div>
<span className="material-symbols-outlined text-on-surface-variant/30 text-[18px]">add_circle</span>
</div>
<div className="group flex items-center justify-between p-3 bg-white rounded-xl border border-border-gray hover:border-primary-container/30 cursor-grab active:cursor-grabbing transition-all">
<div className="flex items-center">
<span className="material-symbols-outlined text-on-surface-variant/40 mr-2">drag_indicator</span>
<span className="font-body-sm text-body-sm text-on-surface">Flight Number</span>
</div>
<span className="material-symbols-outlined text-on-surface-variant/30 text-[18px]">add_circle</span>
</div>
</div>
</div>

<div className="bg-white rounded-2xl border border-border-gray card-shadow p-4">
<h4 className="font-label-md text-label-md text-on-surface mb-3 flex items-center">
<span className="material-symbols-outlined text-[20px] mr-2">bookmarks</span>
                                Saved Templates
                            </h4>
<div className="space-y-2">
<button className="w-full text-left px-3 py-2 rounded-lg text-body-sm font-body-sm text-on-surface-variant hover:bg-background-alt transition-colors flex items-center justify-between group">
                                    Weekly VIP Summary
                                    <span className="material-symbols-outlined text-[14px] opacity-0 group-hover:opacity-100 transition-opacity">open_in_new</span>
</button>
<button className="w-full text-left px-3 py-2 rounded-lg text-body-sm font-body-sm text-on-surface-variant hover:bg-background-alt transition-colors flex items-center justify-between group">
                                    Catering Breakdown
                                    <span className="material-symbols-outlined text-[14px] opacity-0 group-hover:opacity-100 transition-opacity">open_in_new</span>
</button>
<button className="w-full text-left px-3 py-2 rounded-lg text-body-sm font-body-sm text-on-surface-variant hover:bg-background-alt transition-colors flex items-center justify-between group">
                                    Transport Logistics
                                    <span className="material-symbols-outlined text-[14px] opacity-0 group-hover:opacity-100 transition-opacity">open_in_new</span>
</button>
</div>
</div>
</div>

<div className="flex-1 bg-white rounded-2xl border border-border-gray card-shadow flex flex-col overflow-hidden">

<div className="p-4 border-b border-border-gray flex flex-wrap items-center justify-between gap-4">
<div className="flex items-center gap-3">
<button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border-gray text-body-sm font-body-sm hover:bg-background-alt transition-colors">
<span className="material-symbols-outlined text-[18px]">group_work</span>
                                    Group By
                                </button>
<button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border-gray text-body-sm font-body-sm hover:bg-background-alt transition-colors">
<span className="material-symbols-outlined text-[18px]">filter_list</span>
                                    Filter
                                </button>
<button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border-gray text-body-sm font-body-sm hover:bg-background-alt transition-colors">
<span className="material-symbols-outlined text-[18px]">sort</span>
                                    Sort
                                </button>
</div>
<div className="flex items-center gap-2">
<span className="text-body-sm text-on-surface-variant mr-2">Previewing 15 of 248 records</span>
<button className="material-symbols-outlined p-1.5 rounded-lg hover:bg-background-alt text-on-surface-variant transition-colors">settings</button>
<button className="material-symbols-outlined p-1.5 rounded-lg hover:bg-background-alt text-on-surface-variant transition-colors">refresh</button>
</div>
</div>

<div className="flex-1 overflow-auto">
<table className="w-full border-collapse">
<thead className="sticky top-0 bg-white shadow-sm z-10">
<tr>
<th className="p-4 text-left border-b border-border-gray font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Guest Name</th>
<th className="p-4 text-left border-b border-border-gray font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Email</th>
<th className="p-4 text-left border-b border-border-gray font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">RSVP Status</th>
<th className="p-4 text-left border-b border-border-gray font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Tier</th>
<th className="p-4 text-right border-b border-border-gray font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Last Check-in</th>
</tr>
</thead>
<tbody className="divide-y divide-border-gray/50">
<tr className="hover:bg-background-alt/40 transition-colors">
<td className="p-4">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-full bg-primary-container/10 text-primary flex items-center justify-center font-bold text-xs">AH</div>
<span className="font-body-md text-on-surface">Alex Harrison</span>
</div>
</td>
<td className="p-4 text-body-sm text-on-surface-variant">alex.h@techvision.com</td>
<td className="p-4">
<span className="px-2.5 py-1 rounded-full bg-emerald-green/10 text-emerald-green text-[10px] font-bold uppercase">Confirmed</span>
</td>
<td className="p-4 text-body-sm text-on-surface-variant">VIP</td>
<td className="p-4 text-right text-body-sm text-on-surface-variant">2h ago</td>
</tr>
<tr className="hover:bg-background-alt/40 transition-colors">
<td className="p-4">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-full bg-secondary-container/20 text-secondary flex items-center justify-center font-bold text-xs">SM</div>
<span className="font-body-md text-on-surface">Sarah Miller</span>
</div>
</td>
<td className="p-4 text-body-sm text-on-surface-variant">s.miller@hospitality.org</td>
<td className="p-4">
<span className="px-2.5 py-1 rounded-full bg-emerald-green/10 text-emerald-green text-[10px] font-bold uppercase">Confirmed</span>
</td>
<td className="p-4 text-body-sm text-on-surface-variant">Speaker</td>
<td className="p-4 text-right text-body-sm text-on-surface-variant">5h ago</td>
</tr>
<tr className="hover:bg-background-alt/40 transition-colors">
<td className="p-4">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-full bg-tertiary-container/10 text-tertiary flex items-center justify-center font-bold text-xs">JB</div>
<span className="font-body-md text-on-surface">James Bennett</span>
</div>
</td>
<td className="p-4 text-body-sm text-on-surface-variant">james@bennett-legal.com</td>
<td className="p-4">
<span className="px-2.5 py-1 rounded-full bg-sunset-orange/10 text-sunset-orange text-[10px] font-bold uppercase">Pending</span>
</td>
<td className="p-4 text-body-sm text-on-surface-variant">Standard</td>
<td className="p-4 text-right text-body-sm text-on-surface-variant">-</td>
</tr>
<tr className="hover:bg-background-alt/40 transition-colors">
<td className="p-4">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-full bg-primary-container/10 text-primary flex items-center justify-center font-bold text-xs">LW</div>
<span className="font-body-md text-on-surface">Linda Wu</span>
</div>
</td>
<td className="p-4 text-body-sm text-on-surface-variant">linda.wu@creative.io</td>
<td className="p-4">
<span className="px-2.5 py-1 rounded-full bg-emerald-green/10 text-emerald-green text-[10px] font-bold uppercase">Confirmed</span>
</td>
<td className="p-4 text-body-sm text-on-surface-variant">VIP</td>
<td className="p-4 text-right text-body-sm text-on-surface-variant">10m ago</td>
</tr>
<tr className="hover:bg-background-alt/40 transition-colors">
<td className="p-4">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-full bg-background-alt text-on-surface-variant/40 flex items-center justify-center font-bold text-xs">DR</div>
<span className="font-body-md text-on-surface">David Ross</span>
</div>
</td>
<td className="p-4 text-body-sm text-on-surface-variant">d.ross@venture.com</td>
<td className="p-4">
<span className="px-2.5 py-1 rounded-full bg-error-container/20 text-error text-[10px] font-bold uppercase">Declined</span>
</td>
<td className="p-4 text-body-sm text-on-surface-variant">Standard</td>
<td className="p-4 text-right text-body-sm text-on-surface-variant">-</td>
</tr>
<tr className="hover:bg-background-alt/40 transition-colors">
<td className="p-4">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-full bg-secondary-container/20 text-secondary flex items-center justify-center font-bold text-xs">EK</div>
<span className="font-body-md text-on-surface">Elena Kovic</span>
</div>
</td>
<td className="p-4 text-body-sm text-on-surface-variant">elena@kovic-design.de</td>
<td className="p-4">
<span className="px-2.5 py-1 rounded-full bg-emerald-green/10 text-emerald-green text-[10px] font-bold uppercase">Confirmed</span>
</td>
<td className="p-4 text-body-sm text-on-surface-variant">Speaker</td>
<td className="p-4 text-right text-body-sm text-on-surface-variant">1d ago</td>
</tr>
</tbody>
</table>
</div>

<div className="p-4 border-t border-border-gray bg-background-alt/10 flex items-center justify-between">
<span className="text-body-sm text-on-surface-variant">Showing 1 to 15 of 248 entries</span>
<div className="flex items-center gap-1">
<button className="p-1 rounded-lg hover:bg-background-alt transition-colors disabled:opacity-30" disabled="">
<span className="material-symbols-outlined">chevron_left</span>
</button>
<button className="w-8 h-8 rounded-lg bg-primary text-white text-body-sm font-bold">1</button>
<button className="w-8 h-8 rounded-lg hover:bg-background-alt text-body-sm transition-colors">2</button>
<button className="w-8 h-8 rounded-lg hover:bg-background-alt text-body-sm transition-colors">3</button>
<span className="px-2">...</span>
<button className="w-8 h-8 rounded-lg hover:bg-background-alt text-body-sm transition-colors">17</button>
<button className="p-1 rounded-lg hover:bg-background-alt transition-colors">
<span className="material-symbols-outlined">chevron_right</span>
</button>
</div>
</div>
</div>
</div>
</div>

<nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-border-gray flex items-center justify-around z-50">
<button className="flex flex-col items-center gap-1 text-on-surface-variant">
<span className="material-symbols-outlined">dashboard</span>
<span className="text-[10px] font-label-sm">Home</span>
</button>
<button className="flex flex-col items-center gap-1 text-primary">
<span className="material-symbols-outlined">person_book</span>
<span className="text-[10px] font-label-sm">Guests</span>
</button>
<button className="flex flex-col items-center gap-1 text-on-surface-variant">
<span className="material-symbols-outlined">analytics</span>
<span className="text-[10px] font-label-sm">Stats</span>
</button>
<button className="flex flex-col items-center gap-1 text-on-surface-variant">
<span className="material-symbols-outlined">settings</span>
<span className="text-[10px] font-label-sm">Settings</span>
</button>
</nav>
</main>
</div>



        </>
    );
};

export default GuestReports;
