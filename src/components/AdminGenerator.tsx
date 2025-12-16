
import React, { useState } from 'react';
import { ShieldCheck, Copy, RefreshCw, Lock, Home, KeyRound, Smartphone, AlertCircle } from 'lucide-react';

const SALT = "SMART_EDU_EGYPT_2026"; 
const ADMIN_PASS = "202625";

export const AdminGenerator: React.FC = () => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [studentDeviceId, setStudentDeviceId] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');

  // 1. Login Handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASS) {
      setIsAuthenticated(true);
    } else {
      alert("كلمة المرور غير صحيحة");
      setPassword('');
    }
  };

  // 2. Code Generator Logic
  const generateCode = () => {
    if (!studentDeviceId.trim()) return;
    
    // CRITICAL: This logic MUST match SubscriptionModal.tsx exactly
    // We take the DeviceID + Salt -> Base64 -> First 12 Chars
    const cleanId = studentDeviceId.trim();
    const rawString = cleanId + SALT;
    const code = btoa(rawString).substring(0, 12).toUpperCase();
    
    setGeneratedCode(code);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    alert("تم نسخ كود التفعيل!");
  };

  const handleExit = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.hash = '';
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans" dir="rtl">
        <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-400">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-6">منطقة الإدارة</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="أدخل كلمة المرور"
              className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-600 text-white focus:border-indigo-500 focus:outline-none text-center text-lg tracking-widest"
              autoFocus
            />
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg transition-all">
              دخول
            </button>
          </form>
          <button 
            onClick={handleExit} 
            className="block w-full mt-6 text-slate-500 hover:text-white text-sm transition-colors"
          >
            العودة للتطبيق
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4 font-mono" dir="rtl">
      <div className="max-w-xl w-full space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between text-slate-400 mb-4">
           <div className="flex items-center gap-2">
             <ShieldCheck size={20} className="text-emerald-500" />
             <span className="font-bold text-white">مولد أكواد التفعيل</span>
           </div>
           <button onClick={() => setIsAuthenticated(false)} className="text-xs hover:text-white">تسجيل خروج</button>
        </div>

        {/* Generator Section */}
        <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-8">
          
          <div className="space-y-6">
            
            {/* Warning / Instruction Box */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex items-start gap-2">
               <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={16} />
               <p className="text-xs text-amber-200 leading-relaxed">
                 تنبيه هام: لا تستخدم رقم جهازك أنت.<br/>
                 يجب أن تأخذ الرقم الظاهر على شاشة موبايل الطالب (الذي يبدأ بـ APP) وتضعه هنا.
               </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">رقم جهاز الطالب (System ID)</label>
              <div className="relative">
                <input 
                    type="text" 
                    value={studentDeviceId}
                    onChange={(e) => setStudentDeviceId(e.target.value)}
                    placeholder="ضع كود الطالب هنا (APP-XXXX...)"
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-4 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none font-mono text-center text-lg placeholder:text-slate-600"
                    dir="ltr"
                />
                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
              </div>
            </div>

            <button 
              onClick={generateCode}
              disabled={!studentDeviceId.trim()}
              className={`w-full font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg ${
                  studentDeviceId.trim() 
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-900/20' 
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              <RefreshCw size={20} />
              توليد كود التفعيل
            </button>

            {generatedCode && (
              <div className="bg-black/30 p-6 rounded-xl border border-emerald-500/30 text-center animate-in fade-in slide-in-from-top-2">
                <p className="text-sm text-emerald-400 mb-3 font-bold">تم توليد الكود بنجاح (صالح لهذا الجهاز فقط)</p>
                <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 mb-4 cursor-pointer hover:border-emerald-500 transition-colors" onClick={copyToClipboard}>
                  <code className="text-3xl font-black text-white tracking-widest break-all">{generatedCode}</code>
                </div>
                <button 
                  onClick={copyToClipboard}
                  className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-bold"
                >
                  <Copy size={16} />
                  نسخ الكود وإرساله
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="text-center pt-8">
           <button 
             onClick={handleExit} 
             className="text-slate-500 hover:text-white flex items-center justify-center gap-2 transition-colors w-full"
           >
             <Home size={18} />
             <span>العودة للتطبيق الرئيسي</span>
           </button>
        </div>

      </div>
    </div>
  );
};
