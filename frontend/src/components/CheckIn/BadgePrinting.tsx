import React from 'react';

const BadgePrinting: React.FC = () => {
    return (
        <>
            

<aside className="h-screen w-64 fixed left-0 top-0 bg-surface-container-low flex flex-col p-container-margin z-50">
<div className="mb-10">
<h1 className="font-headline-md text-headline-md font-bold text-primary tracking-tight">EventHub360</h1>
<p className="text-label-sm font-label-sm text-on-surface-variant opacity-70">The Digital Concierge</p>
</div>
<nav className="flex-1 space-y-2">

<div className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer rounded-lg font-label-md text-label-md">
<span className="material-symbols-outlined">dashboard</span>
<span>Dashboard</span>
</div>
<div className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer rounded-lg font-label-md text-label-md">
<span className="material-symbols-outlined">group</span>
<span>Guests</span>
</div>
<div className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer rounded-lg font-label-md text-label-md">
<span className="material-symbols-outlined">event</span>
<span>Events</span>
</div>

<div className="flex flex-col gap-1">
<div className="flex items-center gap-3 px-4 py-3 bg-primary-container text-on-primary-container rounded-lg font-label-md text-label-md cursor-pointer">
<span className="material-symbols-outlined">local_shipping</span>
<span>Logistics</span>
</div>
<div className="pl-12 py-2">
<div className="text-primary font-bold border-l-2 border-primary pl-4 text-label-md font-label-md">Badge Setup</div>
</div>
</div>
<div className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer rounded-lg font-label-md text-label-md">
<span className="material-symbols-outlined">settings</span>
<span>Settings</span>
</div>
</nav>
<div className="mt-auto">
<button className="w-full gradient-button text-white py-3 px-4 rounded-xl font-label-md text-label-md flex items-center justify-center gap-2 shadow-lg">
<span className="material-symbols-outlined text-sm">add</span>
                Create Event
            </button>
</div>
</aside>

<header className="flex justify-between items-center px-gutter h-16 w-[calc(100%-16rem)] ml-64 fixed top-0 z-40 bg-surface/60 backdrop-blur-md border-b border-border-gray">
<div className="flex items-center bg-background-alt px-4 py-2 rounded-full w-96 border border-transparent focus-within:border-primary focus-within:bg-white transition-all group">
<span className="material-symbols-outlined text-on-surface-variant group-focus-within:text-primary transition-colors">search</span>
<input className="bg-transparent border-none focus:ring-0 text-body-sm font-body-sm w-full" placeholder="Search guests, printers, or logs..." type="text"/>
</div>
<div className="flex items-center gap-6">
<div className="flex gap-4">
<span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer transition-colors">notifications</span>
<span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer transition-colors">help_outline</span>
</div>
<div className="flex items-center gap-3 border-l border-border-gray pl-6">
<div className="text-right">
<p className="text-label-md font-label-md text-on-surface">Alex Rivera</p>
<p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Event Manager</p>
</div>
<img className="w-10 h-10 rounded-full border-2 border-primary/20" data-alt="A professional headshot of a modern event manager in a well-lit hospitality setting, reflecting a warm yet focused executive aesthetic with soft ambient lighting and a clean, high-end background." src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6o-NkTuSU3_xugu-Rv3DpRME1LPmX57LN5WVe33uMXfO2QKs-Zf9A97RY9xaTKCiNek8-pLWvcp0Tit_CtmkgBhOkBc3-TJnHpW3tjEXvkBcqSOoIZ_Gf-SGdGDmhBCN-_wpFGCvokHZ-apOMbexdPsI1YykYue7tFGulfXjOl5rQCWUN6JoW_q3w1pzvMSR2U1c1n1RNZPJNOZX9vjpjmeN66mpn_nH5Z7ixPtFhIKBENp-qISgiuED6RzKWp0Cj2z6b6yIjvDU"/>
</div>
</div>
</header>

<main className="ml-64 pt-24 px-container-margin pb-container-margin min-h-screen">
<header className="mb-8">
<h2 className="font-headline-lg text-headline-lg text-on-background">Badge Printing Command Center</h2>
<p className="text-body-md text-on-surface-variant">Manage your event's physical identity workflow in real-time.</p>
</header>

<section className="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-section-gap">
<div className="level-1-card p-6 flex items-center gap-4">
<div className="w-12 h-12 rounded-2xl bg-surface-container-high flex items-center justify-center text-primary">
<span className="material-symbols-outlined">print</span>
</div>
<div>
<p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Active Printers</p>
<p className="text-headline-md font-headline-md text-on-background">04 <span className="text-label-sm text-emerald-green">/ 05</span></p>
</div>
</div>
<div className="level-1-card p-6 flex items-center gap-4">
<div className="w-12 h-12 rounded-2xl bg-surface-container-high flex items-center justify-center text-secondary">
<span className="material-symbols-outlined">view_list</span>
</div>
<div>
<p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Queue Size</p>
<p className="text-headline-md font-headline-md text-on-background">12 <span className="text-label-sm text-on-surface-variant">Pending</span></p>
</div>
</div>
<div className="level-1-card p-6 flex items-center gap-4">
<div className="w-12 h-12 rounded-2xl bg-surface-container-high flex items-center justify-center text-tertiary">
<span className="material-symbols-outlined">badge</span>
</div>
<div>
<p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Badges Today</p>
<p className="text-headline-md font-headline-md text-on-background">1,248</p>
</div>
</div>
<div className="level-1-card p-6 flex items-center gap-4 border-l-4 border-error">
<div className="w-12 h-12 rounded-2xl bg-error-container flex items-center justify-center text-error">
<span className="material-symbols-outlined">warning</span>
</div>
<div>
<p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Error Alerts</p>
<p className="text-headline-md font-headline-md text-error">02</p>
</div>
</div>
</section>

<div className="grid grid-cols-12 gap-gutter items-start">

<section className="col-span-3 space-y-6">
<div className="level-1-card overflow-hidden">
<div className="px-6 py-4 border-b border-border-gray bg-off-white flex justify-between items-center">
<h3 className="font-label-md text-label-md text-on-surface uppercase tracking-wider">Connected Units</h3>
<span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary">refresh</span>
</div>
<div className="p-4 space-y-3">

<div className="p-4 rounded-xl border border-border-gray hover:border-primary/30 transition-all cursor-pointer group">
<div className="flex justify-between mb-2">
<p className="text-label-md font-bold text-on-background">Main Gate ZD621</p>
<span className="w-2 h-2 rounded-full bg-emerald-green"></span>
</div>
<p className="text-body-sm font-body-sm text-on-surface-variant mb-4">Status: Online</p>
<button className="w-full py-2 px-3 rounded-lg bg-surface-container-highest text-on-surface text-label-sm font-label-sm flex items-center justify-center gap-2 hover:bg-primary-fixed transition-colors">
<span className="material-symbols-outlined text-base">magic_button</span>
                                Test Print
                            </button>
</div>

<div className="p-4 rounded-xl border border-border-gray hover:border-primary/30 transition-all cursor-pointer">
<div className="flex justify-between mb-2">
<p className="text-label-md font-bold text-on-background">VIP Lounge Dymo</p>
<span className="w-2 h-2 rounded-full bg-sunset-orange"></span>
</div>
<p className="text-body-sm font-body-sm text-on-surface-variant mb-4">Status: Paper Low</p>
<button className="w-full py-2 px-3 rounded-lg bg-surface-container-highest text-on-surface text-label-sm font-label-sm flex items-center justify-center gap-2">
<span className="material-symbols-outlined text-base">magic_button</span>
                                Test Print
                            </button>
</div>

<div className="p-4 rounded-xl border border-error/20 bg-error-container/10">
<div className="flex justify-between mb-2">
<p className="text-label-md font-bold text-error">Check-in B1</p>
<span className="w-2 h-2 rounded-full bg-error"></span>
</div>
<p className="text-body-sm font-body-sm text-on-surface-variant mb-4">Status: Offline</p>
<button className="w-full py-2 px-3 rounded-lg bg-error-container text-on-error-container text-label-sm font-label-sm flex items-center justify-center gap-2">
<span className="material-symbols-outlined text-base">settings</span>
                                Troubleshoot
                            </button>
</div>
</div>
</div>
</section>

<section className="col-span-6 space-y-6">
<div className="level-1-card overflow-hidden">
<div className="px-6 py-4 border-b border-border-gray bg-off-white flex justify-between items-center">
<h3 className="font-label-md text-label-md text-on-surface uppercase tracking-wider">Badge Design Editor</h3>
<div className="flex gap-2">
<button className="px-3 py-1 text-label-sm font-label-sm border border-border-gray rounded-md hover:bg-background transition-colors">4x6 Card</button>
<button className="px-3 py-1 text-label-sm font-label-sm bg-primary/10 text-primary border border-primary/20 rounded-md">Portrait</button>
</div>
</div>
<div className="p-8 flex flex-col items-center justify-center bg-surface-container-lowest">

<div className="w-[320px] h-[480px] bg-white shadow-2xl rounded-lg overflow-hidden border border-border-gray relative flex flex-col items-center pt-10" id="badge-canvas">
<div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
<span className="material-symbols-outlined text-primary text-4xl">straight</span>
</div>
<p className="text-label-md font-label-md uppercase tracking-[0.2em] text-primary mb-2" id="preview-category">VIP PASS</p>
<h4 className="font-headline-md text-headline-md text-on-background text-center px-4 mb-4" id="preview-name">Julianne Abernathy</h4>
<p className="text-body-sm font-body-sm text-on-surface-variant mb-12" id="preview-company">Global Hospitality Group</p>
<div className="mt-auto mb-10">
<div className="w-32 h-32 bg-background-alt border border-border-gray rounded-xl flex items-center justify-center p-2">
<span className="material-symbols-outlined text-6xl text-on-surface-variant/30">qr_code_2</span>
</div>
</div>
<div className="w-full h-4 bg-primary"></div>
</div>

<div className="mt-10 w-full grid grid-cols-2 gap-gutter">
<div className="space-y-4">
<label className="flex items-center gap-3 cursor-pointer">
<input checked="" className="rounded border-border-gray text-primary focus:ring-primary w-5 h-5" type="checkbox"/>
<span className="text-body-md font-body-md">Show Event Logo</span>
</label>
<label className="flex items-center gap-3 cursor-pointer">
<input checked="" className="rounded border-border-gray text-primary focus:ring-primary w-5 h-5" type="checkbox"/>
<span className="text-body-md font-body-md">Include QR Code</span>
</label>
</div>
<div className="space-y-4">
<label className="flex items-center gap-3 cursor-pointer">
<input checked="" className="rounded border-border-gray text-primary focus:ring-primary w-5 h-5" type="checkbox"/>
<span className="text-body-md font-body-md">Center Alignment</span>
</label>
<label className="flex items-center gap-3 cursor-pointer">
<input className="rounded border-border-gray text-primary focus:ring-primary w-5 h-5" type="checkbox"/>
<span className="text-body-md font-body-md">Display Job Title</span>
</label>
</div>
</div>
</div>
<div className="px-6 py-6 border-t border-border-gray bg-off-white flex gap-4">
<button className="flex-1 gradient-button text-white font-label-md text-label-md py-4 rounded-xl shadow-lg">Save Template</button>
<button className="flex-1 bg-white border border-border-gray text-on-surface font-label-md text-label-md py-4 rounded-xl hover:bg-background transition-all">Print Preview</button>
</div>
</div>
</section>

<section className="col-span-3 space-y-6">
<div className="level-1-card flex flex-col h-[700px]">
<div className="px-6 py-4 border-b border-border-gray bg-off-white">
<h3 className="font-label-md text-label-md text-on-surface uppercase tracking-wider">Live Print Queue</h3>
</div>
<div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">

<div className="p-4 rounded-xl bg-primary/5 border border-primary/20 relative overflow-hidden group">
<div className="absolute top-0 left-0 h-1 bg-primary w-2/3"></div>
<div className="flex justify-between items-start">
<div>
<p className="text-label-md font-bold text-on-background">Marcus Thorne</p>
<p className="text-[10px] text-on-surface-variant">Just now • VIP</p>
</div>
<div className="flex items-center text-primary gap-1">
<span className="material-symbols-outlined text-sm animate-spin">refresh</span>
<span className="text-[10px] font-bold uppercase">Printing</span>
</div>
</div>
</div>

<div className="p-4 rounded-xl border border-border-gray hover:bg-background transition-colors group">
<div className="flex justify-between items-start">
<div>
<p className="text-label-md font-bold text-on-background">Elena Rodriguez</p>
<p className="text-[10px] text-on-surface-variant">2m ago • Speaker</p>
</div>
<span className="material-symbols-outlined text-emerald-green text-lg">check_circle</span>
</div>
</div>

<div className="p-4 rounded-xl border border-border-gray hover:bg-background transition-colors group">
<div className="flex justify-between items-start">
<div>
<p className="text-label-md font-bold text-on-background">Chen Wei</p>
<p className="text-[10px] text-on-surface-variant">5m ago • Press</p>
</div>
<span className="material-symbols-outlined text-emerald-green text-lg">check_circle</span>
</div>
</div>

<div className="p-4 rounded-xl bg-error-container/20 border border-error/20 group">
<div className="flex justify-between items-start">
<div>
<p className="text-label-md font-bold text-error">Sarah Jenkins</p>
<p className="text-[10px] text-on-surface-variant">12m ago • Attendee</p>
</div>
<span className="material-symbols-outlined text-error text-lg" title="Paper Jam">error</span>
</div>
<button className="mt-2 text-[10px] font-bold text-error uppercase underline tracking-widest cursor-pointer">Retry Print</button>
</div>

<div className="p-4 rounded-xl border border-border-gray opacity-60 hover:opacity-100 transition-all">
<div className="flex justify-between items-start">
<div>
<p className="text-label-md font-bold text-on-background">Robert Pattinson</p>
<p className="text-[10px] text-on-surface-variant">15m ago • Attendee</p>
</div>
<span className="material-symbols-outlined text-emerald-green text-lg">check_circle</span>
</div>
</div>
<div className="p-4 rounded-xl border border-border-gray opacity-60">
<div className="flex justify-between items-start">
<div>
<p className="text-label-md font-bold text-on-background">Linda Hamilton</p>
<p className="text-[10px] text-on-surface-variant">18m ago • Staff</p>
</div>
<span className="material-symbols-outlined text-emerald-green text-lg">check_circle</span>
</div>
</div>
<div className="p-4 rounded-xl border border-border-gray opacity-60">
<div className="flex justify-between items-start">
<div>
<p className="text-label-md font-bold text-on-background">David Byrne</p>
<p className="text-[10px] text-on-surface-variant">22m ago • VIP</p>
</div>
<span className="material-symbols-outlined text-emerald-green text-lg">check_circle</span>
</div>
</div>
</div>
<div className="p-4 bg-background-alt border-t border-border-gray">
<button className="w-full text-center text-label-sm font-label-sm text-primary py-2 hover:bg-white rounded-lg transition-colors">Clear Finished Jobs</button>
</div>
</div>
</section>
</div>
</main>


        </>
    );
};

export default BadgePrinting;
