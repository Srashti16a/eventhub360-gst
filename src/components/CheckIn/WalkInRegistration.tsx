import React from 'react';

const WalkInRegistration: React.FC = () => {
    return (
        <>
            

<header className="bg-surface dark:bg-surface-dim shadow-sm z-30 sticky top-0">
<nav className="flex justify-between items-center px-container-margin py-4 w-full max-w-[1440px] mx-auto">
<div className="flex items-center gap-2">
<span className="font-headline-md text-headline-md font-bold tracking-tight text-primary dark:text-primary-fixed">Lumina Events</span>
</div>
<div className="flex items-center gap-6">
<button className="flex items-center gap-2 text-on-surface-variant font-medium hover:bg-surface-container-low transition-colors px-3 py-2 rounded-lg touch-ripple">
<span className="material-symbols-outlined">language</span>
<span className="font-label-md text-label-md">English</span>
</button>
<button className="flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors w-10 h-10 rounded-full touch-ripple">
<span className="material-symbols-outlined">help</span>
</button>
</div>
</nav>
</header>
<main className="flex-grow flex flex-col items-center justify-center p-gutter max-w-[1440px] mx-auto w-full relative">

<div className="w-full max-w-5xl transition-all duration-500 ease-in-out opacity-100 transform translate-y-0" id="registration-form">
<div className="mb-12 text-center">
<h1 className="font-display-lg text-display-lg mb-2 text-on-surface">Welcome to Lumina Expo</h1>
<p className="font-body-lg text-body-lg text-on-surface-variant">Please register for your guest badge</p>
</div>
<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

<div className="lg:col-span-8 bg-white p-8 md:p-12 rounded-[24px] custom-shadow-l1 border border-border-gray">
<div className="flex items-center justify-between mb-8">
<h2 className="font-headline-md text-headline-md">Guest Information</h2>
<button className="flex items-center gap-2 px-6 py-3 bg-secondary-container text-on-secondary-container rounded-xl font-label-md text-label-md hover:bg-opacity-90 transition-all touch-ripple" onclick="simulateScan()">
<span className="material-symbols-outlined">contact_emergency</span>
                            Scan Business Card
                        </button>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
<div className="space-y-2">
<label className="font-label-md text-label-md text-on-surface-variant ml-1">First Name</label>
<input className="w-full h-16 px-6 bg-background-alt border-none rounded-xl text-body-lg focus:bg-white focus:ring-2 focus:ring-primary-container transition-all" placeholder="e.g. Julian" type="text"/>
</div>
<div className="space-y-2">
<label className="font-label-md text-label-md text-on-surface-variant ml-1">Last Name</label>
<input className="w-full h-16 px-6 bg-background-alt border-none rounded-xl text-body-lg focus:bg-white focus:ring-2 focus:ring-primary-container transition-all" placeholder="e.g. Thorne" type="text"/>
</div>
<div className="md:col-span-2 space-y-2">
<label className="font-label-md text-label-md text-on-surface-variant ml-1">Work Email</label>
<input className="w-full h-16 px-6 bg-background-alt border-none rounded-xl text-body-lg focus:bg-white focus:ring-2 focus:ring-primary-container transition-all" placeholder="julian.thorne@company.com" type="email"/>
</div>
<div className="space-y-2">
<label className="font-label-md text-label-md text-on-surface-variant ml-1">Company</label>
<input className="w-full h-16 px-6 bg-background-alt border-none rounded-xl text-body-lg focus:bg-white focus:ring-2 focus:ring-primary-container transition-all" placeholder="Company Name" type="text"/>
</div>
<div className="space-y-2">
<label className="font-label-md text-label-md text-on-surface-variant ml-1">Job Title</label>
<input className="w-full h-16 px-6 bg-background-alt border-none rounded-xl text-body-lg focus:bg-white focus:ring-2 focus:ring-primary-container transition-all" placeholder="Executive Director" type="text"/>
</div>
<div className="md:col-span-2 space-y-2">
<label className="font-label-md text-label-md text-on-surface-variant ml-1">Phone Number</label>
<input className="w-full h-16 px-6 bg-background-alt border-none rounded-xl text-body-lg focus:bg-white focus:ring-2 focus:ring-primary-container transition-all" placeholder="+1 (555) 000-0000" type="tel"/>
</div>
</div>
<div className="mt-12">
<button className="w-full h-20 bg-coral-gradient text-white rounded-[20px] font-headline-md text-headline-md font-bold shadow-lg hover:scale-[1.02] transition-all touch-ripple flex items-center justify-center gap-3" onclick="handleSubmit()">
<span>Register &amp; Print Badge</span>
<span className="material-symbols-outlined text-3xl">print</span>
</button>
</div>
</div>

<div className="lg:col-span-4 flex flex-col gap-8">
<div className="bg-white p-8 rounded-[24px] custom-shadow-l1 border border-border-gray text-center overflow-hidden">
<h3 className="font-label-md text-label-md mb-6 uppercase tracking-widest text-on-surface-variant">Profile Photo</h3>
<div className="relative w-48 h-48 mx-auto mb-6 group cursor-pointer">
<div className="w-full h-full rounded-full bg-background-alt flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
<img className="w-full h-full object-cover" data-alt="A portrait-style profile photo placeholder of a diverse professional person in high-end office lighting, using a minimalist light-mode aesthetic with soft shadows and a pristine white background. The composition is clean and modern, following hospitality modernism design principles with a focused, warm, and inviting mood." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwxVvhkpSNR-2durePZq832418d4SPdWSHinUViD_shEdND4vo7bm4SHPNW__GJJB6Hxfp0rhAugo6pANbJLgyQHiH30QeoqZVZHvzl685BxUR1okIDCg_AOTaSCIeycxth0ZRkma-1pjP9ZcXsMfMYO5plUlh6bq3HtfEREmnwxQbND_11EAKhyhuK6JF1UkoKOGxLuzg7IdWyH6Ik8zvHz1Jwr2n0MTdDDaSiJDv2pfbJNH3Y3C5Zd5E4WGmD4AHxWSa2zR4D6c"/>
<div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
<span className="material-symbols-outlined text-white text-4xl">add_a_photo</span>
</div>
</div>
</div>
<p className="text-body-sm font-body-sm text-on-surface-variant mb-4 px-4">Take a photo for your digital and physical guest credentials.</p>
<div className="flex flex-col gap-3">
<button className="w-full py-4 bg-background-alt text-on-surface font-label-md text-label-md rounded-xl hover:bg-surface-container transition-colors touch-ripple flex items-center justify-center gap-2">
<span className="material-symbols-outlined">photo_camera</span>
                                Take Photo
                            </button>
<button className="w-full py-4 border-2 border-border-gray text-on-surface-variant font-label-md text-label-md rounded-xl hover:border-primary-container hover:text-primary transition-all touch-ripple">
                                Upload File
                            </button>
</div>
</div>

<div className="bg-primary-container/10 p-8 rounded-[24px] border border-primary-container/20">
<div className="flex items-start gap-4">
<span className="material-symbols-outlined text-primary text-3xl">info</span>
<div>
<h4 className="font-label-md text-label-md text-primary mb-2">Need Assistance?</h4>
<p className="text-body-sm font-body-sm text-on-surface-variant">Simply tap the help icon above or look for a Lumina Concierge member in a red vest.</p>
</div>
</div>
</div>
</div>
</div>
</div>

<div className="hidden w-full max-w-3xl bg-white p-12 rounded-[32px] custom-shadow-l1 border border-border-gray text-center flex flex-col items-center opacity-0 transform translate-y-10 transition-all duration-700" id="success-state">
<div className="w-24 h-24 bg-emerald-green rounded-full flex items-center justify-center text-white mb-8 animate-bounce">
<span className="material-symbols-outlined text-6xl">check_circle</span>
</div>
<h2 className="font-display-lg text-display-lg mb-4 text-on-surface">Registration Complete!</h2>
<p className="font-body-lg text-body-lg text-on-surface-variant mb-12">Welcome to Lumina Expo 2024. Your badge is currently being prepared.</p>

<div className="relative bg-background-alt p-8 rounded-3xl w-full max-w-sm mb-12 border border-border-gray overflow-hidden">
<div className="absolute top-0 right-0 p-4 opacity-10">
<span className="material-symbols-outlined text-[120px]">qr_code_2</span>
</div>
<div className="text-left mb-6 relative z-10">
<span className="bg-primary text-white text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider">Guest Pass</span>
<h3 className="font-headline-md text-headline-md mt-2">Julian Thorne</h3>
<p className="text-body-sm opacity-60">Global Strategy Group</p>
</div>
<div className="flex justify-center bg-white p-6 rounded-2xl shadow-inner relative z-10">
<img className="w-48 h-48" data-alt="A clean, high-contrast QR code generated on a white background with rounded corners. The design is minimalist and sophisticated, intended for a premium event registration pass, surrounded by ample white space to maintain the hospitality modernism aesthetic." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCCSlXRCbY14D3ac2g0AkrobWHqQmLKdgFp-RExyCejV63qWBSNuarFkqF37drN1SSPTxzfZTDLQR9ZwMNtFXMKm31EVdgbO99yNZpTlKhgk9M5XZnFASQkoBXS2eTq2400CVVRANPW8p8ZtqBIBIZG5hCWuCnWj8xhR-fQUSpWvCXqZX1Fl_HkO2IarULCQJMAsbJ6KaSTSp-nAmPFDKkuj9cnHReZQw5qw2p0Du4N0rCyCM_Kq0dzJdmY8J52WerDPY3aMQ0uBAw"/>
</div>
<div className="mt-6 flex justify-between items-center text-label-sm relative z-10">
<span className="text-on-surface-variant">LUMINA-XP-2024</span>
<span className="text-emerald-green font-bold flex items-center gap-1">
<span className="w-2 h-2 bg-emerald-green rounded-full animate-pulse"></span>
                        Active
                    </span>
</div>
</div>

<div className="flex flex-col items-center gap-4 w-full">
<div className="w-full max-w-md h-2 bg-background-alt rounded-full overflow-hidden">
<div className="h-full bg-primary-container w-0 transition-all duration-3000 ease-linear" id="print-progress"></div>
</div>
<div className="flex items-center gap-2 text-primary font-bold">
<span className="material-symbols-outlined animate-spin">print</span>
<span className="font-label-md text-label-md">Printing Badge... Please wait</span>
</div>
</div>
<button className="mt-12 text-on-surface-variant font-label-md text-label-md hover:text-primary transition-colors flex items-center gap-2 px-6 py-3 rounded-full hover:bg-surface-container-low touch-ripple" onclick="resetKiosk()">
<span className="material-symbols-outlined">restart_alt</span>
                Finish &amp; New Registration
            </button>
</div>
</main>

<footer className="fixed bottom-0 w-full z-20 pointer-events-none">
<div className="glass-overlay flex justify-center gap-12 py-6 px-container-margin w-full pointer-events-auto">
<button className="flex flex-col items-center justify-center text-primary font-bold px-8 py-2 rounded-xl transition-all touch-ripple scale-95 duration-150">
<span className="material-symbols-outlined">home</span>
<span className="font-label-md text-label-md">Home</span>
</button>
<button className="flex flex-col items-center justify-center text-on-surface-variant px-8 py-2 rounded-xl hover:bg-surface-container-low transition-colors touch-ripple">
<span className="material-symbols-outlined">support_agent</span>
<span className="font-label-md text-label-md">Help</span>
</button>
</div>
</footer>


        </>
    );
};

export default WalkInRegistration;
