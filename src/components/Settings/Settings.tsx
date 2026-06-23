import React from 'react';

const Settings: React.FC = () => {
    return (
        <>
            

<aside className="fixed left-0 top-0 h-full flex flex-col p-6 space-y-4 h-screen w-72 flex-shrink-0 bg-surface-container-lowest shadow-[4px_0_20px_0_rgba(31,41,55,0.05)] z-40 overflow-y-auto custom-scrollbar">
<div className="flex items-center space-x-3 mb-8 px-2">
<div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center text-white">
<span className="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">hub</span>
</div>
<div>
<h1 className="font-headline-lg text-headline-lg font-bold text-primary">EventHub360</h1>
<p className="text-xs font-label-sm text-on-surface-variant tracking-wider uppercase">Digital Concierge Admin</p>
</div>
</div>
<nav className="flex-1 space-y-2">

<button className="w-full flex items-center px-4 py-3 space-x-3 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors duration-200 rounded-xl group" onclick="switchTab('organization')">
<span className="material-symbols-outlined group-hover:scale-110 transition-transform">business</span>
<span className="font-label-md text-label-md">Organization</span>
</button>

<button className="w-full flex items-center px-4 py-3 space-x-3 text-primary font-bold bg-primary-fixed rounded-xl" id="nav-active" onclick="switchTab('event_settings')">
<span className="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">event_available</span>
<span className="font-label-md text-label-md">Event Settings</span>
</button>
<button className="w-full flex items-center px-4 py-3 space-x-3 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors duration-200 rounded-xl group" onclick="switchTab('notifications')">
<span className="material-symbols-outlined group-hover:scale-110 transition-transform">notifications_active</span>
<span className="font-label-md text-label-md">Notifications</span>
</button>
<button className="w-full flex items-center px-4 py-3 space-x-3 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors duration-200 rounded-xl group" onclick="switchTab('users')">
<span className="material-symbols-outlined group-hover:scale-110 transition-transform">group</span>
<span className="font-label-md text-label-md">Users</span>
</button>
<button className="w-full flex items-center px-4 py-3 space-x-3 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors duration-200 rounded-xl group" onclick="switchTab('roles')">
<span className="material-symbols-outlined group-hover:scale-110 transition-transform">badge</span>
<span className="font-label-md text-label-md">Roles</span>
</button>
<button className="w-full flex items-center px-4 py-3 space-x-3 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors duration-200 rounded-xl group" onclick="switchTab('branding')">
<span className="material-symbols-outlined group-hover:scale-110 transition-transform">palette</span>
<span className="font-label-md text-label-md">Branding</span>
</button>
<button className="w-full flex items-center px-4 py-3 space-x-3 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors duration-200 rounded-xl group" onclick="switchTab('security')">
<span className="material-symbols-outlined group-hover:scale-110 transition-transform">shield</span>
<span className="font-label-md text-label-md">Security</span>
</button>
<button className="w-full flex items-center px-4 py-3 space-x-3 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors duration-200 rounded-xl group" onclick="switchTab('audit')">
<span className="material-symbols-outlined group-hover:scale-110 transition-transform">history</span>
<span className="font-label-md text-label-md">Audit Logs</span>
</button>
</nav>
<div className="pt-6 border-t border-border-gray space-y-4">
<div className="bg-primary-container/10 p-4 rounded-2xl">
<p className="text-xs font-bold text-primary mb-1 uppercase tracking-tighter">Current Plan</p>
<p className="font-headline-md text-headline-md text-on-surface mb-3">Enterprise Plus</p>
<button className="w-full bg-primary text-white py-2 rounded-lg font-label-md text-label-md hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">Upgrade Plan</button>
</div>
<button className="w-full flex items-center px-4 py-2 space-x-3 text-on-surface-variant hover:text-on-surface transition-colors">
<span className="material-symbols-outlined">help</span>
<span className="font-label-md text-label-md">Help Center</span>
</button>
<button className="w-full flex items-center px-4 py-2 space-x-3 text-error hover:opacity-80 transition-colors">
<span className="material-symbols-outlined">logout</span>
<span className="font-label-md text-label-md">Sign Out</span>
</button>
</div>
</aside>

<main className="ml-72 flex-1 flex flex-col min-h-screen relative">

<header className="flex justify-between items-center px-12 sticky top-0 z-50 w-full h-20 backdrop-blur-xl bg-white/60 border-b border-border-gray">
<div className="flex items-center space-x-8">
<h2 className="font-headline-md text-headline-md font-extrabold text-primary">Settings</h2>
<div className="relative w-96">
<span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60">search</span>
<input className="w-full pl-12 pr-4 py-2 bg-background-alt border-none rounded-full text-body-md focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all" placeholder="Search settings, users, or logs..." type="text"/>
</div>
</div>
<div className="flex items-center space-x-6">
<div className="flex space-x-1">
<button className="p-2 hover:bg-background-alt rounded-full transition-all active:scale-90"><span className="material-symbols-outlined text-on-surface-variant">notifications</span></button>
<button className="p-2 hover:bg-background-alt rounded-full transition-all active:scale-90"><span className="material-symbols-outlined text-on-surface-variant">help</span></button>
<button className="p-2 hover:bg-background-alt rounded-full transition-all active:scale-90"><span className="material-symbols-outlined text-on-surface-variant">settings</span></button>
</div>
<div className="h-8 w-[1px] bg-border-gray"></div>
<div className="flex items-center space-x-3 pl-2">
<div className="text-right">
<p className="font-label-md text-label-md text-on-surface">Alex Thompson</p>
<p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Admin Manager</p>
</div>
<div className="w-10 h-10 rounded-full border-2 border-primary/20 p-0.5">
<img className="w-full h-full rounded-full object-cover" data-alt="A professional headshot of a young business executive with a friendly expression, wearing a stylish charcoal suit, against a clean and blurred modern office background with soft cinematic lighting." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbOVuhDiDtAEMiNMOvmQyRBiNcPRyx9G2mXPrhxP9aueXaT6Onm7uoH0jz2n5oDqkkHwN9GPILtWFUIZRQk-exXqjMK97ep262_OBFUcSiLDcDqvjjERfpP7yqNRWOqA-ug3UcSxd0iaenucemHcKhSUdpKtHi02Q3IEy0JOAXqGswhsNOpdgO-VE2IHqasgL9cyJQV6DWF1mDFwXd9Hrj22ksW1adPHAJKaU9ccpyk98w_hkLSlfBaaNknE_JYfg4Zqlwpr2y9zI"/>
</div>
</div>
</div>
</header>

<div className="p-12 max-w-[1440px] mx-auto w-full space-y-12 animate-in fade-in duration-700">

<div className="flex justify-between items-end">
<div>
<span className="text-primary font-bold text-xs uppercase tracking-widest">Digital Concierge Platform</span>
<h3 className="font-display-lg text-display-lg text-on-surface mt-1" id="section-title">Organization</h3>
</div>
<div className="flex space-x-3">
<button className="px-6 py-2.5 rounded-xl border border-border-gray text-on-surface-variant font-label-md hover:bg-white hover:shadow-sm transition-all">Discard Changes</button>
<button className="px-8 py-2.5 rounded-xl bg-primary text-white font-label-md shadow-lg shadow-primary/25 hover:scale-102 hover:shadow-xl transition-all">Save Changes</button>
</div>
</div>

<div className="grid grid-cols-12 gap-8" id="settings-canvas">

<div className="col-span-12 space-y-8 tab-panel" id="tab-organization">
<div className="grid grid-cols-12 gap-8">
<div className="col-span-8 space-y-6">
<div className="glass-card p-8 rounded-[24px] shadow-sm">
<h4 className="font-headline-md text-headline-md text-on-surface mb-6 border-b border-border-gray pb-4">General Information</h4>
<div className="grid grid-cols-2 gap-6">
<div className="space-y-2">
<label className="font-label-md text-label-md text-on-surface-variant">Company Name</label>
<input className="w-full px-4 py-3 bg-background-alt border-none rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all" type="text" value="Grand Hyatt Grand Regency"/>
</div>
<div className="space-y-2">
<label className="font-label-md text-label-md text-on-surface-variant">Tax Identification Number</label>
<input className="w-full px-4 py-3 bg-background-alt border-none rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all" type="text" value="US-99-2345678"/>
</div>
<div className="col-span-2 space-y-2">
<label className="font-label-md text-label-md text-on-surface-variant">Registered Office Address</label>
<textarea className="w-full px-4 py-3 bg-background-alt border-none rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all" rows="3">102 Boutique Square, Luxury District, San Francisco, CA 94103</textarea>
</div>
<div className="space-y-2">
<label className="font-label-md text-label-md text-on-surface-variant">Timezone</label>
<select className="w-full px-4 py-3 bg-background-alt border-none rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all">
<option>Pacific Standard Time (PST)</option>
<option>Eastern Standard Time (EST)</option>
<option>Greenwich Mean Time (GMT)</option>
</select>
</div>
<div className="space-y-2">
<label className="font-label-md text-label-md text-on-surface-variant">Primary Currency</label>
<select className="w-full px-4 py-3 bg-background-alt border-none rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all">
<option>USD ($)</option>
<option>EUR (€)</option>
<option>GBP (£)</option>
</select>
</div>
</div>
</div>
</div>
<div className="col-span-4 space-y-6">
<div className="glass-card p-8 rounded-[24px] shadow-sm flex flex-col items-center text-center">
<div className="w-32 h-32 bg-background-alt rounded-3xl border-2 border-dashed border-border-gray flex items-center justify-center mb-6 overflow-hidden">
<img className="w-full h-full object-contain p-4" data-alt="A clean, high-resolution vector logo of a luxury hotel group. The logo is minimalist, featuring a stylized gold H letterform inside a laurel wreath, isolated on a pure white background. Elegant, modern, and high-end hospitality aesthetic." src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8CDA7AEK0zSbu6clptMikYTzTpukV5hHO2XLiOytIKa8En7Teq2n_Y5BGYX1FG-FPc_eO7lZa5BwABy4D8z6kcsF5zM-5qVh6pHX3X2xjp_A7Zr9EW7oXR2ZCq9RZfuOnxr2PeXCmE7hwMK76Vn-xrUeGAOjRsWaVYBuCRnLW-Ok-7IxFYt9_O_YpP2Nk0UVZ2cHpsmrIVFLAiLy31h7MKCo-wnHQ0bXtALBg0cHpJfghcrnZrCVE32N31YZYLg5MODO6yoXufNI"/>
</div>
<h5 className="font-headline-md text-headline-md text-on-surface">Organization Logo</h5>
<p className="text-on-surface-variant text-body-sm mt-2 mb-6">High resolution PNG or SVG (Max 5MB)</p>
<button className="w-full bg-secondary-container text-on-secondary-container py-3 rounded-xl font-label-md hover:opacity-90 transition-all">Replace Logo</button>
</div>
</div>
</div>
</div>

<div className="col-span-12 space-y-8 tab-panel hidden" id="tab-users">
<div className="glass-card rounded-[24px] shadow-sm overflow-hidden border border-border-gray">
<div className="p-8 border-b border-border-gray flex justify-between items-center">
<div>
<h4 className="font-headline-md text-headline-md text-on-surface">User Management</h4>
<p className="text-on-surface-variant text-body-sm">Manage access and roles for your event team members.</p>
</div>
<button className="flex items-center space-x-2 px-6 py-2.5 bg-primary text-white rounded-xl font-label-md shadow-md hover:scale-102 transition-all">
<span className="material-symbols-outlined text-[20px]">person_add</span>
<span>Add User</span>
</button>
</div>
<div className="overflow-x-auto">
<table className="w-full text-left">
<thead className="bg-background-alt/50 border-b border-border-gray">
<tr>
<th className="px-8 py-4 font-label-md text-label-md text-on-surface-variant">User</th>
<th className="px-8 py-4 font-label-md text-label-md text-on-surface-variant">Role</th>
<th className="px-8 py-4 font-label-md text-label-md text-on-surface-variant">Status</th>
<th className="px-8 py-4 font-label-md text-label-md text-on-surface-variant">Last Active</th>
<th className="px-8 py-4"></th>
</tr>
</thead>
<tbody className="divide-y divide-border-gray">
<tr className="hover:bg-background-alt/30 transition-colors">
<td className="px-8 py-5">
<div className="flex items-center space-x-3">
<div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold">SM</div>
<div>
<p className="font-label-md text-on-surface">Sarah Miller</p>
<p className="text-xs text-on-surface-variant">sarah.m@eventhub.com</p>
</div>
</div>
</td>
<td className="px-8 py-5"><span className="px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed-variant rounded-full text-xs font-bold uppercase">Admin</span></td>
<td className="px-8 py-5">
<span className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-emerald-green/10 text-emerald-green rounded-full text-xs font-bold">
<span className="w-1.5 h-1.5 bg-emerald-green rounded-full"></span>
<span>Active</span>
</span>
</td>
<td className="px-8 py-5 text-on-surface-variant text-body-sm">2 mins ago</td>
<td className="px-8 py-5 text-right"><button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">more_vert</button></td>
</tr>
<tr className="hover:bg-background-alt/30 transition-colors">
<td className="px-8 py-5">
<div className="flex items-center space-x-3">
<div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary font-bold">JD</div>
<div>
<p className="font-label-md text-on-surface">James Donovan</p>
<p className="text-xs text-on-surface-variant">j.donovan@hotelgroup.com</p>
</div>
</div>
</td>
<td className="px-8 py-5"><span className="px-3 py-1 bg-surface-container-high text-on-surface-variant rounded-full text-xs font-bold uppercase">Staff</span></td>
<td className="px-8 py-5">
<span className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-emerald-green/10 text-emerald-green rounded-full text-xs font-bold">
<span className="w-1.5 h-1.5 bg-emerald-green rounded-full"></span>
<span>Active</span>
</span>
</td>
<td className="px-8 py-5 text-on-surface-variant text-body-sm">1 hour ago</td>
<td className="px-8 py-5 text-right"><button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">more_vert</button></td>
</tr>
<tr className="hover:bg-background-alt/30 transition-colors">
<td className="px-8 py-5">
<div className="flex items-center space-x-3">
<div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant font-bold">EL</div>
<div>
<p className="font-label-md text-on-surface">Elena Lopez</p>
<p className="text-xs text-on-surface-variant">elena.l@partner.io</p>
</div>
</div>
</td>
<td className="px-8 py-5"><span className="px-3 py-1 bg-surface-container-high text-on-surface-variant rounded-full text-xs font-bold uppercase">Viewer</span></td>
<td className="px-8 py-5">
<span className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-on-surface-variant/10 text-on-surface-variant rounded-full text-xs font-bold">
<span className="w-1.5 h-1.5 bg-on-surface-variant rounded-full"></span>
<span>Inactive</span>
</span>
</td>
<td className="px-8 py-5 text-on-surface-variant text-body-sm">3 days ago</td>
<td className="px-8 py-5 text-right"><button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">more_vert</button></td>
</tr>
</tbody>
</table>
</div>
<div className="p-4 bg-background-alt/30 flex justify-center">
<button className="text-primary font-label-md hover:underline">View all 148 users</button>
</div>
</div>
</div>

<div className="col-span-12 space-y-8 tab-panel hidden" id="tab-branding">
<div className="grid grid-cols-12 gap-8">

<div className="col-span-12 glass-card p-8 rounded-[24px]">
<h4 className="font-headline-md text-headline-md text-on-surface mb-8">Logo System</h4>
<div className="grid grid-cols-2 gap-12">
<div className="space-y-4">
<p className="font-label-md text-on-surface">Light Mode Logo</p>
<div className="h-48 bg-white border border-border-gray rounded-2xl flex items-center justify-center p-8 relative group">
<img className="max-h-full" data-alt="A refined hotel logo in black and gold on a white background. Minimalist elegance, sharp lines, luxury branding." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDV6X0t7BSiQ0eeuEMU53VPEwkiVoCXYGKKrx0Mf68CN4b_Onm-dYdvEUs3RARf31-J4kmcdBkcB8qIe2L1ZswKGDevCdzSH0BCqN-MPOSde_UgHplpRDQk1ykUs5sU5hEb2sw1zNjRIWYAyMvfv_5ds8pVjtI2t6DDG96hJgQFb22o1X5yOdlDnjJu1S1PHfc8hqvEQFiWAzWY5Mlv5E8EmLICW5N3OpNHPcGlRPhr8EYwuo4W4tvwn1GyhkJEES_ygc5Vtts3dyU"/>
<div className="absolute inset-0 bg-on-surface/5 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-2xl cursor-pointer">
<span className="bg-white px-4 py-2 rounded-lg font-label-md shadow-sm">Replace Image</span>
</div>
</div>
<p className="text-xs text-on-surface-variant italic">Visible on light backgrounds and mobile header.</p>
</div>
<div className="space-y-4">
<p className="font-label-md text-on-surface">Dark Mode Logo</p>
<div className="h-48 bg-inverse-surface border border-border-gray rounded-2xl flex items-center justify-center p-8 relative group">
<img className="max-h-full" data-alt="The same refined hotel logo but inverted in white and silver on a dark charcoal background. Minimalist elegance, sharp lines, premium hospitality identity." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCOZLfoR0SYmFxpiGYjAdzJ1dD1_BhcITHj-ITMFPMgikrZ69zTHmDQyNqvNMHJRJRaGQuQZSd5EMHHNkMlvQBr65C3aHsydofuoXWFwv2gMH5DXaCfiHPVVLMuly6NSgkXExu5MdkJQdB3mpirA3L0v-CnL6ph_RYw8xeu-IbArJdPzNUyj2fR7Zsb0G6cyRiCisYZ18Cf1ATy9vNP94qS29wrlxqxO374mme8AP-H3hqlDB9dJDp7jDvse4OS7IUrCTb49IkvGe4"/>
<div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-2xl cursor-pointer">
<span className="bg-inverse-surface text-white px-4 py-2 rounded-lg font-label-md shadow-sm border border-white/20">Replace Image</span>
</div>
</div>
<p className="text-xs text-on-surface-variant italic">Visible on dark navigation shells and high-contrast modes.</p>
</div>
</div>
</div>

<div className="col-span-6 glass-card p-8 rounded-[24px]">
<h4 className="font-headline-md text-headline-md text-on-surface mb-6">Color Palette</h4>
<div className="space-y-6">
<div className="flex items-center justify-between p-4 bg-background-alt rounded-xl">
<div className="flex items-center space-x-4">
<div className="w-12 h-12 rounded-lg bg-primary-container shadow-inner border border-white/20"></div>
<div>
<p className="font-label-md text-on-surface">Primary Accent</p>
<p className="text-xs font-mono text-on-surface-variant">#FF6B6B</p>
</div>
</div>
<button className="text-primary font-label-md px-4 py-1 hover:bg-white rounded-lg transition-all">Edit</button>
</div>
<div className="flex items-center justify-between p-4 bg-background-alt rounded-xl opacity-60">
<div className="flex items-center space-x-4">
<div className="w-12 h-12 rounded-lg bg-secondary shadow-inner border border-white/20"></div>
<div>
<p className="font-label-md text-on-surface">Secondary Gold</p>
<p className="text-xs font-mono text-on-surface-variant">#755A1D</p>
</div>
</div>
<span className="text-[10px] uppercase font-bold text-on-surface-variant">Locked</span>
</div>
</div>
</div>

<div className="col-span-6 glass-card p-8 rounded-[24px]">
<h4 className="font-headline-md text-headline-md text-on-surface mb-6">Typography</h4>
<div className="space-y-4">
<div className="space-y-2">
<label className="font-label-md text-on-surface-variant">Heading Font Family</label>
<select className="w-full px-4 py-3 bg-background-alt border-none rounded-xl font-headline-md">
<option>Hanken Grotesk</option>
<option>Playfair Display</option>
<option>Inter</option>
</select>
</div>
<div className="space-y-2">
<label className="font-label-md text-on-surface-variant">Body Font Family</label>
<select className="w-full px-4 py-3 bg-background-alt border-none rounded-xl">
<option>Inter</option>
<option>Roboto</option>
<option>Open Sans</option>
</select>
</div>
</div>
</div>
</div>
</div>

<div className="col-span-12 space-y-8 tab-panel hidden" id="tab-security">
<div className="grid grid-cols-12 gap-8">
<div className="col-span-8 glass-card p-8 rounded-[24px]">
<h4 className="font-headline-md text-headline-md text-on-surface mb-8 border-b border-border-gray pb-4">Security Policies</h4>
<div className="space-y-8">
<div className="flex items-center justify-between">
<div className="space-y-1">
<p className="font-label-md text-on-surface">Two-Factor Authentication (2FA)</p>
<p className="text-body-sm text-on-surface-variant max-w-md">Mandate users to verify their identity via SMS or Auth App on every login attempt.</p>
</div>
<label className="relative inline-flex items-center cursor-pointer">
<input checked="" className="sr-only peer" type="checkbox"/>
<div className="w-12 h-6 bg-on-surface-variant/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
</label>
</div>
<div className="h-[1px] bg-border-gray"></div>
<div className="grid grid-cols-2 gap-8">
<div className="space-y-3">
<label className="font-label-md text-on-surface">Session Timeout</label>
<div className="flex items-center space-x-3">
<input className="w-24 px-4 py-2 bg-background-alt border-none rounded-lg focus:ring-primary" type="number" value="30"/>
<span className="text-body-md text-on-surface-variant">Minutes of inactivity</span>
</div>
</div>
<div className="space-y-3">
<label className="font-label-md text-on-surface">Password Expiry</label>
<div className="flex items-center space-x-3">
<input className="w-24 px-4 py-2 bg-background-alt border-none rounded-lg focus:ring-primary" type="number" value="90"/>
<span className="text-body-md text-on-surface-variant">Days until renewal</span>
</div>
</div>
</div>
<div className="h-[1px] bg-border-gray"></div>
<div className="space-y-4">
<p className="font-label-md text-on-surface">IP Whitelist</p>
<div className="flex space-x-3">
<input className="flex-1 px-4 py-2 bg-background-alt border-none rounded-lg" placeholder="Add IP Address (e.g., 192.168.1.1)" type="text"/>
<button className="bg-secondary-container text-on-secondary-container px-6 py-2 rounded-lg font-label-md">Add IP</button>
</div>
<div className="flex flex-wrap gap-2 pt-2">
<span className="px-3 py-1 bg-surface-container-high text-on-surface rounded-md text-xs font-mono flex items-center space-x-2">
<span>204.14.23.188</span>
<button className="material-symbols-outlined text-xs">close</button>
</span>
<span className="px-3 py-1 bg-surface-container-high text-on-surface rounded-md text-xs font-mono flex items-center space-x-2">
<span>192.110.4.11</span>
<button className="material-symbols-outlined text-xs">close</button>
</span>
</div>
</div>
</div>
</div>
<div className="col-span-4 space-y-6">
<div className="bg-error-container/20 border border-error/20 p-6 rounded-[24px]">
<h5 className="flex items-center space-x-2 text-error font-bold mb-4">
<span className="material-symbols-outlined">warning</span>
<span>Danger Zone</span>
</h5>
<p className="text-body-sm text-on-error-container/80 mb-6">Changing these settings may restrict access for multiple users or reset critical security data.</p>
<button className="w-full border border-error text-error py-2.5 rounded-xl font-label-md hover:bg-error/5 transition-all">Revoke All Sessions</button>
</div>
</div>
</div>
</div>

<div className="col-span-12 space-y-8 tab-panel hidden" id="tab-audit">
<div className="glass-card rounded-[24px] shadow-sm border border-border-gray">
<div className="p-8 border-b border-border-gray flex justify-between items-center">
<h4 className="font-headline-md text-headline-md text-on-surface">Platform Activity Audit</h4>
<div className="flex space-x-2">
<button className="px-4 py-2 bg-background-alt rounded-lg font-label-md flex items-center space-x-2">
<span className="material-symbols-outlined text-[18px]">filter_list</span>
<span>Filter</span>
</button>
<button className="px-4 py-2 bg-background-alt rounded-lg font-label-md flex items-center space-x-2">
<span className="material-symbols-outlined text-[18px]">download</span>
<span>Export CSV</span>
</button>
</div>
</div>
<div className="overflow-x-auto">
<table className="w-full text-left">
<thead className="bg-background-alt/50 border-b border-border-gray">
<tr>
<th className="px-8 py-4 font-label-md text-label-md text-on-surface-variant">Timestamp</th>
<th className="px-8 py-4 font-label-md text-label-md text-on-surface-variant">User</th>
<th className="px-8 py-4 font-label-md text-label-md text-on-surface-variant">Action</th>
<th className="px-8 py-4 font-label-md text-label-md text-on-surface-variant">Category</th>
<th className="px-8 py-4 font-label-md text-label-md text-on-surface-variant">IP Address</th>
</tr>
</thead>
<tbody className="divide-y divide-border-gray">
<tr className="hover:bg-background-alt/20 transition-colors">
<td className="px-8 py-5 text-body-sm text-on-surface-variant font-mono">Oct 24, 2023 · 14:22:01</td>
<td className="px-8 py-5 font-label-md text-on-surface">Alex Thompson</td>
<td className="px-8 py-5">
<p className="text-body-sm text-on-surface">Updated Branding Theme Colors</p>
</td>
<td className="px-8 py-5"><span className="px-2 py-0.5 bg-primary-fixed text-primary rounded text-[10px] font-bold uppercase">Settings</span></td>
<td className="px-8 py-5 text-body-sm text-on-surface-variant font-mono">192.168.1.44</td>
</tr>
<tr className="hover:bg-background-alt/20 transition-colors">
<td className="px-8 py-5 text-body-sm text-on-surface-variant font-mono">Oct 24, 2023 · 13:45:12</td>
<td className="px-8 py-5 font-label-md text-on-surface">Sarah Miller</td>
<td className="px-8 py-5">
<p className="text-body-sm text-on-surface">Created User "Kevin Wright"</p>
</td>
<td className="px-8 py-5"><span className="px-2 py-0.5 bg-secondary-fixed text-on-secondary-fixed-variant rounded text-[10px] font-bold uppercase">Auth</span></td>
<td className="px-8 py-5 text-body-sm text-on-surface-variant font-mono">204.11.23.99</td>
</tr>
<tr className="hover:bg-background-alt/20 transition-colors">
<td className="px-8 py-5 text-body-sm text-on-surface-variant font-mono">Oct 24, 2023 · 11:02:55</td>
<td className="px-8 py-5 font-label-md text-on-surface">System (Automated)</td>
<td className="px-8 py-5">
<p className="text-body-sm text-on-surface">Scheduled Session Clean-up</p>
</td>
<td className="px-8 py-5"><span className="px-2 py-0.5 bg-surface-variant text-on-surface-variant rounded text-[10px] font-bold uppercase">System</span></td>
<td className="px-8 py-5 text-body-sm text-on-surface-variant font-mono">Internal</td>
</tr>
</tbody>
</table>
</div>
</div>
</div>
</div>
</div>

<div className="fixed top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
<div className="fixed bottom-0 left-72 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
</main>


        </>
    );
};

export default Settings;
