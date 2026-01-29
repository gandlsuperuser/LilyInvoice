import { useState, useCallback } from 'react';
import Tesseract from 'tesseract.js';
import { extractInvoiceData } from '../utils/ocrFieldMapper';

/**
 * OCR 处理 Hook
 */
export function useOCR() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const processImage = useCallback(async (imageSource) => {
        setIsProcessing(true);
        setProgress(0);
        setError(null);
        setResult(null);

        try {
            setStatus('正在初始化 OCR 引擎...');

            const ocrResult = await Tesseract.recognize(
                imageSource,
                'eng+chi_sim', // 英文 + 简体中文
                {
                    logger: (m) => {
                        if (m.status === 'recognizing text') {
                            setProgress(Math.round(m.progress * 100));
                            setStatus('正在识别文字...');
                        } else if (m.status === 'loading language traineddata') {
                            setStatus('正在加载语言包...');
                        }
                    }
                }
            );

            setStatus('正在提取发票信息...');
            const extractedData = extractInvoiceData(ocrResult.data.text);

            setResult({
                text: ocrResult.data.text,
                data: extractedData,
                confidence: ocrResult.data.confidence
            });

            setStatus('识别完成');
            setProgress(100);
        } catch (err) {
            console.error('OCR error:', err);
            setError(err.message || '识别失败，请重试');
            setStatus('识别失败');
        } finally {
            setIsProcessing(false);
        }
    }, []);

    const reset = useCallback(() => {
        setIsProcessing(false);
        setProgress(0);
        setStatus('');
        setResult(null);
        setError(null);
    }, []);

    return {
        isProcessing,
        progress,
        status,
        result,
        error,
        processImage,
        reset
    };
}
