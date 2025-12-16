
import React, { useState, useEffect } from 'react';
import { Lock, Clock, CheckCircle, Send, AlertTriangle, Copy, BadgePercent, X, Star, Smartphone } from 'lucide-react';
import { GradeLevel } from '../types';

const SALT = "SMART_EDU_EGYPT_2026"; 
const ADMIN_PHONE_NUMBER = "201221746554"; // رقمك

interface SubscriptionModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
  currentGrade?: GradeLevel | null;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ forceOpen, onClose, currentGrade }) => {
  const [viewState, setViewState] = useState<'loading' | 'hidden' | 'locked' | 'manual'>('loading');
  const [lockReason, setLockReason] = useState<'trial_ended' | 'subscription_ended' | 'manual_upgrade'>('trial_ended');
  
  const [daysLeft, setDaysLeft] = useState(0);
  const [deviceId, setDeviceId] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [error, setError] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('');

  // Auto-select grade if passed via props
  useEffect(() => {
    if (currentGrade) {
        setSelectedGrade(currentGrade);
    }
  }, [currentGrade]);

  useEffect(() => {
    if (forceOpen) {
        setLockReason('manual_upgrade');
        setViewState('manual');
        ensureDeviceId();
    } else {
        checkStatus();
    }
  }, [forceOpen, currentGrade]);

  // Block scrolling only if locked
  useEffect(() => {
    if (viewState === 'locked') {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'unset';
    }
  }, [viewState]);

  const ensureDeviceId = () => {
    let storedId = localStorage.getItem('device_id');
    // Generate a more professional looking ID if not exists
    if (!storedId) {
      const array = new Uint32Array(2);
      window.crypto.getRandomValues(array);
      // Format: APP-XXXX-XXXX
      storedId = 'APP-' + array[0].toString(16).toUpperCase().padStart(4, '0') + '-' + array[1].toString(16).toUpperCase().padStart(4, '0');
      localStorage.setItem('device_id', storedId);
    }
    setDeviceId(storedId);
    return storedId;
  };

  const checkStatus = () => {
    const currentId = ensureDeviceId();

    // If we are on Home Screen (no specific grade), don't lock
    if (!currentGrade) {
        setViewState('hidden');
        return;
    }

    // 1. PRIORITY CHECK: Is the student ALREADY subscribed?
    // If yes, we STOP here. We do not check the trial.
    const subscriptionKey = `subscription_expiry_${currentGrade}`;
    const subscriptionExpiry = localStorage.getItem(subscriptionKey);
    
    if (subscriptionExpiry) {
        const expiryDate = new Date(subscriptionExpiry);
        const now = new Date();
        
        if (now < expiryDate) {
            // Active Subscription -> HIDDEN (No Lock)
            setViewState('hidden');
            return;
        } else {
            // Expired Subscription -> LOCK
            setLockReason('subscription_ended');
            setViewState('locked');
            return;
        }
    }

    // 2. SECONDARY CHECK: Trial Period
    // This code only runs if the user is NOT subscribed.
    let trialStartStr = localStorage.getItem('trial_start_date');
    if (!trialStartStr) {
        trialStartStr = new Date().toISOString();
        localStorage.setItem('trial_start_date', trialStartStr);
    }

    const trialStartDate = new Date(trialStartStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - trialStartDate.getTime());
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays >= 7) {
        // Trial Over AND Not Subscribed -> LOCK
        setLockReason('trial_ended');
        setViewState('locked');
    } else {
        // Still in trial -> HIDDEN
        setDaysLeft(Math.ceil(7 - diffDays));
        setViewState('hidden');
    }
  };

  const handleActivate = () => {
    // 1. Validation Logic
    const code = inputCode.trim().toUpperCase();
    
    // Hash Logic: Match exactly with AdminGenerator
    // We use the ID + SALT to ensure the code is unique to this device.
    const expectedCode = btoa(deviceId + SALT).substring(0, 12).toUpperCase();

    if (code === expectedCode) {
      if (!selectedGrade) {
          setError("يرجى اختيار الصف الدراسي أولاً");
          return;
      }

      // 2. Success Logic
      const now = new Date();
      now.setDate(now.getDate() + 30); // Add 30 Days
      
      const subscriptionKey = `subscription_expiry_${selectedGrade}`;
      localStorage.setItem(subscriptionKey, now.toISOString());
      
      alert(`مبروك! 🥳\nتم تفعيل اشتراك ${selectedGrade} بنجاح.\nالتطبيق يعمل معك الآن لمدة 30 يوم.`);
      window.location.reload(); 
    } else {
      setError("كود التفعيل خاطئ! هذا الكود لا يعمل مع هذا الجهاز.");
    }
  };

  const handleWhatsAppClick = () => {
    if (!selectedGrade) {
        alert("من فضلك اختر الصف الدراسي أولاً");
        return;
    }
    const message = `مرحباً مستر، أريد الاشتراك في تطبيق 'المعلم الذكي' لمدة شهر.%0aالصف: ${selectedGrade}%0aالسعر: 300ج%0aرقم جهازي (Device ID): ${deviceId}`;
    window.open(`https://wa.me/${ADMIN_PHONE_NUMBER}?text=${message}`, '_blank');
  };

  if (viewState === 'hidden') return null;

  const isManual = viewState === 'manual';

  return (
    <div className={`fixed inset-0 z-[9999] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-4 font-sans dir-rtl text-right overflow-hidden ${isManual ? 'animate-in fade-in duration-200' : ''}`} dir="rtl">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300 relative">
        
        {isManual && onClose && (
            <button 
                onClick={onClose}
                className="absolute top-4 left-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 hover:text-red-500 transition-colors z-10"
            >
                <X size={20} />
            </button>
        )}

        <div className={`p-6 text-center border-b ${
            lockReason === 'trial_ended' ? 'bg-amber-50 border-amber-100' : 
            lockReason === 'subscription_ended' ? 'bg-red-50 border-red-100' :
            'bg-indigo-50 border-indigo-100'
        }`}>
           <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-sm ${
               lockReason === 'trial_ended' ? 'bg-amber-100 text-amber-600' : 
               lockReason === 'subscription_ended' ? 'bg-red-100 text-red-600' :
               'bg-indigo-100 text-indigo-600'
           }`}>
             {lockReason === 'trial_ended' ? <Clock size={32} /> : 
              lockReason === 'subscription_ended' ? <Lock size={32} /> :
              <Star size={32} />
             }
           </div>
           
           <h2 className="text-2xl font-black text-slate-800">
               {lockReason === 'trial_ended' ? 'انتهت الفترة التجريبية' : 
                lockReason === 'subscription_ended' ? 'انتهى الاشتراك الشهري' :
                'ترقية الحساب'
               }
           </h2>
           <p className="text-slate-600 font-medium mt-2 leading-relaxed">
               {lockReason === 'trial_ended' 
                ? `انتهت الـ 7 أيام المجانية. لمتابعة التفوق في ${currentGrade || 'هذا الصف'}، يرجى الاشتراك.` 
                : lockReason === 'subscription_ended'
                ? 'انتهت فترة الـ 30 يوم. جدد اشتراكك الآن لتفتح التطبيق فوراً.'
                : 'استمتع بكافة مميزات المعلم الذكي بلا حدود.'
               }
           </p>
        </div>

        <div className="p-6 space-y-6">
           
           {/* Step 1 */}
           <div>
               <label className="block text-sm font-bold text-slate-700 mb-2">1. اختر الصف الدراسي:</label>
               <select 
                  value={selectedGrade} 
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700"
               >
                   <option value="">-- اضغط للاختيار --</option>
                   <option value="الصف الأول الثانوي">الصف الأول الثانوي (300ج / شهر)</option>
                   <option value="الصف الثاني الثانوي">الصف الثاني الثانوي (300ج / شهر)</option>
                   <option value="الصف الثالث الثانوي">الصف الثالث الثانوي (300ج / شهر)</option>
               </select>
           </div>

           {/* Step 2 */}
           <div>
               <label className="block text-sm font-bold text-slate-700 mb-2">2. أرسل رقم جهازك للمسؤول:</label>
               
               <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 mb-3 flex items-center justify-between gap-3 shadow-inner">
                  <div className="overflow-hidden">
                      <span className="text-[10px] text-slate-400 font-bold block mb-1 flex items-center gap-1">
                        <Smartphone size={10} />
                        معرف الجهاز (System ID):
                      </span>
                      <code className="text-sm md:text-base font-mono font-black text-emerald-400 tracking-wider block truncate">{deviceId}</code>
                  </div>
                  <button onClick={() => navigator.clipboard.writeText(deviceId)} className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors" title="نسخ"><Copy size={18}/></button>
               </div>

               <button 
                onClick={handleWhatsAppClick}
                disabled={!selectedGrade}
                className={`w-full font-bold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                    !selectedGrade 
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                    : 'bg-[#25D366] hover:bg-[#128C7E] text-white shadow-green-100 hover:scale-105'
                }`}
              >
                <Send size={20} />
                <span>{selectedGrade ? 'إرسال طلب الاشتراك (واتساب)' : 'اختر الصف أولاً'}</span>
              </button>
           </div>
           
           {/* Step 3 */}
           <div className="border-t border-slate-100 pt-5">
              <label className="block text-sm font-bold text-slate-700 mb-2">3. أدخل كود التفعيل:</label>
              <div className="space-y-3">
                 <input 
                   type="text" 
                   value={inputCode}
                   onChange={(e) => setInputCode(e.target.value)}
                   className="block w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-center font-mono text-lg placeholder:text-slate-300 uppercase tracking-widest"
                   placeholder="XXXX-XXXX-XXXX"
                 />
                 
                 <button 
                    onClick={handleActivate}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 hover:shadow-xl active:scale-95"
                 >
                    <CheckCircle size={18} />
                    تفعيل الاشتراك
                 </button>
              </div>
              
              {error && (
                    <div className="mt-3 text-red-600 text-xs font-bold text-center bg-red-50 p-2 rounded-lg border border-red-100 flex items-center justify-center gap-2 animate-pulse">
                        <AlertTriangle size={14} />
                        {error}
                    </div>
               )}
           </div>
        </div>
      </div>
    </div>
  );
};
