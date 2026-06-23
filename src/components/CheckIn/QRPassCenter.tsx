import React from 'react';

const QRPassCenter: React.FC = () => {
    return (
        <>
            

<aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-lowest flex flex-col border-r border-border-gray shadow-sm z-50">
<div className="p-6">
<div className="flex items-center gap-3 mb-8">
<div className="w-10 h-10 rounded-xl coral-gradient flex items-center justify-center text-white font-bold text-xl">E</div>
<div>
<h1 className="text-headline-md font-headline-md font-bold text-primary leading-tight">EventHub360</h1>
<p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Concierge Suite</p>
</div>
</div>
<nav className="space-y-1">

<a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant font-label-md hover:bg-surface-container-low transition-colors rounded-xl" href="#">
<span className="material-symbols-outlined">dashboard</span>
                    Dashboard
                </a>
<a className="flex items-center gap-3 px-4 py-3 text-primary font-bold border-r-4 border-primary bg-surface-container-low rounded-l-xl" href="#">
<span className="material-symbols-outlined">qr_code_2</span>
                    QR Registry
                </a>
<a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant font-label-md hover:bg-surface-container-low transition-colors rounded-xl" href="#">
<span className="material-symbols-outlined">trolley</span>
                    Delivery Status
                </a>
<a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant font-label-md hover:bg-surface-container-low transition-colors rounded-xl" href="#">
<span className="material-symbols-outlined">analytics</span>
                    Scanner Stats
                </a>
<a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant font-label-md hover:bg-surface-container-low transition-colors rounded-xl" href="#">
<span className="material-symbols-outlined">settings</span>
                    Settings
                </a>
</nav>
<div className="mt-8">
<button className="w-full py-3 px-4 rounded-xl coral-gradient text-white font-label-md flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-md">
<span className="material-symbols-outlined">add</span>
                    New QR Pass
                </button>
</div>
</div>
<div className="mt-auto p-6 border-t border-border-gray space-y-1">
<a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant font-label-md hover:bg-surface-container-low transition-colors rounded-xl" href="#">
<span className="material-symbols-outlined">help_outline</span>
                Support
            </a>
<a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant font-label-md hover:bg-surface-container-low transition-colors rounded-xl" href="#">
<span className="material-symbols-outlined">logout</span>
                Sign Out
            </a>
</div>
</aside>

<header className="fixed top-0 left-64 right-0 h-16 bg-white/60 backdrop-blur-xl border-b border-border-gray flex items-center justify-between px-gutter z-40">
<div className="flex items-center gap-8">
<h2 className="font-headline-md text-headline-md font-extrabold text-primary">QR Pass Center</h2>
<div className="hidden md:flex items-center gap-6">
<a className="text-on-surface-variant hover:text-primary transition-colors text-label-md" href="#">Bulk Actions</a>
<a className="text-on-surface-variant hover:text-primary transition-colors text-label-md" href="#">Export Logs</a>
</div>
</div>
<div className="flex items-center gap-4">
<div className="flex items-center gap-2 mr-4">
<button className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors relative">
<span className="material-symbols-outlined">notifications</span>
<span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full"></span>
</button>
<button className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors">
<span className="material-symbols-outlined">history</span>
</button>
</div>
<button className="px-6 py-2 rounded-full border border-primary text-primary font-label-md hover:bg-primary/5 transition-colors">
                Help
            </button>
<button className="px-6 py-2 rounded-full bg-primary text-white font-label-md hover:shadow-lg transition-all">
                Generate Batch
            </button>
<div className="w-10 h-10 rounded-full bg-surface-container-high ml-4 overflow-hidden border border-border-gray">
<img className="w-full h-full object-cover" data-alt="A professional headshot of a corporate event manager in a modern, brightly lit office environment. The person is smiling warmly, wearing a crisp navy blazer, against a background of soft-focus architectural glass and warm indoor lighting. The overall mood is sophisticated, trustworthy, and premium." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDB2ZNaF8fnodbGSGuuEbxEzVTis5t44hC4wMZG51tlZrMjd1aih5dT9IlwqVWsWT_2TR9mcsnWavQcSp9Ub9BM7CES6XNCdGTfNnmN5sV9M1SCAqPHpCBGb_-1zYcHhOJw_at7o1i0bnP7CfJnG2tnMy1UFXw6k0tlE-_TZ1T3gKI2jd_Kn7HWWX6pS03yOHetElVUo-O9ogjNsiM9Tv4TligaFLonM1AfvcJ3BK8Vh0gHf7uIzh9HTLYzhggdyukTWWJefolp3MI"/>
</div>
</div>
</header>

<main className="ml-64 mt-16 p-gutter max-w-[1440px] mx-auto min-h-screen">

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-section-gap">

<div className="bg-white p-6 rounded-[24px] custom-shadow border border-border-gray group hover:translate-y-[-4px] transition-all">
<div className="flex justify-between items-start mb-4">
<div className="p-3 bg-surface-container-low rounded-2xl text-primary group-hover:bg-primary-fixed transition-colors">
<span className="material-symbols-outlined">qr_code</span>
</div>
<span className="text-emerald-green font-label-md flex items-center gap-1">
<span className="material-symbols-outlined text-[18px]">trending_up</span>
                        12%
                    </span>
</div>
<p className="text-on-surface-variant font-label-md mb-1">Total Passes Generated</p>
<h3 className="font-headline-lg text-headline-lg text-on-surface">2,482</h3>
</div>

<div className="bg-white p-6 rounded-[24px] custom-shadow border border-border-gray group hover:translate-y-[-4px] transition-all">
<div className="flex justify-between items-start mb-4">
<div className="p-3 bg-surface-container-low rounded-2xl text-primary group-hover:bg-primary-fixed transition-colors">
<span className="material-symbols-outlined">check_circle</span>
</div>
<span className="text-emerald-green font-label-md flex items-center gap-1">
<span className="material-symbols-outlined text-[18px]">trending_up</span>
                        8%
                    </span>
</div>
<p className="text-on-surface-variant font-label-md mb-1">Scanned/Active</p>
<h3 className="font-headline-lg text-headline-lg text-on-surface">1,894</h3>
</div>

<div className="bg-white p-6 rounded-[24px] custom-shadow border border-border-gray group hover:translate-y-[-4px] transition-all">
<div className="flex justify-between items-start mb-4">
<div className="p-3 bg-surface-container-low rounded-2xl text-primary group-hover:bg-primary-fixed transition-colors">
<span className="material-symbols-outlined">pending_actions</span>
</div>
<span className="text-sunset-orange font-label-md flex items-center gap-1">
<span className="material-symbols-outlined text-[18px]">horizontal_rule</span>
                        Stable
                    </span>
</div>
<p className="text-on-surface-variant font-label-md mb-1">Pending Delivery</p>
<h3 className="font-headline-lg text-headline-lg text-on-surface">128</h3>
</div>

<div className="bg-white p-6 rounded-[24px] custom-shadow border border-border-gray group hover:translate-y-[-4px] transition-all">
<div className="flex justify-between items-start mb-4">
<div className="p-3 bg-surface-container-low rounded-2xl text-primary group-hover:bg-primary-fixed transition-colors">
<span className="material-symbols-outlined">security</span>
</div>
<span className="text-emerald-green font-label-md flex items-center gap-1">
<span className="material-symbols-outlined text-[18px]">shield</span>
                        Optimal
                    </span>
</div>
<p className="text-on-surface-variant font-label-md mb-1">Security Health</p>
<h3 className="font-headline-lg text-headline-lg text-on-surface">99.9%</h3>
</div>
</div>
<div className="flex gap-gutter items-start">

<section className="flex-grow bg-white rounded-[24px] custom-shadow border border-border-gray overflow-hidden">
<div className="p-6 border-b border-border-gray flex items-center justify-between">
<h3 className="font-headline-md text-headline-md text-on-surface">Pass Registry</h3>
<div className="flex items-center gap-4">
<div className="relative">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
<input className="pl-10 pr-4 py-2 bg-background-alt border-none rounded-xl focus:ring-2 focus:ring-primary/20 w-64 text-body-sm" placeholder="Search guests..." type="text"/>
</div>
<button className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors">
<span className="material-symbols-outlined">filter_list</span>
</button>
</div>
</div>
<div className="overflow-x-auto">
<table className="w-full text-left">
<thead>
<tr className="bg-surface-container-lowest border-b border-border-gray">
<th className="px-6 py-4"><input className="rounded text-primary focus:ring-primary" type="checkbox"/></th>
<th className="px-6 py-4 font-label-md text-on-surface-variant uppercase text-[11px] tracking-widest">Guest Name</th>
<th className="px-6 py-4 font-label-md text-on-surface-variant uppercase text-[11px] tracking-widest">Pass Type</th>
<th className="px-6 py-4 font-label-md text-on-surface-variant uppercase text-[11px] tracking-widest">Status</th>
<th className="px-6 py-4 font-label-md text-on-surface-variant uppercase text-[11px] tracking-widest">Last Activity</th>
<th className="px-6 py-4 font-label-md text-on-surface-variant uppercase text-[11px] tracking-widest">Security</th>
</tr>
</thead>
<tbody className="divide-y divide-border-gray">

<tr className="hover:bg-surface-container-low/50 transition-colors bg-primary/5">
<td className="px-6 py-4"><input checked="" className="rounded text-primary focus:ring-primary" type="checkbox"/></td>
<td className="px-6 py-4">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-full overflow-hidden bg-surface-container-high">
<img className="w-full h-full object-cover" data-alt="A portrait of a sophisticated man with silver-flecked hair, Alexander Thorne, wearing a tailored charcoal suit and a light blue shirt. He is set against a blurred background of a luxury hotel lobby with warm ambient light, gold accents, and marble textures. The photography style is sharp, editorial, and high-end light-mode." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAykyek0JxVpixgW32USIuXJemwkQlseh5XWt0MnwhbrWDS4YUxqz0B4q2S5MNbtpLaqxEC2uTloc8H0apIFlr5q8kw4QIYBlD-lcLVyItqLHhu0uG4Sd361_5VSCzyXag7m5dDhkIGjfiluu1AfJShS4QgLTpdL_kIFC1Kidn7SxqYQ_uGaDvm2KItjB6m3Zax8-CCSAOwYOE3Z64IoSVFqF83Y9leSJDHawYKoPn_NbJejtMcvd-OwCXkvTa7LayDJi5lxj97154"/>
</div>
<span className="font-bold text-on-surface">Alexander Thorne</span>
</div>
</td>
<td className="px-6 py-4">
<span className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm">VIP</span>
</td>
<td className="px-6 py-4">
<div className="flex items-center gap-1.5 text-emerald-green font-label-sm">
<span className="w-2 h-2 rounded-full bg-emerald-green"></span>
                                        Active
                                    </div>
</td>
<td className="px-6 py-4 text-body-sm text-on-surface-variant">2 mins ago</td>
<td className="px-6 py-4">
<span className="px-2 py-1 rounded bg-error-container text-on-error-container font-label-sm">Restricted</span>
</td>
</tr>

<tr className="hover:bg-surface-container-low/50 transition-colors">
<td className="px-6 py-4"><input className="rounded text-primary focus:ring-primary" type="checkbox"/></td>
<td className="px-6 py-4">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-full overflow-hidden bg-surface-container-high">
<img className="w-full h-full object-cover" data-alt="A portrait of a young professional woman with a bright, welcoming expression. She has sleek dark hair and wears elegant glasses and a minimalist white blouse. The backdrop is a sun-drenched, modern coworking space with plants and soft morning light. The image has a clean, airy, and professional aesthetic." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCIpBrBAqJqoRz56v8EdQ2appEoodbyPwgFF1L9ZRv-mr7_H1WwOELgJU_TIcfqJ5VTO47W4_SVCLIlnSGmLKk0uyziqp5jrfg-3FHUWewcOiFDQITnUGDzdGbMWR9H4brKTsxdyPbDixXAeJCGfBQK1LnbJIfIpnpHjRJLuokzLNSS93sfU-Kktb8333lt1MHo1tLAbFNVvDapug7rWFjW_0J0-TnafcWJum1fQ3BJnJz7KDF_F9ObzY3VQSkkpBliwSHsfuqUCJI"/>
</div>
<span className="font-bold text-on-surface">Elena Rodriguez</span>
</div>
</td>
<td className="px-6 py-4">
<span className="px-3 py-1 rounded-full bg-surface-variant text-on-surface-variant font-label-sm">Attendee</span>
</td>
<td className="px-6 py-4">
<div className="flex items-center gap-1.5 text-on-surface-variant font-label-sm opacity-50">
<span className="w-2 h-2 rounded-full bg-on-surface-variant"></span>
                                        Scanned
                                    </div>
</td>
<td className="px-6 py-4 text-body-sm text-on-surface-variant">1 hour ago</td>
<td className="px-6 py-4">
<span className="px-2 py-1 rounded bg-surface-container-high text-on-surface-variant font-label-sm">Standard</span>
</td>
</tr>

<tr className="hover:bg-surface-container-low/50 transition-colors">
<td className="px-6 py-4"><input className="rounded text-primary focus:ring-primary" type="checkbox"/></td>
<td className="px-6 py-4">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-full overflow-hidden bg-surface-container-high">
<img className="w-full h-full object-cover" data-alt="A portrait of a man in his 40s with a professional yet friendly demeanor, representing a staff member. He is wearing a black polo shirt with a subtle logo. The background is a crisp architectural detail of an event venue with soft blue and white lighting. Clean, corporate, and trustworthy style." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDO_UOBsmCWpiX8GC2jeij4xa5QFsK6p_neCpDmm8cxhKIGktBgt1e3-1soZbFaBaQZg40eF6MPc3JuuxdhSAPLrO1ZgsvdiNF4gD_ssrTeMotgJxceshBsdD-FTnR-t3S0K_Y0eX_NiVv5D-i8OrM7jJb_f2s_YfvqXOajwWN7Eu3qfR15KqCVvQFxzdHDVwhKlyFL0o5_814akbLxnSsH4aqmK8-uCxklBice--clnmLlz1tvz1CAX7ElXkfobc1jbl2SvRPLMSw"/>
</div>
<span className="font-bold text-on-surface">Marcus Chen</span>
</div>
</td>
<td className="px-6 py-4">
<span className="px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-sm">Staff</span>
</td>
<td className="px-6 py-4">
<div className="flex items-center gap-1.5 text-emerald-green font-label-sm">
<span className="w-2 h-2 rounded-full bg-emerald-green"></span>
                                        Active
                                    </div>
</td>
<td className="px-6 py-4 text-body-sm text-on-surface-variant">Just now</td>
<td className="px-6 py-4">
<span className="px-2 py-1 rounded bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm">High</span>
</td>
</tr>

<tr className="hover:bg-surface-container-low/50 transition-colors">
<td className="px-6 py-4"><input className="rounded text-primary focus:ring-primary" type="checkbox"/></td>
<td className="px-6 py-4">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-full overflow-hidden bg-surface-container-high">
<img className="w-full h-full object-cover" data-alt="A professional portrait of a senior executive woman, Sophia Lang, with an air of authority and grace. She has styled blonde hair and wears a bespoke pearl-white suit. The environment is an upscale, modern corporate lounge with blurred city views through high-rise windows. Minimalist, premium, and calm lighting." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDAGzs2RTmxKofLIXGYKvgHN9_RZki1GmKFrPgAk8w-8f3pY4fsu240GW3hhiTgAkxdAsnGagxwqg86cSv77LEZJkYY4sxLBs6pTTxvX1YbGsj8IIm8DpYRZY692r5nPT30hvajtqnFCsghmaSlD9gsIIszXsLTi3uJRafkLa-ATrE0UqnC7p7KKW6Hznx9PX8oEN1Ox7CTDDdT0wXMfCWSqqhPtB_dXhPErFh6iqp86sjpWkQozW2LRSr2GaoSD1b3oocL5a1ZglE"/>
</div>
<span className="font-bold text-on-surface">Sophia Lang</span>
</div>
</td>
<td className="px-6 py-4">
<span className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm">VIP</span>
</td>
<td className="px-6 py-4">
<div className="flex items-center gap-1.5 text-error font-label-sm">
<span className="w-2 h-2 rounded-full bg-error"></span>
                                        Revoked
                                    </div>
</td>
<td className="px-6 py-4 text-body-sm text-on-surface-variant">Yesterday</td>
<td className="px-6 py-4">
<span className="px-2 py-1 rounded bg-error-container text-on-error-container font-label-sm">Restricted</span>
</td>
</tr>
</tbody>
</table>
</div>
<div className="p-6 border-t border-border-gray flex items-center justify-between">
<span className="text-body-sm text-on-surface-variant">Showing 4 of 2,482 guests</span>
<div className="flex gap-2">
<button className="px-4 py-2 rounded-lg border border-border-gray hover:bg-surface-container-low transition-colors text-label-md">Previous</button>
<button className="px-4 py-2 rounded-lg border border-border-gray hover:bg-surface-container-low transition-colors text-label-md">Next</button>
</div>
</div>
</section>

<aside className="w-96 shrink-0 space-y-6">

<div className="bg-white rounded-[24px] custom-shadow border border-border-gray overflow-hidden">
<div className="p-6 border-b border-border-gray text-center relative overflow-hidden">

<div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] rotate-[-15deg]">
<span className="font-headline-lg text-[120px] font-extrabold text-primary">VIP</span>
</div>
<h4 className="font-label-md text-on-surface-variant uppercase tracking-widest mb-6">Pass Preview</h4>
<div className="bg-white p-4 rounded-3xl shadow-inner border border-border-gray inline-block relative group">
<img className="w-48 h-48 block" data-alt="A high-fidelity, high-contrast QR code rendered with premium aesthetics. The QR code features smooth, rounded pixels and a subtle gradient of deep coral to primary red. In the center, there is a small, elegant 'E' logo. The image is crisp, modern, and looks like a digital asset for a luxury hospitality brand." src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_Hi-wtSVfgn3N7KvYYd9fRuT7x02cPFNLDCf7FWxQJlYgSiiOtEyMEXqkKVtYGl0ByCOG4OXPP1-hrwf6UYR9VJH5Z3PHvsoPT3FY25nz9yEmA-_5r_XKVHLRKB3R-ncBugUuZW2fgpzAjDdsN1AV_heHWeqaqr0c_tqtkVOwqtOJcPLPZWs6vcD03Tur0uTUImqVdC1NsNpHmi4UbHCPyLNm4u-Qstj7N5LoPqDoIiu0BkpTpu2zoKWKiZEE6lBSTiYB5-ljEFs"/>
<div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors pointer-events-none"></div>
</div>
<div className="mt-6">
<span className="px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-container font-label-md">VIP ACCESS GRANTED</span>
</div>
</div>
<div className="p-6 space-y-4">
<div>
<p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Guest Name</p>
<h3 className="font-headline-md text-on-surface">Alexander Thorne</h3>
</div>
<div className="grid grid-cols-2 gap-4">
<div>
<p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Pass ID</p>
<p className="font-bold text-on-surface">EH-VIP-2901</p>
</div>
<div>
<p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Expires</p>
<p className="font-bold text-on-surface">12 Oct 2024</p>
</div>
</div>
<div className="pt-4 space-y-3">
<button className="w-full py-3 px-4 rounded-xl coral-gradient text-white font-label-md flex items-center justify-center gap-2 hover:shadow-lg transition-all group">
<span className="material-symbols-outlined group-hover:scale-110 transition-transform">download</span>
                                Download Pass
                            </button>
<div className="flex gap-3">
<button className="flex-1 py-3 px-4 rounded-xl bg-surface-container-low text-on-surface-variant font-label-md flex items-center justify-center gap-2 hover:bg-surface-variant transition-colors">
<span className="material-symbols-outlined text-[20px]">mail</span>
                                    Email
                                </button>
<button className="flex-1 py-3 px-4 rounded-xl bg-surface-container-low text-on-surface-variant font-label-md flex items-center justify-center gap-2 hover:bg-surface-variant transition-colors">
<span className="material-symbols-outlined text-[20px]">chat</span>
                                    WhatsApp
                                </button>
</div>
</div>
</div>
<div className="px-6 py-4 bg-background-alt border-t border-border-gray">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2">
<div className="w-8 h-8 rounded-full bg-emerald-green/10 flex items-center justify-center text-emerald-green">
<span className="material-symbols-outlined text-[20px]" data-weight="fill">verified</span>
</div>
<span className="text-label-md text-on-surface-variant">Security Verified</span>
</div>
<button className="text-primary font-label-sm hover:underline">Details</button>
</div>
<p className="mt-2 text-[11px] text-on-surface-variant/60 leading-relaxed font-mono">
                            SHA-256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                        </p>
</div>
</div>

<div className="bg-white rounded-[24px] custom-shadow border border-border-gray p-6">
<div className="flex justify-between items-center mb-4">
<h4 className="font-label-md text-on-surface">Recent Scans</h4>
<span className="material-symbols-outlined text-on-surface-variant cursor-pointer">open_in_new</span>
</div>
<div className="space-y-4">
<div className="flex items-start gap-3">
<div className="mt-1 w-2 h-2 rounded-full bg-emerald-green"></div>
<div>
<p className="text-body-sm font-bold text-on-surface">Grand Ballroom Entrance</p>
<p className="text-label-sm text-on-surface-variant">Scanned by Agent Smith • 2m ago</p>
</div>
</div>
<div className="flex items-start gap-3">
<div className="mt-1 w-2 h-2 rounded-full bg-emerald-green"></div>
<div>
<p className="text-body-sm font-bold text-on-surface">Valet Parking Zone 1</p>
<p className="text-label-sm text-on-surface-variant">Automatic Scanner • 14m ago</p>
</div>
</div>
</div>
</div>
</aside>
</div>
</main>


<button className="fixed bottom-8 right-8 w-16 h-16 rounded-full coral-gradient text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group">
<span className="material-symbols-outlined text-3xl group-hover:rotate-90 transition-transform">qr_code_scanner</span>
</button>


        </>
    );
};

export default QRPassCenter;
