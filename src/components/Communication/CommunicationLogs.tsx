import React from 'react';

const CommunicationLogs: React.FC = () => {
    return (
        <>
            

<aside className="h-screen w-64 fixed left-0 top-0 bg-white dark:bg-inverse-surface shadow-sm border-r border-border-gray dark:border-outline-variant flex flex-col py-base z-50">
<div className="px-6 mb-10 mt-4">
<h1 className="font-headline-md text-headline-md font-bold text-primary dark:text-inverse-primary leading-tight">EventHub360</h1>
<p className="text-on-surface-variant font-label-sm tracking-wider uppercase opacity-70">The Digital Concierge</p>
</div>
<nav className="flex-1 space-y-1">
<a className="group flex items-center px-6 py-4 text-on-surface-variant hover:bg-surface-container-high transition-all duration-200" href="#">
<span className="material-symbols-outlined mr-4" data-icon="dashboard">dashboard</span>
<span className="font-label-md">Dashboard</span>
</a>
<a className="group flex items-center px-6 py-4 text-on-surface-variant hover:bg-surface-container-high transition-all duration-200" href="#">
<span className="material-symbols-outlined mr-4" data-icon="group">group</span>
<span className="font-label-md">Guests</span>
</a>
<a className="group flex items-center px-6 py-4 text-on-surface-variant hover:bg-surface-container-high transition-all duration-200" href="#">
<span className="material-symbols-outlined mr-4" data-icon="local_shipping">local_shipping</span>
<span className="font-label-md">Logistics</span>
</a>
<a className="group relative flex items-center px-6 py-4 text-primary font-bold bg-surface-container transition-all duration-200" href="#">
<span className="material-symbols-outlined mr-4" data-icon="hub">hub</span>
<span className="font-label-md">Comm Center</span>
<div className="active-nav-indicator"></div>
</a>
</nav>
<div className="px-6 pt-4 mt-auto border-t border-border-gray">
<div className="flex items-center gap-3 py-4">
<img className="w-10 h-10 rounded-full border-2 border-primary-fixed" data-alt="A high-quality studio portrait of a professional female event manager with a friendly expression, wearing a tailored blazer in a neutral palette. The background is a blurred high-end hotel lobby, emphasizing a luxury service aesthetic with warm lighting and minimalist decor." src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5cQK6JE754apWpEbL4QSiC7rU1asDXhePAu6gL78-r9Hs59pHhwwIwiTvzLQcFVDnUvDkrIEyGt53CvBvST52WeqXJwZkJgNoo8QqXFylJ5zAqTN5PWFAqShp8d6rDyJIzN3HZg972WBWDsrDZarpbVZWtLPRLcmJzDbCFCBT7xzrIKAyPLjdYWVt_KVkC-HaPVt1MpAMT1Ok9t1GpOeMi2QXIFLxKQhSY-wqEuDm0WruJAy-IekUVCanRYVVN-gLw3wOaKRe82w"/>
<div>
<p className="font-label-md text-on-surface">Elena Vance</p>
<p className="text-label-sm text-on-surface-variant">Lead Concierge</p>
</div>
</div>
</div>
</aside>

<main className="ml-64 min-h-screen">

<header className="h-16 fixed top-0 right-0 left-64 z-40 bg-white/60 backdrop-blur-xl border-b border-border-gray flex justify-between items-center px-container-margin w-full">
<div className="flex items-center w-1/2">
<div className="relative w-full max-w-md">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" data-icon="search">search</span>
<input className="w-full bg-background-alt border-none rounded-xl pl-10 pr-4 py-2 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-body-sm" placeholder="Search comm logs, recipients, or metadata..." type="text"/>
</div>
</div>
<div className="flex items-center gap-4">
<button className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors">
<span className="material-symbols-outlined" data-icon="notifications">notifications</span>
</button>
<button className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors">
<span className="material-symbols-outlined" data-icon="settings">settings</span>
</button>
</div>
</header>

<section className="pt-24 px-container-margin pb-section-gap max-w-[1440px] mx-auto">

<div className="flex justify-between items-end mb-8">
<div>
<h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Communication Logs</h2>
<p className="text-body-md text-on-surface-variant mt-1">Real-time monitoring of all guest and vendor communications.</p>
</div>
<button className="bg-gradient-to-r from-primary to-sunset-orange text-white px-6 py-3 rounded-xl font-label-md flex items-center gap-2 hover:scale-[1.02] hover:shadow-lg transition-all duration-300">
<span className="material-symbols-outlined" data-icon="download">download</span>
                    Export Logs
                </button>
</div>

<div className="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-10">
<div className="bg-white p-6 rounded-[24px] custom-shadow border border-border-gray">
<div className="flex justify-between items-start mb-4">
<div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center text-primary">
<span className="material-symbols-outlined" data-icon="bar_chart">bar_chart</span>
</div>
<span className="text-emerald-green font-label-sm flex items-center">+4.2%</span>
</div>
<p className="text-on-surface-variant font-label-md mb-1">Total Logs</p>
<p className="font-headline-md text-headline-md text-on-surface">45,280</p>
</div>
<div className="bg-white p-6 rounded-[24px] custom-shadow border border-border-gray">
<div className="flex justify-between items-start mb-4">
<div className="w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center text-secondary">
<span className="material-symbols-outlined" data-icon="check_circle">check_circle</span>
</div>
<span className="text-emerald-green font-label-sm flex items-center">Target met</span>
</div>
<p className="text-on-surface-variant font-label-md mb-1">Successful Deliveries</p>
<p className="font-headline-md text-headline-md text-on-surface">98.2%</p>
</div>
<div className="bg-white p-6 rounded-[24px] custom-shadow border border-border-gray">
<div className="flex justify-between items-start mb-4">
<div className="w-12 h-12 rounded-xl bg-error-container flex items-center justify-center text-error">
<span className="material-symbols-outlined" data-icon="error">error</span>
</div>
<span className="text-error font-label-sm flex items-center">-2 active</span>
</div>
<p className="text-on-surface-variant font-label-md mb-1">Active Failures</p>
<p className="font-headline-md text-headline-md text-on-surface">12</p>
</div>
<div className="bg-white p-6 rounded-[24px] custom-shadow border border-border-gray">
<div className="flex justify-between items-start mb-4">
<div className="w-12 h-12 rounded-xl bg-tertiary-fixed flex items-center justify-center text-tertiary">
<span className="material-symbols-outlined" data-icon="timer">timer</span>
</div>
<span className="text-on-surface-variant font-label-sm flex items-center">Low latency</span>
</div>
<p className="text-on-surface-variant font-label-md mb-1">Average Latency</p>
<p className="font-headline-md text-headline-md text-on-surface">1.2s</p>
</div>
</div>

<div className="bg-white rounded-[24px] custom-shadow border border-border-gray overflow-hidden">

<div className="p-6 border-b border-border-gray flex flex-wrap items-center justify-between gap-4">
<div className="flex items-center gap-4">
<div className="flex bg-background-alt p-1 rounded-xl">
<button className="px-4 py-1.5 rounded-lg text-label-sm font-semibold bg-white shadow-sm text-primary">All Channels</button>
<button className="px-4 py-1.5 rounded-lg text-label-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors">Email</button>
<button className="px-4 py-1.5 rounded-lg text-label-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors">WhatsApp</button>
<button className="px-4 py-1.5 rounded-lg text-label-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors">SMS</button>
</div>
<button className="flex items-center gap-2 px-4 py-2 border border-border-gray rounded-xl hover:bg-background-alt transition-colors text-label-sm">
<span className="material-symbols-outlined text-[18px]" data-icon="filter_list">filter_list</span>
                            Status: All
                        </button>
<button className="flex items-center gap-2 px-4 py-2 border border-border-gray rounded-xl hover:bg-background-alt transition-colors text-label-sm">
<span className="material-symbols-outlined text-[18px]" data-icon="calendar_today">calendar_today</span>
                            Oct 24, 2023 - Today
                        </button>
</div>
<div className="flex items-center gap-2 text-on-surface-variant text-label-sm">
<span>Showing 1-10 of 45,280 results</span>
</div>
</div>

<div className="overflow-x-auto">
<table className="w-full text-left">
<thead>
<tr className="bg-background-alt border-b border-border-gray">
<th className="px-6 py-4 font-label-md text-on-surface-variant">Date & Time</th>
<th className="px-6 py-4 font-label-md text-on-surface-variant">Channel</th>
<th className="px-6 py-4 font-label-md text-on-surface-variant">Recipient</th>
<th className="px-6 py-4 font-label-md text-on-surface-variant">Status</th>
<th className="px-6 py-4 font-label-md text-on-surface-variant">Delivery Result</th>
<th className="px-6 py-4 font-label-md text-on-surface-variant text-right">Actions</th>
</tr>
</thead>
<tbody className="divide-y divide-border-gray">

<tr className="hover:bg-background-alt/50 transition-colors group">
<td className="px-6 py-5 whitespace-nowrap">
<div className="flex flex-col">
<span className="text-on-surface font-medium">Oct 24, 2023</span>
<span className="text-label-sm text-on-surface-variant">14:20:12</span>
</div>
</td>
<td className="px-6 py-5 whitespace-nowrap">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary" data-icon="mail">mail</span>
<span className="text-body-sm font-medium">Email</span>
</div>
</td>
<td className="px-6 py-5">
<div className="flex flex-col">
<span className="text-on-surface font-semibold">Julian Thorne</span>
<span className="text-label-sm text-on-surface-variant">julian@company.com</span>
</div>
</td>
<td className="px-6 py-5">
<span className="status-pill bg-emerald-green/10 text-emerald-green">Delivered</span>
</td>
<td className="px-6 py-5">
<p className="text-body-sm text-on-surface-variant max-w-xs truncate">Accepted by SMTP, bounce check passed.</p>
</td>
<td className="px-6 py-5 text-right">
<button className="p-2 rounded-lg hover:bg-white transition-all text-on-surface-variant">
<span className="material-symbols-outlined" data-icon="more_vert">more_vert</span>
</button>
</td>
</tr>

<tr className="hover:bg-background-alt/50 transition-colors">
<td className="px-6 py-5 whitespace-nowrap">
<div className="flex flex-col">
<span className="text-on-surface font-medium">Oct 24, 2023</span>
<span className="text-label-sm text-on-surface-variant">14:18:45</span>
</div>
</td>
<td className="px-6 py-5 whitespace-nowrap">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-[#25D366]" data-icon="chat">chat</span>
<span className="text-body-sm font-medium">WhatsApp</span>
</div>
</td>
<td className="px-6 py-5">
<div className="flex flex-col">
<span className="text-on-surface font-semibold">Sarah Montgomery</span>
<span className="text-label-sm text-on-surface-variant">+1 (555) 098-1234</span>
</div>
</td>
<td className="px-6 py-5">
<span className="status-pill bg-primary/10 text-primary">Sent</span>
</td>
<td className="px-6 py-5">
<p className="text-body-sm text-on-surface-variant max-w-xs truncate">Handed off to WhatsApp gateway.</p>
</td>
<td className="px-6 py-5 text-right">
<button className="p-2 rounded-lg hover:bg-white transition-all text-on-surface-variant">
<span className="material-symbols-outlined" data-icon="more_vert">more_vert</span>
</button>
</td>
</tr>

<tr className="hover:bg-background-alt/50 transition-colors">
<td className="px-6 py-5 whitespace-nowrap">
<div className="flex flex-col">
<span className="text-on-surface font-medium">Oct 24, 2023</span>
<span className="text-label-sm text-on-surface-variant">14:15:22</span>
</div>
</td>
<td className="px-6 py-5 whitespace-nowrap">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-secondary" data-icon="sms">sms</span>
<span className="text-body-sm font-medium">SMS</span>
</div>
</td>
<td className="px-6 py-5">
<div className="flex flex-col">
<span className="text-on-surface font-semibold">David Kincaid</span>
<span className="text-label-sm text-on-surface-variant">+44 7700 900123</span>
</div>
</td>
<td className="px-6 py-5">
<span className="status-pill bg-error/10 text-error">Failed</span>
</td>
<td className="px-6 py-5">
<p className="text-body-sm text-on-surface-variant max-w-xs truncate">Invalid Number: Carrier reported 404.</p>
</td>
<td className="px-6 py-5 text-right">
<button className="p-2 rounded-lg hover:bg-white transition-all text-on-surface-variant">
<span className="material-symbols-outlined" data-icon="more_vert">more_vert</span>
</button>
</td>
</tr>

<tr className="hover:bg-background-alt/50 transition-colors">
<td className="px-6 py-5 whitespace-nowrap">
<div className="flex flex-col">
<span className="text-on-surface font-medium">Oct 24, 2023</span>
<span className="text-label-sm text-on-surface-variant">14:12:01</span>
</div>
</td>
<td className="px-6 py-5 whitespace-nowrap">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary" data-icon="mail">mail</span>
<span className="text-body-sm font-medium">Email</span>
</div>
</td>
<td className="px-6 py-5">
<div className="flex flex-col">
<span className="text-on-surface font-semibold">Emily Zhang</span>
<span className="text-label-sm text-on-surface-variant">ezhang@techflow.io</span>
</div>
</td>
<td className="px-6 py-5">
<span className="status-pill bg-tertiary/10 text-tertiary">Pending</span>
</td>
<td className="px-6 py-5">
<p className="text-body-sm text-on-surface-variant max-w-xs truncate">Carrier Delay: Retrying in 5 minutes.</p>
</td>
<td className="px-6 py-5 text-right">
<button className="p-2 rounded-lg hover:bg-white transition-all text-on-surface-variant">
<span className="material-symbols-outlined" data-icon="more_vert">more_vert</span>
</button>
</td>
</tr>

<tr className="hover:bg-background-alt/50 transition-colors">
<td className="px-6 py-5 whitespace-nowrap">
<div className="flex flex-col">
<span className="text-on-surface font-medium">Oct 24, 2023</span>
<span className="text-label-sm text-on-surface-variant">14:10:55</span>
</div>
</td>
<td className="px-6 py-5 whitespace-nowrap">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-[#25D366]" data-icon="chat">chat</span>
<span className="text-body-sm font-medium">WhatsApp</span>
</div>
</td>
<td className="px-6 py-5">
<div className="flex flex-col">
<span className="text-on-surface font-semibold">Robert De Luca</span>
<span className="text-label-sm text-on-surface-variant">+39 312 456 7890</span>
</div>
</td>
<td className="px-6 py-5">
<span className="status-pill bg-emerald-green/10 text-emerald-green">Read</span>
</td>
<td className="px-6 py-5">
<p className="text-body-sm text-on-surface-variant max-w-xs truncate">Read by Recipient (Double Blue Tick).</p>
</td>
<td className="px-6 py-5 text-right">
<button className="p-2 rounded-lg hover:bg-white transition-all text-on-surface-variant">
<span className="material-symbols-outlined" data-icon="more_vert">more_vert</span>
</button>
</td>
</tr>
</tbody>
</table>
</div>

<div className="p-6 border-t border-border-gray flex items-center justify-between">
<button className="px-4 py-2 text-label-sm font-semibold text-on-surface-variant hover:text-on-surface flex items-center gap-2 transition-colors">
<span className="material-symbols-outlined" data-icon="chevron_left">chevron_left</span>
                        Previous
                    </button>
<div className="flex items-center gap-2">
<button className="w-8 h-8 rounded-lg bg-primary text-white text-label-sm font-bold">1</button>
<button className="w-8 h-8 rounded-lg hover:bg-background-alt transition-colors text-label-sm">2</button>
<button className="w-8 h-8 rounded-lg hover:bg-background-alt transition-colors text-label-sm">3</button>
<span className="px-2">...</span>
<button className="w-8 h-8 rounded-lg hover:bg-background-alt transition-colors text-label-sm">452</button>
</div>
<button className="px-4 py-2 text-label-sm font-semibold text-on-surface-variant hover:text-on-surface flex items-center gap-2 transition-colors">
                        Next
                        <span className="material-symbols-outlined" data-icon="chevron_right">chevron_right</span>
</button>
</div>
</div>

<div className="mt-gutter grid grid-cols-1 md:grid-cols-2 gap-gutter">
<div className="glass-panel p-8 rounded-[24px] border border-border-gray/50 flex flex-col items-center justify-center text-center">
<div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-4 custom-shadow">
<span className="material-symbols-outlined text-primary text-3xl" data-icon="monitoring">monitoring</span>
</div>
<h3 className="font-headline-md text-headline-md text-on-surface mb-2">Live Analysis</h3>
<p className="text-body-md text-on-surface-variant max-w-sm">Select any log entry to view detailed header information, payload data, and retry history.</p>
</div>
<div className="bg-primary-fixed/30 p-8 rounded-[24px] relative overflow-hidden flex flex-col justify-between">
<div>
<h3 className="font-headline-md text-headline-md text-on-primary-container mb-2">Automation Alert</h3>
<p className="text-body-md text-on-primary-container/80 max-w-sm">We detected 12 delivery failures in the last 15 minutes. Would you like to re-route via secondary SMS gateway?</p>
</div>
<div className="mt-8 flex gap-4">
<button className="bg-primary text-white px-6 py-2 rounded-xl font-label-md hover:shadow-lg transition-all">Re-route Traffic</button>
<button className="bg-white/80 text-on-surface px-6 py-2 rounded-xl font-label-md hover:bg-white transition-all">View Failure Map</button>
</div>

<div className="absolute -right-10 -bottom-10 w-40 h-40 bg-sunset-orange/20 rounded-full blur-3xl"></div>
</div>
</div>
</section>
</main>


        </>
    );
};

export default CommunicationLogs;
