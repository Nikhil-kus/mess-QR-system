import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { MealType, ScanResult } from '../types';
import { processMealScan } from '../services/db';

const ScannerView: React.FC = () => {
  const [mealType, setMealType] = useState<MealType>(MealType.BREAKFAST);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string>('');
  
  // Refs to handle scanner instance and state without triggering re-renders/effects
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const mealTypeRef = useRef<MealType>(MealType.BREAKFAST);
  const isMountedRef = useRef<boolean>(true);

  // Keep mealType ref in sync for the callback
  useEffect(() => {
    mealTypeRef.current = mealType;
  }, [mealType]);

  useEffect(() => {
    isMountedRef.current = true;
    const elementId = "reader";
    let isScanning = false;

    const cleanupScanner = async () => {
        const scanner = scannerRef.current;
        if (!scanner) return;
        
        try {
            if (isScanning) {
                await scanner.stop();
            }
        } catch (e) {
            console.debug("Scanner stop error ignored:", e);
        }
        
        try {
            await scanner.clear();
        } catch (e) {
             console.debug("Scanner clear error ignored:", e);
        }
        scannerRef.current = null;
    };

    const initScanner = async () => {
      try {
        // Ensure element exists
        if (!document.getElementById(elementId)) return;

        // Cleanup previous instance if it exists
        if (scannerRef.current) {
            await cleanupScanner();
        }

        const scanner = new Html5Qrcode(elementId);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          },
          (decodedText) => {
             handleScanSuccess(decodedText);
          },
          (errorMessage) => {
            // Ignore individual frame errors
          }
        );
        isScanning = true;
      } catch (err) {
        if (isMountedRef.current) {
            console.error("Camera start error:", err);
            setError("Failed to start camera. Ensure permissions are granted.");
        }
      }
    };

    // Small delay to ensure DOM is ready and previous cleanups are done
    const timer = setTimeout(initScanner, 300);

    return () => {
      isMountedRef.current = false;
      clearTimeout(timer);
      // Execute cleanup safely
      cleanupScanner();
    };
  }, []); // Run once on mount

  const handleScanSuccess = async (decodedText: string) => {
    const scanner = scannerRef.current;
    if (!scanner) return;

    try {
        await scanner.pause(true); 
    } catch(e) {
        console.warn("Pause failed", e);
    }

    setScanResult({ status: 'loading', message: 'Processing...' });

    try {
        // Use ref for current meal type to avoid closure staleness
        const result = await processMealScan(decodedText, mealTypeRef.current);
        if (isMountedRef.current) setScanResult(result);
    } catch (e) {
        if (isMountedRef.current) setScanResult({ status: 'error', message: 'Unknown error occurred' });
    }
  };

  const resetScanner = async () => {
    setScanResult(null);
    if (scannerRef.current) {
        try {
            await scannerRef.current.resume();
        } catch(e) {
            console.error("Resume failed", e);
            // If resume fails, try reloading the page as a fallback
            window.location.reload();
        }
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 pb-20">
      <h2 className="text-2xl font-bold mb-4 text-center">Meal Scanner</h2>

      {/* Meal Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Meal to Track</label>
        <div className="grid grid-cols-3 gap-2">
            {Object.values(MealType).map((type) => (
                <button
                    key={type}
                    onClick={() => setMealType(type)}
                    className={`p-2 text-sm rounded-md font-semibold capitalize transition-all ${
                        mealType === type 
                        ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-300' 
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                >
                    {type}
                </button>
            ))}
        </div>
      </div>

      {/* Scanner Viewport */}
      <div className="bg-black rounded-xl overflow-hidden shadow-inner border border-gray-400 relative h-[350px] w-full">
         {!error && <div id="reader" className="w-full h-full"></div>}
         {error && (
             <div className="absolute inset-0 flex items-center justify-center text-white p-4 text-center">
                 <div>
                     <i className="fas fa-exclamation-circle text-3xl text-red-500 mb-2"></i>
                     <p>{error}</p>
                 </div>
             </div>
         )}
      </div>
      <p className="text-center text-xs text-gray-500 mt-2">Point camera at student QR code</p>

      {/* Results Modal / Overlay */}
      {scanResult && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className={`w-full max-w-sm p-6 rounded-xl shadow-2xl transform transition-all ${
                scanResult.status === 'success' ? 'bg-white border-t-8 border-green-500' :
                scanResult.status === 'error' ? 'bg-white border-t-8 border-red-500' :
                scanResult.status === 'warning' ? 'bg-white border-t-8 border-yellow-500' :
                'bg-white'
            }`}>
                
                {scanResult.status === 'loading' && (
                    <div className="text-center py-8">
                        <i className="fas fa-circle-notch fa-spin text-4xl text-blue-500 mb-4"></i>
                        <p className="font-semibold text-gray-600">Verifying...</p>
                    </div>
                )}

                {scanResult.status !== 'loading' && (
                    <div className="text-center">
                        <div className="mb-4 text-5xl">
                            {scanResult.status === 'success' && <i className="fas fa-check-circle text-green-500"></i>}
                            {scanResult.status === 'error' && <i className="fas fa-times-circle text-red-500"></i>}
                            {scanResult.status === 'warning' && <i className="fas fa-exclamation-triangle text-yellow-500"></i>}
                        </div>
                        
                        <h3 className="text-2xl font-bold mb-2 text-gray-800">{scanResult.message}</h3>
                        
                        {scanResult.student && (
                            <div className="mt-4 bg-gray-50 p-4 rounded-lg text-left border border-gray-100">
                                <p className="text-lg font-bold text-gray-900">{scanResult.student.name}</p>
                                <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-gray-600">
                                    <div>
                                        <span className="block text-xs uppercase text-gray-400">Room</span>
                                        {scanResult.student.room}
                                    </div>
                                    <div>
                                        <span className="block text-xs uppercase text-gray-400">Status</span>
                                        <span className={scanResult.student.hasPaid ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                                            {scanResult.student.hasPaid ? 'Paid' : 'Unpaid'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <button 
                            onClick={resetScanner}
                            className="mt-6 w-full py-3.5 bg-gray-900 text-white rounded-lg font-bold text-lg hover:bg-gray-800 active:scale-95 transition-transform"
                        >
                            Scan Next
                        </button>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default ScannerView;