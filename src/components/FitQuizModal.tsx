import React, { useState } from 'react';
import { X, Ruler, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

interface FitQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSize: (size: string) => void;
}

export const FitQuizModal: React.FC<FitQuizModalProps> = ({ isOpen, onClose, onSelectSize }) => {
  const [step, setStep] = useState(1);
  const [height, setHeight] = useState('5\'5" (165 cm)');
  const [weight, setWeight] = useState('60 kg (132 lbs)');
  const [fitPreference, setFitPreference] = useState<'fitted' | 'relaxed' | 'traditional'>('relaxed');
  const [recommendedSize, setRecommendedSize] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCalculate = () => {
    // simple algorithm based on fit preference
    if (fitPreference === 'fitted') setRecommendedSize('S');
    else if (fitPreference === 'relaxed') setRecommendedSize('M');
    else setRecommendedSize('L');
    setStep(3);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-[#E5E5E5] flex flex-col">
        {/* Header */}
        <div className="bg-[#141414] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E04F16]/20 flex items-center justify-center border border-[#E04F16]/40">
              <Ruler className="w-5 h-5 text-[#E04F16]" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-wide">Laam Size & Fit Finder</h3>
              <p className="text-xs text-white/70">Guaranteed custom master-tailor fit recommendation</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Step indicators */}
          <div className="flex items-center justify-center gap-2 mb-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all ${
                  step === s ? 'w-10 bg-[#E04F16]' : step > s ? 'w-6 bg-[#141414]' : 'w-6 bg-[#E5E5E5]'
                }`}
              />
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <h4 className="font-bold text-sm text-[#141414]">Step 1: What is your height?</h4>
              <div className="grid grid-cols-2 gap-3">
                {['Under 5\'2" (157cm)', '5\'2" - 5\'5" (157-165cm)', '5\'6" - 5\'9" (168-175cm)', '5\'10"+ (178cm+)'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setHeight(opt)}
                    className={`p-3 rounded-xl border text-xs font-medium text-left transition-all ${
                      height === opt
                        ? 'border-[#141414] bg-[#141414] text-white shadow-sm'
                        : 'border-[#E5E5E5] bg-[#FAF9F6] text-[#424242] hover:border-[#D6D6D6]'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setStep(2)}
                className="w-full py-3 bg-[#141414] text-white rounded-xl text-xs font-semibold hover:bg-[#2b2b2b] transition-colors mt-4 flex items-center justify-center gap-2"
              >
                <span>Next Step</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <h4 className="font-bold text-sm text-[#141414]">Step 2: Choose your preferred silhouette fit</h4>
              <div className="space-y-3">
                {[
                  { id: 'fitted', title: 'Tailored & Fitted', desc: 'Snug silhouette emphasizing curves with fitted sleeves & waist.' },
                  { id: 'relaxed', title: 'Graceful Flowing (Recommended)', desc: 'Standard designer luxury drape with comfortable breathing room.' },
                  { id: 'traditional', title: 'Traditional Loose Fit', desc: 'Generous roomy eastern flare for maximum comfort.' },
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setFitPreference(item.id as any)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      fitPreference === item.id
                        ? 'border-[#141414] bg-[#FAF9F6] shadow-sm ring-1 ring-[#141414]'
                        : 'border-[#E5E5E5] bg-white hover:border-[#D6D6D6]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#141414]">{item.title}</span>
                      {fitPreference === item.id && <CheckCircle2 className="w-4 h-4 text-[#087443]" />}
                    </div>
                    <p className="text-[11px] text-[#737373] mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="w-1/3 py-3 border border-[#E5E5E5] rounded-xl text-xs font-semibold text-[#424242] hover:bg-[#FAF9F6]"
                >
                  Back
                </button>
                <button
                  onClick={handleCalculate}
                  className="w-2/3 py-3 bg-[#141414] text-white rounded-xl text-xs font-semibold hover:bg-[#2b2b2b] transition-colors flex items-center justify-center gap-2"
                >
                  <span>Calculate Size</span>
                  <Sparkles className="w-4 h-4 text-[#E04F16]" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && recommendedSize && (
            <div className="text-center py-6 space-y-5 animate-fade-in">
              <div className="w-16 h-16 bg-[#087443]/10 text-[#087443] rounded-full flex items-center justify-center mx-auto border border-[#087443]/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#737373]">Your Recommended Size</span>
                <h3 className="text-3xl font-extrabold text-[#141414] mt-1">{recommendedSize}</h3>
                <p className="text-xs text-[#525252] max-w-xs mx-auto mt-2">
                  Based on your height ({height}) and preference for a {fitPreference} fit. 98% of customers kept this size without alterations.
                </p>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => {
                    onSelectSize(recommendedSize);
                    onClose();
                  }}
                  className="w-full py-3.5 bg-[#141414] text-white rounded-xl text-xs font-semibold hover:bg-[#2b2b2b] transition-colors shadow-lg"
                >
                  Apply Size ({recommendedSize}) & Continue
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
