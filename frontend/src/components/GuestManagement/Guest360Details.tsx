import React from 'react';

const Guest360Details: React.FC = () => {
    return (
        <>
            

<aside className="h-screen w-64 fixed left-0 top-0 bg-surface dark:bg-on-background shadow-[4px_0_20px_rgba(31,41,55,0.05)] border-r border-border-gray dark:border-on-surface-variant/20 flex flex-col py-base px-4 z-50">
<div className="mb-8 px-2">
<h1 className="text-headline-md font-headline-md text-primary dark:text-primary-fixed-dim">EventHub360</h1>
<p className="font-label-sm text-on-surface-variant opacity-70">Premium Concierge</p>
</div>
<nav className="flex-1 space-y-1">

<a className="flex items-center gap-3 px-3 py-2.5 text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors hover:bg-surface-container-low rounded-lg group" href="#">
<span className="material-symbols-outlined text-[22px]">dashboard</span>
<span className="font-body-md">Dashboard</span>
</a>
<a className="flex items-center gap-3 px-3 py-2.5 text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors hover:bg-surface-container-low rounded-lg" href="#">
<span className="material-symbols-outlined text-[22px]">contacts</span>
<span className="font-body-md">CRM</span>
</a>
<a className="flex items-center gap-3 px-3 py-2.5 text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors hover:bg-surface-container-low rounded-lg" href="#">
<span className="material-symbols-outlined text-[22px]">payments</span>
<span className="font-body-md">Sales</span>
</a>
<a className="flex items-center gap-3 px-3 py-2.5 text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors hover:bg-surface-container-low rounded-lg" href="#">
<span className="material-symbols-outlined text-[22px]">event</span>
<span className="font-body-md">Events</span>
</a>
<a className="flex items-center gap-3 px-3 py-2.5 text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors hover:bg-surface-container-low rounded-lg" href="#">
<span className="material-symbols-outlined text-[22px]">favorite</span>
<span className="font-body-md">Weddings</span>
</a>

<a className="flex items-center gap-3 px-3 py-2.5 text-primary dark:text-primary-fixed-dim font-bold bg-surface-container-low dark:bg-surface-variant/10 rounded-lg" href="#">
<span className="material-symbols-outlined text-[22px]" style="font-variation-settings: 'FILL' 1;">group</span>
<span className="font-body-md">Guests</span>
</a>
<a className="flex items-center gap-3 px-3 py-2.5 text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors hover:bg-surface-container-low rounded-lg" href="#">
<span className="material-symbols-outlined text-[22px]">handshake</span>
<span className="font-body-md">Vendors</span>
</a>
<a className="flex items-center gap-3 px-3 py-2.5 text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors hover:bg-surface-container-low rounded-lg" href="#">
<span className="material-symbols-outlined text-[22px]">hotel</span>
<span className="font-body-md">Hotels</span>
</a>
</nav>
<div className="pt-4 border-t border-border-gray/50 mt-auto space-y-1">
<button className="w-full coral-gradient text-white py-3 rounded-xl font-headline-md text-body-md mb-4 shadow-lg hover:scale-102 transition-transform">
                Create Event
            </button>
<a className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:text-primary" href="#">
<span className="material-symbols-outlined">help</span>
<span className="font-body-md">Help Center</span>
</a>
<a className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:text-primary" href="#">
<span className="material-symbols-outlined">logout</span>
<span className="font-body-md">Logout</span>
</a>
</div>
</aside>

<header className="fixed top-0 right-0 h-16 left-64 bg-surface/80 dark:bg-on-background/80 backdrop-blur-xl border-b border-border-gray dark:border-on-surface-variant/20 flex justify-between items-center px-gutter z-40">
<div className="flex items-center flex-1 max-w-xl">
<div className="relative w-full">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
<input className="w-full pl-10 pr-4 py-2 bg-background-alt border-none rounded-full focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all text-body-sm" placeholder="Search guests, events, or bookings..." type="text"/>
</div>
</div>
<div className="flex items-center gap-6">
<nav className="hidden md:flex gap-6">
<a className="text-label-md font-label-md text-on-surface-variant hover:text-primary transition-colors" href="#">Directory</a>
<a className="text-label-md font-label-md text-on-surface-variant hover:text-primary transition-colors" href="#">Resources</a>
</nav>
<div className="flex gap-4 items-center pl-6 border-l border-border-gray/50">
<button className="relative">
<span className="material-symbols-outlined text-on-surface-variant">notifications</span>
<span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full"></span>
</button>
<button><span className="material-symbols-outlined text-on-surface-variant">chat_bubble</span></button>
<div className="h-8 w-8 rounded-full overflow-hidden border border-border-gray">
<img alt="Administrator Portrait" className="w-full h-full object-cover" data-alt="Professional headshot of a luxury event concierge manager. He is a middle-aged man with a refined appearance, wearing a sharp charcoal grey tailored suit and a crisp white shirt. The background is a blurred, high-end hotel lobby with warm golden lighting and marble surfaces, reflecting a premium hospitality environment." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDX8ki8LshwJsz4lyZHFR9x2GdvWRgnujBGr3og8sVfcvq6e_bAqbk28rLDYT5Ty6LQZM0m15eN7rp7mzsCD37sKOeDlWXiAgyqMe4rSrxMs55Kbm4PzhINwydWdC6S8gTyAjkihiKa_bzM0OcrwqRazd3zi9gDsMPnHuGB3R0pkrM68bGJpTbANculJFUrCkAk5Kk03E8iwX7uigMS9zXChIYkO1s2MjVjCacLK5SD-0LL__Yh63_mMNK6rYH4kD66cHw2mDKw7z0"/>
</div>
</div>
</div>
</header>

<main className="ml-64 pt-24 pb-12 px-container-margin max-w-[1440px]">

<section className="mb-gutter">
<div className="bg-white rounded-card shadow-soft p-8 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden">

<div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
<div className="relative">
<div className="w-32 h-32 md:w-40 md:h-40 rounded-card overflow-hidden ring-4 ring-white shadow-soft">
<img alt="Jameson Vanderbilt" className="w-full h-full object-cover" data-alt="A high-resolution portrait of an elegant, distinguished gentleman in his late 40s with a confident and warm smile. He has neatly styled hair and wears a bespoke navy blue velvet dinner jacket. The lighting is soft and cinematic, with a warm golden hue reminiscent of a luxury ballroom setting. The overall mood is sophisticated and exclusive." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHiuhf2I9OMFAe4ZbHEr6vHbjNa4L7kwZnGluAIigMILfvjfV-bZvqFnwRsFcqva7Ovqde_2_Oe0RoUYD0sa_EH_Eic5xIwnsjGugbumeSlORTAiYV0-HaUg_N0JklsAhaHCyDRBJQmSbwvs_C0SCmzH1CNRQWikQaMt01Je2BvfS_n3jhpr2f0C5etXxZlCPX616UyZAVDVWZtjKl359fMgDo5hzvGajfvz67Ub0gHWblw6eOpUw6G9-Bjae1YS79BNAT90aBdtY"/>
</div>
<div className="absolute -bottom-2 -right-2 bg-secondary text-white px-3 py-1 rounded-full text-label-sm font-label-md shadow-md flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]" style="font-variation-settings: 'FILL' 1;">stars</span>
                        VIP
                    </div>
</div>
<div className="flex-1 text-center md:text-left">
<div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
<h2 className="text-display-lg font-display-lg text-on-surface">Jameson Vanderbilt</h2>
<span className="inline-flex items-center px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-label-sm font-label-md w-fit mx-auto md:mx-0">
                            Platinum Member
                        </span>
</div>
<p className="text-body-lg text-on-surface-variant mb-6">Chairman, Vanderbilt Global Enterprises</p>
<div className="flex flex-wrap justify-center md:justify-start gap-6 text-body-md text-on-surface-variant">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[20px]">mail</span>
                            j.vanderbilt@vge.com
                        </div>
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[20px]">phone_iphone</span>
                            +1 (555) 012-3456
                        </div>
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[20px]">location_on</span>
                            New York, USA
                        </div>
</div>
</div>
<div className="flex gap-4 self-center md:self-start">
<button className="px-6 py-3 border border-secondary text-secondary rounded-xl font-label-md hover:bg-secondary-fixed/10 transition-all">
                        Edit Profile
                    </button>
<button className="px-6 py-3 coral-gradient text-white rounded-xl font-label-md shadow-lg flex items-center gap-2 hover:scale-105 transition-all">
<span className="material-symbols-outlined text-[20px]">send</span>
                        Send Message
                    </button>
</div>
</div>
</section>
<div className="grid grid-cols-12 gap-gutter">

<div className="col-span-12 lg:col-span-8 space-y-gutter">

<div className="bg-white rounded-card shadow-soft p-8">
<div className="flex justify-between items-center mb-6">
<h3 className="text-headline-md font-headline-md">RSVP &amp; Event Attendance</h3>
<span className="px-4 py-1 bg-emerald-green/10 text-emerald-green rounded-full text-label-sm font-bold flex items-center gap-2">
<span className="material-symbols-outlined text-[16px]" style="font-variation-settings: 'FILL' 1;">check_circle</span>
                            CONFIRMED
                        </span>
</div>
<div className="flex flex-col md:flex-row gap-8">
<div className="flex-1 p-6 bg-background rounded-2xl border border-border-gray/50">
<div className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-2">Current Event</div>
<div className="text-body-lg font-bold text-on-surface mb-4">Corporate Gala 2024: Innovation Tomorrow</div>
<div className="flex items-center gap-4 text-body-sm text-on-surface-variant">
<div className="flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">calendar_today</span> Oct 12, 2024</div>
<div className="flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">location_city</span> Metropolitan Museum</div>
</div>
</div>
<div className="flex-1 space-y-4">
<div>
<label className="text-label-sm text-on-surface-variant font-semibold">Dietary Preferences</label>
<div className="flex flex-wrap gap-2 mt-2">
<span className="px-3 py-1 bg-tertiary-fixed-dim/30 text-tertiary text-label-sm rounded-full">Shellfish Allergy</span>
<span className="px-3 py-1 bg-tertiary-fixed-dim/30 text-tertiary text-label-sm rounded-full">Keto-Friendly Preferred</span>
</div>
</div>
<div>
<label className="text-label-sm text-on-surface-variant font-semibold">Special Requests</label>
<p className="text-body-sm text-on-surface mt-1 italic font-medium text-primary">"Prefers sparkling water with fresh lime at all times. Requesting a quiet lounge access for a 30-min call at 9 PM."</p>
</div>
</div>
</div>
</div>

<div className="grid md:grid-cols-2 gap-gutter">

<div className="bg-white rounded-card shadow-soft p-8 border-t-4 border-secondary">
<div className="flex items-center gap-3 mb-6">
<div className="w-10 h-10 rounded-full bg-secondary-fixed/30 text-secondary flex items-center justify-center">
<span className="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">hotel</span>
</div>
<h3 className="text-headline-md font-headline-md">Accommodation</h3>
</div>
<div className="mb-4">
<div className="text-body-lg font-bold text-on-surface">The Ritz-Carlton, Manhattan</div>
<div className="text-body-md text-on-surface-variant">Executive Suite, Room 402</div>
</div>
<div className="flex justify-between py-3 border-y border-border-gray/50 text-body-sm">
<span className="text-on-surface-variant">Check-in</span>
<span className="font-bold">Oct 11, 3:00 PM</span>
</div>
<div className="flex justify-between py-3 text-body-sm">
<span className="text-on-surface-variant">Check-out</span>
<span className="font-bold">Oct 13, 12:00 PM</span>
</div>
<button className="w-full mt-4 py-2 text-primary font-label-md hover:bg-primary/5 rounded-lg transition-all underline underline-offset-4">
                            View Reservation Details
                        </button>
</div>

<div className="bg-white rounded-card shadow-soft p-8 border-t-4 border-primary">
<div className="flex items-center gap-3 mb-6">
<div className="w-10 h-10 rounded-full bg-primary-fixed/30 text-primary flex items-center justify-center">
<span className="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">commute</span>
</div>
<h3 className="text-headline-md font-headline-md">Transportation</h3>
</div>
<div className="mb-4">
<div className="text-body-lg font-bold text-on-surface">Airport Pickup (JFK)</div>
<div className="text-body-md text-on-surface-variant">Cadillac Escalade ESV • Black</div>
</div>
<div className="flex justify-between py-3 border-y border-border-gray/50 text-body-sm">
<span className="text-on-surface-variant">Scheduled For</span>
<span className="font-bold">Oct 11, 10:30 AM</span>
</div>
<div className="flex justify-between py-3 text-body-sm items-center">
<span className="text-on-surface-variant">Driver</span>
<div className="flex items-center gap-2 font-bold">
<span>Robert S.</span>
<span className="material-symbols-outlined text-emerald-green text-[18px]">verified</span>
</div>
</div>
<div className="mt-4 p-3 bg-background-alt rounded-xl flex items-center justify-between">
<span className="text-body-sm font-medium">Tracking Link Sent</span>
<span className="material-symbols-outlined text-primary">check</span>
</div>
</div>
</div>

<div className="bg-white rounded-card shadow-soft p-8">
<div className="flex justify-between items-start mb-8">
<div>
<h3 className="text-headline-md font-headline-md">Seating Assignment</h3>
<p className="text-body-sm text-on-surface-variant">Main Ballroom Floor Plan</p>
</div>
<div className="text-right">
<div className="text-display-lg-mobile font-display-lg text-primary">Table 12</div>
<div className="text-label-sm font-bold text-secondary uppercase tracking-widest">VIP Section A</div>
</div>
</div>
<div className="relative w-full h-64 bg-background-alt rounded-2xl overflow-hidden group">
<img alt="Table Map" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" data-alt="An artistic, abstract overhead architectural floor plan of a luxury gala ballroom. The map uses a minimalist aesthetic with clean lines in charcoal and gold. Specific tables are glowing with soft amber light, and Table 12 is prominently highlighted with a radiant coral pulse. The overall visual style is elegant, high-contrast, and modern." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYgNT-3vCU0ca5iJRzl-DLQa1Em23M0n1e0WJk-JzlZCtW_eQFQ_0Ew2JVVqJtMhCtoTwysbnGBvb2OYFgpHDb2a0FMPXZshpp7PUG0J4x7j5aXY3B16Xlle_Y8C54nGO5-l8b0AQdVr-_hJyrzZO4eI7msS-tTfr096udG_eBxjGZlIXyN-aGj023BvkFP02pp34dvMYox2DM8OaIWpA4ndlFTbYhj5aAEiwnnxaPy6oadId1jM7yWqkBxxDMQVyu9W0qDXwY18k"/>
<div className="absolute inset-0 flex items-center justify-center">
<div className="glass-effect p-6 rounded-2xl shadow-xl flex flex-col items-center">
<span className="material-symbols-outlined text-primary text-4xl mb-2">location_on</span>
<span className="font-headline-md text-on-surface">You are here</span>
</div>
</div>
<button className="absolute bottom-4 right-4 bg-white/90 px-4 py-2 rounded-full shadow-lg text-label-sm font-bold flex items-center gap-2">
<span className="material-symbols-outlined text-[18px]">zoom_in</span>
                            Expand Map
                        </button>
</div>
</div>
</div>

<div className="col-span-12 lg:col-span-4 space-y-gutter">

<div className="bg-white rounded-card shadow-soft p-8 h-fit">
<h3 className="text-headline-md font-headline-md mb-8">Communication History</h3>
<div className="space-y-8 relative">

<div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-border-gray"></div>

<div className="relative pl-10">
<div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-primary-fixed text-primary flex items-center justify-center z-10">
<span className="material-symbols-outlined text-[16px]">mail</span>
</div>
<div className="text-label-sm text-on-surface-variant">Today, 9:15 AM</div>
<div className="text-body-md font-bold mt-0.5">Welcome Packet Sent</div>
<p className="text-body-sm text-on-surface-variant mt-1">Digital itinerary and venue map delivered via email.</p>
</div>

<div className="relative pl-10">
<div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center z-10">
<span className="material-symbols-outlined text-[16px]">call</span>
</div>
<div className="text-label-sm text-on-surface-variant">Yesterday, 2:40 PM</div>
<div className="text-body-md font-bold mt-0.5">Inbound Inquiry: Logistics</div>
<p className="text-body-sm text-on-surface-variant mt-1">Confirmed pickup time and dietary allergy details.</p>
</div>

<div className="relative pl-10 opacity-60">
<div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-surface-variant text-on-surface-variant flex items-center justify-center z-10">
<span className="material-symbols-outlined text-[16px]">chat</span>
</div>
<div className="text-label-sm text-on-surface-variant">Oct 5, 11:00 AM</div>
<div className="text-body-md font-bold mt-0.5">WhatsApp Confirmation</div>
<p className="text-body-sm text-on-surface-variant mt-1">RSVP status moved to 'Confirmed'.</p>
</div>
</div>
<button className="w-full mt-10 py-3 bg-background-alt text-on-surface font-label-md rounded-xl hover:bg-surface-container-high transition-colors">
                        View All Activity
                    </button>
</div>

<div className="bg-white rounded-card shadow-soft p-8 h-fit">
<div className="flex items-center justify-between mb-6">
<h3 className="text-headline-md font-headline-md">Concierge Notes</h3>
<span className="material-symbols-outlined text-secondary cursor-pointer hover:scale-110 transition-transform">edit_note</span>
</div>
<div className="space-y-4">
<div className="p-4 bg-secondary-container/20 border-l-4 border-secondary rounded-r-xl">
<p className="text-body-sm text-on-secondary-container leading-relaxed italic">
                                "Guest is highly sensitive to fragrance. Ensure room 402 is aired out 3 hours prior and use unscented linens only."
                            </p>
<div className="mt-3 text-label-sm font-bold">- Sarah J., Head Concierge</div>
</div>
<textarea className="w-full bg-background-alt border-none rounded-2xl p-4 text-body-sm focus:ring-2 focus:ring-primary/20 min-h-[120px]" placeholder="Add an internal note..."></textarea>
<button className="w-full py-3 bg-primary/10 text-primary font-bold rounded-xl hover:bg-primary/20 transition-colors text-label-sm">
                            Save Internal Note
                        </button>
</div>
</div>
</div>
</div>
</main>

<!-- <button className="fixed bottom-8 right-8 w-16 h-16 coral-gradient text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-50">
        <span className="material-symbols-outlined text-3xl">add</span>
    </button> -->


        </>
    );
};

export default Guest360Details;
