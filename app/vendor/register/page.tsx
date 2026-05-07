"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function VendorRegistration() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    email: "",
    phone: "",
    description: "",
    logo: "",
    banner: "",
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: "logo" | "banner") => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (logo 2MB, banner 5MB)
    const maxSize = field === "logo" ? 2 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`File is too large. Max size for ${field} is ${field === "logo" ? "2MB" : "5MB"}.`);
      return;
    }

    setUploading(field);
    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      
      setFormData(prev => ({ ...prev, [field]: data.url }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/vendor/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to register vendor");

      router.refresh();
      // Use window.location to force a full reload and session refresh
      window.location.href = "/vendor";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7f9] text-gray-800 font-sans pb-16">
      {/* Top Bar */}
      <div className="bg-[#00522c] text-white text-xs py-2 px-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span>🚀</span>
          <span>Free delivery on orders above ₦20,000 in Lagos</span>
        </div>
        <div className="flex items-center gap-4 divide-x divide-white/30">
          <a href="#" className="pr-4 hover:underline">Sell on Diosesgrande</a>
          <a href="#" className="px-4 hover:underline">Track Order</a>
          <a href="#" className="px-4 hover:underline">Help Center</a>
          <div className="pl-4 flex items-center gap-2 cursor-pointer">
            <span className="text-lg">🇳🇬</span> EN v | NGN v
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="bg-white py-4 px-6 shadow-sm flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="relative w-12 h-12">
            <Image
              src="/logo.png"
              alt="Diosesgrande Logo"
              fill
              sizes="100px"
              className="object-contain"
            />
          </div>
        </div>

        <div className="flex-1 max-w-2xl mx-8 flex items-center">
          <select className="bg-gray-50 border border-gray-300 rounded-l-md px-3 py-2.5 text-sm text-gray-600 outline-none">
            <option>All Categories</option>
          </select>
          <input type="text" placeholder="Search for products, brands and more..." className="flex-1 border-y border-gray-300 px-4 py-2.5 text-sm outline-none" />
          <button className="bg-[#0b8241] text-white px-5 py-2.5 rounded-r-md hover:bg-[#096b35] transition">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </button>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center cursor-pointer">
            <div className="relative">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              <span className="absolute -top-2 -right-2 bg-[#0b8241] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">3</span>
            </div>
            <span className="text-xs mt-1">Favorites</span>
          </div>
          <div className="flex flex-col items-center cursor-pointer">
            <div className="relative">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              <span className="absolute -top-2 -right-2 bg-[#0b8241] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">2</span>
            </div>
            <span className="text-xs mt-1">Cart</span>
          </div>
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="text-right">
              <div className="text-xs text-gray-500">Hi, Adaeze</div>
              <div className="text-sm font-medium">My Account v</div>
            </div>
            <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
              {/* Dummy Avatar */}
              <div className="w-full h-full bg-gray-400"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Vendor Registration</h1>
            <p className="text-gray-600">Join thousands of trusted vendors on Diosesgrande and grow your business with us.</p>
          </div>
          {/* Shop illustration placeholder */}
          <div className="w-48 h-24 bg-green-100 rounded-t-lg relative border-b-8 border-green-800">
            <div className="absolute bottom-0 w-full flex justify-around">
               <div className="w-8 h-12 bg-white rounded-t-sm"></div>
               <div className="w-8 h-12 bg-white rounded-t-sm"></div>
            </div>
          </div>
        </div>

        <div className="flex gap-6 items-start">
          {/* Main Form Area */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm p-8">
              {/* Steps */}
              <div className="flex items-center justify-between mb-10 relative">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10 -translate-y-1/2"></div>
                
                <div className="flex flex-col items-center bg-white px-2">
                  <div className="w-8 h-8 bg-[#0b8241] text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">1</div>
                  <span className="text-xs font-semibold mt-2 text-gray-900">Store Information</span>
                </div>
                
                <div className="flex flex-col items-center bg-white px-2">
                  <div className="w-8 h-8 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center text-sm font-bold border border-gray-200">2</div>
                  <span className="text-xs font-medium mt-2 text-gray-400">Business Details</span>
                </div>

                <div className="flex flex-col items-center bg-white px-2">
                  <div className="w-8 h-8 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center text-sm font-bold border border-gray-200">3</div>
                  <span className="text-xs font-medium mt-2 text-gray-400">Verification</span>
                </div>

                <div className="flex flex-col items-center bg-white px-2">
                  <div className="w-8 h-8 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center text-sm font-bold border border-gray-200">4</div>
                  <span className="text-xs font-medium mt-2 text-gray-400">Bank Details</span>
                </div>

                <div className="flex flex-col items-center bg-white px-2">
                  <div className="w-8 h-8 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center text-sm font-bold border border-gray-200">5</div>
                  <span className="text-xs font-medium mt-2 text-gray-400">Review & Submit</span>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">Store Information</h2>
                <p className="text-sm text-gray-500 mt-1">Let's start with the basic information about your store.</p>
              </div>

              {error && <div className="bg-red-50 text-red-600 p-3 rounded-md mb-6 text-sm">{error}</div>}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Store Name <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your store name" 
                      className="w-full border border-gray-300 rounded-md px-4 py-2.5 outline-none focus:border-[#0b8241] focus:ring-1 focus:ring-[#0b8241]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Store Slug <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      name="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      placeholder="your-store-name" 
                      className="w-full border border-gray-300 rounded-md px-4 py-2.5 outline-none focus:border-[#0b8241] focus:ring-1 focus:ring-[#0b8241]"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">This will be your store URL on Diosesgrande</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Store Email <span className="text-red-500">*</span></label>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter store email address" 
                      className="w-full border border-gray-300 rounded-md px-4 py-2.5 outline-none focus:border-[#0b8241] focus:ring-1 focus:ring-[#0b8241]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
                    <div className="flex">
                      <div className="flex items-center border border-gray-300 border-r-0 rounded-l-md px-3 bg-gray-50">
                        <span className="mr-2">🇳🇬</span>
                        <span className="text-sm">+234</span>
                        <svg className="w-4 h-4 ml-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                      <input 
                        type="tel" 
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="801 234 5678" 
                        className="flex-1 border border-gray-300 rounded-r-md px-4 py-2.5 outline-none focus:border-[#0b8241] focus:ring-1 focus:ring-[#0b8241]"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Store Description <span className="text-red-500">*</span></label>
                  <textarea 
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Tell customers about your store, the products you sell, and what makes your store special..." 
                    className="w-full border border-gray-300 rounded-md px-4 py-3 h-28 resize-none outline-none focus:border-[#0b8241] focus:ring-1 focus:ring-[#0b8241]"
                    maxLength={500}
                    required
                  ></textarea>
                  <p className="text-xs text-gray-500 mt-1 text-right">{formData.description.length}/500 characters</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Store Logo <span className="text-red-500">*</span></label>
                    <input 
                      type="file" 
                      ref={logoInputRef} 
                      onChange={(e) => handleFileChange(e, "logo")} 
                      className="hidden" 
                      accept="image/*"
                    />
                    <div 
                      onClick={() => logoInputRef.current?.click()}
                      className={`border-2 border-dashed ${formData.logo ? "border-[#0b8241] bg-green-50" : "border-gray-300"} rounded-md p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition min-h-[140px] relative overflow-hidden`}
                    >
                      {uploading === "logo" ? (
                        <div className="flex flex-col items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0b8241]"></div>
                          <span className="text-xs mt-2 font-medium text-gray-500">Uploading...</span>
                        </div>
                      ) : formData.logo ? (
                        <>
                          <img src={formData.logo} alt="Logo Preview" className="absolute inset-0 w-full h-full object-cover opacity-20" />
                          <svg className="w-8 h-8 text-[#0b8241] mb-2 z-10" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                          <span className="text-sm font-bold text-[#0b8241] z-10">Logo Uploaded</span>
                          <span className="text-xs text-gray-500 mt-1 z-10">Click to change</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-8 h-8 text-[#0b8241] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                          <span className="text-sm font-medium text-gray-900">Upload Store Logo</span>
                          <span className="text-xs text-gray-500 mt-1">PNG, JPG or JPEG (max. 2MB)</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Store Banner <span className="text-gray-400 font-normal">(Optional)</span></label>
                    <input 
                      type="file" 
                      ref={bannerInputRef} 
                      onChange={(e) => handleFileChange(e, "banner")} 
                      className="hidden" 
                      accept="image/*"
                    />
                    <div 
                      onClick={() => bannerInputRef.current?.click()}
                      className={`border-2 border-dashed ${formData.banner ? "border-[#0b8241] bg-green-50" : "border-gray-300"} rounded-md p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition min-h-[140px] relative overflow-hidden`}
                    >
                      {uploading === "banner" ? (
                        <div className="flex flex-col items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0b8241]"></div>
                          <span className="text-xs mt-2 font-medium text-gray-500">Uploading...</span>
                        </div>
                      ) : formData.banner ? (
                        <>
                          <img src={formData.banner} alt="Banner Preview" className="absolute inset-0 w-full h-full object-cover opacity-20" />
                          <svg className="w-8 h-8 text-[#0b8241] mb-2 z-10" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                          <span className="text-sm font-bold text-[#0b8241] z-10">Banner Uploaded</span>
                          <span className="text-xs text-gray-500 mt-1 z-10">Click to change</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-8 h-8 text-[#0b8241] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                          <span className="text-sm font-medium text-gray-900">Upload Banner Image</span>
                          <span className="text-xs text-gray-500 mt-1">PNG, JPG or JPEG (max. 5MB)</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-[#0b8241] text-white px-6 py-3 rounded-md font-medium hover:bg-[#096b35] transition flex items-center gap-2 disabled:opacity-70"
                  >
                    {loading ? "Saving..." : "Save & Continue"}
                    {!loading && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-80 space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-6">Why sell on Diosesgrande?</h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="bg-[#e6f4ea] p-2.5 rounded-lg text-[#0b8241] shrink-0 h-min">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-1">Grow Your Business</h4>
                    <p className="text-xs text-gray-600">Reach millions of customers across Nigeria and beyond.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-[#e6f4ea] p-2.5 rounded-lg text-[#0b8241] shrink-0 h-min">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-1">Trusted Platform</h4>
                    <p className="text-xs text-gray-600">Join a marketplace that buyers trust for quality and reliability.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-[#e6f4ea] p-2.5 rounded-lg text-[#0b8241] shrink-0 h-min">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-1">Secure Payments</h4>
                    <p className="text-xs text-gray-600">Get paid securely with multiple withdrawal options.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-[#e6f4ea] p-2.5 rounded-lg text-[#0b8241] shrink-0 h-min">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-1">24/7 Support</h4>
                    <p className="text-xs text-gray-600">Our dedicated team is always here to help you succeed.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-2">Need help getting started?</h3>
              <p className="text-xs text-gray-600 mb-4">Our vendor support team is here to help you every step of the way.</p>
              
              <button className="w-full border border-gray-200 rounded-md py-2.5 text-sm font-medium text-[#0b8241] flex items-center justify-center gap-2 hover:bg-gray-50 transition mb-4">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                Contact Support
              </button>

              <div className="space-y-3 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                  <span>Call: 0700 123 4567</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                  <span>Email: vendorsupport@diosesgrande.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 mt-8 mb-12">
        <div className="bg-white rounded-xl shadow-sm p-8 flex flex-wrap items-center justify-between gap-8">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 grayscale opacity-50">
              <Image
                src="/logo.png"
                alt="Diosesgrande Logo"
                fill
                sizes="100px"
                className="object-contain"
              />
            </div>
            <span className="text-sm font-medium text-gray-600">Trusted by thousands of customers and top brands</span>
          </div>
          <div className="flex items-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-300">
            {/* Logos placeholder using text for simplicity */}
            <span className="font-bold italic">paga</span>
            <span className="font-bold text-blue-600">paystack</span>
            <span className="font-bold text-yellow-500">flutterwave</span>
            <span className="font-bold text-blue-800">Interswitch</span>
            <span className="font-bold text-orange-500">Konga</span>
            <span className="font-bold text-orange-600">JUMIA</span>
            <span className="font-bold text-red-600">DHL</span>
          </div>
        </div>
      </div>
    </div>
  );
}
