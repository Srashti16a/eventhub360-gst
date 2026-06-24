import React from 'react';

const TablePlanner: React.FC = () => {
    return (
        <>
            <header className="h-20 fixed top-0 right-0 left-72 z-40 bg-white/60 dark:bg-inverse-surface/60 backdrop-blur-xl border-b border-border-gray dark:border-outline shadow-sm flex justify-between items-center px-gutter">
<div className="flex items-center gap-4 flex-1">
<div className="relative w-96 group">
<span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">search</span>
<input className="w-full bg-background-alt border-none rounded-full py-2.5 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-body-sm" placeholder="Search tables, guests, or zones..." type="text"/>
</div>
</div>
<div className="flex items-center gap-6">
<button className="relative p-2 text-on-surface-variant hover:text-primary transition-colors">
<span className="material-symbols-outlined">notifications</span>
<span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border-2 border-white"></span>
</button>
<button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
<span className="material-symbols-outlined">chat_bubble</span>
</button>
<div className="flex items-center gap-3 pl-4 border-l border-border-gray">
<div className="text-right">
<p className="font-label-md text-on-surface leading-none">Alexander Thorne</p>
<p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">Event Director</p>
</div>
<div className="w-10 h-10 rounded-full border-2 border-primary-container p-0.5">
<img className="w-full h-full object-cover rounded-full" data-alt="A professional headshot of a sophisticated event director with a friendly smile, clean-shaven, wearing a tailored navy suit. The portrait is high-end corporate photography style with a soft-focus minimalist background of a luxury hotel lobby, maintaining a bright and modern light-mode aesthetic." src="https://lh3.googleusercontent.com/aida-public/AB6AXuC4LrerCcgzZctxTkeitmGnBxVeiwbXnppvJcYvEwfLLaq1dITkNqRrPvqSgEtPNLlt2h99zyF2_dD-9DfRhFieOx3W8DDPWkldVmm_OngENpKDOdcqDPPEqjaPl89wRiuujJCqfMkqHgeUfuHdYpp9idZo5VGXBidgQ5aR9BxiDQuJ-bvwrp27FNqGVXWH7xZeTa3mbI6k5MkAQecRBg3ie90HVCvn9urCjaZWpV--pFDo6sElJ-5ebm2r_j6qriBrR6Br92WMUJI"/>
</div>
</div>
</div>
</header>

<main className="ml-72 mt-20 p-container-margin h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar bg-surface-dim">

<div className="max-w-[1440px] mx-auto">
<div className="flex justify-between items-end mb-8">
<div>
<h2 className="font-headline-lg text-headline-lg text-on-surface mb-1">Layout Designer</h2>
<p className="text-on-surface-variant">Grand Ballroom • Winter Gala 2024</p>
</div>
<div className="flex gap-3">
<button className="bg-white px-6 py-2.5 rounded-xl border border-border-gray text-on-surface font-label-md flex items-center gap-2 hover:bg-background-alt transition-colors">
<span className="material-symbols-outlined">save</span> Save Layout
                    </button>
<button className="bg-primary text-white px-6 py-2.5 rounded-xl font-label-md flex items-center gap-2 hover:bg-on-primary-fixed-variant transition-all shadow-md">
<span className="material-symbols-outlined">publish</span> Finalize Setup
                    </button>
</div>
</div>

<div className="grid grid-cols-4 gap-gutter mb-8">
<div className="bg-white p-6 rounded-[24px] shadow-[0_4px_20px_rgba(31,41,55,0.08)] border border-border-gray">
<p className="text-on-surface-variant font-label-sm uppercase tracking-wider mb-2">Total Tables</p>
<div className="flex items-end gap-3">
<span className="font-display-lg text-display-lg leading-none">32</span>
<span className="text-emerald-green font-label-md mb-2">+4 active</span>
</div>
</div>
<div className="bg-white p-6 rounded-[24px] shadow-[0_4px_20px_rgba(31,41,55,0.08)] border border-border-gray">
<p className="text-on-surface-variant font-label-sm uppercase tracking-wider mb-2">Max Capacity</p>
<div className="flex items-end gap-3">
<span className="font-display-lg text-display-lg leading-none">320</span>
<span className="text-on-surface-variant font-label-md mb-2">pax</span>
</div>
</div>
<div className="bg-white p-6 rounded-[24px] shadow-[0_4px_20px_rgba(31,41,55,0.08)] border border-border-gray">
<p className="text-on-surface-variant font-label-sm uppercase tracking-wider mb-2">Current Assignments</p>
<div className="flex items-end gap-3">
<span className="font-display-lg text-display-lg leading-none">248</span>
<span className="text-on-surface-variant font-label-md mb-2">/320</span>
</div>
</div>
<div className="bg-white p-6 rounded-[24px] shadow-[0_4px_20px_rgba(31,41,55,0.08)] border border-border-gray">
<p className="text-on-surface-variant font-label-sm uppercase tracking-wider mb-2">Layout Efficiency</p>
<div className="flex items-end gap-3">
<span className="font-display-lg text-display-lg leading-none text-primary">88%</span>
<span className="text-on-surface-variant font-label-md mb-2">Optimized</span>
</div>
</div>
</div>

<div className="flex gap-gutter items-start">

<div className="flex-1 space-y-6">

<div className="glass-panel rounded-2xl p-3 flex items-center justify-between shadow-lg mb-6">
<div className="flex items-center gap-1">
<button className="p-3 text-primary hover:bg-primary/5 rounded-xl flex items-center gap-2 transition-colors">
<span className="material-symbols-outlined">add_circle</span>
<span className="font-label-md">Add Table</span>
</button>
<div className="w-px h-8 bg-border-gray mx-2"></div>
<button className="p-3 text-on-surface-variant hover:bg-background-alt rounded-xl flex items-center gap-2">
<span className="material-symbols-outlined">format_list_numbered</span>
<span className="font-label-md">Manage Numbering</span>
</button>
<button className="p-3 text-on-surface-variant hover:bg-background-alt rounded-xl flex items-center gap-2">
<span className="material-symbols-outlined">groups</span>
<span className="font-label-md">Capacity Settings</span>
</button>
</div>
<div className="flex items-center gap-4 px-4 border-l border-border-gray">
<span className="text-on-surface-variant font-label-sm">Drag &amp; Drop</span>
<button className="w-12 h-6 bg-primary rounded-full relative p-1 transition-all">
<div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
</button>
</div>
</div>

<div className="grid grid-cols-3 gap-6">

<div className="bg-white rounded-[24px] p-6 shadow-sm border-2 border-transparent hover:border-primary/20 transition-all cursor-pointer group">
<div className="flex justify-between items-start mb-6">
<div className="bg-background-alt w-14 h-14 rounded-full flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-3xl">radio_button_unchecked</span>
</div>
<div className="flex flex-col items-end">
<span className="px-3 py-1 bg-emerald-green/10 text-emerald-green text-[10px] font-bold uppercase rounded-full">Active</span>
<p className="text-on-surface-variant text-label-sm mt-1">Zone A</p>
</div>
</div>
<div className="mb-6">
<h3 className="font-display-lg text-display-lg leading-tight mb-1">01</h3>
<p className="text-on-surface-variant font-label-md">Presidential Round</p>
</div>
<div className="flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-on-surface-variant text-sm">person</span>
<span className="font-label-md">8/10 <span className="text-on-surface-variant font-normal">Seats</span></span>
</div>
<div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
<button className="p-2 hover:bg-background-alt rounded-lg text-on-surface-variant"><span className="material-symbols-outlined text-lg">edit</span></button>
<button className="p-2 hover:bg-background-alt rounded-lg text-on-surface-variant"><span className="material-symbols-outlined text-lg">content_copy</span></button>
<button className="p-2 hover:bg-background-alt rounded-lg text-error"><span className="material-symbols-outlined text-lg">delete</span></button>
</div>
</div>
</div>

<div className="bg-white rounded-[24px] p-6 shadow-sm border-2 border-primary/40 relative group">
<div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold px-4 py-1 rounded-full uppercase">VIP Table</div>
<div className="flex justify-between items-start mb-6">
<div className="bg-primary/5 w-14 h-14 rounded-xl flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-3xl">rectangle</span>
</div>
<div className="flex flex-col items-end">
<span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase rounded-full">Locked</span>
<p className="text-on-surface-variant text-label-sm mt-1">Zone A</p>
</div>
</div>
<div className="mb-6">
<h3 className="font-display-lg text-display-lg leading-tight mb-1">02</h3>
<p className="text-on-surface-variant font-label-md">Diamond Rectangular</p>
</div>
<div className="flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-on-surface-variant text-sm">person</span>
<span className="font-label-md">12/12 <span className="text-on-surface-variant font-normal">Seats</span></span>
</div>
<div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
<button className="p-2 hover:bg-background-alt rounded-lg text-on-surface-variant"><span className="material-symbols-outlined text-lg">lock</span></button>
<button className="p-2 hover:bg-background-alt rounded-lg text-error"><span className="material-symbols-outlined text-lg">delete</span></button>
</div>
</div>
</div>

<div className="bg-white/40 border-2 border-dashed border-border-gray rounded-[24px] p-6 group transition-all hover:bg-white hover:border-solid hover:border-border-gray cursor-pointer">
<div className="flex justify-between items-start mb-6">
<div className="bg-white w-14 h-14 rounded-full flex items-center justify-center text-on-surface-variant">
<span className="material-symbols-outlined text-3xl">radio_button_unchecked</span>
</div>
<div className="flex flex-col items-end">
<span className="px-3 py-1 bg-on-surface-variant/10 text-on-surface-variant text-[10px] font-bold uppercase rounded-full">Pending</span>
<p className="text-on-surface-variant text-label-sm mt-1">Zone B</p>
</div>
</div>
<div className="mb-6">
<h3 className="font-display-lg text-display-lg leading-tight mb-1 text-on-surface-variant">03</h3>
<p className="text-on-surface-variant font-label-md">Standard Guest Round</p>
</div>
<div className="flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-on-surface-variant text-sm">person</span>
<span className="font-label-md text-on-surface-variant">0/10 <span className="text-on-surface-variant font-normal">Seats</span></span>
</div>
<div className="flex gap-1">
<button className="p-2 hover:bg-background-alt rounded-lg text-on-surface-variant"><span className="material-symbols-outlined text-lg">edit</span></button>
</div>
</div>
</div>

<div className="bg-white rounded-[24px] p-6 shadow-sm border-2 border-transparent hover:border-primary/20 transition-all cursor-pointer group">
<div className="flex justify-between items-start mb-6">
<div className="bg-background-alt w-14 h-14 rounded-full flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-3xl">radio_button_unchecked</span>
</div>
<div className="flex flex-col items-end">
<span className="px-3 py-1 bg-emerald-green/10 text-emerald-green text-[10px] font-bold uppercase rounded-full">Active</span>
<p className="text-on-surface-variant text-label-sm mt-1">Zone B</p>
</div>
</div>
<div className="mb-6">
<h3 className="font-display-lg text-display-lg leading-tight mb-1">04</h3>
<p className="text-on-surface-variant font-label-md">Lounge Circular</p>
</div>
<div className="flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-on-surface-variant text-sm">person</span>
<span className="font-label-md">6/8 <span className="text-on-surface-variant font-normal">Seats</span></span>
</div>
</div>
</div>

<div className="bg-white rounded-[24px] p-6 shadow-sm border-2 border-transparent hover:border-primary/20 transition-all cursor-pointer group">
<div className="flex justify-between items-start mb-6">
<div className="bg-background-alt w-14 h-14 rounded-full flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-3xl">radio_button_unchecked</span>
</div>
<div className="flex flex-col items-end">
<span className="px-3 py-1 bg-emerald-green/10 text-emerald-green text-[10px] font-bold uppercase rounded-full">Active</span>
<p className="text-on-surface-variant text-label-sm mt-1">Zone C</p>
</div>
</div>
<div className="mb-6">
<h3 className="font-display-lg text-display-lg leading-tight mb-1">05</h3>
<p className="text-on-surface-variant font-label-md">Lounge Circular</p>
</div>
<div className="flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-on-surface-variant text-sm">person</span>
<span className="font-label-md">8/8 <span className="text-on-surface-variant font-normal">Seats</span></span>
</div>
</div>
</div>

<div className="bg-white rounded-[24px] p-6 shadow-sm border-2 border-transparent hover:border-primary/20 transition-all cursor-pointer group">
<div className="flex justify-between items-start mb-6">
<div className="bg-background-alt w-14 h-14 rounded-xl flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-3xl">square</span>
</div>
<div className="flex flex-col items-end">
<span className="px-3 py-1 bg-emerald-green/10 text-emerald-green text-[10px] font-bold uppercase rounded-full">Active</span>
<p className="text-on-surface-variant text-label-sm mt-1">Stage Side</p>
</div>
</div>
<div className="mb-6">
<h3 className="font-display-lg text-display-lg leading-tight mb-1">06</h3>
<p className="text-on-surface-variant font-label-md">Media Square</p>
</div>
<div className="flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-on-surface-variant text-sm">person</span>
<span className="font-label-md">4/4 <span className="text-on-surface-variant font-normal">Seats</span></span>
</div>
</div>
</div>
</div>
</div>

<div className="w-96 sticky top-0 h-fit space-y-6">
<div className="bg-white rounded-[32px] p-gutter shadow-[0_12px_40px_rgba(31,41,55,0.12)] border border-border-gray">
<div className="flex justify-between items-center mb-8">
<h4 className="font-headline-md text-headline-md">Table Details</h4>
<button className="text-on-surface-variant hover:text-primary transition-colors"><span className="material-symbols-outlined">close</span></button>
</div>
<div className="space-y-6">

<div>
<label className="font-label-sm uppercase tracking-wider text-on-surface-variant block mb-2">Table Number/ID</label>
<input className="w-full bg-background-alt border-none rounded-2xl py-3 px-4 font-display-lg text-primary focus:ring-2 focus:ring-primary/20" type="text" value="02"/>
</div>

<div>
<label className="font-label-sm uppercase tracking-wider text-on-surface-variant block mb-3">Shape &amp; Style</label>
<div className="grid grid-cols-4 gap-2">
<button className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-background-alt transition-colors group">
<span className="material-symbols-outlined text-2xl group-hover:text-primary">radio_button_unchecked</span>
<span className="text-[10px] font-bold uppercase">Round</span>
</button>
<button className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-background-alt transition-colors group">
<span className="material-symbols-outlined text-2xl group-hover:text-primary">square</span>
<span className="text-[10px] font-bold uppercase">Square</span>
</button>
<button className="flex flex-col items-center gap-1 p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary">
<span className="material-symbols-outlined text-2xl" style="font-variation-settings: 'FILL' 1;">rectangle</span>
<span className="text-[10px] font-bold uppercase">Rect</span>
</button>
<button className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-background-alt transition-colors group">
<span className="material-symbols-outlined text-2xl group-hover:text-primary">view_stream</span>
<span className="text-[10px] font-bold uppercase">Long</span>
</button>
</div>
</div>

<div>
<div className="flex justify-between items-center mb-3">
<label className="font-label-sm uppercase tracking-wider text-on-surface-variant">Capacity</label>
<span className="font-bold text-primary">12 Guests</span>
</div>
<input className="w-full h-1.5 bg-background-alt rounded-lg appearance-none cursor-pointer accent-primary" max="12" min="1" type="range" value="12"/>
<div className="flex justify-between text-[10px] text-on-surface-variant mt-2">
<span>1</span>
<span>6</span>
<span>12</span>
</div>
</div>

<div className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl border border-primary/10">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-primary">workspace_premium</span>
<div>
<p className="font-label-md text-primary">VIP Designation</p>
<p className="text-[10px] text-on-surface-variant">Premium service protocols</p>
</div>
</div>
<button className="w-10 h-5 bg-primary rounded-full relative p-1 transition-all">
<div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
</button>
</div>

<div>
<label className="font-label-sm uppercase tracking-wider text-on-surface-variant block mb-4">Current Assignments (12/12)</label>
<div className="space-y-3">
<div className="flex items-center gap-3 p-2 bg-background-alt/50 rounded-xl">
<div className="w-8 h-8 rounded-full bg-surface-variant overflow-hidden">
<img className="w-full h-full object-cover" data-alt="A portrait of a distinguished middle-aged man with salt and pepper hair, wearing a high-end designer suit, minimalist professional lighting." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJzUpn-hHLmkfUUPqP-IAZw5ix8r-y0QRpzyAzAlZayXV0fGMMlSWfyX6vTKVnDDbeXmr-1DHAz2fritpfuHbLr8ncVulaGTISOCJtxKTT4B9cgenOiH59fpC78ht5_3tw4KVZpIZ6tQpev8iW1AqVxzEaF7olV06ILIMn8ek2bk7ueP7G3AM7cP-rh2hGJtKNumr28wmUmJv1jLpz9y0jkyPSXJ2Hknt3lzIJ5SF2p4hfru9Xc52Cqs47dhZqs2uPJdrrRSP8d7Y"/>
</div>
<div className="flex-1">
<p className="text-label-sm font-bold truncate">Sir Richard Branson III</p>
<p className="text-[10px] text-on-surface-variant uppercase">Keynote Speaker</p>
</div>
<button className="text-on-surface-variant hover:text-error transition-colors"><span className="material-symbols-outlined text-sm">person_remove</span></button>
</div>
<div className="flex items-center gap-3 p-2 bg-background-alt/50 rounded-xl">
<div className="w-8 h-8 rounded-full bg-surface-variant overflow-hidden">
<img className="w-full h-full object-cover" data-alt="Portrait of a young executive woman with blonde hair, wearing a white blazer and gold jewelry, soft focus background of a modern office." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAq2K-xeBR8oBjyBk6z_tkhf_ZhJCh-VpSE7kBiC-NfLK362-z7rYSXn3giogQrSbqYR2yHWT4G4Mey5wVhPcAn9J9aZ6wM3DMlgZeXKev7Wd7KfMIqL5PK0vGg5Q3nYbj2GXkB3uV-YrYWGQx4OGnFda2zPiujgQMv97NtaOY0jceYXJGr42thoSi9wIgahy9d1raFyACEDKN-jXmU-ddobYDVTnM2CFpyaGxiWst2T3ZPxoOX5dviwKMJlsYMd-lRCWly8FVGdV4"/>
</div>
<div className="flex-1">
<p className="text-label-sm font-bold truncate">Lady Sarah Jenkins</p>
<p className="text-[10px] text-on-surface-variant uppercase">Ambassador</p>
</div>
<button className="text-on-surface-variant hover:text-error transition-colors"><span className="material-symbols-outlined text-sm">person_remove</span></button>
</div>
<button className="w-full py-2 border-2 border-dashed border-border-gray rounded-xl text-on-surface-variant text-[11px] font-bold uppercase hover:bg-background-alt transition-colors">+ View All 12 Guests</button>
</div>
</div>
<div className="pt-4 flex gap-3">
<button className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold hover:scale-[1.02] transition-transform shadow-md">Apply Changes</button>
<button className="p-4 bg-background-alt text-on-surface-variant rounded-2xl hover:bg-surface-variant transition-colors"><span className="material-symbols-outlined">delete</span></button>
</div>
</div>
</div>

<div className="bg-gradient-to-br from-inverse-surface to-[#3a475a] p-6 rounded-[24px] text-white">
<div className="flex items-center gap-3 mb-4">
<span className="material-symbols-outlined text-emerald-green">check_circle</span>
<span className="font-label-md">Layout Rule Checker</span>
</div>
<p className="text-xs text-surface-variant leading-relaxed">All VIP tables have the required 2-meter clearance from the catering exit. No further modifications needed.</p>
</div>
</div>
</div>
</div>
</main>
        </>
    );
};

export default TablePlanner;
