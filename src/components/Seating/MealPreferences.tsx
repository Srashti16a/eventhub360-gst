import React from 'react';

const MealPreferences: React.FC = () => {
    return (
        <>
            <header className="fixed top-0 w-full z-50 bg-surface/60 backdrop-blur-xl border-b border-outline-variant shadow-sm h-16 flex justify-between items-center px-gutter">
<div className="flex items-center gap-8">
<span className="text-headline-md font-bold text-on-surface">EventLink</span>
<div className="hidden md:flex items-center bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant w-80">
<span className="material-symbols-outlined text-outline mr-2">search</span>
<input className="bg-transparent border-none focus:ring-0 text-body-sm w-full" placeholder="Search guests or events..." type="text"/>
</div>
</div>
<div className="flex items-center gap-4">
<button className="p-2 hover:bg-surface-container-low rounded-full transition-colors">
<span className="material-symbols-outlined text-on-surface-variant" data-icon="notifications">notifications</span>
</button>
<button className="p-2 hover:bg-surface-container-low rounded-full transition-colors">
<span className="material-symbols-outlined text-on-surface-variant" data-icon="help">help</span>
</button>
<div className="h-8 w-8 rounded-full overflow-hidden border border-primary-container">
<img className="w-full h-full object-cover" data-alt="A professional headshot of a female event manager with a warm smile, wearing business casual attire. The background is a softly blurred modern office interior with warm ambient lighting. High-end lifestyle photography style with a premium feel." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBseG8Nw4LE1hTS9M_W2hwPXZQVS0odJmsMV3lSxx6ezHXaSRdZ0GkkBtmI2dtRtpREfbGgSmBi0D5KhWtXg-Fkb9V8q7dD-Qk5yGK98mEbZXcVa5r1ay3_KXkPhzOvAXh1KsG2McP2GqU2EJXVk8SV_ioEnNqVvKo5K17q3dLBHzcvqSFEzDJ7pS7uLTxdeRaOkWl_XHmRpOdoHxLmQAvjGU4VCocWCy2oc28ieGlc7fSGfSuAyL9DdCQ8bYOqQ2BmILE3WWybpsg"/>
</div>
</div>
</header>

<aside className="fixed left-0 top-0 h-full w-64 z-40 bg-surface-container-lowest border-r border-outline-variant flex flex-col p-base gap-2 pt-20">
<div className="px-4 mb-6">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-on-primary">
<span className="material-symbols-outlined" data-icon="restaurant_menu">restaurant_menu</span>
</div>
<div>
<p className="text-label-md font-black text-primary uppercase tracking-wider">Global Events</p>
<p className="text-body-sm text-on-surface-variant opacity-70">Enterprise Tier</p>
</div>
</div>
</div>
<nav className="flex-1 space-y-1">
<a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded-xl transition-all" href="#">
<span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
<span className="text-label-md">Dashboard</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded-xl transition-all" href="#">
<span className="material-symbols-outlined" data-icon="calendar_today">calendar_today</span>
<span className="text-label-md">Events</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 sidebar-active" href="#">
<span className="material-symbols-outlined" data-icon="group">group</span>
<span className="text-label-md">Guest Management</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded-xl transition-all" href="#">
<span className="material-symbols-outlined" data-icon="conveyor_belt">conveyor_belt</span>
<span className="text-label-md">Logistics</span>
</a>
</nav>
<div className="mt-auto border-t border-outline-variant pt-4 space-y-1">
<button className="w-full btn-gradient text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 mb-4">
<span className="material-symbols-outlined" data-icon="add">add</span>
                New Event
            </button>
<a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded-xl transition-all" href="#">
<span className="material-symbols-outlined" data-icon="settings">settings</span>
<span className="text-label-md">Settings</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded-xl transition-all" href="#">
<span className="material-symbols-outlined" data-icon="contact_support">contact_support</span>
<span className="text-label-md">Support</span>
</a>
</div>
</aside>

<main className="ml-64 pt-20 p-container-margin min-h-screen">
<div className="max-w-[1440px] mx-auto">

<div className="flex justify-between items-end mb-8">
<div>
<h1 className="text-display-lg font-hanken text-on-surface">Meal Preferences Matrix</h1>
<p className="text-body-md text-on-surface-variant">Global Tech Summit 2024 • Catering &amp; Dietary Management</p>
</div>
<div className="flex gap-3">
<button className="bg-white border border-border-gray text-on-surface-variant font-label-md px-6 py-2.5 rounded-lg flex items-center gap-2 hover:bg-surface-container-low transition-colors">
<span className="material-symbols-outlined text-[20px]" data-icon="download">download</span>
                        Export PDF
                    </button>
<button className="btn-gradient text-white font-label-md px-6 py-2.5 rounded-lg flex items-center gap-2 shadow-sm">
<span className="material-symbols-outlined text-[20px]" data-icon="edit">edit</span>
                        Manage Menu
                    </button>
</div>
</div>

<div className="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-section-gap">

<div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
<div className="flex justify-between items-start mb-4">
<div className="bg-primary-container/10 p-3 rounded-xl text-primary">
<span className="material-symbols-outlined" data-icon="groups">groups</span>
</div>
<span className="text-emerald-green text-label-sm flex items-center">+12% vs last month</span>
</div>
<p className="text-on-surface-variant text-label-md uppercase tracking-widest mb-1">Total Guests</p>
<h3 className="text-display-lg-mobile font-hanken font-bold text-on-surface leading-none">1,248</h3>
<div className="mt-4 flex items-center gap-2 bg-error-container/30 px-3 py-1.5 rounded-lg w-fit">
<span className="material-symbols-outlined text-error text-[18px]" data-icon="warning">warning</span>
<span className="text-error font-semibold text-body-sm">42 Allergy Alerts</span>
</div>
</div>

<div className="glass-card p-6 rounded-2xl">
<div className="flex justify-between items-start mb-4">
<div className="bg-emerald-green/10 p-3 rounded-xl text-emerald-green">
<span className="material-symbols-outlined" data-icon="eco">eco</span>
</div>
<span className="text-on-surface-variant/50 text-label-sm">18% of total</span>
</div>
<p className="text-on-surface-variant text-label-md uppercase tracking-widest mb-1">Vegan</p>
<h3 className="text-display-lg-mobile font-hanken font-bold text-on-surface">225</h3>
<div className="mt-4 h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
<div className="h-full bg-emerald-green" style="width: 18%"></div>
</div>
</div>

<div className="glass-card p-6 rounded-2xl">
<div className="flex justify-between items-start mb-4">
<div className="bg-secondary-container/20 p-3 rounded-xl text-secondary">
<span className="material-symbols-outlined" data-icon="egg_alt">egg_alt</span>
</div>
<span className="text-on-surface-variant/50 text-label-sm">32% of total</span>
</div>
<p className="text-on-surface-variant text-label-md uppercase tracking-widest mb-1">Vegetarian</p>
<h3 className="text-display-lg-mobile font-hanken font-bold text-on-surface">402</h3>
<div className="mt-4 h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
<div className="h-full bg-secondary" style="width: 32%"></div>
</div>
</div>

<div className="glass-card p-6 rounded-2xl">
<div className="flex justify-between items-start mb-4">
<div className="bg-primary/10 p-3 rounded-xl text-primary">
<span className="material-symbols-outlined" data-icon="restaurant">restaurant</span>
</div>
<span className="text-on-surface-variant/50 text-label-sm">50% of total</span>
</div>
<p className="text-on-surface-variant text-label-md uppercase tracking-widest mb-1">Non-Veg</p>
<h3 className="text-display-lg-mobile font-hanken font-bold text-on-surface">621</h3>
<div className="mt-4 h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
<div className="h-full bg-primary" style="width: 50%"></div>
</div>
</div>
</div>
<div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">

<div className="lg:col-span-2 flex flex-col gap-6">
<div className="glass-card rounded-2xl p-6">
<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
<h2 className="text-headline-md font-hanken">Guest Preference Log</h2>
<div className="flex flex-wrap gap-3">
<select className="bg-surface-container-low border-none rounded-lg text-body-sm font-label-md focus:ring-primary">
<option>All Categories</option>
<option>VIP</option>
<option>Speaker</option>
<option>Attendee</option>
</select>
<select className="bg-surface-container-low border-none rounded-lg text-body-sm font-label-md focus:ring-primary">
<option>All Preferences</option>
<option>Vegan</option>
<option>Vegetarian</option>
<option>Gluten-Free</option>
<option>Halal</option>
</select>
<button className="p-2.5 rounded-lg border border-border-gray hover:bg-surface-container-low transition-colors">
<span className="material-symbols-outlined text-[20px]" data-icon="filter_list">filter_list</span>
</button>
</div>
</div>
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead>
<tr className="border-b border-border-gray">
<th className="py-4 px-2 text-label-sm text-on-surface-variant font-bold uppercase tracking-wider">Guest</th>
<th className="py-4 px-2 text-label-sm text-on-surface-variant font-bold uppercase tracking-wider">Preference</th>
<th className="py-4 px-2 text-label-sm text-on-surface-variant font-bold uppercase tracking-wider">Allergies</th>
<th className="py-4 px-2 text-label-sm text-on-surface-variant font-bold uppercase tracking-wider">Category</th>
<th className="py-4 px-2 text-label-sm text-on-surface-variant font-bold uppercase tracking-wider">Status</th>
</tr>
</thead>
<tbody className="divide-y divide-border-gray">

<tr className="hover:bg-surface-container-low transition-colors group">
<td className="py-4 px-2">
<div className="flex items-center gap-3">
<div className="h-10 w-10 rounded-full overflow-hidden border border-border-gray">
<img className="w-full h-full object-cover" data-alt="Close up portrait of Julianne Smith, a mature professional woman with grey-streaked hair and stylish spectacles. She has a confident expression, set against a clean studio background with soft directional light. 8k resolution, minimalist aesthetic." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDagv6LSbx5zZTxRxLEhwRBThV9E17RwXZwnQQsyaOFFHK8Bdb1XG1a4xexUOwD47jr0jGkVaNYaqVRpcdVW0yHtQVng6uxF7JJf5Zk6AllcpshniXUYbikUGCjNpmknbaUDVkwjYqpKIuVf8WvCYHrJ_7fcQL8WrRezkJxMhAfC3XWFS7DhLmX2oSBkRUHAhxWS91r_etfVMelgIb5goHS6ZutREr352iC6jIDttTlw2Gvj0HT8VybWV5vvDl3lkIvWUAI8_Zvzg8"/>
</div>
<div>
<p className="font-bold text-on-surface">Julianne Smith</p>
<p className="text-body-sm text-on-surface-variant opacity-60">j.smith@techcorp.com</p>
</div>
</div>
</td>
<td className="py-4 px-2">
<span className="px-3 py-1 bg-emerald-green/10 text-emerald-green rounded-full text-label-sm border border-emerald-green/20">Vegan</span>
</td>
<td className="py-4 px-2">
<span className="px-3 py-1 bg-error-container text-error rounded-full text-label-sm font-bold">Nuts (Severe)</span>
</td>
<td className="py-4 px-2">
<span className="px-3 py-1 bg-tertiary-container/20 text-tertiary rounded-full text-label-sm">Speaker</span>
</td>
<td className="py-4 px-2">
<span className="material-symbols-outlined text-emerald-green" data-icon="check_circle">check_circle</span>
</td>
</tr>

<tr className="hover:bg-surface-container-low transition-colors group">
<td className="py-4 px-2">
<div className="flex items-center gap-3">
<div className="h-10 w-10 rounded-full overflow-hidden border border-border-gray">
<img className="w-full h-full object-cover" data-alt="A portrait of Marcus Wright, a charismatic young black male professional wearing a tailored navy blazer and a white shirt. He is smiling warmly in a bright, modern architectural setting with high-end luxury vibes. Realistic professional photography." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBp0zHu48zV1cHQI3fU7NsCG92KR7Rs1U0VLPTh-qfHIQyVY_o5q1Lebdf2WxiX0bnjpDSFrhwEWlR7fLbGMEMYPBkytq9HUoqjE-EPe12A86GDv4c2sFTDdVk21D9UPP4CZH1mDV0axYXYr6_yvgzxd4wyFmoT2ZhHMQfO_wh9XNKJvekrAt-eTFnPH2VDINjH3y9-pKvFjzay3pjBADFPpH0HCUxZhVsX7-S5NpYz3urye_zu4Vc21FkbiZU-XiXIW3TDT9QXpxM"/>
</div>
<div>
<p className="font-bold text-on-surface">Marcus Wright</p>
<p className="text-body-sm text-on-surface-variant opacity-60">marcus.w@global.io</p>
</div>
</div>
</td>
<td className="py-4 px-2">
<span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-label-sm border border-primary/20">Non-Veg</span>
</td>
<td className="py-4 px-2">
<span className="text-on-surface-variant/40 text-label-sm italic">None</span>
</td>
<td className="py-4 px-2">
<span className="px-3 py-1 bg-secondary-container/30 text-secondary rounded-full text-label-sm font-bold">VIP</span>
</td>
<td className="py-4 px-2">
<span className="material-symbols-outlined text-emerald-green" data-icon="check_circle">check_circle</span>
</td>
</tr>

<tr className="hover:bg-surface-container-low transition-colors group">
<td className="py-4 px-2">
<div className="flex items-center gap-3">
<div className="h-10 w-10 rounded-full overflow-hidden border border-border-gray">
<img className="w-full h-full object-cover" data-alt="Headshot of Sarah Chen, a stylish Asian female professional with sleek black hair, smiling thoughtfully. She is in a minimalist café environment with bright natural light flooding the scene. High-fidelity photography, soft textures." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBAl1o_afMaHTijb3ZaTepuMiuCwZDCkN3yEIIjiyOWyTMLjiJ4pdYIRU2I1myGgFBFLTyi3rMEnDu2RvK-tOt9K-UJNZJglY6DXXJZVs-k_qNCYEEI2agbf7e-2v9H4QmsN75tYP1InHGrrkuJgJEyQR6qPVTNvkDHDd9O_Uda-tAMzq-WD_fXL-29WqCmSoETol-QleDUi7w6quKtDmKPjm3GJqY61U3yymBTWyv1Lb929KDwlgCszgkpR-jZ_Ia-WliUWBUyhHI"/>
</div>
<div>
<p className="font-bold text-on-surface">Sarah Chen</p>
<p className="text-body-sm text-on-surface-variant opacity-60">s.chen@innovate.net</p>
</div>
</div>
</td>
<td className="py-4 px-2">
<span className="px-3 py-1 bg-secondary-container/20 text-secondary rounded-full text-label-sm border border-secondary/20">Gluten-Free</span>
</td>
<td className="py-4 px-2">
<span className="px-3 py-1 bg-error-container text-error rounded-full text-label-sm font-bold">Shellfish</span>
</td>
<td className="py-4 px-2">
<span className="px-3 py-1 bg-surface-container-highest text-on-surface-variant rounded-full text-label-sm">Attendee</span>
</td>
<td className="py-4 px-2">
<span className="material-symbols-outlined text-outline" data-icon="pending">pending</span>
</td>
</tr>

<tr className="hover:bg-surface-container-low transition-colors group">
<td className="py-4 px-2">
<div className="flex items-center gap-3">
<div className="h-10 w-10 rounded-full overflow-hidden border border-border-gray">
<img className="w-full h-full object-cover" data-alt="Portrait of David Miller, a senior executive with salt-and-pepper hair, wearing a sharp grey suit. He is looking directly at the camera with a steady, authoritative gaze. The background is a luxury hotel lobby with warm ambient light and mahogany accents." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHy3HKuTC_R7QwW76y2cSDwMq6x6bklWzJRGJK--d_Xw0FVSLEV-NYgeSWoQ5eyaFhfAG_WnbQIUfnAqAC89Q2yGcTa9K8xKH8CapU2RoI0DTVzEF7ib0Yj2sXLWiiuCHgJd8f9BDgYMi4y7Qf-sHkmP_Kq8huJClpDV14X2d5SMiX-IHMUStSTg2NRG8dC0xNcKa2AWNaJMpPw0Aw-dW8HdwqJKx-_lDJ2MuzhuZjND-EppfcpCIQnyfoqWRxcFdhBb4PSlfSlHY"/>
</div>
<div>
<p className="font-bold text-on-surface">David Miller</p>
<p className="text-body-sm text-on-surface-variant opacity-60">d.miller@exective.com</p>
</div>
</div>
</td>
<td className="py-4 px-2">
<span className="px-3 py-1 bg-sunset-orange/10 text-sunset-orange rounded-full text-label-sm border border-sunset-orange/20">Keto</span>
</td>
<td className="py-4 px-2">
<span className="text-on-surface-variant/40 text-label-sm italic">None</span>
</td>
<td className="py-4 px-2">
<span className="px-3 py-1 bg-secondary-container/30 text-secondary rounded-full text-label-sm font-bold">VIP</span>
</td>
<td className="py-4 px-2">
<span className="material-symbols-outlined text-emerald-green" data-icon="check_circle">check_circle</span>
</td>
</tr>
</tbody>
</table>
</div>
<div className="mt-8 flex items-center justify-between">
<p className="text-body-sm text-on-surface-variant">Showing 4 of 1,248 entries</p>
<div className="flex gap-2">
<button className="h-10 w-10 flex items-center justify-center rounded-lg border border-border-gray hover:bg-surface-container-low"><span className="material-symbols-outlined">chevron_left</span></button>
<button className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary-container text-white font-bold">1</button>
<button className="h-10 w-10 flex items-center justify-center rounded-lg border border-border-gray hover:bg-surface-container-low">2</button>
<button className="h-10 w-10 flex items-center justify-center rounded-lg border border-border-gray hover:bg-surface-container-low">3</button>
<button className="h-10 w-10 flex items-center justify-center rounded-lg border border-border-gray hover:bg-surface-container-low"><span className="material-symbols-outlined">chevron_right</span></button>
</div>
</div>
</div>
</div>

<div className="lg:col-span-1 space-y-6">

<div className="glass-card rounded-2xl p-6">
<div className="flex justify-between items-center mb-6">
<h2 className="text-headline-md font-hanken">Procurement</h2>
<span className="material-symbols-outlined text-on-surface-variant/40" data-icon="info">info</span>
</div>
<div className="space-y-6">

<div>
<div className="flex justify-between text-label-md mb-2">
<span>Poultry / Red Meat</span>
<span className="font-bold">621 units</span>
</div>
<div className="h-3 w-full bg-surface-container rounded-full overflow-hidden">
<div className="h-full bg-primary" style="width: 50%"></div>
</div>
</div>

<div>
<div className="flex justify-between text-label-md mb-2">
<span>Lacto-Ovo Vegetarian</span>
<span className="font-bold">402 units</span>
</div>
<div className="h-3 w-full bg-surface-container rounded-full overflow-hidden">
<div className="h-full bg-secondary" style="width: 32%"></div>
</div>
</div>

<div>
<div className="flex justify-between text-label-md mb-2">
<span>Plant-Based / Vegan</span>
<span className="font-bold">225 units</span>
</div>
<div className="h-3 w-full bg-surface-container rounded-full overflow-hidden">
<div className="h-full bg-emerald-green" style="width: 18%"></div>
</div>
</div>
</div>
<div className="mt-8 p-4 bg-background rounded-xl border border-border-gray">
<div className="flex items-center gap-3 mb-2">
<span className="material-symbols-outlined text-primary" data-icon="restaurant_menu">restaurant_menu</span>
<p className="font-bold text-body-md">Chef's Summary</p>
</div>
<ul className="text-body-sm text-on-surface-variant space-y-2">
<li className="flex justify-between"><span>Stock Alert: Chicken Breast</span> <span className="text-error font-bold">Low</span></li>
<li className="flex justify-between"><span>Prep Start Time:</span> <span>06:00 AM</span></li>
<li className="flex justify-between"><span>Special Request Count:</span> <span>18</span></li>
</ul>
</div>
</div>

<div className="rounded-2xl overflow-hidden relative h-64 shadow-xl">
<div className="absolute inset-0 z-0">
<img className="w-full h-full object-cover" data-alt="A gourmet, beautifully plated plant-based dish with vibrant microgreens, edible flowers, and colorful vegetable purees. The plating is artistic and sophisticated, highlighting hospitality modernism. The lighting is soft and bright, emphasizing fresh textures and luxury catering quality." src="https://lh3.googleusercontent.com/aida-public/AB6AXuApwKHu5XhTKmig5zJlGNqRJzgIjkUF3EFyI29-Mvaqc4Cv0zLgjE0DOVBhnNA7XVTDyrUqg-N_7_YS3h3EW4iv0w3jV_N-GpG7bpRKI5xkm6q1KvmysA5uM2EbFFCPpivkv7QnEfShIxM7tePiMOHvLGlFJnKhIVQpdQWhQY8MdBVCO4MKNheHk_OUJrWr6LEhYeqdte3v6M30eCCIDulg0bv_i9qhMnc7pS4Fw8mQ3G8G2uVZD5IG04oJPL_f8wIpph2KcJMAM6E"/>
<div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
</div>
<div className="absolute bottom-0 p-6 z-10 w-full">
<span className="bg-primary text-white text-[10px] uppercase font-bold px-2 py-1 rounded mb-2 inline-block">Daily Special</span>
<h4 className="text-white font-hanken text-headline-md font-bold">Heritage Carrot &amp; Miso Puree</h4>
<p className="text-white/70 text-body-sm">Curated for 225 Vegan guests</p>
</div>
</div>

<div className="glass-card rounded-2xl p-6 border-dashed border-2 border-primary-container/30">
<div className="flex items-center gap-3 mb-4">
<span className="material-symbols-outlined text-primary" data-icon="lightbulb">lightbulb</span>
<p className="font-bold font-hanken">Smart Suggestions</p>
</div>
<p className="text-body-sm text-on-surface-variant mb-4">
                            Based on current data, we recommend increasing the **Nut-Free** appetizer count by 15% due to high severe allergy overlap.
                        </p>
<button className="w-full py-2 bg-primary-container/10 text-primary font-bold rounded-lg hover:bg-primary-container/20 transition-colors">
                            Apply Recommendation
                        </button>
</div>
</div>
</div>
</div>
</main>
        </>
    );
};

export default MealPreferences;
